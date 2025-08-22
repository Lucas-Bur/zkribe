import { env } from "@/env"
import { createServerFn } from "@tanstack/react-start"
import z from "zod"

export const getTranscriptionFn = createServerFn({
  method: "POST",
  type: "dynamic",
  response: "data"
})
  .validator((data: FormData) => {

    const audio = data.get("audio")
    const model = data.get("model")
    const language = data.get("language")
    const removeFillerWords = data.get("removeFillerWords")

    const parsedResult = z.object({
      audio: z.instanceof(File),
      model: z.enum(["gemini-2.0-flash", "whisper-1"]),
      language: z.enum(["auto", "de", "en", "es", "fr", "it", "pt", "ru", "ja", "ko", "zh"]),
      removeFillerWords: z.boolean(),
    })
    const parsedData = parsedResult.parse({
      audio,
      model,
      language,
      removeFillerWords: removeFillerWords === "true",
    })
    return parsedData
  })
  .handler(async ({ data }) => {

    const { audio, model, language, removeFillerWords } = data

    if (audio.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error("Audio file size exceeds 10MB limit")
    }

    const buffer = Buffer.from(await audio.arrayBuffer())

    if (model === "whisper-1") {
      return await transcribeWithGemini(buffer, language, removeFillerWords)
    } else if (model === "gemini-2.0-flash") {
      return await transcribeWithGemini(buffer, language, removeFillerWords)
    }

    return await transcribeWithGemini(buffer, language, removeFillerWords)

  })

type TranscriptionOptions = {
  language: string
  removeFillerWords?: boolean
}

const getOptimizedTranscriptionPrompt = (options: TranscriptionOptions): string => {
  const { language, removeFillerWords = true } = options

  const languageMap: { [key: string]: string } = {
    de: "German",
    en: "English",
    es: "Spanish",
    fr: "French",
    it: "Italian",
    pt: "Portuguese",
    ru: "Russian",
    ja: "Japanese",
    ko: "Korean",
    zh: "Chinese",
  }

  const targetLanguage = languageMap[language] || language
  const isAutoDetect = language === "auto"

  const fillerWordInstructions = removeFillerWords
    ? `**CRITICAL: REMOVE ALL FILLER WORDS AND HESITATIONS**
- German: "äh", "ähm", "also", "ja", "ne", "halt", "eben", "sozusagen", "irgendwie"
- English: "um", "uh", "like", "you know", "I mean", "sort of", "kind of", "actually"
- Remove false starts, repetitions, and incomplete sentences
- Clean up stuttering and verbal hesitations
- Make the text flow naturally without these interruptions`
    : `**PRESERVE ALL SPEECH PATTERNS**
- Include all filler words, hesitations, and false starts exactly as spoken
- Maintain natural speech patterns including "um", "uh", "like", etc.
- Keep repetitions and incomplete sentences as they occur`

  return `You are a professional audio transcriber. Transcribe this audio with maximum accuracy.

**LANGUAGE:** ${isAutoDetect ? "Auto-detect the primary language" : `Primarily ${targetLanguage}`}
- Preserve foreign words, names, and technical terms exactly as spoken
- Handle code-switching and multilingual content naturally
- Do not translate or "correct" non-target language phrases

${fillerWordInstructions}

**TRANSCRIPTION RULES:**
- Use proper punctuation, capitalization, and paragraph breaks
- Mark unclear speech as [inaudible]
- Mark significant background sounds as [background noise] or [music]

**SPEAKER IDENTIFICATION:**
- Label multiple speakers as [Speaker 1], [Speaker 2], etc.
- Maintain consistent speaker labels throughout
- Use new lines for speaker changes

**OUTPUT FORMAT:**
- Plain text only, no markdown or formatting
- Natural paragraph structure for readability
- Focus on accuracy over interpretation

Begin transcription:`
}

/** === Shared Subschemas === */
const TextContent = z.object({
  type: z.literal("text"),
  text: z.string(),
})
const ImageContentPart = z.object({
  type: z.literal("image_url"),
  image_url: z.object({
    url: z.string(),
    detail: z.string().optional(),
  }),
})
const AudioContentPart = z.object({
  type: z.literal("input_audio"),
  input_audio: z.object({
    data: z.string().base64(),
    format: z.enum(["wav", "mp3"]),
  }),
})
const ContentPart = z.union([TextContent, ImageContentPart, AudioContentPart,])

export const UserMessage = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.union([z.string(), z.array(ContentPart)]),
  name: z.string().optional(),
})

export const ToolMessage = z.object({
  role: z.literal("tool"),
  content: z.string(),
  tool_call_id: z.string(),
  name: z.string().optional(),
})

export const MessageSchema = z.union([UserMessage, ToolMessage])

const FunctionDescription = z.object({
  name: z.string(),
  description: z.string().optional(),
  parameters: z.record(z.unknown()),
})
const ToolSchema = z.object({
  type: z.literal("function"),
  function: FunctionDescription,
})
const ToolChoiceSchema = z.union([
  z.literal("none"),
  z.literal("auto"),
  z.object({
    type: z.literal("function"),
    function: z.object({ name: z.string() }),
  }),
])

const ProviderPreferences = z.record(z.unknown())

