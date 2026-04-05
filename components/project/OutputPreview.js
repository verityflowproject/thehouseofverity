'use client'

import { useState, useMemo } from 'react'
import { Copy, Check, FileCode2, Eye, Folder, FolderOpen, File } from 'lucide-react'

const MODEL_LABELS = {
  claude:     'Claude · Architect',
  gpt:        'GPT · Reviewer',
  'gpt5.4o':  'GPT · Reviewer',
  codestral:  'Codestral · Implementer',
  gemini:     'Gemini · Refactor',
  perplexity: 'Perplexity · Researcher',
}

// ── HTML detection & extraction ───────────────────────────────────────────────

function extractHtml(content) {
  if (!content) return null

  // Full HTML document
  if (/<!DOCTYPE\s+html/i.test(content) || /<html[\s>]/i.test(content)) {
    return content
  }

  // HTML code-fence blocks
  const fenceMatch = content.match(/```html\s*([\s\S]*?)```/i)
  if (fenceMatch) {
    const fragment = fenceMatch[1].trim()
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;padding:1rem;background:#fff;color:#111}</style></head><body>${fragment}</body></html>`
  }

  // Bare HTML tags suggest renderable content
  if (/<(div|section|main|header|nav|article|p|h[1-6]|ul|ol|table|form)[\s>]/i.test(content)) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;padding:1rem;background:#fff;color:#111}</style></head><body>${content}</body></html>`
  }

  return null
}

// ── Codebase file parser ──────────────────────────────────────────────────────

/**
 * Parse all outputs and split them into individual files.
 * Recognises patterns like:
 *   ```typescript:src/components/Button.tsx
 *   ```ts src/components/Button.tsx
 *   // file: src/components/Button.tsx
 *   // --- src/components/Button.tsx ---
 */
function parseFilesFromOutputs(outputs) {
  const files = []

  const PATTERNS = [
    // ```lang:path or ```lang path
    /^```[\w+.-]*[: ]+([\w./-]+\.\w+)\s*\n([\s\S]*?)```/gm,
    // // file: path
    /^\/\/ file: ([\w./-]+\.\w+)\s*\n([\s\S]*?)(?=^\/\/ file: |$)/gm,
    // // --- path ---
    /^\/\/ --- ([\w./-]+\.\w+) ---\s*\n([\s\S]*?)(?=^\/\/ --- |$)/gm,
  ]

  for (const output of outputs) {
    const content = output.content || ''

    for (const pattern of PATTERNS) {
      pattern.lastIndex = 0
      let match
      while ((match = pattern.exec(content)) !== null) {
        const path = match[1]
        const body = match[2].trimEnd()
        if (path && body) {
          const ext = path.split('.').pop()?.toLowerCase() ?? ''
          const language = EXT_LANG[ext] ?? ext
          // Deduplicate by path (last write wins)
          const existing = files.findIndex((f) => f.path === path)
          if (existing >= 0) {
            files[existing] = { path, content: body, language, source: output.taskType }
          } else {
            files.push({ path, content: body, language, source: output.taskType })
          }
        }
      }
    }

    // If no file patterns found in this output, treat the whole output as one file
    if (files.length === 0 && content.trim()) {
      const guessedName = `${output.taskType || 'output'}.${output.model === 'perplexity' ? 'md' : 'ts'}`
      files.push({ path: guessedName, content: content.trim(), language: 'typescript', source: output.taskType })
    }
  }

  return files
}

const EXT_LANG = {
  ts: 'typescript', tsx: 'tsx', js: 'javascript', jsx: 'jsx',
  py: 'python', rs: 'rust', go: 'go', rb: 'ruby', java: 'java',
  css: 'css', scss: 'scss', html: 'html', json: 'json', md: 'markdown',
  sql: 'sql', sh: 'bash', yml: 'yaml', yaml: 'yaml', toml: 'toml',
  prisma: 'prisma', env: 'env',
}

// ── File tree builder ─────────────────────────────────────────────────────────

function buildTree(files) {
  const root = {}
  for (const file of files) {
    const parts = file.path.split('/')
    let node = root
    for (let i = 0; i < parts.length - 1; i++) {
      const dir = parts[i]
      if (!node[dir]) node[dir] = { __type: 'dir', __children: {} }
      node = node[dir].__children
    }
    node[parts[parts.length - 1]] = { __type: 'file', __file: file }
  }
  return root
}

