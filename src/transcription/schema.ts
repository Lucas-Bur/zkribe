import { z } from 'zod'

export const languages = [
  ['auto', 'Automatisch'],
  ['de', 'Deutsch'],
  ['en', 'Englisch'],
  ['es', 'Spanisch'],
  ['fr', 'Französisch'],
  ['it', 'Italienisch'],
  ['pt', 'Portugiesisch'],
] as const

export const transcriptionSchema = z.object({
  segments: z.array(
    z.object({
      id: z.number().int(),
      speaker: z.string(),
      text: z.string(),
      type: z.enum(['speech', 'background_noise', 'music', 'inaudible']),
    }),
  ),
})

export type Transcription = z.infer<typeof transcriptionSchema>
