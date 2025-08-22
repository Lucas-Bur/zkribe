import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Brain, CloudUpload, FileAudio, Filter, Info, Languages, Loader2, Mic, Pause, Play, Upload } from "lucide-react"
import type React from "react"

interface FileUploadProps {
  file: File | null
  originalAudioUrl: string
  processedAudioUrl: string
  isConverting: boolean
  error: string
  isPlayingOriginal: boolean
  isPlayingProcessed: boolean
  originalAudioRef: React.RefObject<HTMLAudioElement | null>
  processedAudioRef: React.RefObject<HTMLAudioElement | null>
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onToggleOriginalPlayback: () => void
  onToggleProcessedPlayback: () => void
  onTranscribe: () => void
  isTranscribing: boolean
  processedFile: File | null
  selectedModel: string
  onModelChange: (model: string) => void
  selectedLanguage: string
  onLanguageChange: (language: string) => void
  removeFillerWords: boolean
  onRemoveFillerWordsChange: (enabled: boolean) => void
  setIsPlayingOriginal: (isPlaying: boolean) => void
  setIsPlayingProcessed: (isPlaying: boolean) => void
}

const languageOptions = [
  { value: 'auto', mainText: 'Automatisch erkennen', subText: 'Optimal für KI-Analyse' },
  { value: 'de', mainText: 'Deutsch', subText: 'German (DE)' },
  { value: 'en', mainText: 'Englisch', subText: 'English (US/UK)' },
  { value: 'es', mainText: 'Spanisch', subText: 'Spanish (ES/LA)' },
  { value: 'fr', mainText: 'Französisch', subText: 'French (FR/CA)' },
  { value: 'it', mainText: 'Italienisch', subText: 'Italian (IT)' },
  { value: 'pt', mainText: 'Portugiesisch', subText: 'Portuguese (PT/BR)' },
  { value: 'ru', mainText: 'Russisch', subText: 'Russian (RU)' },
  { value: 'ja', mainText: 'Japanisch', subText: 'Japanese (JP)' },
  { value: 'ko', mainText: 'Koreanisch', subText: 'Korean (KR)' },
  { value: 'zh', mainText: 'Chinesisch', subText: 'Chinese (Mandarin/Cantonese)' },
] as const

const modelOptions = [
  {
    value: 'gemini-2.0-flash',
    mainText: 'Gemini 2.0 Flash',
    subText: 'Vielseitige KI für Text, Bild, Audio',
    icon: Brain,
  },
  {
    value: 'whisper-1',
    mainText: 'OpenAI Whisper-1',
    subText: 'Spezialisiert auf hochpräzise Spracherkennung',
    icon: Mic,
  },
] as const

