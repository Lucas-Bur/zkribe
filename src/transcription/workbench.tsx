import {
  Check,
  ChevronDown,
  Copy,
  Download,
  FileAudio,
  LoaderCircle,
  Search,
  Sparkles,
  Upload,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { optimizeAudio } from './audio'
import { modelIds, modelOptions, type ModelId } from './models'
import { languages } from './schema'
import { transcribeAudio } from './transcribe.functions'

type Result = Awaited<ReturnType<typeof transcribeAudio>>

export function TranscriptionWorkbench() {
  const [file, setFile] = useState<File>()
  const [optimized, setOptimized] = useState<File>()
  const [result, setResult] = useState<Result>()
  const [status, setStatus] = useState<'idle' | 'optimizing' | 'transcribing'>('idle')
  const [error, setError] = useState('')
  const [model, setModel] = useState<ModelId>(modelIds[0])
  const [language, setLanguage] = useState('auto')
  const [removeFillers, setRemoveFillers] = useState(true)

  async function selectFile(nextFile?: File) {
    if (!nextFile) return
    if (!nextFile.type.startsWith('audio/')) {
      setError('Bitte wählen Sie eine gültige Audiodatei.')
      return
    }
    setFile(nextFile)
    setOptimized(undefined)
    setResult(undefined)
    setError('')
    setStatus('optimizing')
    try {
      setOptimized(await optimizeAudio(nextFile))
    } catch {
      setError('Dieses Audioformat konnte nicht verarbeitet werden.')
      setFile(undefined)
    } finally {
      setStatus('idle')
    }
  }

  async function transcribe() {
    if (!optimized) return
    setStatus('transcribing')
    setError('')
    const form = new FormData()
    form.set('audio', optimized)
    form.set('model', model)
    form.set('language', language)
    form.set('removeFillers', String(removeFillers))
    try {
      setResult(await transcribeAudio({ data: form }))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Transkription fehlgeschlagen.')
    } finally {
      setStatus('idle')
    }
  }

  return (
    <div className="grid items-start gap-6 md:grid-cols-2">
      <section className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <PanelHeading icon={<Upload size={18} />} title="Audiodatei">
          Bis 10 MB nach lokaler Optimierung
        </PanelHeading>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="KI-Modell"
            value={model}
            onChange={(value) => setModel(value as ModelId)}
            options={modelOptions}
          />
          <SelectField
            label="Sprache"
            value={language}
            onChange={setLanguage}
            options={languages}
          />
        </div>
        <label className="my-4 flex items-center justify-between gap-4 rounded-lg border bg-muted/40 p-4">
          <span className="grid gap-0.5 text-sm">
            <strong className="font-medium">Füllwörter entfernen</strong>
            <small className="text-xs text-muted-foreground">
              Bereinigt äh, ähm und Wiederholungen
            </small>
          </span>
          <input
            className="size-5 accent-primary"
            type="checkbox"
            checked={removeFillers}
            onChange={(event) => setRemoveFillers(event.target.checked)}
          />
        </label>
        <label className="grid min-h-48 cursor-pointer place-content-center place-items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary">
          <input
            className="hidden"
            type="file"
            accept="audio/*"
            onChange={(event) => void selectFile(event.target.files?.[0])}
          />
          {status === 'optimizing' ? (
            <LoaderCircle className="size-12 animate-spin text-primary" />
          ) : (
            <FileAudio className="size-12 text-muted-foreground" />
          )}
          <strong>
            {status === 'optimizing' ? 'Audio wird optimiert' : 'Audiodatei auswählen'}
          </strong>
          <span className="text-sm text-muted-foreground">MP3, WAV, M4A, OGG oder OPUS</span>
        </label>
        {file && optimized && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border p-3 text-success">
            <Check className="shrink-0" size={17} />
            <span className="grid min-w-0 text-sm text-foreground">
              <strong className="truncate font-medium">{file.name}</strong>
              <small className="text-xs text-muted-foreground">
                {formatBytes(file.size)} → {formatBytes(optimized.size)}
              </small>
            </span>
          </div>
        )}
        {error && (
          <p
            className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}
        <button
          className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={!optimized || status !== 'idle'}
          onClick={() => void transcribe()}
        >
          {status === 'transcribing' ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {status === 'transcribing' ? 'Transkribiere...' : 'Transkription starten'}
        </button>
      </section>
      <Results result={result} fileName={file?.name} />
    </div>
  )
}

function PanelHeading({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <span className="text-primary">{icon}</span>
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: ReadonlyArray<readonly [string, string]>
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      <span>{label}</span>
      <div className="relative">
        <select
          className="w-full rounded-lg border bg-background pr-10 pl-3 py-2.5 outline-none transition-shadow focus:ring-2 focus:ring-primary/40 appearance-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map(([key, name]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    </label>
  )
}

function Results({ result, fileName }: { result?: Result; fileName?: string }) {
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState<number>()
  const segments = result?.transcription.segments ?? []
  const visible = segments.filter((segment) =>
    `${segment.speaker} ${segment.text}`.toLowerCase().includes(query.toLowerCase()),
  )
  useEffect(() => setQuery(''), [result])

  function download() {
    const text = segments.map((segment) => `${segment.speaker}: ${segment.text}`).join('\n\n')
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileName?.replace(/\.[^.]+$/, '') ?? 'transcription'}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="min-h-144 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex items-start justify-between gap-4 p-6 pb-1">
        <PanelHeading icon={<Sparkles size={18} />} title="Transkription">
          {segments.length ? `${segments.length} Segmente erkannt` : 'Das Ergebnis erscheint hier'}
        </PanelHeading>
        {segments.length > 0 && (
          <button
            className="flex cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            type="button"
            onClick={download}
          >
            <Download size={16} /> Export
          </button>
        )}
      </div>
      {segments.length > 0 ? (
        <>
          <label className="mx-6 mb-4 flex items-center gap-2 rounded-lg border bg-background px-3 focus-within:ring-2 focus-within:ring-primary/40">
            <Search className="shrink-0 text-muted-foreground" size={17} />
            <input
              className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Im Transkript suchen"
            />
          </label>
          <div className="max-h-112 divide-y overflow-y-auto border-y">
            {visible.map((segment) => (
              <article
                className="relative p-4 pr-12 transition-colors hover:bg-muted/30"
                key={segment.id}
              >
                <div>
                  <span className="mr-2 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {segment.speaker}
                  </span>
                  {segment.type !== 'speech' && (
                    <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {segment.type.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <p className="mt-2 leading-relaxed">{segment.text}</p>
                <button
                  className="absolute top-4 right-4 grid size-8 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&_svg]:size-4"
                  type="button"
                  aria-label="Segment kopieren"
                  onClick={() =>
                    void navigator.clipboard
                      .writeText(segment.text)
                      .then(() => setCopied(segment.id))
                  }
                >
                  {copied === segment.id ? <Check /> : <Copy />}
                </button>
              </article>
            ))}
          </div>
          {result?.usage && (
            <div className="flex justify-end gap-4 px-6 py-4 text-xs text-muted-foreground">
              <span>{result.usage.totalTokens?.toLocaleString() ?? '–'} Tokens</span>
              <span>
                {result.usage.cost == null
                  ? 'Kosten nicht gemeldet'
                  : `$${result.usage.cost.toFixed(6)}`}
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="grid min-h-108 place-content-center place-items-center gap-2 p-6 text-center text-muted-foreground">
          <FileAudio className="mb-2 size-12" />
          <strong className="text-foreground">Noch kein Transkript</strong>
          <span className="text-sm">Wählen Sie links eine Aufnahme aus.</span>
        </div>
      )}
    </section>
  )
}

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}
