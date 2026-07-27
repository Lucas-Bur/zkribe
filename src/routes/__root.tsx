import { HeadContent, Outlet, ScriptOnce, Scripts, createRootRoute } from '@tanstack/react-router'
import { Moon, Sun } from 'lucide-react'
import appCss from '../styles.css?url'

const themeScript = `(function() {
  try {
    const theme = localStorage.getItem('theme') || 'auto';
    const resolved = theme === 'auto'
      ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolved);
    document.documentElement.style.colorScheme = resolved;
  } catch (_) {}
})();`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        name: 'description',
        content: 'Schnelle, strukturierte KI-Transkription mit OpenRouter.',
      },
      { title: 'zkribe - KI-Transkription' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function NotFound() {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-xl place-content-center gap-4 px-4 text-center">
      <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">404</p>
      <h1 className="text-4xl font-bold tracking-tight">Diese Seite gibt es nicht.</h1>
      <a
        className="mx-auto rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground no-underline transition-opacity hover:opacity-90"
        href="/"
      >
        Zurück zur Transkription
      </a>
    </main>
  )
}

function RootDocument() {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <HeadContent />
        <ScriptOnce>{themeScript}</ScriptOnce>
      </head>
      <body>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:px-8">
          <a
            className="flex items-center gap-2.5 font-bold tracking-tight text-foreground no-underline"
            href="/"
            aria-label="zkribe Startseite"
          >
            <img className="size-9 rounded-lg bg-primary p-1.5" src="/logo.svg" alt="" />
            <span>zkribe</span>
          </a>
          <ThemeToggle />
        </header>
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}

function ThemeToggle() {
  function toggleTheme() {
    const nextDark = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', nextDark)
    document.documentElement.classList.toggle('light', !nextDark)
    document.documentElement.style.colorScheme = nextDark ? 'dark' : 'light'
    localStorage.setItem('theme', nextDark ? 'dark' : 'light')
  }

  return (
    <button
      className="grid size-9 cursor-pointer place-items-center rounded-lg border bg-card transition-colors hover:bg-muted"
      type="button"
      onClick={toggleTheme}
      aria-label="Farbschema wechseln"
    >
      <Moon className="dark:hidden" size={18} />
      <Sun className="hidden dark:block" size={18} />
    </button>
  )
}
