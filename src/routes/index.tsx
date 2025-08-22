import { FileUpload } from '@/components/FileUpload';
import { GenerationDetailsCard } from '@/components/GenerationDetails';
import { TranscriptionResults } from '@/components/TranscriptionResult';
import { getTranscriptionFn } from '@/fn/transcribe';
import { compressAudioToOptimizedMp3 } from '@/lib/audio-converter';
import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState } from 'react';

export const Route = createFileRoute('/')({
  component: App,
})

type TranscriptionResponse = Awaited<ReturnType<typeof getTranscriptionFn>> | null

function App() {

  const [file, setFile] = useState<File | null>(null)
  const [processedFile, setProcessedFile] = useState<File | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResponse>(null)
  const [error, setError] = useState<string>("")
  const [originalAudioUrl, setOriginalAudioUrl] = useState<string>("")
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string>("")
  const originalAudioRef = useRef<HTMLAudioElement>(null)
  const processedAudioRef = useRef<HTMLAudioElement>(null)
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false)
  const [isPlayingProcessed, setIsPlayingProcessed] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.0-flash")
  const [selectedLanguage, setSelectedLanguage] = useState<string>("auto")
  const [removeFillerWords, setRemoveFillerWords] = useState<boolean>(true)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (
        selectedFile.type.startsWith("audio/")
      ) {
        setFile(selectedFile)
        setError("")
        setTranscriptionResult(null)

        const originalUrl = URL.createObjectURL(selectedFile)
        setOriginalAudioUrl(originalUrl)
        setProcessedAudioUrl("")
        setProcessedFile(null)
        setIsConverting(true)

        try {
          const processedFile = await compressAudioToOptimizedMp3(selectedFile)
          setProcessedFile(processedFile)
          const processedUrl = URL.createObjectURL(processedFile)
          setProcessedAudioUrl(processedUrl)
          setIsConverting(false)
        } catch (error) {
          setError("Error processing audio file. Please try a different format.")
          setIsConverting(false)
          setFile(null)
          setOriginalAudioUrl("")
          setProcessedAudioUrl("")
        }
      } else {
        setError("Please select a valid audio file")
        setFile(null)
        setOriginalAudioUrl("")
        setProcessedAudioUrl("")
      }
    }
  }

  const toggleOriginalPlayback = () => {
    if (originalAudioRef.current) {
      if (isPlayingOriginal) {
        originalAudioRef.current.pause()
      } else {
        if (isPlayingProcessed && processedAudioRef.current) {
          processedAudioRef.current.pause()
        }
        originalAudioRef.current.play()
      }
      setIsPlayingOriginal(!isPlayingOriginal)
    }
  }

  const toggleProcessedPlayback = () => {
    if (processedAudioRef.current) {
      if (isPlayingProcessed) {
        processedAudioRef.current.pause()
      } else {
        if (isPlayingOriginal && originalAudioRef.current) {
          originalAudioRef.current.pause()
        }
        processedAudioRef.current.play()
      }
      setIsPlayingProcessed(!isPlayingProcessed)
    }
  }

  const handleTranscribe = async () => {
    if (!processedFile) {
      setError("No processed audio file available for transcription.")
      return
    }

    setIsTranscribing(true)
    setError("")

    try {
      const formdata = new FormData()
      formdata.append("audio", processedFile)
      formdata.append("model", selectedModel)
      formdata.append("language", selectedLanguage)
      formdata.append("removeFillerWords", removeFillerWords.valueOf().toString())
      const response = await getTranscriptionFn({ data: formdata })
      setTranscriptionResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transcription error. Please try again.")
    } finally {
      setIsTranscribing(false)
    }
  }

  const downloadTranscription = () => {
    const blob = new Blob([transcriptionResult?.transcription || ""], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transcription-${file?.name || "audio"}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 min-h-[calc(100vh-65px)] bg-background">
      <div className="grid gap-6 md:grid-cols-2">
        <FileUpload
          file={file}
          originalAudioUrl={originalAudioUrl}
          processedAudioUrl={processedAudioUrl}
          isConverting={isConverting}
          error={error}
          isPlayingOriginal={isPlayingOriginal}
          isPlayingProcessed={isPlayingProcessed}
          originalAudioRef={originalAudioRef}
          processedAudioRef={processedAudioRef}
          onFileChange={handleFileChange}
          onToggleOriginalPlayback={toggleOriginalPlayback}
          onToggleProcessedPlayback={toggleProcessedPlayback}
          onTranscribe={handleTranscribe}
          isTranscribing={isTranscribing}
          processedFile={processedFile}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          removeFillerWords={removeFillerWords}
          onRemoveFillerWordsChange={setRemoveFillerWords}
          setIsPlayingOriginal={setIsPlayingOriginal}
          setIsPlayingProcessed={setIsPlayingProcessed}
        />

        <TranscriptionResults
          transcription={transcriptionResult?.transcription}
          onDownload={downloadTranscription}
        />

      </div>
      {
        (transcriptionResult?.usage) && (
          <GenerationDetailsCard provider={transcriptionResult.provider} {...transcriptionResult.usage} />
        )
      }
    </div>

  )
}
