import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSparkles } from './SparklesProvider'
import { useApp } from '../context/AppContext'
import { SparklesIcon, CloseIcon, BellRingIcon, ShieldCheckIcon } from '../components/icons'
import ToggleSwitch from '../components/ToggleSwitch'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.round(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

export default function SparklesPanel() {
  const {
    settings,
    log,
    openPanel,
    setOpenPanel,
    updateSettings,
    setQuietHours,
    setGoalEnabled,
    triggerDemo,
  } = useSparkles()
  const { bills, projects } = useApp()
  const [tab, setTab] = useState<'activity' | 'settings'>('activity')

  const goals = [
    ...bills.filter((b) => b.status !== 'paid').map((b) => ({ id: b.id, label: `${b.type} bill` })),
    ...projects
      .filter((p) => p.status === 'active')
      .map((p) => ({ id: p.id, label: p.title })),
  ]

  return (
    <AnimatePresence>
      {openPanel && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpenPanel(false)} />
          <motion.div
            className="relative w-full max-w-md bg-card rounded-t-card shadow-soft max-h-[80vh] flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-warmgray">
              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-full bg-gold/20 text-terracotta flex items-center justify-center">
                  <SparklesIcon size={17} />
                </span>
                <div>
                  <p className="font-display text-ink font-semibold">Sparkles</p>
                  <p className="text-[11px] text-ink/55 -mt-0.5">Xena's reminder assistant</p>
                </div>
              </div>
              <button
                onClick={() => setOpenPanel(false)}
                aria-label="Close"
                className="h-8 w-8 rounded-full flex items-center justify-center text-ink/55 hover:bg-warmgray/60"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className="flex gap-1 px-5 pt-3">
              {(['activity', 'settings'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 rounded-btn text-sm font-medium capitalize transition-colors ${
                    tab === t ? 'bg-terracotta/10 text-terracotta' : 'text-ink/55 hover:bg-warmgray/60'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {tab === 'activity' && (
                <>
                  <div className="flex items-center justify-between bg-sand rounded-btn px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-ink">
                      <BellRingIcon size={16} className="text-terracotta" />
                      Automated reminders
                    </div>
                    <ToggleSwitch
                      checked={settings.enabled}
                      onChange={(v) => updateSettings({ enabled: v })}
                      label="Automated reminders"
                    />
                  </div>

                  <button
                    onClick={triggerDemo}
                    className="w-full py-2.5 rounded-btn text-sm font-medium bg-olive/10 text-olive"
                  >
                    Trigger a demo reminder
                  </button>

                  <div>
                    <p className="label-text mb-2">Recent activity</p>
                    {log.length === 0 ? (
                      <p className="text-sm text-ink/50">No reminders yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {log.map((r) => (
                          <div key={r.id} className="card-base p-3">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm text-ink">{r.body}</p>
                              <span
                                className={`shrink-0 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${
                                  r.status === 'dismissed'
                                    ? 'bg-warmgray/70 text-ink/50'
                                    : r.status === 'snoozed'
                                      ? 'bg-gold/15 text-[#8a6516]'
                                      : 'bg-olive/10 text-olive'
                                }`}
                              >
                                {r.status}
                              </span>
                            </div>
                            <p className="text-xs text-ink/45 mt-1">{timeAgo(r.createdAt)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {tab === 'settings' && (
                <>
                  <div className="card-base p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-ink">Reminders on</p>
                        <p className="text-xs text-ink/55">Pause every nudge at once</p>
                      </div>
                      <ToggleSwitch
                        checked={settings.enabled}
                        onChange={(v) => updateSettings({ enabled: v })}
                        label="Reminders on"
                      />
                    </div>

                    <div className="border-t border-warmgray pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheckIcon size={15} className="text-olive" />
                        <p className="text-sm font-medium text-ink">Quiet hours</p>
                      </div>
                      <p className="text-xs text-ink/55 mb-2">
                        No reminders between these times, in your local clock.
                      </p>
                      <div className="flex items-center gap-3">
                        <ToggleSwitch
                          checked={settings.quietHours.enabled}
                          onChange={(v) => setQuietHours({ enabled: v })}
                          label="Quiet hours"
                        />
                        <label className="flex items-center gap-1 text-sm text-ink/70">
                          From
                          <input
                            type="time"
                            value={settings.quietHours.start}
                            onChange={(e) => setQuietHours({ start: e.target.value })}
                            className="rounded-btn border border-warmgray bg-card px-2 py-1 text-sm"
                          />
                        </label>
                        <label className="flex items-center gap-1 text-sm text-ink/70">
                          To
                          <input
                            type="time"
                            value={settings.quietHours.end}
                            onChange={(e) => setQuietHours({ end: e.target.value })}
                            className="rounded-btn border border-warmgray bg-card px-2 py-1 text-sm"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="label-text mb-2">Reminders per goal</p>
                    {goals.length === 0 ? (
                      <p className="text-sm text-ink/50">No active goals right now.</p>
                    ) : (
                      <div className="space-y-2">
                        {goals.map((g) => (
                          <div key={g.id} className="card-base p-3 flex items-center justify-between">
                            <span className="text-sm text-ink">{g.label}</span>
                            <ToggleSwitch
                              checked={settings.perGoal[g.id] !== false}
                              onChange={(v) => setGoalEnabled(g.id, v)}
                              label={g.label}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
