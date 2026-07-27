import { createFileRoute } from '@tanstack/react-router'
import { TranscriptionWorkbench } from '../transcription/workbench'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
      <section className="mb-6 max-w-2xl">
        <p className="mb-2 text-xs font-bold tracking-[0.16em] text-primary uppercase">
          Audio rein. Klarer Text raus.
        </p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
          Transkription ohne Umwege.
        </h1>
        <p className="leading-relaxed text-muted-foreground">
          Audio wird lokal für Sprache optimiert und anschließend sicher über OpenRouter
          transkribiert.
        </p>
      </section>
      <TranscriptionWorkbench />
    </main>
  )
}