/** === Request Schema === */
export const OpenRouterRequestSchema = z.object({
  messages: z.array(MessageSchema).optional(),
  prompt: z.string().optional(),
  model: z.string().optional(),
  response_format: z
    .object({ type: z.literal("json_object") })
    .optional(),
  stop: z.union([z.string(), z.array(z.string())]).optional(),
  stream: z.boolean().optional(),
  max_tokens: z.number().int().positive().optional(),
  temperature: z.number().min(0).max(2).optional(),
  tools: z.array(ToolSchema).optional(),
  tool_choice: ToolChoiceSchema.optional(),
  seed: z.number().int().optional(),
  top_p: z.number().min(0).max(1).optional(),
  top_k: z.number().int().min(1).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
  repetition_penalty: z.number().min(0).max(2).optional(),
  logit_bias: z.record(z.number(), z.number()).optional(),
  top_logprobs: z.number().int().optional(),
  min_p: z.number().min(0).max(1).optional(),
  top_a: z.number().min(0).max(1).optional(),
  prediction: z
    .object({ type: z.literal("content"), content: z.string() })
    .optional(),
  transforms: z.array(z.string()).optional(),
  models: z.array(z.string()).optional(),
  route: z.literal("fallback").optional(),
  provider: ProviderPreferences.optional(),
  user: z.string().optional(),
})

/** === Response Schemas === */
const ErrorResponse = z.object({
  code: z.number(),
  message: z.string(),
  metadata: z.record(z.unknown()).optional(),
})
const FunctionCall = z.record(z.unknown()) // konkret nach Bedarf
const ToolCall = z.object({
  id: z.string(),
  type: z.literal("function"),
  function: FunctionCall,
})

const NonChatChoice = z.object({
  finish_reason: z.string().nullable(),
  text: z.string(),
  error: ErrorResponse.optional(),
})
const NonStreamingChoice = z.object({
  finish_reason: z.string().nullable(),
  native_finish_reason: z.string().nullable(),
  message: z.object({
    content: z.string().nullable(),
    role: z.string(),
    tool_calls: z.array(ToolCall).optional(),
  }),
  error: ErrorResponse.optional(),
})
const StreamingChoice = z.object({
  finish_reason: z.string().nullable(),
  native_finish_reason: z.string().nullable(),
  delta: z.object({
    content: z.string().nullable(),
    role: z.string().optional(),
    tool_calls: z.array(ToolCall).optional(),
  }),
  error: ErrorResponse.optional(),
})

const ResponseUsage = z.object({
  prompt_tokens: z.number().int(),
  completion_tokens: z.number().int(),
  total_tokens: z.number().int(),
  cost: z.number(),
  prompt_tokens_details: z.object({
    cached_tokens: z.number().int(),
    audio_tokens: z.number().int(),
  }),
})

export const OpenRouterResponseSchema = z.object({
  id: z.string(),
  provider: z.string(),
  choices: z.array(
    z.union([NonChatChoice, NonStreamingChoice, StreamingChoice])
  ),
  created: z.number().int(),
  model: z.string(),
  object: z.union([
    z.literal("chat.completion"),
    z.literal("chat.completion.chunk"),
  ]),
  system_fingerprint: z.string().optional(),
  usage: ResponseUsage.optional(),
})

/** === Types === */
export type OpenRouterRequest = z.infer<typeof OpenRouterRequestSchema>
export type OpenRouterResponse = z.infer<typeof OpenRouterResponseSchema>

type NonStreamingChoice = Extract<
  OpenRouterResponse["choices"][number],
  { message: unknown }
>

function isNonStreamingChoice(
  choice: OpenRouterResponse["choices"][number]
): choice is NonStreamingChoice {
  return typeof (choice as any).message === "object"
}

async function transcribeWithGemini(
  buffer: Buffer,
  language: string,
  removeFillerWords = true
) {
  const base64Audio = buffer.toString("base64")

  const resp = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001:floor",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: getOptimizedTranscriptionPrompt({
                  language,
                  removeFillerWords,
                }),
              },
              {
                type: "input_audio",
                input_audio: {
                  data: base64Audio,
                  format: "mp3",
                },
              },
            ],
          },
        ],
        temperature: 0,
        usage: {
          include: true,
        },
      }),
    }
  )

  if (!resp.ok) {
    let errorMessage = `HTTP ${resp.status}: ${resp.statusText}`
    try {
      const errJson = await resp.json()
      errorMessage =
        errJson.error?.message || errJson.message || errorMessage
    } catch {
      /* ignore */
    }
    console.error("OpenRouter API error:", errorMessage)
    throw new Error(errorMessage)
  }

  const json = await resp.json()
  const { success, data: parsed, error } = OpenRouterResponseSchema.safeParse(json)

  if (!success) {
    console.error("Failed to parse OpenRouter response:", error)
    throw new Error("Failed to parse OpenRouter response")
  }

  if (!parsed.choices || parsed.choices.length === 0) {
    console.error("No choices returned in OpenRouter response")
    console.dir(parsed)
    throw new Error("No choices returned in OpenRouter response")
  }

  const firstChoice = parsed.choices[0]!

  if (firstChoice.error) {
    console.error("OpenRouter error:", parsed.choices[0]!.error)
    throw new Error(firstChoice.error.message)
  }

  if (!isNonStreamingChoice(firstChoice)) {
    console.error("Unexpected choice shape, no message field:", firstChoice)
    throw new Error("Invalid choice shape")
  }

  const content = firstChoice.message.content

  if (!content) {
    console.error("No content in OpenRouter response message")
    throw new Error("No content in OpenRouter response message")
  }

  return {
    transcription: content,
    generationId: parsed.id,
    usage: parsed.usage,
    provider: parsed.provider,
  }
}
