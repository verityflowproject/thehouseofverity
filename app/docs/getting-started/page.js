import LegalLayout from '@/components/LegalLayout'

const SECTIONS = [
  { id: 'account', title: 'Creating Your Account' },
  { id: 'dashboard', title: 'Navigating the Dashboard' },
  { id: 'first-session', title: 'Your First Council Session' },
  { id: 'output-tabs', title: 'Understanding Your Output' },
  { id: 'project-context', title: 'Projects and Context' },
  { id: 'tips', title: 'Tips for Better Prompts' },
]

export default function GettingStartedPage() {
  return (
    <LegalLayout
      title="Getting Started"
      lastUpdated="April 2026"
      sections={SECTIONS}
    >
      <div className="space-y-16 text-gray-400">

        {/* Account */}
        <section id="account">
          <h2 className="text-2xl font-semibold text-white mb-4">Creating Your Account</h2>
          <p className="mb-4 leading-relaxed">
            VerityFlow requires no API keys, no model subscriptions, and no setup beyond creating an account. All five AI providers are managed by VerityFlow — you get direct access to Claude, GPT, Codestral, Gemini, and Perplexity without touching any provider dashboard.
          </p>

          <div className="space-y-4 mb-6">
            <div className="flex gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-sm font-bold flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <p className="text-white font-medium mb-1">Sign up at verityflow.io</p>
                <p className="text-sm">Click <strong className="text-gray-300">Get started</strong> in the top-right corner of the homepage. You can register with a Google account or a magic link sent to your email — no password required.</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-sm font-bold flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <p className="text-white font-medium mb-1">Choose a plan</p>
                <p className="text-sm">Free accounts receive a starter credit allowance. Paid plans (Starter, Pro, Studio) unlock higher daily limits and monthly credit top-ups. You can also purchase one-time credit packs that never expire. See <a href="/pricing" className="text-indigo-400 hover:text-indigo-300 underline">pricing</a> for full details.</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-sm font-bold flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <p className="text-white font-medium mb-1">You're in</p>
                <p className="text-sm">After authentication, you land directly in the dashboard. Your session persists across visits — no need to sign in again unless you explicitly sign out.</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
            <p className="text-sm"><span className="text-indigo-300 font-medium">Note:</span> VerityFlow is in public beta. Features are actively being added and credit costs may change as the platform matures. Early users receive preferential pricing.</p>
          </div>
        </section>

        {/* Dashboard */}
        <section id="dashboard">
          <h2 className="text-2xl font-semibold text-white mb-4">Navigating the Dashboard</h2>
          <p className="mb-6 leading-relaxed">
            The dashboard is your central workspace. Everything — projects, sessions, output, and billing — lives here.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              {
                label: 'Projects',
                desc: 'Each project is a persistent workspace. It maintains its own context document across sessions, so the models remember decisions made in previous runs.'
              },
              {
                label: 'Sessions',
                desc: 'Every prompt submitted to the AI Council produces one session. Sessions are saved and reviewable — you can inspect each model\'s output, flagged issues, and review pipeline results.'
              },
              {
                label: 'Review Log',
                desc: 'After a session completes, the review log shows every model\'s review of the primary output, flagged issues, severity levels, and whether the arbitration protocol triggered.'
              },
              {
                label: 'Settings',
                desc: 'Adjust appearance, notification preferences, session defaults, and privacy options. Settings are saved to your browser. More account-level settings are coming soon.'
              },
              {
                label: 'Billing',
                desc: 'View your credit balance, usage history, and purchase credit packs or upgrade your plan directly from the dashboard billing tab.'
              },
              {
                label: 'Output Panel',
                desc: 'The right-side panel shows the latest session output in three views: Code (raw output), Preview (rendered HTML), and Files (parsed file tree for multi-file outputs).'
              }
            ].map(({ label, desc }) => (
              <div key={label} className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                <p className="text-white font-medium mb-2">{label}</p>
                <p className="text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* First Session */}
        <section id="first-session">
          <h2 className="text-2xl font-semibold text-white mb-4">Your First Council Session</h2>
          <p className="mb-6 leading-relaxed">
            Running a session is straightforward. The AI Council handles task breakdown, model assignment, review, and arbitration automatically. Here's what happens when you submit a prompt:
          </p>

          <ol className="space-y-6 mb-8">
            {[
              {
                step: 'Create a project',
                detail: 'From the dashboard sidebar, click "New Project". Give it a name and an optional description. The council will use this context throughout all future sessions in this project.'
              },
              {
                step: 'Write your prompt',
                detail: 'Describe what you want built. Be as specific as you need — the council works best with clear requirements but handles ambiguity better than single-model tools because multiple models interpret the task before any code is written. You don\'t need to specify a tech stack; the council selects the most appropriate one for your requirements.'
              },
              {
                step: 'Watch the Council work in real time',
                detail: 'As the session runs, you\'ll see each model appear when it is actively contributing. Claude designs the architecture, Perplexity verifies dependencies against live documentation (the hallucination firewall), Codestral writes the implementation, Gemini refactors, and GPT provides the final review pass.'
              },
              {
                step: 'Review the output',
                detail: 'Once complete, the output panel populates with the full result. Switch between Code, Preview (rendered HTML), and Files (file tree) views to inspect your output. The review log is accessible via the session history.'
              },
              {
                step: 'Iterate',
                detail: 'Submit follow-up prompts in the same project. The council\'s persistent context ensures it remembers the architecture and decisions made in previous sessions — no need to re-explain your codebase.'
              }
            ].map(({ step, detail }, i) => (
              <li key={step} className="flex gap-4">
                <div className="flex-shrink-0 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold flex items-center justify-center">{i + 1}</div>
                  <div className="w-px bg-gray-800 mt-7 h-full hidden" />
                </div>
                <div>
                  <p className="text-white font-medium mb-1">{step}</p>
                  <p className="text-sm leading-relaxed">{detail}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
            <p className="text-sm"><span className="text-amber-300 font-medium">Expected duration:</span> A typical Council session takes 30–90 seconds depending on task complexity, model load, and how many review passes are triggered. Complex multi-file builds may take longer.</p>
          </div>
        </section>

        {/* Output Tabs */}
        <section id="output-tabs">
          <h2 className="text-2xl font-semibold text-white mb-4">Understanding Your Output</h2>
          <p className="mb-6 leading-relaxed">
            The output panel provides three views of your session result. Each view is designed for a different part of your workflow.
          </p>

          <div className="space-y-4 mb-6">
            <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-0.5 text-xs font-mono bg-gray-800 text-gray-300 rounded">Code</span>
                <p className="text-white font-medium">Raw output view</p>
              </div>
              <p className="text-sm leading-relaxed">The default view. Shows the complete, unformatted text output from the Council session. Use this to read the code directly, copy sections, or inspect the raw structure of multi-file outputs. The copy button in the top-right copies the full output to your clipboard.</p>
            </div>

            <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-0.5 text-xs font-mono bg-gray-800 text-gray-300 rounded">Preview</span>
                <p className="text-white font-medium">Rendered HTML preview</p>
              </div>
              <p className="text-sm leading-relaxed">If your session output contains HTML — whether a full document, a component, or a fragment — this tab renders it live in a sandboxed iframe. You can see exactly how the output looks in a browser without deploying anything. If no HTML is detected, this tab shows a message indicating the output type.</p>
            </div>

            <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-0.5 text-xs font-mono bg-gray-800 text-gray-300 rounded">Files</span>
                <p className="text-white font-medium">File tree and codebase viewer</p>
              </div>
              <p className="text-sm leading-relaxed">When the Council generates multi-file output, the Files tab parses the output into individual files and presents them as a navigable file tree. Click any file in the tree to view its contents in the right panel. This is especially useful for full-stack projects where the output spans dozens of files across multiple directories.</p>
            </div>
          </div>

          <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-xl mb-6">
            <p className="text-white font-medium mb-2">Review Log</p>
            <p className="text-sm leading-relaxed">Below the output panel, each session has an associated review log. It shows every model's review of the output, flagged issues (with severity levels: warning or error), whether issues were auto-fixed by the arbitration protocol, and the total token cost of the session. Click any review entry to expand it.</p>
          </div>
        </section>

        {/* Project Context */}
        <section id="project-context">
          <h2 className="text-2xl font-semibold text-white mb-4">Projects and Context</h2>
          <p className="mb-4 leading-relaxed">
            One of VerityFlow's core advantages over single-session AI tools is persistent context. Every project maintains a living document — ProjectState — that is updated after each session. This document captures architectural decisions, file structure, technology choices, naming conventions, and open tasks.
          </p>
          <p className="mb-6 leading-relaxed">
            When you run a new session in the same project, the Council reads ProjectState before doing anything else. This means:
          </p>

          <ul className="space-y-3 mb-6">
            {[
              'The models remember which components already exist and won\'t duplicate them.',
              'Naming conventions established in session one are respected in session fifty.',
              'Architectural constraints set during the planning phase carry forward automatically.',
              'You never need to re-explain your stack or paste previous code as context.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <span className="text-indigo-400 mt-0.5 flex-shrink-0">✦</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
            <p className="text-sm"><span className="text-indigo-300 font-medium">Best practice:</span> Start each project with a detailed brief. Describe the stack you want, the goals of the project, and any constraints. The more detail in the first session, the more accurately ProjectState is initialized — and the more consistent all future sessions will be.</p>
          </div>
        </section>

        {/* Tips */}
        <section id="tips">
          <h2 className="text-2xl font-semibold text-white mb-4">Tips for Better Prompts</h2>
          <p className="mb-6 leading-relaxed">
            The AI Council is powerful, but like any engineering team, it performs best when given clear requirements. Here are practices that consistently produce better output:
          </p>

          <div className="space-y-4">
            {[
              {
                tip: 'Be specific about inputs and outputs',
                detail: 'Instead of "build a login form", say "build a login form with email and password fields that submits to POST /api/auth/login and redirects to /dashboard on success". The council can infer a lot, but explicit requirements remove guesswork.'
              },
              {
                tip: 'Describe the context, not just the task',
                detail: 'Mention what already exists. "Add a search bar to the existing header component at components/Header.tsx" gives the council enough context to generate code that integrates cleanly rather than creating a new component from scratch.'
              },
              {
                tip: 'Use the project description field',
                detail: 'When creating a project, fill in the description with your stack, constraints, and goals. This becomes part of ProjectState and is referenced in every session within that project.'
              },
              {
                tip: 'Iterate in small steps for complex builds',
                detail: 'For large features, break them into multiple sessions. Session one: data model. Session two: API routes. Session three: UI. Each session benefits from the previous one\'s context, and smaller tasks produce higher-quality output than one massive prompt.'
              },
              {
                tip: 'Don\'t over-specify the tech stack',
                detail: 'Unless you have a reason to constrain the technology (e.g., "must use React" for an existing codebase), let the council choose. The models will select the most appropriate stack for your requirements — often more suitable than what you might default to.'
              },
              {
                tip: 'Review the flagged issues',
                detail: 'After each session, check the review log for flagged issues. Even auto-fixed issues are worth reading — they indicate potential architectural concerns the council identified and corrected.'
              },
            ].map(({ tip, detail }) => (
              <div key={tip} className="p-5 bg-gray-900/50 border border-gray-800 rounded-xl">
                <p className="text-white font-medium mb-2">{tip}</p>
                <p className="text-sm leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl">
            <p className="text-white font-medium mb-2">Still have questions?</p>
            <p className="text-sm text-gray-400 mb-4">The FAQ covers common questions about the council, billing, and supported stacks. Or reach out directly.</p>
            <div className="flex gap-3">
              <a href="/faq" className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium">View FAQ</a>
              <a href="/contact" className="px-4 py-2 text-sm border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors">Contact us</a>
            </div>
          </div>
        </section>

      </div>
    </LegalLayout>
  )
}
