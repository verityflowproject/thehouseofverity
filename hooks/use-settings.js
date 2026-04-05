'use client'

import { useState, useEffect } from 'react'

export const SETTINGS_KEY = 'vf-settings'

export const DEFAULT_SETTINGS = {
  compactMode:             false,
  showWelcomeBanner:       true,
  emailOnSessionComplete:  true,
  weeklyUsageDigest:       false,
  autoDownloadOutput:      false,
  defaultOutputFormat:     'code',
  analyticsOptOut:         false,
  usageDataSharing:        true,
}

function loadSettings() {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  useEffect(() => {
    setSettings(loadSettings())

    // Keep in sync if settings change in another tab/window
    const onStorage = (e) => {
      if (e.key === SETTINGS_KEY) {
        setSettings(loadSettings())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return settings
}
