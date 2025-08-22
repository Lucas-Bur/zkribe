import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Download, FileAudio } from "lucide-react"

type TranscriptionResultsProps = {
  transcription: string | undefined
  onDownload: () => void
}

export function TranscriptionResults({
  transcription,
  onDownload,
}: TranscriptionResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Transkriptionsergebnis
        </CardTitle>
        <CardDescription>Ihr transkribierter Text erscheint hier</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {transcription ? (
          <div className="space-y-4">
            <div className="bg-card border border-border shadow-xs p-4 rounded-lg max-h-96 overflow-y-auto">
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                {transcription}
              </p>
            </div>
            <Button
              onClick={onDownload}
              variant="outline"
              size="lg"
              className="w-full flex items-center justify-center gap-2 bg-transparent
                         border border-border hover:bg-muted"
            >
              <Download className="h-4 w-4" />
              Transkription herunterladen
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileAudio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Laden Sie eine Audiodatei hoch, um die Transkription hier zu
              sehen
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}