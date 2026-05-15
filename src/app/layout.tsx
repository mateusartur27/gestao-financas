import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gestão de Finanças',
  description: 'Controle seus recebimentos com facilidade',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>
        {children}
        <footer className="mt-8 pb-6 text-center text-xs text-gray-400">
          Feito por{' '}
          <a
            href="https://instagram.com/mateusartur__"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gray-500 hover:text-brand-600 transition-colors"
          >
            @mateusartur__
          </a>
        </footer>
      </body>
    </html>
  )
}
