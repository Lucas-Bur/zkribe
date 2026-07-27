import { type createOpenRouterText } from '@tanstack/ai-openrouter'

export const models = {
  'google/gemini-2.5-flash': 'Gemini 2.5 Flash',
  'google/gemini-2.5-flash-lite': 'Gemini 2.5 Flash Lite',
  'google/gemini-3.1-flash-lite': 'Gemini 3.1 Flash Lite',
} as const satisfies Partial<Record<Parameters<typeof createOpenRouterText>['0'], string>>

export type ModelId = keyof typeof models

export const modelIds = Object.keys(models) as [ModelId, ...Array<ModelId>]
export const modelOptions = Object.entries(models) as Array<[ModelId, string]>
