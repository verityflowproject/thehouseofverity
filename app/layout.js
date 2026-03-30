import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'VerityFlow — Your AI Engineering Firm',
  description:
    'Multi-model AI coding platform powered by Claude, GPT-4, Codestral, Gemini, and Perplexity. Ship production-grade software at the speed of thought.',
  keywords: 'AI coding, multi-model, Claude, GPT, Codestral, Gemini, Perplexity, engineering',
  authors: [{ name: 'VerityFlow', url: 'https://verityflow.io' }],
  openGraph: {
    title: 'VerityFlow — Your AI Engineering Firm',
    description: 'Ship production-grade software at the speed of thought.',
    url: 'https://verityflow.io',
    siteName: 'VerityFlow',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Space Grotesk (display/body) + JetBrains Mono (code) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        {/* Prevent DataClone DOMException from Next.js perf timings */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);',
          }}
        />
      </head>
      <body style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
