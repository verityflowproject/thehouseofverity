'use client'

import { useState, useRef, useEffect } from 'react'
import { Loader2, Send, Copy, Check } from 'lucide-react'
import ModelFeed from './ModelFeed'

const MODEL_SEQUENCE = ['perplexity', 'claude', 'codestral']

export default function SessionPanel({ projectId }) {
  const [prompt, setPrompt] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [events, setEvents] = useState([])
  const [finalOutput, setFinalOutput] = useState(null)
  const [copied, setCopied] = useState(false)
  
  const textareaRef = useRef(null)
  const thinkingIntervalRef = useRef(null)

  // Handle keyboard shortcut (⌘↵ or Ctrl+Enter)
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Simulate thinking events
  const startThinkingEvents = () => {
    let index = 0
    thinkingIntervalRef.current = setInterval(() => {
      if (index < MODEL_SEQUENCE.length) {
        const model = MODEL_SEQUENCE[index]
        setEvents(prev => [...prev, {
          type: 'thinking',
          model,
          message: `Analyzing your request...`,
          timestamp: new Date().toISOString()
        }])
        index++
      } else {
        clearInterval(thinkingIntervalRef.current)
      }
    }, 800)
  }

  const handleSubmit = async () => {
    if (!prompt.trim() || isRunning) return

    const userPrompt = prompt.trim()
    setPrompt('')
    setIsRunning(true)
    setEvents([{
      type: 'system',
      message: 'Council session initiated',
      timestamp: new Date().toISOString()
    }])
    setFinalOutput(null)

    // Start thinking animations
    startThinkingEvents()

    try {
      const res = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          prompt: userPrompt
        })
      })

      // Clear thinking interval
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current)
      }

      const data = await res.json()

      if (!res.ok) {
        setEvents(prev => [...prev, {
          type: 'error',
          message: data.error || 'Failed to process request',
          timestamp: new Date().toISOString()
        }])
        return
      }

      // Parse response and create events
      const newEvents = []

      // Firewall event (Perplexity verification)
      if (data.perplexityOutput) {
        newEvents.push({
          type: 'firewall',
          model: 'perplexity',
          verified: data.perplexityOutput.verified || 0,
          blocked: data.perplexityOutput.blocked || 0,
          warnings: data.perplexityOutput.warnings || [],
          timestamp: new Date().toISOString()
        })
      }

      // Output and review events
      if (data.reviewedOutputs) {
        data.reviewedOutputs.forEach((item) => {
          // Output event
          newEvents.push({
            type: 'output',
            model: item.authorModel,
            code: item.output,
            taskType: item.taskType,
            timestamp: new Date().toISOString()
          })

          // Review event
          newEvents.push({
            type: 'review',
            model: item.reviewingModel,
            authorModel: item.authorModel,
            outcome: item.outcome,
            flaggedIssues: item.flaggedIssues || [],
            timestamp: new Date().toISOString()
          })
        })
      }

      // Arbitration events
      if (data.arbitrationResults) {
        data.arbitrationResults.forEach((arb) => {
          newEvents.push({
            type: 'arbitration',
            winner: arb.winner,
            rationale: arb.rationale,
            timestamp: new Date().toISOString()
          })
        })
      }

      // Success system event
      newEvents.push({
        type: 'system',
        message: 'Council session complete',
        timestamp: new Date().toISOString()
      })

      setEvents(prev => [...prev, ...newEvents])
      setFinalOutput(data.finalOutput || 'No output generated')

    } catch (error) {
      console.error('Orchestrator error:', error)
      setEvents(prev => [...prev, {
        type: 'error',
        message: 'Network error. Please try again.',
        timestamp: new Date().toISOString()
      }])
    } finally {
      setIsRunning(false)
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current)
      }
    }
  }

  const handleCopy = async () => {
    if (finalOutput) {
      await navigator.clipboard.writeText(finalOutput)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Prompt Input */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
              Brief the council
            </label>
            <textarea
              ref={textareaRef}
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Build a user authentication system with NextAuth and MongoDB..."
              rows={6}
              disabled={isRunning}
              className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 resize-none ${
                isRunning 
                  ? 'border-indigo-500 ring-2 ring-indigo-500/50 animate-pulse-border' 
                  : 'border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/50'
              }`}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs">⌘</kbd>
                {' + '}
                <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs">↵</kbd>
                {' to submit'}
              </p>
              <button
                onClick={handleSubmit}
                disabled={!prompt.trim() || isRunning}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Council working...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Brief council</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Model Feed */}
      {(isRunning || events.length > 0) && (
        <ModelFeed events={events} isRunning={isRunning} />
      )}

      {/* Final Output */}
      {finalOutput && !isRunning && (
        <div className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-emerald-400 mb-1">Final Output</h3>
              <p className="text-sm text-emerald-300/70">Council consensus reached</p>
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="bg-gray-900 border border-emerald-500/20 rounded-lg p-4 overflow-x-auto text-sm text-gray-300 font-mono max-h-96 overflow-y-auto">
            {finalOutput}
          </pre>
        </div>
      )}

      <style jsx global>{`
        @keyframes pulse-border {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
