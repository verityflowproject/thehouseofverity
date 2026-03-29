'use client'

import { useState, useEffect, useRef } from 'react'

// ─── Model definitions ────────────────────────────────────────────────────
const MODELS = [
  {
    id:    'claude',
    name:  'Claude 3.5',
    maker: 'Anthropic',
    color: '#f97316',
    dim:   'rgba(249,115,22,0.12)',
    tag:   'Reasoning',
    desc:  'Deep reasoning & long-context analysis. Best for complex architecture and code review.',
    icon:  'C',
  },
  {
    id:    'gpt',
    name:  'GPT-4o',
    maker: 'OpenAI',
    color: '#10b981',
    dim:   'rgba(16,185,129,0.12)',
    tag:   'Versatile',
    desc:  'Broad capability across all coding tasks. Excellent at test generation and documentation.',
    icon:  'G',
  },
  {
    id:    'codestral',
    name:  'Codestral',
    maker: 'Mistral',
    color: '#f59e0b',
    dim:   'rgba(245,158,11,0.12)',
    tag:   'Speed',
    desc:  'Ultra-fast code completion and fill-in-the-middle. Purpose-built for IDE integration.',
    icon:  'M',
  },
  {
    id:    'gemini',
    name:  'Gemini 1.5',
    maker: 'Google',
    color: '#3b82f6',
    dim:   'rgba(59,130,246,0.12)',
    tag:   'Multimodal',
    desc:  'Native multimodal reasoning. Handles images, diagrams, and up to 1M token context.',
    icon:  'G',
  },
  {
    id:    'perplexity',
    name:  'pplx-70b',
    maker: 'Perplexity',
    color: '#8b5cf6',
    dim:   'rgba(139,92,246,0.12)',
    tag:   'Research',
    desc:  'Web-grounded responses with citations. Best for up-to-date library docs and research.',
    icon:  'P',
  },
]

// ─── Live feed events ─────────────────────────────────────────────────────
const FEED_EVENTS = [
  { model: 'claude',     color: '#f97316', text: 'Refactoring authentication middleware…' },
  { model: 'gpt',        color: '#10b981', text: 'Generating 47 unit tests for PaymentService…' },
  { model: 'codestral',  color: '#f59e0b', text: 'Auto-completing React component tree…' },
  { model: 'gemini',     color: '#3b82f6', text: 'Analyzing architecture diagram…' },
  { model: 'perplexity', color: '#8b5cf6', text: 'Fetching latest Next.js 15 migration guide…' },
  { model: 'claude',     color: '#f97316', text: 'Code review: 3 critical issues found in API layer…' },
  { model: 'gpt',        color: '#10b981', text: 'Writing Terraform modules for AWS deployment…' },
  { model: 'codestral',  color: '#f59e0b', text: 'Inline completion: 120 tokens in 180ms…' },
]

// ─── Feature list ─────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: '⚡',
    title: 'Orchestrated Multi-Model',
    desc: 'Our orchestrator routes each sub-task to the ideal model automatically. No manual switching.',
  },
  {
    icon: '🔁',
    title: 'Parallel Execution',
    desc: 'Multiple models work simultaneously on your project, cutting wall-clock time by up to 80%.',
  },
  {
    icon: '🧠',
    title: 'Persistent Context',
    desc: 'Project memory across sessions. Every model shares the same codebase understanding.',
  },
  {
    icon: '🔍',
    title: 'Web-Grounded Research',
    desc: 'Perplexity integration keeps models current with the latest libraries and breaking changes.',
  },
  {
    icon: '🛡️',
    title: 'Production-Ready Output',
    desc: 'Code reviews, tests, and security scans run automatically before any PR is created.',
  },
  {
    icon: '📊',
    title: 'Usage Analytics',
    desc: 'Per-model token usage, latency metrics, and cost attribution in a real-time dashboard.',
  },
]

// ─── Cursor blink component ───────────────────────────────────────────────
function Cursor() {
  return (
    <span
      style={{
        display:         'inline-block',
        width:           '2px',
        height:          '1em',
        backgroundColor: '#6366f1',
        marginLeft:      '2px',
        verticalAlign:   'text-bottom',
        animation:       'blink 1.1s step-end infinite',
      }}
    />
  )
}

