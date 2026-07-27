import { chat, type ChatMiddleware, type UsageInfo } from '@tanstack/ai'
import { createOpenRouterText } from '@tanstack/ai-openrouter'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { modelIds } from './models'
import { transcriptionSchema } from './schema'

const inputSchema = z.object({
  audio: z.instanceof(File),
  language: z.string(),
  model: z.enum(modelIds),
  removeFillers: z.stringbool(),
})

export const transcribeAudio = createServerFn({ method: 'POST' })
  .validator((form: FormData) =>
    inputSchema.parse({
      audio: form.get('audio'),
      language: form.get('language'),
      model: form.get('model'),
      removeFillers: form.get('removeFillers'),
    }),
  )
  .handler(async ({ data }) => {
    if (data.audio.size > 10 * 1024 * 1024) {
      throw new Error('Die optimierte Audiodatei darf maximal 10 MB groß sein.')
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) throw new Error('OPENROUTER_API_KEY ist nicht konfiguriert.')

    let usage: UsageInfo | undefined
    const usageMiddleware: ChatMiddleware = {
      name: 'capture-usage',
      onUsage: (_context, nextUsage) => {
        usage = nextUsage
      },
    }
    const audio = Buffer.from(await data.audio.arrayBuffer()).toString('base64')
    const transcription = await chat({
      adapter: createOpenRouterText(data.model, apiKey, {
        appTitle: 'zkribe',
      }),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              content: buildPrompt(data.language, data.removeFillers),
            },
            {
              type: 'audio',
              source: {
                type: 'data',
                value: audio,
                mimeType: data.audio.type,
              },
            },
          ],
        },
      ],
      outputSchema: transcriptionSchema,
      middleware: [usageMiddleware],
      modelOptions: { temperature: 0 },
    })

    return {
      transcription,
      usage: usage
        ? {
            promptTokens: usage.promptTokens,
            completionTokens: usage.completionTokens,
            totalTokens: usage.totalTokens,
            cost: usage.cost,
          }
        : undefined,
    }
  })

function buildPrompt(language: string, removeFillers: boolean) {
  return `Transcribe the attached audio exactly as spoken.
Do not translate or summarize. Preserve code-switching and identify speakers consistently.
Language: ${language === 'auto' ? 'detect per utterance' : language}.
${removeFillers ? 'Remove filler words, false starts and stutters without changing meaning.' : 'Preserve filler words, false starts and stutters.'}
Use speech for spoken segments, background_noise for noise, music for music and inaudible for unclear speech.`
}
