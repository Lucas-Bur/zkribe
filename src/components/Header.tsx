import { Link } from '@tanstack/react-router'
import { Star } from 'lucide-react'
import { ModeToggle } from './ModeToggle'
import { Button } from './ui/button'
import { Separator } from './ui/separator'

export default function GlobalHeader() {
  return (
    <header className="bg-background sticky top-0 z-50 border-b w-full px-6 py-4">
      <div className="flex flex-row items-center gap-2">
        <Link to="/" >
          <h1 className='text-lg font-bold text-primary'>
            KI Audio-Transkription
          </h1>
        </Link>
        <div className='ml-auto h-6 flex items-center gap-4'>
          <Button variant="outline" size="default" asChild>
            <a href="https://github.com/lucas-bur" target="_blank" rel="noreferrer noopener" className='flex items-center gap-2'>
              <Star />
              Github
            </a>
          </Button>
          <Separator orientation="vertical" />
          <ModeToggle />
        </div>

      </div>
    </header>
  )
}
