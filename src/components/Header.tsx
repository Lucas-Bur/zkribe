import { Link } from '@tanstack/react-router'
import { Star } from 'lucide-react'
import { ModeToggle } from './ModeToggle'
import { Button } from './ui/button'
import { Separator } from './ui/separator'

export default function GlobalHeader() {
  return (
    <header className="bg-background sticky top-0 z-50 border-b w-full px-6 py-4">
      <div className="flex flex-row items-center gap-2 h-8">
        <Link to="/">
          <h1 className="text-lg font-bold text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 500 500"
              className="inline-block size-6 mr-2"
            >
              <path
                transform="translate(-8,-15) scale(1.05,1.05)"
                fill="currentColor"
                d="M96.52 24.28c-2.66.84-11.76 11.34-27.02 30.52-12.74 16.1-23.1 29.54-23.1 29.96s58.94.98 131.04 1.12l130.9.42-15.12 16.1c-8.26 8.96-34.02 36.68-57.12 61.6-23.1 25.06-55.58 60.06-72.1 77.7-16.52 17.78-41.72 44.8-56 60.2-14.28 15.26-35.84 38.5-48.02 51.52-22.12 23.66-26.18 29.68-26.18 37.94 0 6.16 5.46 14.84 11.2 17.78 9.94 5.32 6.02 6.58 153.72-48.58 31.78-11.9 65.66-24.78 75.32-28.56 9.52-3.92 17.64-7 17.92-7 .42 0-6.02 14-14.14 31.08-27.44 58.24-42.56 92.12-43.54 98.14-1.54 8.54.14 15.82 4.76 20.72 6.44 6.86 11.06 8.68 20.72 7.98 7.98-.56 11.2-2.1 51.24-24.5 87.5-48.86 139.44-78.96 142.52-82.6 3.78-4.06 3.5-10.08-.7-14.7-4.9-5.46-6.16-5.18-90.02 27.86-20.44 7.98-39.2 15.4-41.72 16.52-6.72 3.08-7.28 2.66-4.34-3.22 1.4-2.8 16.52-33.6 33.6-68.18 21.7-44.52 31.08-64.82 31.5-69.3 1.12-9.1-3.64-17.92-12.04-22.12-7.7-3.92-12.46-3.36-29.4 3.36-6.58 2.52-24.22 9.24-39.2 15.12-14.98 5.74-44.24 16.94-65.1 25.06-20.72 7.98-39.34 15.12-41.3 15.68-2.38.7 2.1-4.62 14-16.94 9.66-9.94 29.12-30.66 43.4-46.06 39.48-42.7 100.8-108.5 133-142.8 45.92-49 44.8-47.46 44.8-55.3 0-4.62-.84-7.7-2.94-10.36-6.58-8.26 3.36-7.84-168.84-7.7-101.78 0-159.32.56-161.7 1.54"
              />
            </svg>
            zkribe - Transkription
          </h1>
        </Link>
        <div className='ml-auto h-6 flex items-center gap-4'>
          <Button variant="outline" size="default" asChild>
            <a href="https://github.com/Lucas-Bur/zkribe" target="_blank" rel="noreferrer noopener" className='flex items-center gap-2'>
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
