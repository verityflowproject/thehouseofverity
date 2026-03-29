/**
 * lib/orchestrator/hallucination-detector.ts — External reference detection
 *
 * Scans prompts for signals that external libraries, packages, APIs,
 * or versioned features are referenced. When detected, triggers a
 * Perplexity research task even for non-implementation task types.
 *
 * No LLM calls — pure regex pattern matching.
 */

// ─── Detection patterns ───────────────────────────────────────────────────────────

/**
 * Regex patterns that indicate external library/package/API references.
 */
const HALLUCINATION_PATTERNS = [
  // NPM package names (e.g., "use react-query", "install axios")
  /\b(npm|yarn|pnpm)\s+(install|add|i)\s+([a-z0-9@/-]+)/i,
  /\buse\s+([a-z0-9-]+)\s+(package|library)/i,
  /\bimport.*from\s+['"]([a-z0-9@/-]+)['"]/i,

  // Specific package/library names (common ones)
  /\b(react-query|axios|lodash|moment|dayjs|uuid|zod|prisma|drizzle)\b/i,
  /\b(next-auth|clerk|supabase|firebase|auth0)\b/i,
  /\b(tailwind|shadcn|radix|chakra|mui|mantine)\b/i,
  /\b(stripe|paypal|square|braintree)\b/i,
  /\b(openai|anthropic|mistral|gemini|perplexity)\b/i,

  // Version references (e.g., "React 18", "Node.js v20", "Next.js 14")
  /\b([a-z][a-z0-9-]+)\s+(v?\d+(\.\d+){0,2})/i,
  /\b(version|v)\s*[:.=]?\s*\d+/i,

  // API endpoints and HTTP methods
  /\b(GET|POST|PUT|DELETE|PATCH)\s+\/api\//i,
  /\bREST\s+API\b/i,
  /\bGraphQL\b/i,
  /\btRPC\b/i,

  // Framework-specific features (e.g., "use Server Components", "getServerSideProps")
  /\b(getServerSideProps|getStaticProps|getStaticPaths)\b/i,
  /\bServer\s+Components?\b/i,
  /\bClient\s+Components?\b/i,
  /\bApp\s+Router\b/i,
  /\bPages\s+Router\b/i,

  // Database and ORM mentions
  /\b(MongoDB|PostgreSQL|MySQL|SQLite|Redis|DynamoDB)\b/i,
  /\b(Mongoose|Sequelize|TypeORM|Prisma|Drizzle)\b/i,

  // Cloud providers and services
  /\b(AWS|Azure|GCP|Google Cloud|Vercel|Netlify|Railway|Render)\b/i,
  /\b(S3|Lambda|EC2|CloudFront|DynamoDB|RDS)\b/i,

  // Specific method/function names from popular libraries
  /\buseQuery\b/i,
  /\buseMutation\b/i,
  /\buseEffect\b/i, // React hook (built-in but versioned)
  /\bzod\.(.+)\(/i,

  // Generic "latest version" or "recommended" signals
  /\blatest\s+(version|release)\b/i,
  /\brecommended\s+(package|library|version)\b/i,
  /\bbest\s+(package|library)\s+for\b/i,
]

// ─── Detection function ───────────────────────────────────────────────────────────

/**
 * Detect whether a prompt references external libraries, packages,
 * APIs, or versioned features.
 *
 * This is used to trigger research even when the classified task type
 * is not 'implementation' or 'research'.
 *
 * @param prompt - The user's input prompt
 * @returns true if hallucination triggers are detected
 *
 * @example
 *   detectHallucinationTriggers('Use react-query for data fetching') // → true
 *   detectHallucinationTriggers('Refactor the auth module') // → false
 *   detectHallucinationTriggers('Design with Next.js 14 App Router') // → true
 */
export function detectHallucinationTriggers(prompt: string): boolean {
  for (const pattern of HALLUCINATION_PATTERNS) {
    if (pattern.test(prompt)) {
      return true
    }
  }

  return false
}

/**
 * Extract specific external references from a prompt for logging/debugging.
 *
 * @param prompt - The user's input prompt
 * @returns Array of matched strings
 */
export function extractExternalReferences(prompt: string): string[] {
  const matches: string[] = []

  for (const pattern of HALLUCINATION_PATTERNS) {
    const match = prompt.match(pattern)
    if (match) {
      matches.push(match[0])
    }
  }

  return matches
}
