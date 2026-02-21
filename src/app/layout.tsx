import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gestão de Finanças',
  description: 'Controle seus recebimentos com facilidade',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
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
