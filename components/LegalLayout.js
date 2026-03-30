'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowLeft } from 'lucide-react'

export default function LegalLayout({ title, lastUpdated, sections, children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  // Scroll spy effect
  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(s => ({
        id: s.id,
        element: document.getElementById(s.id)
      }))

      // Find the section that's currently in view
      const currentSection = sectionElements.find(({ element }) => {
        if (!element) return false
        const rect = element.getBoundingClientRect()
        return rect.top <= 120 && rect.bottom >= 120
      })

      if (currentSection) {
        setActiveSection(currentSection.id)
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sections])

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">
                Verity<span className="text-indigo-400">Flow</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Beta
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm">
              <a href="/#how-it-works" className="text-gray-400 hover:text-white transition-colors">
                How it works
              </a>
              <a href="/#council" className="text-gray-400 hover:text-white transition-colors">
                The Council
              </a>
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                Pricing
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link href="/register" className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors font-medium">
                Get started
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-800 pt-4 space-y-4">
              <a href="/#how-it-works" className="block text-gray-400 hover:text-white transition-colors">
                How it works
              </a>
              <a href="/#council" className="block text-gray-400 hover:text-white transition-colors">
                The Council
              </a>
              <Link href="/compare" className="block text-gray-400 hover:text-white transition-colors">
                Compare
              </Link>
              <Link href="/pricing" className="block text-gray-400 hover:text-white transition-colors">
                Pricing
              </Link>
              <div className="pt-4 space-y-2">
                <Link href="/login" className="block w-full px-4 py-2 text-center text-gray-300 hover:text-white border border-gray-700 rounded-lg transition-colors">
                  Sign in
                </Link>
                <Link href="/register" className="block w-full px-5 py-2 text-center bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors font-medium">
                  Get started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar TOC - Desktop only, sticky */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-32">
                <nav className="space-y-1">
                  <div className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
                    Contents
                  </div>
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className={`block w-full text-left text-sm py-2 px-3 rounded-lg transition-colors ${
                        activeSection === section.id
                          ? 'bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-400'
                          : 'text-gray-500 hover:text-gray-300 border-l-2 border-transparent'
                      }`}
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 max-w-[720px]">
              <h1 className="text-5xl font-bold text-white mb-4">{title}</h1>
              <p className="text-sm text-gray-500 mb-12">Last updated: {lastUpdated}</p>
              {children}
            </main>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-[#0a0a0f]">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Column 1: Brand */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold">
                  Verity<span className="text-indigo-400">Flow</span>
                </span>
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your AI Engineering Firm.<br />Five models. One team.
              </p>
            </div>

            {/* Column 2: Product */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Product
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/compare" className="text-gray-400 hover:text-white transition-colors">
                    Compare
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/changelog" className="text-gray-400 hover:text-white transition-colors">
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Developers */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Developers
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/docs" className="text-gray-400 hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/docs/api" className="text-gray-400 hover:text-white transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/verityflowproject"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    GitHub
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </li>
                <li>
                  <Link href="/status" className="text-gray-400 hover:text-white transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Company & Legal */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
              
              <div className="mt-6 pt-6 border-t border-gray-800">
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                      Cookie Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-900">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600 font-mono">
              <p>
                VerityFlow is not affiliated with Anthropic, OpenAI, Google, Mistral, or Perplexity.
              </p>
              <p className="text-gray-500">
                Made for builders who ship.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
