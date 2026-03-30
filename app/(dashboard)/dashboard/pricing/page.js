import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import { auth } from '@/lib/auth'
import { UpgradeButton } from '@/components/dashboard'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    sessions: 50,
    features: [
      'Access to all 5 specialized AI models',
      'Up to 3 projects',
      '50 council sessions per month',
      'ProjectState memory across sessions',
      'Full review log and audit trail',
      'Hallucination firewall protection',
      'Community support'
    ],
    cta: 'Current Plan',
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49',
    period: 'per month',
    sessions: 500,
    features: [
      'Everything in Free, plus:',
      'Up to 25 projects',
      '500 council sessions per month',
      'Priority model access',
      'Advanced analytics dashboard',
      'Export project code & state',
      'Priority email support',
      'Cancel anytime'
    ],
    cta: 'Upgrade to Pro',
    popular: true
  },
  {
    id: 'teams',
    name: 'Teams',
    price: '$199',
    period: 'per month',
    sessions: 2500,
    features: [
      'Everything in Pro, plus:',
      'Unlimited projects',
      '2,500 council sessions per month',
      'Team collaboration features',
      'SSO & advanced security',
      'Dedicated account manager',
      'Custom model configurations',
      'SLA & priority support'
    ],
    cta: 'Upgrade to Teams',
    popular: false
  }
]

const FAQ = [
  {
    question: 'What counts as a council session?',
    answer: 'A council session is triggered each time you send a prompt to VerityFlow. The AI council collaborates to process your request — verifying dependencies, designing architecture, generating code, and reviewing output. All of this coordination counts as one session, regardless of how many models are involved or how many rounds of review occur.'
  },
  {
    question: 'Do unused sessions roll over to the next month?',
    answer: 'No, session limits reset at the start of each billing period. For example, if you use 30 of your 50 free sessions in January, you\'ll start February with a fresh 50 sessions. We recommend upgrading if you consistently hit your limit to ensure uninterrupted access.'
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes. You can cancel your Pro or Teams subscription at any time from the billing portal. You\'ll retain full access until the end of your current billing period, then your account will automatically downgrade to the Free plan. All your projects and data remain intact.'
  }
]

export default async function PricingPage() {
  const session = await auth()
  const currentPlan = session?.user?.plan || 'free'

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div>
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to dashboard</span>
        </Link>
        
        <h1 className="text-4xl font-bold text-white mb-3">
          Scale your council
        </h1>
        <p className="text-xl text-gray-400">
          Choose the plan that fits your needs. All plans include access to the full AI council.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-8">
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id
          const isFree = plan.id === 'free'

          return (
            <div
              key={plan.id}
              className={`relative bg-gray-900/50 border rounded-2xl p-8 flex flex-col ${
                plan.popular 
                  ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' 
                  : 'border-gray-800'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-block px-4 py-1 bg-indigo-600 text-white text-sm font-semibold rounded-full">
                    Most popular
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-block px-4 py-1 bg-emerald-600 text-white text-sm font-semibold rounded-full">
                    Current plan
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">/ {plan.period}</span>
                </div>
                <p className="text-sm text-gray-500">{plan.sessions} sessions/month</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrentPlan ? (
                <button
                  disabled
                  className="w-full px-6 py-3 bg-gray-800 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                >
                  Current plan
                </button>
              ) : isFree ? (
                <Link
                  href="/dashboard"
                  className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold text-center transition-colors"
                >
                  Continue with Free
                </Link>
              ) : (
                <UpgradeButton
                  currentPlan={currentPlan}
                  targetPlan={plan.id}
                  className="w-full"
                />
              )}
            </div>
          )
        })}
      </div>

      {/* FAQ Section */}
      <div className="pt-12 border-t border-gray-800">
        <h2 className="text-3xl font-bold text-white mb-8">
          Frequently asked questions
        </h2>
        
        <div className="space-y-6">
          {FAQ.map((item, i) => (
            <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                {item.question}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
