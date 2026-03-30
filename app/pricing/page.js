import Link from 'next/link'
import { Check, ArrowLeft } from 'lucide-react'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    sessions: 50,
    popular: false,
    features: [
      'Access to all 5 specialized AI models',
      'Up to 3 projects',
      '50 council sessions per month',
      'ProjectState memory across sessions',
      'Full review log and audit trail',
      'Hallucination firewall protection',
      'Community support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49',
    period: 'per month',
    sessions: 500,
    popular: true,
    features: [
      'Everything in Free, plus:',
      'Up to 25 projects',
      '500 council sessions per month',
      'Priority model access',
      'Advanced analytics dashboard',
      'Export project code & state',
      'Priority email support',
      'Cancel anytime'
    ]
  },
  {
    id: 'teams',
    name: 'Teams',
    price: '$199',
    period: 'per month',
    sessions: 2500,
    popular: false,
    features: [
      'Everything in Pro, plus:',
      'Unlimited projects',
      '2,500 council sessions per month',
      'Team collaboration features',
      'SSO & advanced security',
      'Dedicated account manager',
      'Custom model configurations',
      'SLA & priority support'
    ]
  }
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Simple Header */}
      <nav className="border-b border-gray-900">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">
              Verity<span className="text-indigo-400">Flow</span>
            </span>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to home</span>
            </Link>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-gray-400">
              Choose the plan that fits your needs. All plans include access to the full AI council.
            </p>
          </div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-gray-900/50 border rounded-2xl p-8 flex flex-col ${
                  plan.popular 
                    ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' 
                    : 'border-gray-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-block px-4 py-1 bg-indigo-600 text-white text-sm font-semibold rounded-full">
                      Most popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-400">/ {plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-500">{plan.sessions} sessions/month</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`w-full px-6 py-3 rounded-lg font-semibold text-center transition-colors ${
                    plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-white'
                  }`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
