'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowLeft, ChevronRight, Check } from 'lucide-react'

const CATEGORIES = [
  {
    id: 'bug',
    icon: '⬡',
    title: 'Bug Report',
    description: "Something isn't working as expected. API errors, broken UI, sessions failing, or anything behaving incorrectly.",
    subject: 'Bug report: [brief description]',
    placeholder: 'Describe what happened, what you expected, and steps to reproduce. Include any error messages.'
  },
  {
    id: 'feature',
    icon: '◈',
    title: 'Feature Request',
    description: 'Have an idea that would make VerityFlow better? New model roles, integrations, workflow improvements — we want to hear it.',
    subject: 'Feature request: [your idea]',
    placeholder: 'Describe the feature and how it would improve your workflow.'
  },
  {
    id: 'billing',
    icon: '◇',
    title: 'Billing & Credits',
    description: 'Questions about charges, credit purchases, subscription changes, or refund requests.',
    subject: 'Billing question',
    placeholder: 'Describe your billing question or issue. Include your account email if different from above.'
  },
  {
    id: 'byok',
    icon: '⬢',
    title: 'BYOK & API Keys',
    description: 'Help setting up your own provider keys, OpenRouter configuration, or key encryption questions.',
    subject: 'Help with API key setup',
    placeholder: 'Which provider key are you having trouble with? What happens when you try to save it?'
  },
  {
    id: 'feedback',
    icon: '○',
    title: 'Feedback',
    description: "General thoughts on the product. What's working, what's not, what you wish existed. Honest feedback helps us build better.",
    subject: 'Feedback',
    placeholder: "Tell us what you think. Be as specific or as general as you like."
  },
  {
    id: 'other',
    icon: '···',
    title: 'Something Else',
    description: "Partnerships, press, enterprise inquiries, or anything that doesn't fit the categories above.",
    subject: 'General inquiry',
    placeholder: "Tell us what's on your mind."
  }
]

const SUCCESS_NOTES = {
  bug: 'In the meantime, check the status page at /status.',
  feature: 'We review all feature requests — popular ones get prioritized.',
  billing: 'For urgent billing issues, include your Stripe receipt number in a follow-up.',
  byok: 'The FAQ has a full BYOK setup guide: /faq#byok',
  feedback: 'Thank you — honest feedback is how we get better.',
  other: "We'll route your message to the right person."
}

export default function ContactPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [view, setView] = useState('categories') // 'categories' | 'form' | 'success'
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium',
    shareSessionId: false
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setFormData(prev => ({
      ...prev,
      subject: category.subject,
      message: ''
    }))
    setView('form')
  }

  const handleBack = () => {
    setView('categories')
    setSelectedCategory(null)
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      priority: 'medium',
      shareSessionId: false
    })
    setErrors({})
    setSubmitError('')
  }

  const validateField = (name, value) => {
    const newErrors = { ...errors }
    
    switch (name) {
      case 'name':
        if (!value || value.length < 2) {
          newErrors.name = 'Name must be at least 2 characters'
        } else {
          delete newErrors.name
        }
        break
      case 'email':
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address'
        } else {
          delete newErrors.email
        }
        break
      case 'message':
        if (!value || value.length < 20) {
          newErrors.message = 'Message must be at least 20 characters'
        } else if (value.length > 2000) {
          newErrors.message = 'Message must be less than 2000 characters'
        } else {
          delete newErrors.message
        }
        break
    }
    
    setErrors(newErrors)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    // Validate all fields
    validateField('name', formData.name)
    validateField('email', formData.email)
    validateField('message', formData.message)

    // Check if there are any errors
    if (Object.keys(errors).length > 0 || !formData.name || !formData.email || !formData.message) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          category: selectedCategory.id,
          categoryTitle: selectedCategory.title
        })
      })

      const data = await response.json()

      if (data.success) {
        setView('success')
      } else {
        setSubmitError(data.error || 'Something went wrong. Email us directly at contact@verityflow.io')
      }
    } catch (error) {
      setSubmitError('Something went wrong. Email us directly at contact@verityflow.io')
    } finally {
      setIsSubmitting(false)
    }
  }

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
                Compare
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
              <Link href="/dashboard" className="block text-gray-400 hover:text-white transition-colors">
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
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-4">Get in touch</h1>
            <p className="text-xl text-gray-400 mb-3">
              We read every message. Usually respond within 1–2 business days.
            </p>
            <p className="text-sm font-mono text-gray-600">
              contact@verityflow.io
            </p>
          </div>

          {/* View 1: Category Selection */}
          {view === 'categories' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-semibold mb-2">What can we help you with?</h2>
              <p className="text-gray-400 mb-8">Select a category to get started.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className="group bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-left hover:border-indigo-500/50 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{category.icon}</span>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{category.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{category.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* View 2: Message Form */}
          {view === 'form' && selectedCategory && (
            <div className="animate-fade-in">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm mb-8 border border-indigo-500/20">
                {selectedCategory.title}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={(e) => validateField('name', e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={(e) => validateField('email', e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    onBlur={(e) => validateField('message', e.target.value)}
                    placeholder={selectedCategory.placeholder}
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                  <div className="flex items-center justify-between mt-1">
                    {errors.message && <p className="text-sm text-red-400">{errors.message}</p>}
                    <p className="text-sm text-gray-600 ml-auto">{formData.message.length} / 2000</p>
                  </div>
                </div>

                {/* Priority (Bug Report only) */}
                {selectedCategory.id === 'bug' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Priority
                    </label>
                    <div className="flex gap-3">
                      {['low', 'medium', 'high'].map((priority) => (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, priority }))}
                          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.priority === priority
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700'
                          }`}
                        >
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      High priority = blocking your work entirely
                    </p>
                  </div>
                )}

                {/* Attach context (Bug Report only) */}
                {selectedCategory.id === 'bug' && (
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="shareSessionId"
                        checked={formData.shareSessionId}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-gray-400">
                        I can share my session ID if needed
                      </span>
                    </label>
                  </div>
                )}

                {/* Submit Error */}
                {submitError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-400">{submitError}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send message
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* View 3: Success */}
          {view === 'success' && selectedCategory && (
            <div className="animate-fade-in text-center py-12">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-400" />
              </div>

              <h2 className="text-3xl font-bold mb-3">Message sent</h2>
              <p className="text-gray-400 mb-6">
                We'll get back to you at <span className="text-white">{formData.email}</span> within 1–2 business days.
              </p>

              <div className="max-w-md mx-auto mb-8 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
                <p className="text-sm text-gray-400">
                  {SUCCESS_NOTES[selectedCategory.id]}
                </p>
              </div>

              <button
                onClick={handleBack}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
              >
                Send another message
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-[#0a0a0f]">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
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
                <li><Link href="/docs/api" className="text-gray-400 hover:text-white transition-colors">API Reference</Link></li>
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