// ─── Animated typewriter ─────────────────────────────────────────────────
function Typewriter({ words = [], speed = 80 }) {
  const [displayed, setDisplayed] = useState('')
  const [wordIdx,   setWordIdx]   = useState(0)
  const [charIdx,   setCharIdx]   = useState(0)
  const [deleting,  setDeleting]  = useState(false)

  useEffect(() => {
    const word = words[wordIdx % words.length]
    const delay = deleting ? speed / 2 : speed

    const t = setTimeout(() => {
      if (!deleting && charIdx < word.length) {
        setDisplayed(word.slice(0, charIdx + 1))
        setCharIdx(c => c + 1)
      } else if (!deleting && charIdx === word.length) {
        setTimeout(() => setDeleting(true), 1400)
      } else if (deleting && charIdx > 0) {
        setDisplayed(word.slice(0, charIdx - 1))
        setCharIdx(c => c - 1)
      } else {
        setDeleting(false)
        setWordIdx(i => i + 1)
      }
    }, delay)

    return () => clearTimeout(t)
  }, [charIdx, deleting, wordIdx, words, speed])

  return (
    <span>
      <span style={{ color: '#6366f1' }}>{displayed}</span>
      <Cursor />
    </span>
  )
}

// ─── Live feed ticker ─────────────────────────────────────────────────────
function LiveFeed() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    let idx = 0
    const push = () => {
      const ev = FEED_EVENTS[idx % FEED_EVENTS.length]
      setEvents(prev => [{ ...ev, id: Date.now() }, ...prev].slice(0, 6))
      idx++
    }
    push()
    const id = setInterval(push, 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      style={{
        background:   '#0f0f17',
        border:       '1px solid #1a1a28',
        borderRadius: '12px',
        padding:      '16px',
        minHeight:    '200px',
        overflow:     'hidden',
      }}
    >
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          gap:            '8px',
          marginBottom:   '12px',
        }}
      >
        <span
          style={{
            width:           '8px',
            height:          '8px',
            borderRadius:    '50%',
            backgroundColor: '#10b981',
            animation:       'pulse-dot 1.4s ease-in-out infinite',
            display:         'inline-block',
          }}
        />
        <span style={{ color: '#6b6b8a', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
          LIVE ORCHESTRATOR FEED
        </span>
      </div>

      {events.map((ev, i) => (
        <div
          key={ev.id}
          style={{
            display:        'flex',
            alignItems:     'flex-start',
            gap:            '10px',
            marginBottom:   '10px',
            animation:      'slide-in-right 0.5s cubic-bezier(0.16,1,0.3,1) both',
            opacity:        i === 0 ? 1 : Math.max(0.3, 1 - i * 0.15),
          }}
        >
          <span
            style={{
              display:         'inline-block',
              width:           '6px',
              height:          '6px',
              borderRadius:    '50%',
              backgroundColor: ev.color,
              marginTop:       '6px',
              flexShrink:      0,
            }}
          />
          <span
            style={{
              fontSize:   '13px',
              fontFamily: 'JetBrains Mono, monospace',
              color:      i === 0 ? '#e8e8f0' : '#6b6b8a',
            }}
          >
            <span style={{ color: ev.color, fontWeight: 600 }}>[{ev.model}]</span>{' '}
            {ev.text}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Model card ───────────────────────────────────────────────────────────
function ModelCard({ model, delay = 0 }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:    hovered ? model.dim : '#0f0f17',
        border:        `1px solid ${hovered ? model.color : '#1a1a28'}`,
        borderRadius:  '12px',
        padding:       '20px',
        cursor:        'pointer',
        transition:    'all 0.25s cubic-bezier(0.16,1,0.3,1)',
        boxShadow:     hovered ? `0 0 20px ${model.color}30` : 'none',
        animation:     `fade-up 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        {/* Model avatar */}
        <div
          style={{
            width:           '40px',
            height:          '40px',
            borderRadius:    '10px',
            backgroundColor: model.dim,
            border:          `1px solid ${model.color}40`,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            fontSize:        '18px',
            fontWeight:      700,
            color:           model.color,
            fontFamily:      'JetBrains Mono, monospace',
          }}
        >
          {model.icon}
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#e8e8f0' }}>{model.name}</div>
          <div style={{ fontSize: '12px', color: '#6b6b8a' }}>{model.maker}</div>
        </div>
        {/* Tag badge */}
        <div style={{ marginLeft: 'auto' }}>
          <span
            style={{
              fontSize:        '11px',
              fontWeight:      500,
              color:           model.color,
              backgroundColor: model.dim,
              border:          `1px solid ${model.color}40`,
              borderRadius:    '6px',
              padding:         '3px 8px',
              fontFamily:      'JetBrains Mono, monospace',
            }}
          >
            {model.tag}
          </span>
        </div>
      </div>
      <p style={{ fontSize: '13px', color: '#6b6b8a', lineHeight: 1.6, margin: 0 }}>{model.desc}</p>
    </div>
  )
}

// ─── Feature card ─────────────────────────────────────────────────────────
function FeatureCard({ feature, delay = 0 }) {
  return (
    <div
      style={{
        background:   '#0f0f17',
        border:       '1px solid #1a1a28',
        borderRadius: '12px',
        padding:      '20px',
        animation:    `fade-up 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
      }}
    >
      <div style={{ fontSize: '28px', marginBottom: '12px' }}>{feature.icon}</div>
      <div style={{ fontSize: '15px', fontWeight: 600, color: '#e8e8f0', marginBottom: '8px' }}>
        {feature.title}
      </div>
      <p style={{ fontSize: '13px', color: '#6b6b8a', lineHeight: 1.6, margin: 0 }}>{feature.desc}</p>
    </div>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav
      style={{
        position:        'fixed',
        top:             0,
        left:            0,
        right:           0,
        zIndex:          50,
        height:          '60px',
        borderBottom:    '1px solid #1a1a28',
        backgroundColor: 'rgba(8,8,13,0.8)',
        backdropFilter:  'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display:         'flex',
        alignItems:      'center',
        padding:         '0 32px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Logo mark */}
        <div
          style={{
            width:           '32px',
            height:          '32px',
            borderRadius:    '8px',
            background:      'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            fontSize:        '16px',
            fontWeight:      700,
            color:           '#fff',
            fontFamily:      'JetBrains Mono, monospace',
          }}
        >
          V
        </div>
        <span
          style={{
            fontSize:    '18px',
            fontWeight:  700,
            color:       '#e8e8f0',
            fontFamily:  'Space Grotesk, sans-serif',
            letterSpacing: '-0.01em',
          }}
        >
          VerityFlow
        </span>
      </div>

      {/* Nav links */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '24px' }}>
        {['Models', 'Pricing', 'Docs', 'Blog'].map(link => (
          <a
            key={link}
            href="#"
            style={{
              fontSize:        '14px',
              color:           '#6b6b8a',
              textDecoration:  'none',
              transition:      'color 0.2s',
              fontFamily:      'Space Grotesk, sans-serif',
            }}
            onMouseEnter={e => (e.target.style.color = '#e8e8f0')}
            onMouseLeave={e => (e.target.style.color = '#6b6b8a')}
          >
            {link}
          </a>
        ))}
        <button
          style={{
            background:    'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color:         '#fff',
            border:        'none',
            borderRadius:  '8px',
            padding:       '8px 18px',
            fontSize:      '14px',
            fontWeight:    600,
            cursor:        'pointer',
            fontFamily:    'Space Grotesk, sans-serif',
            transition:    'opacity 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Get Early Access
        </button>
      </div>
    </nav>
  )
}

// ─── Hero gradient bg ─────────────────────────────────────────────────────
function HeroBg() {
  return (
    <div
      style={{
        position:   'absolute',
        inset:      0,
        overflow:   'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Top center radial glow */}
      <div
        style={{
          position:         'absolute',
          top:              '-20%',
          left:             '50%',
          transform:        'translateX(-50%)',
          width:            '800px',
          height:           '600px',
          background:       'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)',
          borderRadius:     '50%',
        }}
      />
      {/* Left model color accent */}
      <div
        style={{
          position:     'absolute',
          top:          '20%',
          left:         '-5%',
          width:        '400px',
          height:       '400px',
          background:   'radial-gradient(ellipse, rgba(249,115,22,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
      {/* Right model color accent */}
      <div
        style={{
          position:     'absolute',
          top:          '30%',
          right:        '-5%',
          width:        '400px',
          height:       '400px',
          background:   'radial-gradient(ellipse, rgba(16,185,129,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
      {/* Grid pattern overlay */}
      <div
        style={{
          position:   'absolute',
          inset:      0,
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────
const STATS = [
  { label: 'Models Orchestrated', value: '5' },
  { label: 'Avg Response (ms)', value: '320' },
  { label: 'Context Window', value: '1M' },
  { label: 'Faster Than 1 Model', value: '3×' },
]

// ─── Main page ────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div
      style={{
        minHeight:       '100vh',
        backgroundColor: '#08080d',
        fontFamily:      'Space Grotesk, system-ui, sans-serif',
        color:           '#e8e8f0',
      }}
    >
      <Nav />

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section
        style={{
          position:   'relative',
          paddingTop: '140px',
          paddingBottom: '80px',
          textAlign:  'center',
          overflow:   'hidden',
        }}
      >
        <HeroBg />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
          {/* Badge */}
          <div
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            '8px',
              background:     'rgba(99,102,241,0.12)',
              border:         '1px solid rgba(99,102,241,0.3)',
              borderRadius:   '100px',
              padding:        '6px 14px',
              marginBottom:   '32px',
              animation:      'fade-in 0.6s ease both',
            }}
          >
            <span
              style={{
                width:           '6px',
                height:          '6px',
                borderRadius:    '50%',
                backgroundColor: '#6366f1',
                animation:       'pulse-dot 1.4s ease-in-out infinite',
                display:         'inline-block',
              }}
            />
            <span style={{ fontSize: '13px', color: '#a5b4fc', fontWeight: 500 }}>
              Now in private beta · 5 AI models, 1 platform
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize:      'clamp(40px, 6vw, 72px)',
              fontWeight:    700,
              lineHeight:    1.1,
              letterSpacing: '-0.03em',
              marginBottom:  '16px',
              animation:     'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 100ms both',
            }}
          >
            Your AI{' '}
            <br />
            <span
              style={{
                background:            'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #3b82f6 100%)',
                WebkitBackgroundClip:  'text',
                WebkitTextFillColor:   'transparent',
                backgroundClip:        'text',
              }}
            >
              Engineering Firm
            </span>
          </h1>

          {/* Typewriter subheading */}
          <p
            style={{
              fontSize:     'clamp(16px, 2.5vw, 22px)',
              color:        '#6b6b8a',
              marginBottom: '12px',
              fontWeight:   400,
              animation:    'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 200ms both',
            }}
          >
            Ship production-grade software with{' '}
            <Typewriter
              words={[
                'Claude 3.5',
                'GPT-4o',
                'Codestral',
                'Gemini 1.5',
                'Perplexity',
              ]}
            />
          </p>

          <p
            style={{
              fontSize:     '15px',
              color:        '#3a3a55',
              marginBottom: '40px',
              animation:    'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 300ms both',
            }}
          >
            verityflow.io
          </p>

          {/* CTA buttons */}
          <div
            style={{
              display:        'flex',
              gap:            '12px',
              justifyContent: 'center',
              flexWrap:       'wrap',
              animation:      'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 400ms both',
            }}
          >
            <button
              style={{
                background:   'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color:        '#fff',
                border:       'none',
                borderRadius: '10px',
                padding:      '14px 28px',
                fontSize:     '15px',
                fontWeight:   600,
                cursor:       'pointer',
                fontFamily:   'Space Grotesk, sans-serif',
                boxShadow:    '0 0 24px rgba(99,102,241,0.35)',
                transition:   'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 0 36px rgba(99,102,241,0.5)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 0 24px rgba(99,102,241,0.35)'
              }}
            >
              Start Building Free
            </button>
            <button
              style={{
                background:   'transparent',
                color:        '#e8e8f0',
                border:       '1px solid #1a1a28',
                borderRadius: '10px',
                padding:      '14px 28px',
                fontSize:     '15px',
                fontWeight:   600,
                cursor:       'pointer',
                fontFamily:   'Space Grotesk, sans-serif',
                transition:   'border-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#6366f1')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#1a1a28')}
            >
              Watch Demo →
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────── */}
      <section
        style={{
          borderTop:    '1px solid #1a1a28',
          borderBottom: '1px solid #1a1a28',
          padding:      '24px 0',
          animation:    'fade-in 0.8s ease 500ms both',
        }}
      >
        <div
          style={{
            maxWidth:       '900px',
            margin:         '0 auto',
            padding:        '0 24px',
            display:        'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap:            '16px',
            textAlign:      'center',
          }}
        >
          {STATS.map(s => (
            <div key={s.label}>
              <div
                style={{
                  fontSize:   '28px',
                  fontWeight: 700,
                  color:      '#6366f1',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: '12px', color: '#6b6b8a', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE FEED + MODELS ──────────────────────────────────── */}
      <section style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: '1fr 1fr',
            gap:                 '32px',
            alignItems:          'start',
          }}
          className="responsive-grid"
        >
          {/* Left: live feed */}
          <div style={{ animation: 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 200ms both' }}>
            <h2
              style={{
                fontSize:      '24px',
                fontWeight:    700,
                color:         '#e8e8f0',
                marginBottom:  '8px',
                letterSpacing: '-0.02em',
              }}
            >
              Orchestrator in action
            </h2>
            <p style={{ fontSize: '14px', color: '#6b6b8a', marginBottom: '20px' }}>
              Watch models collaborate on your codebase in real time.
            </p>
            <LiveFeed />
          </div>

          {/* Right: code example */}
          <div style={{ animation: 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 300ms both' }}>
            <h2
              style={{
                fontSize:      '24px',
                fontWeight:    700,
                color:         '#e8e8f0',
                marginBottom:  '8px',
                letterSpacing: '-0.02em',
              }}
            >
              Design system ready
            </h2>
            <p style={{ fontSize: '14px', color: '#6b6b8a', marginBottom: '20px' }}>
              CSS variables, animations, and typography — all wired up.
            </p>
            <div
              style={{
                background:   '#0f0f17',
                border:       '1px solid #1a1a28',
                borderRadius: '12px',
                padding:      '20px',
                fontFamily:   'JetBrains Mono, monospace',
                fontSize:     '12px',
                lineHeight:   1.8,
              }}
            >
              <div style={{ color: '#3a3a55', marginBottom: '8px' }}>/* VerityFlow tokens */</div>
              {[
                ['--vf-bg',          '#08080d', '#6b6b8a'],
                ['--vf-surface',     '#0f0f17', '#6b6b8a'],
                ['--vf-primary',     '#6366f1', '#6366f1'],
                ['--vf-claude',      '#f97316', '#f97316'],
                ['--vf-gpt',         '#10b981', '#10b981'],
                ['--vf-codestral',   '#f59e0b', '#f59e0b'],
                ['--vf-gemini',      '#3b82f6', '#3b82f6'],
                ['--vf-perplexity',  '#8b5cf6', '#8b5cf6'],
              ].map(([k, v, c]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#6b6b8a' }}>{k}:</span>
                  <span style={{ color: c, fontWeight: 600 }}>{v}</span>
                  <span
                    style={{
                      marginLeft:      'auto',
                      width:           '12px',
                      height:          '12px',
                      borderRadius:    '3px',
                      backgroundColor: v,
                      display:         'inline-block',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MODELS GRID ─────────────────────────────────────────── */}
      <section
        style={{
          padding:         '0 24px 80px',
          maxWidth:        '1100px',
          margin:          '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2
            style={{
              fontSize:      'clamp(28px, 4vw, 40px)',
              fontWeight:    700,
              letterSpacing: '-0.02em',
              color:         '#e8e8f0',
              marginBottom:  '12px',
              animation:     'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
            }}
          >
            Five models. One orchestrator.
          </h2>
          <p style={{ fontSize: '15px', color: '#6b6b8a', animation: 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 100ms both' }}>
            Each model selected for its unique strength. Routed automatically.
          </p>
        </div>

        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap:                 '16px',
          }}
        >
          {MODELS.map((m, i) => (
            <ModelCard key={m.id} model={m} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ───────────────────────────────────────── */}
      <section
        style={{
          padding:         '0 24px 80px',
          maxWidth:        '1100px',
          margin:          '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2
            style={{
              fontSize:      'clamp(28px, 4vw, 40px)',
              fontWeight:    700,
              letterSpacing: '-0.02em',
              color:         '#e8e8f0',
              marginBottom:  '12px',
            }}
          >
            Everything your engineering team needs
          </h2>
        </div>
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap:                 '16px',
          }}
        >
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} feature={f} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* ── ANIMATION SHOWCASE ──────────────────────────────────── */}
      <section
        style={{
          padding:         '0 24px 80px',
          maxWidth:        '1100px',
          margin:          '0 auto',
        }}
      >
        <div
          style={{
            background:   '#0f0f17',
            border:       '1px solid #1a1a28',
            borderRadius: '16px',
            padding:      '32px',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#6b6b8a', marginBottom: '24px', fontFamily: 'JetBrains Mono, monospace' }}>
            // animation system
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
            {/* Pulse dots for each model */}
            {MODELS.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width:           '10px',
                    height:          '10px',
                    borderRadius:    '50%',
                    backgroundColor: m.color,
                    display:         'inline-block',
                    animation:       'pulse-dot 1.4s ease-in-out infinite',
                    animationDelay:  `${MODELS.indexOf(m) * 200}ms`,
                  }}
                />
                <span style={{ fontSize: '12px', color: '#6b6b8a', fontFamily: 'JetBrains Mono, monospace' }}>
                  {m.id}
                </span>
              </div>
            ))}

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Spin loader */}
              <div
                style={{
                  width:       '20px',
                  height:      '20px',
                  border:      '2px solid #1a1a28',
                  borderTop:   '2px solid #6366f1',
                  borderRadius:'50%',
                  animation:   'spin 1s linear infinite',
                }}
              />
              <span style={{ fontSize: '12px', color: '#3a3a55', fontFamily: 'JetBrains Mono, monospace' }}>
                orchestrating
                <span
                  style={{
                    display:         'inline-block',
                    width:           '2px',
                    height:          '12px',
                    backgroundColor: '#6366f1',
                    marginLeft:      '2px',
                    verticalAlign:   'middle',
                    animation:       'blink 1.1s step-end infinite',
                  }}
                />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section
        style={{
          textAlign:    'center',
          padding:      '80px 24px 120px',
          borderTop:    '1px solid #1a1a28',
        }}
      >
        <h2
          style={{
            fontSize:      'clamp(28px, 4vw, 48px)',
            fontWeight:    700,
            letterSpacing: '-0.03em',
            color:         '#e8e8f0',
            marginBottom:  '16px',
          }}
        >
          Start shipping with your
          <br />
          <span
            style={{
              background:           'linear-gradient(135deg, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor:  'transparent',
              backgroundClip:       'text',
            }}
          >
            AI engineering team
          </span>
        </h2>
        <p style={{ fontSize: '16px', color: '#6b6b8a', marginBottom: '40px' }}>
          Join the private beta at verityflow.io
        </p>
        <button
          style={{
            background:   'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color:        '#fff',
            border:       'none',
            borderRadius: '12px',
            padding:      '16px 40px',
            fontSize:     '16px',
            fontWeight:   600,
            cursor:       'pointer',
            fontFamily:   'Space Grotesk, sans-serif',
            boxShadow:    '0 0 32px rgba(99,102,241,0.4)',
            animation:    'glow-pulse 2s ease-in-out infinite',
          }}
        >
          Request Early Access
        </button>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop:   '1px solid #1a1a28',
          padding:     '24px',
          textAlign:   'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <div
            style={{
              width:           '20px',
              height:          '20px',
              borderRadius:    '5px',
              background:      'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              fontSize:        '11px',
              fontWeight:      700,
              color:           '#fff',
              fontFamily:      'JetBrains Mono, monospace',
            }}
          >
            V
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#e8e8f0' }}>VerityFlow</span>
        </div>
        <p style={{ fontSize: '12px', color: '#3a3a55' }}>
          © 2025 VerityFlow · verityflow.io · Your AI Engineering Firm
        </p>
      </footer>

      {/* Responsive grid styles */}
      <style>{`
        @media (max-width: 768px) {
          .responsive-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 24px rgba(99,102,241,0.35); }
          50% { box-shadow: 0 0 48px rgba(99,102,241,0.6); }
        }
      `}</style>
    </div>
  )
}
