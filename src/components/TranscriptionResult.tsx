import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getTranscriptionFn } from '@/fn/transcribe'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight, Copy, Download, FileAudio, Info, Search, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'

type TranscriptionResult = Awaited<
  ReturnType<typeof getTranscriptionFn>
>['transcription']
type Segment = TranscriptionResult['segments'][number]
type SegmentType = Segment['type']

type TranscriptionResultsProps = {
  transcription: TranscriptionResult | undefined
  onDownload: () => void
}

const typeBadgeStyle: Record<SegmentType, string> = {
  speech: 'bg-primary/10 text-primary ring-1 ring-primary/20', // Nutze primary
  background_noise:
    'bg-secondary/10 text-secondary ring-1 ring-secondary/20', // Nutze secondary
  music: 'bg-tertiary/10 text-tertiary ring-1 ring-tertiary/20', // Nutze tertiary
  inaudible:
    'bg-destructive/10 text-destructive ring-1 ring-destructive/20',
}

function SpeakerBadge({ speaker }: { speaker: string }) {
  const chartPalette = [
    'bg-chart-1/10 text-chart-1 ring-chart-1/20',
    'bg-chart-2/10 text-chart-2 ring-chart-2/20',
    'bg-chart-3/10 text-chart-3 ring-chart-3/20',
    'bg-chart-4/10 text-chart-4 ring-chart-4/20',
    'bg-chart-5/10 text-chart-5 ring-chart-5/20',
  ] as const
  const idx =
    Math.abs(
      speaker.split('').reduce((a, c) => a + c.charCodeAt(0), 0),
    ) % chartPalette.length

  return (
    <Badge
      variant="secondary"
      className={cn('ring-1 font-medium', chartPalette[idx])}
      title={speaker}
    >
      {speaker}
    </Badge>
  )
}

function TypeBadge({ type }: { type: SegmentType }) {
  return (
    <Badge
      variant="secondary"
      className={cn('ring-1 font-medium', typeBadgeStyle[type])}
    >
      {type.replace('_', ' ')}
    </Badge>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:cursor-pointer"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1200)
        } catch {
          // Fehlerbehandlung
        }
      }}
      title="Segment kopieren"
    >
      <Copy className={cn('h-4 w-4', copied && 'text-primary animate-wiggle')} />
    </Button>
  )
}

