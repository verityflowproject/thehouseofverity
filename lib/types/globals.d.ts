/**
 * globals.d.ts — Ambient module declarations for packages that ship their
 * own types in a way TypeScript's 'bundler' moduleResolution doesn't pick up.
 */

// uuid v11 bundles its own types via package.json `exports` but doesn't
// include a top-level `types` field, causing TS7016 under bundler resolution.
declare module 'uuid' {
  export function v1(): string
  export function v3(name: string, namespace: string): string
  export function v4(): string
  export function v5(name: string, namespace: string): string
  export function v6(): string
  export function v7(): string
  export const NIL: string
  export function parse(uuid: string): Uint8Array
  export function stringify(arr: Uint8Array): string
  export function validate(uuid: string): boolean
  export function version(uuid: string): number
}
