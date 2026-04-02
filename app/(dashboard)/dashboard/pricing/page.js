import Link from 'next/link'
import { ArrowLeft, Check, Coins } from 'lucide-react'
import { auth } from '@/lib/auth'
import { UpgradeButton } from '@/components/dashboard'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    credits: '50 on signup',
    features: [
      'Access to all 5 specialized AI models',
      'Up to 3 projects',
      '50 credits on signup',
      '~3 council sessions/day',
      'Hallucination firewall',
      'Full review log',
      'No API keys needed'
    ],
    cta: 'Current Plan',
    popular: false
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$19',
    period: 'per month',
    credits: '2,500/mo',
    features: [
      'Everything in Free, plus:',
      '2,500 credits/month',
      '10 projects',
      '~10 council sessions/day',
      'Extended session history',
      'Email support',
      'All models managed, zero setup'
    ],
    cta: 'Upgrade to Starter',
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49',
    period: 'per month',
    credits: '8,000/mo',
    features: [
      'Everything in Starter, plus:',
      '8,000 credits/month',
      '50 projects',
      '~50 council sessions/day',
      'Priority model routing',
      'Usage analytics dashboard',
      'Priority support',
      'Transparent cost breakdowns'
    ],
    cta: 'Upgrade to Pro',
    popular: true
  },
  {
    id: 'studio',
    name: 'Studio',
    price: '$99',
    period: 'per month',
    credits: '20,000/mo',
    features: [
      'Everything in Pro, plus:',
      '20,000 credits/month',
      'Unlimited projects',
      'Unlimited daily usage',
      'Custom model routing rules',
      'Team collaboration',
      'Dedicated support & SLA',
      'Full unit economics reporting'
    ],
    cta: 'Upgrade to Studio',
    popular: false
  }
]

const FAQ = [
  {
    question: 'How do credits work?',
    answer: 'Credits are VerityFlow\'s universal currency. Each council session costs approximately 30 credits, depending on task complexity and which models are used. Credits are deducted in real-time based on actual token usage — you only pay for what you use. Simple tasks use fewer credits (routed to efficient models), while complex tasks may use more.'
  },
  {
    question: 'Do credits expire?',
    answer: 'No. Credits purchased through one-time credit packs never expire. Monthly subscription credits are also persistent — they roll over and never disappear. You can use them at your own pace.'
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes. You can cancel your subscription at any time from the billing portal. You\'ll retain full access until the end of your current billing period, then your account will automatically downgrade to the Free plan. All your projects, data, and remaining credits are preserved.'
  },
  {
    question: 'What if I run out of credits?',
    answer: 'You can top up credits anytime with a one-time purchase. Credit packs range from 500 credits ($5) to 8,000 credits ($40). Larger packs offer better value. You can also upgrade your subscription plan for more monthly credits.'
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
          Choose the plan that fits your needs. All plans include the full AI council — no API keys needed.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id
          const isFree = plan.id === 'free'

          return (
            <div
              key={plan.id}
              className={`relative bg-gray-900/50 border rounded-2xl p-6 flex flex-col ${
                plan.popular 
                  ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' 
                  : 'border-gray-800'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && !isCurrentPlan && (
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
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">/ {plan.period}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm text-indigo-300 font-medium">{plan.credits} credits</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
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
                  className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold text-center transition-colors block"
                >
                  Continue with Free
                </Link>
              ) : (
                <UpgradeButton
                  currentPlan={currentPlan}
                  targetPlan={plan.id}
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
