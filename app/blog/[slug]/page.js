import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { BLOG_POSTS, getPost } from '@/lib/blog-data'

export function generateStaticParams() {
  return BLOG_POSTS.map(post => ({ slug: post.slug }))
}

const CATEGORY_COLORS = {
  Engineering: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  Product: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Announcement: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Behind the Scenes': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

function renderBlock(block, i) {
  if (block.type === 'h2') {
    return <h2 key={i} className="text-2xl font-bold text-white mt-10 mb-4">{block.text}</h2>
  }
  if (block.type === 'p') {
    return <p key={i} className="text-gray-400 leading-relaxed mb-5">{block.text}</p>
  }
  return null
}

export default function BlogPostPage({ params }) {
  const post = getPost(params.slug)
  if (!post) notFound()

  const currentIndex = BLOG_POSTS.findIndex(p => p.slug === post.slug)
  const prev = currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : null
  const next = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null

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
              <a href="/#how-it-works" className="text-gray-400 hover:text-white transition-colors">How it works</a>
              <a href="/#council" className="text-gray-400 hover:text-white transition-colors">The Council</a>
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
              <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">Sign in</Link>
              <Link href="/register" className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors font-medium">Get started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All posts</span>
          </Link>

          {/* Post header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${CATEGORY_COLORS[post.category] || 'bg-gray-800 text-gray-300 border-gray-700'}`}>
                {post.category}
              </span>
              <span className="text-xs text-gray-500">{post.date}</span>
              <span className="text-xs text-gray-600">·</span>
              <span className="text-xs text-gray-500">{post.readTime}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              {post.title}
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              {post.summary}
            </p>
          </div>

          <div className="border-t border-gray-800/60 pt-10">
            <div className="prose-custom">
              {post.content.map((block, i) => renderBlock(block, i))}
            </div>
          </div>

          {/* Prev/Next */}
          <div className="mt-16 pt-8 border-t border-gray-800">
            <div className="flex items-stretch justify-between gap-4">
              {prev ? (
                <Link
                  href={`/blog/${prev.slug}`}
                  className="group flex-1 flex items-center gap-3 p-5 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-indigo-500/40 transition-all"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Previous</p>
                    <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors leading-snug">{prev.title}</p>
                  </div>
                </Link>
              ) : <div className="flex-1" />}

              {next ? (
                <Link
                  href={`/blog/${next.slug}`}
                  className="group flex-1 flex items-center justify-end gap-3 p-5 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-indigo-500/40 transition-all text-right"
                >
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Next</p>
                    <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors leading-snug">{next.title}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                </Link>
              ) : <div className="flex-1" />}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl text-center">
            <p className="text-white font-semibold mb-2">Ready to try the AI Council?</p>
            <p className="text-sm text-gray-400 mb-5">Create a free account and run your first session in minutes.</p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors text-sm"
            >
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-[#0a0a0f]">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold">Verity<span className="text-indigo-400">Flow</span></span>
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed">Your AI Engineering Firm.<br />Five models. One team.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/changelog" className="text-gray-400 hover:text-white transition-colors">Changelog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Developers</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/docs/getting-started" className="text-gray-400 hover:text-white transition-colors">Getting Started</Link></li>
                <li><Link href="/docs/credits" className="text-gray-400 hover:text-white transition-colors">Credit System</Link></li>
                <li><Link href="/status" className="text-gray-400 hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
              <div className="mt-6 pt-6 border-t border-gray-800">
                <ul className="space-y-3 text-sm">
                  <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-900">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600 font-mono">
              <p>VerityFlow is not affiliated with Anthropic, OpenAI, Google, Mistral, or Perplexity.</p>
              <p className="text-gray-500">Made for builders who ship.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
