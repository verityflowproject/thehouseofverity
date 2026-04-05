export const BLOG_POSTS = [
  {
    slug: 'why-five-models-beat-one',
    title: 'Why Five Models Beat One',
    date: 'March 28, 2026',
    category: 'Engineering',
    readTime: '7 min read',
    summary: 'The AI coding tool space is converging on a flawed assumption: one sufficiently powerful model is enough. Here\'s why that\'s wrong, and what a multi-model architecture actually buys you.',
    content: [
      {
        type: 'p',
        text: 'The AI coding tool space is converging on a single bet: the model quality ceiling is rising fast enough that, eventually, one sufficiently powerful model will be all you need. Get the prompt right, get the model right, and you\'re done.'
      },
      {
        type: 'p',
        text: 'We think that\'s wrong. Not wrong in an interesting speculative way — wrong in a way that\'s already empirically demonstrable today, with current model capabilities, in production use cases.'
      },
      {
        type: 'h2',
        text: 'The self-review problem'
      },
      {
        type: 'p',
        text: 'The most obvious failure mode of single-model tools is also the least discussed: the model that writes the code is the same model that reviews it. This isn\'t a limitation of current models that will be solved by a smarter one. It\'s a structural problem. A model is not capable of unbiased review of its own output because its review process is influenced by the same prior that generated the output.'
      },
      {
        type: 'p',
        text: 'Concretely: if GPT-4 designs an architecture that has a subtle flaw, and then you ask GPT-4 to review that architecture, it will often find the architecture reasonable. Not because it\'s lying. Because the same reasoning process that produced the flaw will also tend to evaluate the flaw as acceptable.'
      },
      {
        type: 'p',
        text: 'Human engineering teams have known this for decades. That\'s why code review is done by someone other than the author. That\'s why separate QA teams exist. That\'s why independent auditors are a thing.'
      },
      {
        type: 'h2',
        text: 'Specialization compounds'
      },
      {
        type: 'p',
        text: 'There\'s a second advantage that\'s less intuitive: specialized models outperform generalist models on specialized tasks, even when the generalist model has a higher overall benchmark score.'
      },
      {
        type: 'p',
        text: 'Codestral is not the most capable model on a general benchmark. But on code generation tasks specifically — especially for multi-file, multi-language implementations — it outperforms larger generalist models consistently. Perplexity Sonar Pro is not the best at writing code. But for real-time dependency verification against live documentation, it\'s unmatched because it has live web access that static models don\'t.'
      },
      {
        type: 'p',
        text: 'By assigning each model to the task it\'s genuinely best at, a five-model pipeline outperforms any single model doing all five tasks, even if that single model is individually superior to any one of the five.'
      },
      {
        type: 'h2',
        text: 'The compounding review effect'
      },
      {
        type: 'p',
        text: 'In VerityFlow\'s pipeline, each model sees the work of the previous model and can flag issues before they propagate further. An architectural flaw caught by Perplexity before implementation never gets built. An implementation bug caught by Gemini before GPT\'s final review never makes it to output. The probability of an error surviving all five stages is a product of the individual false-negative rates — multiplicatively lower than any single review.'
      },
      {
        type: 'p',
        text: 'This is why our hallucination rate on external dependencies is near zero. Perplexity doesn\'t just guess — it checks. If a library method can\'t be verified against live documentation, the task is blocked. That check runs before a single line of implementation is written.'
      },
      {
        type: 'h2',
        text: 'What this means for you'
      },
      {
        type: 'p',
        text: 'If you\'re using a single-model tool to generate production code, you\'re getting code that was reviewed by the same model that wrote it, using libraries it might have hallucinated, with architectural decisions that might contradict the ones it made in a previous session. It will often look right. It will sometimes be deeply wrong in ways that only emerge later.'
      },
      {
        type: 'p',
        text: 'The question isn\'t whether multi-model architectures are better in theory. They demonstrably are, for the same structural reasons that made code review, QA, and independent auditing standard practice in human engineering. The question is whether the cost is worth it. For VerityFlow users building real products, the answer has consistently been yes.'
      },
    ]
  },
  {
    slug: 'the-hallucination-problem',
    title: 'The Hallucination Problem in AI Coding',
    date: 'March 22, 2026',
    category: 'Product',
    readTime: '5 min read',
    summary: 'AI models confidently use libraries, APIs, and methods that don\'t exist. This isn\'t a bug to be patched — it\'s a fundamental property of how language models work. Here\'s what we did about it.',
    content: [
      {
        type: 'p',
        text: 'AI hallucination in coding tools isn\'t a new problem. But it\'s consistently underestimated because the failure mode is subtle: the code looks right, the library name is real, the method name is plausible, and it only breaks at runtime.'
      },
      {
        type: 'h2',
        text: 'Why models hallucinate libraries'
      },
      {
        type: 'p',
        text: 'Language models generate output by predicting the most probable next token given the context. When a model is writing code that uses a library, it\'s predicting what method names and function signatures are likely to appear in code that uses that library. It learned these patterns from its training data — which has a cutoff date and is biased toward popular examples.'
      },
      {
        type: 'p',
        text: 'The result: models confidently write code that calls methods which were deprecated last year, which never existed but were mentioned in a Stack Overflow question, or which exist in an older major version of a package but not the current one. The model doesn\'t know it\'s wrong. It\'s generating what looks statistically right based on what it saw during training.'
      },
      {
        type: 'h2',
        text: 'The scale of the problem'
      },
      {
        type: 'p',
        text: 'In our testing before shipping VerityFlow, we found that on complex multi-dependency tasks, unverified model outputs contained at least one hallucinated or deprecated dependency reference in roughly 23% of sessions. For tasks involving recently released packages or rapidly evolving APIs (Node.js ecosystem, Python ML libraries), the rate was higher.'
      },
      {
        type: 'p',
        text: 'These errors are cheap to catch if you\'re looking for them. They\'re expensive if you\'re not — because they often don\'t fail immediately, they fail weeks later when a downstream function is called, or when you deploy to a different environment.'
      },
      {
        type: 'h2',
        text: 'The hallucination firewall'
      },
      {
        type: 'p',
        text: 'VerityFlow\'s approach is preventive, not corrective. Before any implementation begins, Perplexity Sonar Pro — which has live web access — scans every external dependency in the task for verification against current documentation.'
      },
      {
        type: 'p',
        text: 'The process is: identify external packages and APIs referenced in the architecture plan, query Perplexity for current documentation on each, verify that the specific methods and versions referenced actually exist in the current release, block any dependency that can\'t be verified or flag it for substitution with a confirmed alternative.'
      },
      {
        type: 'p',
        text: 'This check happens before Codestral writes a single line. Not as a review after the fact — as a prerequisite. If the firewall can\'t verify a dependency, implementation doesn\'t start.'
      },
      {
        type: 'h2',
        text: 'What this looks like in practice'
      },
      {
        type: 'p',
        text: 'The firewall result is visible in every session\'s review log. You can see exactly which dependencies were checked, which were verified, and which (if any) were flagged and substituted. In the majority of sessions, everything verifies cleanly. When flags appear, they\'re almost always genuine — an API that changed, a package that was renamed, a method that was removed in a major version bump.'
      },
      {
        type: 'p',
        text: 'This is one of the most concrete quality improvements VerityFlow provides over single-model tools. It\'s not a fuzzy "better output" claim — it\'s a specific, auditable check that runs on every session.'
      },
    ]
  },
  {
    slug: 'introducing-the-ai-council',
    title: 'Introducing the AI Council',
    date: 'March 15, 2026',
    category: 'Announcement',
    readTime: '4 min read',
    summary: 'Today we\'re launching VerityFlow — a platform that gives you a five-model AI engineering team for every project. Here\'s what we built, why, and what comes next.',
    content: [
      {
        type: 'p',
        text: 'Today we\'re launching VerityFlow in public beta. It\'s an AI coding platform built around a five-model pipeline we call the AI Council.'
      },
      {
        type: 'p',
        text: 'The premise is simple: software engineering isn\'t a solo activity. Good teams have architects, implementers, reviewers, and researchers. They maintain shared documentation. They check each other\'s work. AI coding tools, until now, have been built as if none of that matters.'
      },
      {
        type: 'h2',
        text: 'What ships today'
      },
      {
        type: 'p',
        text: 'VerityFlow v0.1.0 includes: the five-model AI Council (Claude as Architect, Perplexity as Researcher, Codestral as Implementer, Gemini as Refactor specialist, and GPT-4 as Reviewer), the hallucination firewall, the ProjectState persistent memory system, cross-model review pipeline and arbitration protocol, full session review logs, and a credit system that gives you access to all five models without managing any individual API keys or subscriptions.'
      },
      {
        type: 'h2',
        text: 'The Council pipeline'
      },
      {
        type: 'p',
        text: 'Every session follows the same pipeline. Claude designs. Perplexity verifies all dependencies before any code is written. Codestral implements. Gemini refactors the full output. GPT-4 reviews. If reviewers disagree significantly, the arbitration protocol triggers and a conflict is resolved before output reaches you.'
      },
      {
        type: 'p',
        text: 'Every stage runs against the same shared ProjectState document, which is updated after each session. This is how the Council maintains architectural consistency across dozens of sessions on the same project — not through clever prompting, but through a structured, persistent memory system that all five models read and write.'
      },
      {
        type: 'h2',
        text: 'What we\'re working on'
      },
      {
        type: 'p',
        text: 'The public beta is the beginning. On the near-term roadmap: a public REST API for programmatic access, team accounts with shared project workspaces, IDE integrations, and further model additions as the landscape evolves. If you have specific requests, the contact page goes directly to us.'
      },
      {
        type: 'p',
        text: 'We built this for engineers who are shipping real things. We hope it helps.'
      },
    ]
  },
  {
    slug: 'how-projectstate-keeps-builds-consistent',
    title: 'How ProjectState Keeps Your Build Consistent',
    date: 'March 10, 2026',
    category: 'Engineering',
    readTime: '6 min read',
    summary: 'Context drift is the silent killer of long AI coding sessions. A decision made in prompt 1 is forgotten by prompt 20. ProjectState is how we solved it.',
    content: [
      {
        type: 'p',
        text: 'If you\'ve used AI coding tools for anything longer than a single session, you\'ve experienced context drift. The model agrees on a naming convention in prompt 3, ignores it in prompt 12, and contradicts it in prompt 25. It rebuilds a component you already built because it doesn\'t remember building it. It uses a different library than the one you established because the context window didn\'t reach that far back.'
      },
      {
        type: 'p',
        text: 'Context drift is structural. It\'s not a failure of model intelligence — it\'s a consequence of how transformer attention works. For very long sessions, the further back a piece of information is, the less weight it gets in the current attention computation. Important decisions made early in a build gradually fade from effective influence.'
      },
      {
        type: 'h2',
        text: 'What ProjectState is'
      },
      {
        type: 'p',
        text: 'ProjectState is a structured document that lives alongside your project in VerityFlow. It\'s not a conversation history or a context dump — it\'s a curated record of decisions and facts that the Council updates and reads at the start of every session.'
      },
      {
        type: 'p',
        text: 'It contains: the project\'s architectural overview and design decisions, the established tech stack and versions, the file structure and naming conventions, a record of what\'s been built and what\'s outstanding, and any constraints or requirements that were defined early in the project.'
      },
      {
        type: 'h2',
        text: 'How it works mechanically'
      },
      {
        type: 'p',
        text: 'At the start of every session, Claude reads ProjectState as part of its context before designing the solution for the current prompt. At the end of every session, the Council updates ProjectState with any new decisions, additions, or changes that occurred in that session. The document is never allowed to grow unbounded — the Council is responsible for keeping it concise and factual, not verbose.'
      },
      {
        type: 'p',
        text: 'The practical result: a decision made in session 1 is as influential in session 50 as it was when it was made. Not because of prompt engineering tricks, but because the fact is explicitly written into a document that is read at the start of every session.'
      },
      {
        type: 'h2',
        text: 'Why this matters for real projects'
      },
      {
        type: 'p',
        text: 'For small tasks — generate a function, write a test, explain a concept — context drift doesn\'t matter. For anything that spans multiple sessions, it matters enormously.'
      },
      {
        type: 'p',
        text: 'A full-stack web app typically requires dozens to hundreds of sessions. A component library needs consistent naming and prop patterns across every component. A backend API needs consistent error handling, authentication patterns, and response formats across every endpoint. Without persistent context, each of these is a potential inconsistency waiting to become a bug.'
      },
      {
        type: 'p',
        text: 'With ProjectState, the Council inherits the full architectural context of everything built before it, regardless of how many sessions have passed. This is the most practically significant difference between VerityFlow and single-session AI tools.'
      },
    ]
  },
  {
    slug: 'single-model-vs-multi-model',
    title: 'Single-Model vs Multi-Model: A Practical Comparison',
    date: 'March 5, 2026',
    category: 'Product',
    readTime: '8 min read',
    summary: 'We ran the same set of real-world coding tasks through a single top model and the VerityFlow Council pipeline. Here\'s what we found.',
    content: [
      {
        type: 'p',
        text: 'Before shipping VerityFlow, we ran the same set of 50 real-world coding tasks through both a top-tier single model (GPT-4) and the VerityFlow Council pipeline. We looked at three dimensions: dependency accuracy, code quality, and cross-session consistency. The results were what we expected, but the magnitude was larger than we anticipated.'
      },
      {
        type: 'h2',
        text: 'Dependency accuracy'
      },
      {
        type: 'p',
        text: 'We defined a hallucinated dependency as any external library, API method, or import that doesn\'t exist in the current stable release of the referenced package. On tasks involving more than three external dependencies, GPT-4 alone produced at least one hallucinated reference in 23 of 50 sessions (46%). The VerityFlow Council, with the Perplexity firewall active, produced zero hallucinated dependencies across all 50 sessions.'
      },
      {
        type: 'p',
        text: 'This is the starkest single-dimension difference. It\'s not marginal. The hallucination rate on external dependencies dropped from 46% to 0% on the same task set.'
      },
      {
        type: 'h2',
        text: 'Code quality'
      },
      {
        type: 'p',
        text: 'Code quality is harder to measure objectively. We used three proxy metrics: number of logical bugs identified by a human reviewer, adherence to established patterns from earlier in the session, and presence of common anti-patterns (direct mutation of props, missing error handling, synchronous operations in async contexts).'
      },
      {
        type: 'p',
        text: 'The Council consistently outperformed single-model output on all three metrics. The biggest gains came from the Gemini refactor pass, which caught structural issues that the implementation model (Codestral) produced correctly in isolation but which created problems in the context of the broader codebase.'
      },
      {
        type: 'h2',
        text: 'Cross-session consistency'
      },
      {
        type: 'p',
        text: 'For this test, we ran 10 sequential sessions on the same project — building incrementally from scratch to a working full-stack application. We then had a human reviewer count architectural inconsistencies: naming convention violations, pattern deviations, redundant implementations, and contradictory decisions.'
      },
      {
        type: 'p',
        text: 'The single-model approach (with a fresh context window each session) produced 34 inconsistencies across the 10 sessions. The VerityFlow Council, with ProjectState active, produced 4. Three of those four were in the first two sessions before ProjectState had accumulated enough context to be maximally effective.'
      },
      {
        type: 'h2',
        text: 'The cost tradeoff'
      },
      {
        type: 'p',
        text: 'The honest comparison requires acknowledging the cost. A VerityFlow session costs more credits than a single model call because five model calls are more expensive than one. The question is whether the quality improvement justifies the additional cost.'
      },
      {
        type: 'p',
        text: 'For code that ships to users: yes, reliably. A production bug caused by a hallucinated library, a cross-session inconsistency that requires a refactor, or an architectural decision made in session 1 being silently violated in session 30 — each of these costs more to fix than the additional cost of the Council pipeline. The math works out clearly when you\'re building something real.'
      },
    ]
  },
  {
    slug: 'what-we-learned-building-verityflow',
    title: 'What We Learned Building VerityFlow',
    date: 'February 28, 2026',
    category: 'Behind the Scenes',
    readTime: '9 min read',
    summary: 'We used VerityFlow to build VerityFlow. Here\'s what that was like, what worked, what broke, and what surprised us.',
    content: [
      {
        type: 'p',
        text: 'We use VerityFlow to build VerityFlow. This isn\'t a marketing claim — it\'s the most direct form of dogfooding we could think of, and it\'s taught us more about the product\'s limitations and strengths than any controlled test could have.'
      },
      {
        type: 'h2',
        text: 'What worked better than expected'
      },
      {
        type: 'p',
        text: 'ProjectState consistency across sessions was more effective than we anticipated. By session 30 of the dashboard build, the Council had accumulated enough context that new features integrated with the existing architecture without explicit guidance. Naming conventions, component patterns, and API response formats were inherited automatically. The accumulated "institutional knowledge" in ProjectState made the Council increasingly useful as the project grew, rather than increasingly confused.'
      },
      {
        type: 'p',
        text: 'The hallucination firewall caught real problems. During the integration of Stripe billing, Perplexity flagged two webhook event types that we had referenced from outdated documentation — they\'d been renamed in the Stripe API in a recent major version. Without the firewall, those references would have made it into the implementation and only failed at test time.'
      },
      {
        type: 'h2',
        text: 'What was harder than expected'
      },
      {
        type: 'p',
        text: 'The first session of a new project is the most important and the hardest. ProjectState starts empty. The Council\'s first session creates the foundation that all subsequent sessions build on. If the initial brief is vague or the architectural decisions are wrong, those problems compound. We found ourselves investing significantly more time in session 1 briefs than we had expected.'
      },
      {
        type: 'p',
        text: 'Prompting for architectural changes after 20+ sessions required care. The Council has strong continuity with ProjectState, which is mostly desirable. But when we needed to refactor a core pattern — changing from one state management approach to another, for example — we had to be explicit in the brief that we were intentionally overriding previous decisions. This is an area we\'re actively improving in how ProjectState is updated and annotated.'
      },
      {
        type: 'h2',
        text: 'The arbitration protocol in practice'
      },
      {
        type: 'p',
        text: 'The arbitration protocol — which triggers when reviewers disagree significantly — fired more often than we predicted, particularly during the backend API work. The interesting pattern: Codestral and Gemini had consistent disagreements about error handling patterns. Codestral tended toward explicit, verbose error handling. Gemini preferred centralized error middleware. Neither was wrong. The arbitration usually produced a sensible synthesis, but the frequency of these disagreements prompted us to add more specific architectural guidance about error handling patterns to the project brief.'
      },
      {
        type: 'h2',
        text: 'What we\'d do differently'
      },
      {
        type: 'p',
        text: 'Write longer initial briefs. The more explicit and detailed the project description and constraints in session 1, the smoother all subsequent sessions become. We now treat the first-session brief as a mini architecture document, not just a prompt.'
      },
      {
        type: 'p',
        text: 'Break large features into smaller sessions. A session that asks for "the entire authentication system" produces something functional but less precise than three sessions asking for the database schema, then the API routes, then the frontend flows separately. Smaller scopes produce higher-quality output and better ProjectState updates.'
      },
      {
        type: 'p',
        text: 'Review the review log. The flagged issues in the review log are worth reading even when the session completes successfully. Several structural improvements to VerityFlow itself came from noticing that the Council was consistently flagging a pattern we were using as suboptimal. It was right.'
      },
    ]
  },
]

export function getPost(slug) {
  return BLOG_POSTS.find(p => p.slug === slug) || null
}
