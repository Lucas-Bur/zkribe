import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Info } from 'lucide-react'

type GenerationDetailsProps = {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  cost: number
  prompt_tokens_details: {
    cached_tokens: number
    audio_tokens: number
  }
  provider: string
}

export function GenerationDetailsCard({
  prompt_tokens,
  completion_tokens,
  total_tokens,
  cost,
  prompt_tokens_details: { audio_tokens },
  provider,
}: GenerationDetailsProps) {
  const promptPct = total_tokens > 0 ? (prompt_tokens / total_tokens) * 100 : 0
  const completionPct =
    total_tokens > 0 ? (completion_tokens / total_tokens) * 100 : 0

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Generierungs­details
        </CardTitle>
        <CardDescription>Kosten & Tokenaufteilung</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Bar für Tokenverhältnis */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-foreground">
              Prompt vs. Completion
            </span>
            <Badge variant="secondary">
              {total_tokens.toLocaleString()} Total
            </Badge>
          </div>
          <Progress value={promptPct} className="h-3 bg-muted" />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>Prompt {promptPct.toFixed(1)}%</span>
            <span>Completion {completionPct.toFixed(1)}%</span>
          </div>
        </div>

        <Separator />

        {/* Detail-Grid mit Tooltipen */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              label: 'Prompt Tokens',
              value: prompt_tokens,
              desc: 'Enthält Audio- & Cached-Tokens',
            },
            {
              label: 'Audio Tokens',
              value: audio_tokens,
              desc: 'Direkt aus der Audiodatei extrahiert',
            },
            // {
            //   label: "Cached Tokens",
            //   value: cached_tokens,
            //   desc: "Bereits bekannte Phrasen im Cache",
            // },
            {
              label: 'Completion Tokens',
              value: completion_tokens,
              desc: 'Vom Modell generierte Tokens',
            },
            {
              label: 'Total Tokens',
              value: total_tokens,
              desc: 'Summe aller Tokens',
            },
            {
              label: 'Kosten',
              value: cost,
              desc: 'Genauer Betrag in USD',
              isCurrency: true,
            },
            {
              label: 'Provider',
              value: provider,
              desc: 'Der Anbieter, der die Transkription durchgeführt hat',
              isString: true,
            },
          ].map((stat) => (
            <Tooltip key={stat.label}>
              <TooltipTrigger asChild>
                <div className="p-4 bg-card border border-border rounded-lg shadow-sm">
                  <p className="text-2xl font-bold text-foreground">
                    {stat.isCurrency
                      ? `$${stat.value.toFixed(6)}`
                      : stat.isString
                        ? stat.value
                        : stat.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                {stat.desc}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
