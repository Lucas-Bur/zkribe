import { TanstackDevtools } from '@tanstack/react-devtools'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import GlobalHeader from '@/components/Header'
import { ThemeProvider } from '@/components/ThemeProvider'
import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Constants (must match ThemeProvider.tsx)
                const THEME_COOKIE_NAME = 'ui-theme';
                const COOKIE_EXPIRY_DAYS = 365;
                const MILLISECONDS_PER_DAY = 864e5;
                const DARK_MODE_MEDIA_QUERY = '(prefers-color-scheme: dark)';
                const THEME_CLASSES = { LIGHT: 'light', DARK: 'dark' };
                
                // Get theme from cookie
                let theme = document.cookie.match(new RegExp('(^| )' + THEME_COOKIE_NAME + '=([^;]+)'))?.[2];
                
                let resolvedTheme;
                let root = document.documentElement;
                
                // Clear any existing theme classes
                root.classList.remove(THEME_CLASSES.LIGHT, THEME_CLASSES.DARK);
                
                if (!theme || theme === 'system') {
                  // Use system preference for system theme or if no theme is set
                  resolvedTheme = window.matchMedia(DARK_MODE_MEDIA_QUERY).matches ? THEME_CLASSES.DARK : THEME_CLASSES.LIGHT;
                  
                  if (!theme) {
                    // Set cookie with system preference on first visit
                    const expires = new Date(Date.now() + COOKIE_EXPIRY_DAYS * MILLISECONDS_PER_DAY).toUTCString();
                    document.cookie = THEME_COOKIE_NAME + '=system; expires=' + expires + '; path=/; SameSite=Lax';
                  }
                } else {
                  resolvedTheme = theme;
                }
                
                root.classList.add(resolvedTheme);
                
                // Add data attribute for debugging
                root.setAttribute('data-theme', theme || 'system');
                root.setAttribute('data-resolved-theme', resolvedTheme);
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <div
            className="pointer-events-none fixed opacity-15 dark:opacity-5 z-[-10] h-full w-full"
            style={{
              backgroundImage: `url('data:image/svg+xml;utf8,\
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">\
<filter id="n" x="0" y="0" width="100%" height="100%">\
<feTurbulence type="fractalNoise" baseFrequency="15.4" numOctaves="1"/>\
</filter><rect width="128" height="128" filter="url(%23n)"/></svg>')`,
            }}
          />
          <GlobalHeader />
          {children}
          <TanstackDevtools
            config={{
              position: 'bottom-left',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
          <Scripts />
        </ThemeProvider>
      </body>
    </html>
  )
}