export function FileUpload({
  file,
  originalAudioUrl,
  processedAudioUrl,
  isConverting,
  error,
  isPlayingOriginal,
  isPlayingProcessed,
  originalAudioRef,
  processedAudioRef,
  onFileChange,
  onToggleOriginalPlayback,
  onToggleProcessedPlayback,
  onTranscribe,
  isTranscribing,
  processedFile,
  selectedModel,
  onModelChange,
  selectedLanguage,
  onLanguageChange,
  removeFillerWords,
  onRemoveFillerWordsChange,
  setIsPlayingOriginal,
  setIsPlayingProcessed,
}: FileUploadProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="size-5" />
          Audiodatei hochladen
        </CardTitle>
        <CardDescription>Wählen Sie eine Audio-Datei zum Transkribieren</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <CloudUpload className="h-4 w-4" />
              KI-Modell auswählen
            </label>
            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger className="w-full font-medium">
                <SelectValue>
                  {selectedModel ? (
                    (() => {
                      const selectedOption = modelOptions.find(
                        (option) => option.value === selectedModel,
                      )
                      if (selectedOption) {
                        const IconComponent = selectedOption.icon
                        return (
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            <span>{selectedOption.mainText}</span>
                          </div>
                        )
                      }
                      return 'Wählen Sie ein Modell'
                    })()
                  ) : (
                    'Wählen Sie ein Modell'
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map((option) => {
                  const IconComponent = option.icon
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{option.mainText}</div>
                          <div className="text-xs text-muted-foreground">{option.subText}</div>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Sprache der Audiodatei
            </label>
            <Select value={selectedLanguage} onValueChange={onLanguageChange}>
              <SelectTrigger className="w-full font-medium">
                <SelectValue>
                  {selectedLanguage
                    ? languageOptions.find((option) => option.value === selectedLanguage)
                      ?.mainText || 'Sprache auswählen' // Fallback für unbekannten Wert
                    : 'Sprache auswählen'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.mainText}</div>
                      <div className="text-xs text-muted-foreground">{option.subText}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card shadow-xs">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-foreground" />
            <div>
              <label className="text-sm font-medium text-foreground">Füllwörter entfernen</label>
              <p className="text-xs text-muted-foreground">Entfernt "äh", "ähm", "also", etc. für saubereren Text</p>
            </div>
          </div>
          <Switch checked={removeFillerWords} onCheckedChange={onRemoveFillerWordsChange} />
        </div>

        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
          <input
            type="file"
            accept="audio/*"
            onChange={onFileChange}
            className="hidden"
            id="audio-upload"
          />
          <label htmlFor="audio-upload" className="cursor-pointer">
            <FileAudio className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="mb-2 text-foreground">Klicken Sie, um eine Audiodatei auszuwählen</p>
            <p className="text-sm text-muted-foreground">MP3, WAV, OPUS bis zu 10MB (auto-komprimiert)</p>
          </label>
        </div>

        {file && (
          <div className="bg-card p-4 rounded-lg space-y-3 border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <FileAudio className="h-5 w-5 text-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                {processedFile && (
                  <div className="space-y-1">
                    <p className="text-xs text-tertiary font-medium">
                      KI-optimiert: <span className="text-tertiary">{(processedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    </p>
                    {/* HIER WURDE ES ANGEPASST: text-tertiary für besseren Kontrast */}
                    <div className="flex items-start gap-2 p-2 bg-tertiary/10 rounded text-xs text-tertiary">
                      <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>
                        Optimiert für Transkription: 16kHz Mono, Kompression & Filterung für bessere KI-Erkennung
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isConverting && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                Optimiere Audio für KI-Transkription (16kHz Mono + Kompression)...
              </div>
            )}

            {originalAudioUrl && (
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="grid gap-3 md:grid-cols-2">
                  {/* Original Audio Player */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Original:</span>
                      <span className="text-xs text-muted-foreground">{(file!.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onToggleOriginalPlayback}
                      className="w-full flex items-center gap-2 bg-transparent border border-border hover:bg-muted"
                    >
                      {isPlayingOriginal ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isPlayingOriginal ? "Pause" : "Original anhören"}
                    </Button>
                    <audio
                      ref={originalAudioRef}
                      src={originalAudioUrl}
                      onEnded={() => setIsPlayingOriginal(false)}
                      onPause={() => setIsPlayingOriginal(false)}
                      onPlay={() => setIsPlayingOriginal(true)}
                      className="hidden"
                    />
                  </div>

                  {/* Processed Audio Player */}
                  {processedAudioUrl && processedFile && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-tertiary">KI-optimiert:</span>
                        <span className="text-xs text-tertiary">
                          {(processedFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onToggleProcessedPlayback}
                        className="w-full flex items-center gap-2 border-tertiary text-tertiary hover:bg-tertiary/10 bg-transparent"
                      >
                        {isPlayingProcessed ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        {isPlayingProcessed ? "Pause" : "KI-optimiert anhören"}
                      </Button>
                      <audio
                        ref={processedAudioRef}
                        src={processedAudioUrl}
                        onEnded={() => setIsPlayingProcessed(false)}
                        onPause={() => setIsPlayingProcessed(false)}
                        onPlay={() => setIsPlayingProcessed(true)}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                {processedFile && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      Vergleichen Sie Original und KI-optimierte Version vor der Transkription
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button
          onClick={onTranscribe}
          disabled={!processedFile || isTranscribing || isConverting}
          className="w-full"
          size="lg"
        >
          {isTranscribing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Transkribiere mit {selectedModel === "whisper-1" ? "Whisper-1" : "Gemini 2.0"}...
            </>
          ) : (
            `Transkription starten mit ${selectedModel === "whisper-1" ? "Whisper-1" : "Gemini 2.0"}`
          )}
        </Button>
      </CardContent>
    </Card>
  )
}