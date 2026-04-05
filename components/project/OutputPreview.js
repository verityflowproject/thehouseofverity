'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Copy, Check, FileCode2, Eye, Folder, FolderOpen, File, Download, ChevronDown } from 'lucide-react'
import { useSettings } from '@/hooks/use-settings'

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

  if (/<!DOCTYPE\s+html/i.test(content) || /<html[\s>]/i.test(content)) {
    return content
  }

  const fenceMatch = content.match(/```html\s*([\s\S]*?)```/i)
  if (fenceMatch) {
    const fragment = fenceMatch[1].trim()
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;padding:1rem;background:#fff;color:#111}</style></head><body>${fragment}</body></html>`
  }

  if (/<(div|section|main|header|nav|article|p|h[1-6]|ul|ol|table|form)[\s>]/i.test(content)) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;padding:1rem;background:#fff;color:#111}</style></head><body>${content}</body></html>`
  }

  return null
}

// ── Codebase file parser ──────────────────────────────────────────────────────

function parseFilesFromOutputs(outputs) {
  const files = []

  const PATTERNS = [
    /^```[\w+.-]*[: ]+([\w./-]+\.\w+)\s*\n([\s\S]*?)```/gm,
    /^\/\/ file: ([\w./-]+\.\w+)\s*\n([\s\S]*?)(?=^\/\/ file: |$)/gm,
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
          const existing = files.findIndex((f) => f.path === path)
          if (existing >= 0) {
            files[existing] = { path, content: body, language, source: output.taskType }
          } else {
            files.push({ path, content: body, language, source: output.taskType })
          }
        }
      }
    }

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

// ── Export helpers ────────────────────────────────────────────────────────────

function downloadText(filename, content) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a)
  a.click()
  setTimeout(() => { URL.revokeObjectURL(url); a.remove() }, 200)
}

async function downloadZip(files, sessionId) {
  try {
    // Dynamic import so JSZip is only loaded when needed
    const JSZip = (await import('jszip')).default
    const zip   = new JSZip()
    for (const file of files) {
      zip.file(file.path, file.content)
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const name = `session-${sessionId?.slice(0, 8) ?? 'output'}.zip`
    downloadText(name, '')  // dummy — override:
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: name })
    document.body.appendChild(a)
    a.click()
    setTimeout(() => { URL.revokeObjectURL(url); a.remove() }, 200)
  } catch (err) {
    console.error('[OutputPreview] ZIP export failed:', err)
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export default function OutputPreview({ outputs, sessionId }) {
  const settings = useSettings()

  const [copied, setCopied]           = useState(false)
  const [activeOutputTab, setActiveOutputTab] = useState(0)
  const [viewMode, setViewMode]       = useState(settings.defaultOutputFormat ?? 'code')
  const [selectedFile, setSelectedFile] = useState(null)
  const [exportOpen, setExportOpen]   = useState(false)
  const exportRef = useRef(null)

  const hasOutputs = outputs && outputs.length > 0
  const active     = hasOutputs ? outputs[activeOutputTab] ?? outputs[0] : null

  const parsedFiles = useMemo(() => parseFilesFromOutputs(outputs ?? []), [outputs])
  const fileTree    = useMemo(() => buildTree(parsedFiles), [parsedFiles])
  const htmlContent = useMemo(() => extractHtml(active?.content ?? ''), [active])

  const displayContent = viewMode === 'files' && selectedFile
    ? selectedFile.content
    : active?.content ?? ''

  const lines = displayContent.split('\n')

  // Sync default view mode from settings when settings load
  useEffect(() => {
    if (settings.defaultOutputFormat) {
      setViewMode(settings.defaultOutputFormat)
    }
  }, [settings.defaultOutputFormat])

  // Auto-download when outputs first arrive (if setting is on)
  useEffect(() => {
    if (!settings.autoDownloadOutput || !hasOutputs) return
    const content = outputs.map((o) => `=== ${o.taskType} (${o.model}) ===\n${o.content}`).join('\n\n')
    downloadText(`session-${sessionId?.slice(0, 8) ?? 'output'}.txt`, content)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  // Close export dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleCopy = async () => {
    if (!displayContent) return
    await navigator.clipboard.writeText(displayContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleViewMode = (mode) => {
    setViewMode(mode)
    if (mode === 'files' && parsedFiles.length > 0 && !selectedFile) {
      setSelectedFile(parsedFiles[0])
    }
  }

  const handleExport = async (type) => {
    setExportOpen(false)
    if (type === 'txt') {
      const content = outputs.map((o) => `=== ${o.taskType} (${o.model}) ===\n${o.content}`).join('\n\n')
      downloadText(`session-${sessionId?.slice(0, 8) ?? 'output'}.txt`, content)
    } else if (type === 'zip') {
      await downloadZip(parsedFiles.length > 0 ? parsedFiles : outputs.map((o, i) => ({
        path: `output-${i + 1}-${o.taskType}.txt`,
        content: o.content,
      })), sessionId)
    } else if (type === 'copy-file' && selectedFile) {
      await navigator.clipboard.writeText(selectedFile.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else if (type === 'copy-all') {
      await handleCopy()
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
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-800 flex-shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span className="text-sm font-medium text-white whitespace-nowrap">Preview</span>
          {sessionId && (
            <span className="text-xs text-gray-600 font-mono hidden sm:inline">#{sessionId.slice(0, 8)}</span>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-gray-800/60 rounded-lg p-0.5 flex-shrink-0">
          {['code', 'preview', 'files'].map((mode) => (
            <button
              key={mode}
              onClick={() => handleViewMode(mode)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === mode ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {mode === 'code' && <FileCode2 className="w-3 h-3" />}
              {mode === 'preview' && <Eye className="w-3 h-3" />}
              {mode === 'files' && <Folder className="w-3 h-3" />}
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
              {mode === 'files' && parsedFiles.length > 0 && (
                <span className="ml-0.5 px-1 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] leading-none">
                  {parsedFiles.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Export / copy dropdown */}
        <div ref={exportRef} className="relative flex-shrink-0">
          <button
            onClick={() => setExportOpen((v) => !v)}
            className="flex items-center gap-1 px-2 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
            title="Export options"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {exportOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
              <button
                onClick={() => handleExport('copy-all')}
                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800 flex items-center gap-2 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> Copy all
              </button>
              {viewMode === 'files' && selectedFile && (
                <button
                  onClick={() => handleExport('copy-file')}
                  className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800 flex items-center gap-2 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy this file
                </button>
              )}
              <div className="h-px bg-gray-800 my-1" />
              <button
                onClick={() => handleExport('txt')}
                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800 flex items-center gap-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download .txt
              </button>
              <button
                onClick={() => handleExport('zip')}
                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800 flex items-center gap-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download .zip
              </button>
            </div>
          )}
        </div>
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

      {/* Model attribution */}
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
