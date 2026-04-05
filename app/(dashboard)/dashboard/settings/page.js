'use client'

import { useState, useEffect, useCallback } from 'react'
import { Settings, Monitor, Bell, FileCode, Shield } from 'lucide-react'

const STORAGE_KEY = 'vf-settings'

const DEFAULT_SETTINGS = {
  compactMode: false,
  showWelcomeBanner: true,
  emailOnSessionComplete: true,
  weeklyUsageDigest: false,
  autoDownloadOutput: false,
  defaultOutputFormat: 'code',
  analyticsOptOut: false,
  usageDataSharing: true,
}

function loadSettings() {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0f] ${
        enabled ? 'bg-indigo-600' : 'bg-gray-700'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function SettingRow({ label, description, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1 pr-8">
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-gray-500 mt-0.5">{description}</div>
      </div>
      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  )
}

function SettingSection({ icon: Icon, title, description, children }) {
  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <div className="divide-y divide-gray-800/60 mt-4">
        {children}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  const update = useCallback((key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }, [])

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          {saved && (
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full animate-fade-in">
              Saved
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">
          Manage your preferences and customize your VerityFlow experience.
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <SettingSection
          icon={Monitor}
          title="Appearance"
          description="Customize how the dashboard looks"
        >
          <SettingRow
            label="Compact mode"
            description="Reduce spacing and padding throughout the dashboard for a denser layout"
            enabled={settings.compactMode}
            onChange={(v) => update('compactMode', v)}
          />
          <SettingRow
            label="Show welcome banner"
            description="Display the welcome message and quick stats on your dashboard home"
            enabled={settings.showWelcomeBanner}
            onChange={(v) => update('showWelcomeBanner', v)}
          />
        </SettingSection>

        {/* Notifications */}
        <SettingSection
          icon={Bell}
          title="Notifications"
          description="Control when and how you get notified"
        >
          <SettingRow
            label="Session completion emails"
            description="Receive an email when a council session finishes processing"
            enabled={settings.emailOnSessionComplete}
            onChange={(v) => update('emailOnSessionComplete', v)}
          />
          <SettingRow
            label="Weekly usage digest"
            description="Get a weekly summary of your credit usage and project activity"
            enabled={settings.weeklyUsageDigest}
            onChange={(v) => update('weeklyUsageDigest', v)}
          />
        </SettingSection>

        {/* Session Defaults */}
        <SettingSection
          icon={FileCode}
          title="Session Defaults"
          description="Set default behaviors for new council sessions"
        >
          <SettingRow
            label="Auto-download output"
            description="Automatically download session output files when a session completes"
            enabled={settings.autoDownloadOutput}
            onChange={(v) => update('autoDownloadOutput', v)}
          />
          <div className="flex items-center justify-between py-4">
            <div className="flex-1 pr-8">
              <div className="text-sm font-medium text-white">Default output format</div>
              <div className="text-xs text-gray-500 mt-0.5">Choose the default format for session output</div>
            </div>
            <select
              value={settings.defaultOutputFormat}
              onChange={(e) => update('defaultOutputFormat', e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="code">Code files</option>
              <option value="markdown">Markdown</option>
              <option value="zip">ZIP archive</option>
            </select>
          </div>
        </SettingSection>

        {/* Privacy */}
        <SettingSection
          icon={Shield}
          title="Privacy"
          description="Control your data and privacy preferences"
        >
          <SettingRow
            label="Opt out of analytics"
            description="Disable anonymous usage analytics used to improve VerityFlow"
            enabled={settings.analyticsOptOut}
            onChange={(v) => update('analyticsOptOut', v)}
          />
          <SettingRow
            label="Usage data sharing"
            description="Allow anonymized session data to help improve AI model quality"
            enabled={settings.usageDataSharing}
            onChange={(v) => update('usageDataSharing', v)}
          />
        </SettingSection>
      </div>

      <p className="text-xs text-gray-600 mt-8">
        Settings are saved locally to your browser. More options coming soon.
      </p>
    </div>
  )
}
