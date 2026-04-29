import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'
import { FcmProvider } from '@/contexts/fcm-context'
import { ThemeProvider } from '@/contexts/theme-context'

export const metadata: Metadata = {
  title: 'Aahanik - Spiritual Task Manager',
  description: 'Track your daily spiritual activities and earn Rajipo. Jai Swaminarayan.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Aahanik',
  },
  formatDetection: { telephone: false },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#e05c00',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Prevent flash of wrong theme before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{if(localStorage.getItem('aahanik-theme')==='dark')document.documentElement.classList.add('dark');}catch(e){}})();` }} />
      </head>
      <body className="h-full">
        <ThemeProvider>
          <AuthProvider>
            <FcmProvider>
              {children}
            </FcmProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