function FileTreeNode({ name, node, selectedPath, onSelect, depth = 0 }) {
  const [open, setOpen] = useState(depth < 2)
  const isDir = node.__type === 'dir'

  if (isDir) {
    const children = Object.entries(node.__children).sort(([, a], [, b]) => {
      // Dirs first
      if (a.__type !== b.__type) return a.__type === 'dir' ? -1 : 1
      return 0
    })
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center gap-1.5 px-2 py-1 text-left text-xs text-gray-400 hover:text-white hover:bg-gray-800/60 rounded transition-colors"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {open ? <FolderOpen className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" /> : <Folder className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />}
          <span className="truncate">{name}</span>
        </button>
        {open && children.map(([childName, childNode]) => (
          <FileTreeNode
            key={childName}
            name={childName}
            node={childNode}
            selectedPath={selectedPath}
            onSelect={onSelect}
            depth={depth + 1}
          />
        ))}
      </div>
    )
  }

  const file = node.__file
  const isSelected = selectedPath === file.path
  return (
    <button
      onClick={() => onSelect(file)}
      className={`w-full flex items-center gap-1.5 px-2 py-1 text-left text-xs rounded transition-colors truncate ${
        isSelected
          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
          : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
      }`}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      <File className="w-3 h-3 flex-shrink-0 opacity-60" />
      <span className="truncate">{name}</span>
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function OutputPreview({ outputs, sessionId }) {
  const [copied, setCopied]         = useState(false)
  const [activeOutputTab, setActiveOutputTab] = useState(0)
  const [viewMode, setViewMode]     = useState('code')   // 'code' | 'preview' | 'files'
  const [selectedFile, setSelectedFile] = useState(null)

  const hasOutputs = outputs && outputs.length > 0
  const active     = hasOutputs ? outputs[activeOutputTab] ?? outputs[0] : null

  // Parse files from all outputs (memoised — only recomputes when outputs change)
  const parsedFiles = useMemo(() => parseFilesFromOutputs(outputs ?? []), [outputs])
  const fileTree    = useMemo(() => buildTree(parsedFiles), [parsedFiles])

  const htmlContent = useMemo(() => extractHtml(active?.content ?? ''), [active])

  const displayContent = viewMode === 'files' && selectedFile
    ? selectedFile.content
    : active?.content ?? ''

  const lines = displayContent.split('\n')

  const handleCopy = async () => {
    if (!displayContent) return
    await navigator.clipboard.writeText(displayContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Auto-select first file when switching to files view
  const handleViewMode = (mode) => {
    setViewMode(mode)
    if (mode === 'files' && parsedFiles.length > 0 && !selectedFile) {
      setSelectedFile(parsedFiles[0])
    }
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!hasOutputs) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
          <FileCode2 className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-400">Preview</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
          <div className="w-16 h-16 rounded-2xl bg-gray-800/60 border border-gray-700 flex items-center justify-center mb-4">
            <FileCode2 className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">No output yet</p>
          <p className="text-gray-600 text-xs leading-relaxed max-w-[200px]">
            Brief the council and the generated output will appear here.
          </p>
        </div>
      </div>
    )
  }

  // ── Output state ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 flex-shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span className="text-sm font-medium text-white whitespace-nowrap">Preview</span>
          {sessionId && (
            <span className="text-xs text-gray-600 font-mono hidden sm:inline">#{sessionId.slice(0, 8)}</span>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-gray-800/60 rounded-lg p-0.5 flex-shrink-0">
          <button
            onClick={() => handleViewMode('code')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'code' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileCode2 className="w-3 h-3" />
            Code
          </button>
          <button
            onClick={() => handleViewMode('preview')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'preview' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Rendered HTML preview"
          >
            <Eye className="w-3 h-3" />
            Preview
          </button>
          <button
            onClick={() => handleViewMode('files')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'files' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Codebase file explorer"
          >
            <Folder className="w-3 h-3" />
            Files
            {parsedFiles.length > 0 && (
              <span className="ml-0.5 px-1 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] leading-none">
                {parsedFiles.length}
              </span>
            )}
          </button>
        </div>

        {/* Copy button (code + files views) */}
        {viewMode !== 'preview' && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-xs font-medium transition-colors flex-shrink-0"
          >
            {copied ? (
              <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Copied</span></>
            ) : (
              <><Copy className="w-3.5 h-3.5" />Copy</>
            )}
          </button>
        )}
      </div>

      {/* Output tab bar (code + preview views only) */}
      {viewMode !== 'files' && outputs.length > 1 && (
        <div className="flex gap-1 px-3 py-2 border-b border-gray-800 overflow-x-auto flex-shrink-0">
          {outputs.map((out, i) => (
            <button
              key={i}
              onClick={() => setActiveOutputTab(i)}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                i === activeOutputTab
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              {out.taskType || `Output ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Model attribution (code + preview views) */}
      {viewMode !== 'files' && active?.model && (
        <div className="px-4 py-2 border-b border-gray-800/50 flex-shrink-0">
          <p className="text-xs text-gray-500">
            Generated by <span className="text-gray-400">{MODEL_LABELS[active.model] || active.model}</span>
            {viewMode === 'code' && <span>{' · '}{lines.length} lines</span>}
          </p>
        </div>
      )}

      {/* ── Content area ──────────────────────────────────────────────────── */}

      {/* Code view */}
      {viewMode === 'code' && (
        <div className="flex-1 overflow-auto min-h-0">
          <pre className="p-4 text-xs text-gray-300 font-mono leading-relaxed">
            {active?.content || ''}
          </pre>
        </div>
      )}

      {/* Rendered HTML preview */}
      {viewMode === 'preview' && (
        <div className="flex-1 min-h-0 flex flex-col">
          {htmlContent ? (
            <iframe
              key={active?.taskId}
              srcDoc={htmlContent}
              sandbox="allow-scripts"
              title="Output preview"
              className="flex-1 w-full border-0 bg-white"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
              <div className="w-14 h-14 rounded-2xl bg-gray-800/60 border border-gray-700 flex items-center justify-center mb-4">
                <Eye className="w-7 h-7 text-gray-600" />
              </div>
              <p className="text-gray-400 text-sm font-medium mb-1">No HTML output detected</p>
              <p className="text-gray-600 text-xs leading-relaxed max-w-[220px]">
                This output contains non-HTML code. Switch to Code view to read it.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Files (codebase) view */}
      {viewMode === 'files' && (
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {parsedFiles.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
              <Folder className="w-8 h-8 text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm font-medium mb-1">No files parsed</p>
              <p className="text-gray-600 text-xs max-w-[220px] leading-relaxed">
                Files will appear here when the council outputs code with named file paths.
              </p>
            </div>
          ) : (
            <>
              {/* File tree sidebar */}
              <div className="w-44 flex-shrink-0 border-r border-gray-800 overflow-y-auto py-2 bg-gray-950/30">
                <div className="px-3 py-1 mb-1">
                  <span className="text-[10px] text-gray-600 uppercase tracking-wider font-medium">Files ({parsedFiles.length})</span>
                </div>
                {Object.entries(fileTree).sort(([, a], [, b]) => {
                  if (a.__type !== b.__type) return a.__type === 'dir' ? -1 : 1
                  return 0
                }).map(([name, node]) => (
                  <FileTreeNode
                    key={name}
                    name={name}
                    node={node}
                    selectedPath={selectedFile?.path}
                    onSelect={setSelectedFile}
                    depth={0}
                  />
                ))}
              </div>

              {/* File content */}
              <div className="flex-1 min-w-0 overflow-auto flex flex-col">
                {selectedFile ? (
                  <>
                    <div className="px-3 py-2 border-b border-gray-800 bg-gray-950/50 flex-shrink-0">
                      <p className="text-xs text-gray-400 font-mono truncate">{selectedFile.path}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5">{selectedFile.language} · {selectedFile.content.split('\n').length} lines</p>
                    </div>
                    <pre className="flex-1 p-3 text-xs text-gray-300 font-mono leading-relaxed overflow-auto">
                      {selectedFile.content}
                    </pre>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-600 text-xs">
                    Select a file to view its content
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