export function TranscriptionResults({
  transcription,
  onDownload,
}: TranscriptionResultsProps) {
  const [query, setQuery] = useState('')
  const [groupBySpeaker, setGroupBySpeaker] = useState(true)

  const segments = transcription?.segments ?? []

  const filtered = useMemo(() => {
    if (!query.trim()) return segments
    const q = query.toLowerCase()
    return segments.filter(
      (s) =>
        s.text.toLowerCase().includes(q) ||
        s.speaker.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q),
    )
  }, [segments, query])

  const grouped = useMemo(() => {
    if (!groupBySpeaker) return null
    const map = new Map<string, Segment[]>()
    for (const s of filtered) {
      if (!map.has(s.speaker)) map.set(s.speaker, [])
      map.get(s.speaker)!.push(s)
    }
    return Array.from(map.entries()).map(([speaker, segs]) => ({
      speaker,
      segs,
    }))
  }, [filtered, groupBySpeaker])

  const [collapsedSpeakers, setCollapsedSpeakers] = useState<
    Record<string, boolean>
  >(() => {
    // Initialisiere alle Sprecher als eingeklappt, wenn groupBySpeaker standardmäßig true ist
    if (groupBySpeaker && grouped) {
      const initial: Record<string, boolean> = {}
      grouped.forEach(({ speaker }) => (initial[speaker] = true))
      return initial
    }
    return {}
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />{' '}
            {/* Icon-Farbe angepasst */}
            Transkriptionsergebnis
          </span>
          <div className="flex items-center gap-2">
            <Button
              onClick={onDownload}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-background text-foreground border-border hover:bg-muted" // Hintergrund und Text angepasst
            >
              <Download className="h-4 w-4" />
              Herunterladen
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Strukturierte Segmente mit Sprecher- und Typ-Badges
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {segments.length ? (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border border-border bg-card shadow-xs">
              {' '}
              {/* Einheitlicher Hintergrund wie im FileUpload */}
              <div className="relative w-full sm:max-w-sm">
                <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Suchen (Text, Sprecher, Typ)…"
                  className="pl-8 bg-background border-border text-foreground focus-visible:ring-ring" // Input-Stile angepasst
                />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="group-by-speaker"
                    checked={groupBySpeaker}
                    onCheckedChange={(v) => {
                      setGroupBySpeaker(Boolean(v))
                      // Beim Wechsel zu Gruppierung: alle Sprecher einklappen
                      if (Boolean(v) && grouped) {
                        const initial: Record<string, boolean> = {}
                        grouped.forEach(({ speaker }) => (initial[speaker] = true))
                        setCollapsedSpeakers(initial)
                      } else {
                        setCollapsedSpeakers({}) // Zustand zurücksetzen, wenn nicht gruppiert
                      }
                    }}
                  />
                  <Label
                    htmlFor="group-by-speaker"
                    className="flex items-center gap-1 text-sm font-medium text-foreground"
                  >
                    <Users className="h-4 w-4 text-muted-foreground" />{' '}
                    {/* Icon-Farbe */}
                    Nach Sprecher gruppieren
                  </Label>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border shadow-xs rounded-lg max-h-[32rem] overflow-y-auto">
              {' '}
              {/* Padding hier weggenommen, da in SegmentRow */}
              {groupBySpeaker && grouped ? (
                <div className="divide-y divide-border">
                  {' '}
                  {/* divide-y für Trennlinien zwischen Sprechern */}
                  {grouped.map(({ speaker, segs }) => {
                    const collapsed = collapsedSpeakers[speaker] ?? true // Standardmäßig eingeklappt, wenn nicht explizit ausgeklappt
                    return (
                      <div key={speaker}>
                        <button
                          type="button"
                          className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/60 transition-colors" // px/py wie in anderen shadcn Komponenten, bg-card
                          onClick={() =>
                            setCollapsedSpeakers((prev) => ({
                              ...prev,
                              [speaker]: !collapsed,
                            }))
                          }
                        >
                          <div className="flex items-center gap-3">
                            {' '}
                            {/* Gap vergrößert */}
                            {collapsed ? (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                            <SpeakerBadge speaker={speaker} />
                            <span className="text-sm text-muted-foreground">
                              {segs.length} Segment{segs.length !== 1 ? 'e' : ''}
                            </span>
                          </div>
                        </button>
                        {!collapsed && (
                          <div className="divide-y divide-border">
                            {' '}
                            {segs.map((s) => (
                              <SegmentRow key={s.id} seg={s} grouped={true} />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filtered.map((s) => (
                    <SegmentRow key={s.id} seg={s} grouped={false} />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground border border-border shadow-xs">
              {' '}
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
              <span>
                Hinweis: Markierungen wie "background noise" oder "inaudible"
                sind als Typen deklariert und werden farblich hervorgehoben.
              </span>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <FileAudio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Laden Sie eine Audiodatei hoch, um die Transkription hier zu sehen
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SegmentRow({ seg, grouped }: { seg: Segment; grouped?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-3 px-4 hover:bg-muted/20 transition-colors">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 mb-1">
          {!grouped && (
            <SpeakerBadge speaker={seg.speaker} />
          )}
          <TypeBadge type={seg.type} />
          <span className="text-xs text-muted-foreground">
            Segment #{seg.id}
          </span>
        </div>
        <p className="text-foreground leading-relaxed whitespace-pre-wrap pl-4">
          {seg.text}
        </p>
      </div>
      <div className="flex items-center self-start h-full">
        <CopyButton text={seg.text} />
      </div>
    </div>
  )
}