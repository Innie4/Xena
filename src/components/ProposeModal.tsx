import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from './Modal'
import Input from './Input'
import Button from './Button'
import AvatarStack from './AvatarStack'
import { useApp } from '../context/AppContext'
import { ProposalCategory } from '../mockData'

const CATEGORIES: ProposalCategory[] = [
  'Gate pickup',
  'Gutter clearing',
  'Waste packing',
  'Security',
  'Sanitation',
]

const COST_RANGES = [
  { label: '₦5,000 - ₦10,000', value: 10000 },
  { label: '₦10,000 - ₦20,000', value: 20000 },
  { label: '₦20,000 - ₦40,000', value: 40000 },
  { label: '₦40,000 - ₦60,000', value: 60000 },
  { label: '₦60,000 - ₦80,000', value: 80000 },
  { label: '₦80,000 - ₦100,000', value: 100000 },
]

export default function ProposeModal() {
  const { proposeOpen, closePropose, contacts, activeStreetId, createProposal } = useApp()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<ProposalCategory>('Gate pickup')
  const [cost, setCost] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  const reset = () => {
    setStep(1)
    setTitle('')
    setDescription('')
    setCategory('Gate pickup')
    setCost('')
    setSearch('')
    setSelected([])
  }

  const streetContacts = contacts.filter((c) => c.streetId === activeStreetId)
  const q = search.trim().toLowerCase()
  const filtered = streetContacts.filter((c) => c.name.toLowerCase().includes(q))
  const selectedContacts = streetContacts.filter((c) => selected.includes(c.id))
  const selectedNames = selectedContacts.map((c) => c.name)

  const costNum = Number(cost.replace(/,/g, ''))
  const step1Valid = title.trim().length > 2 && costNum > 0
  const step2Valid = selected.length > 0

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const selectAll = () => setSelected(filtered.map((c) => c.id))
  const clearAll = () => setSelected([])

  const close = () => {
    closePropose()
    window.setTimeout(reset, 200)
  }

  const submit = () => {
    if (!step1Valid || !step2Valid) return
    createProposal({ title, description, category, estimatedCost: costNum, voters: selected })
    close()
    navigate('/vote')
  }

  const footer =
    step === 1 ? (
      <>
        <Button variant="ghost" size="sm" onClick={close}>
          Cancel
        </Button>
        <Button size="sm" onClick={() => setStep(2)} disabled={!step1Valid}>
          Next
        </Button>
      </>
    ) : (
      <>
        <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button size="sm" onClick={submit} disabled={!step2Valid}>
          Start vote
        </Button>
      </>
    )

  return (
    <Modal
      open={proposeOpen}
      onClose={close}
      title={step === 1 ? 'Propose an idea' : 'Pick your voters'}
      size="md"
      footer={footer}
    >
      {step === 1 ? (
        <div className="space-y-4">
          <Input
            id="pr-title"
            label="Title"
            placeholder="e.g. Repaint the street signs"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label htmlFor="pr-desc" className="label-text block mb-1.5">
              Description
            </label>
            <textarea
              id="pr-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What should we fund, and why?"
              className="w-full bg-card border border-warmgray rounded-btn px-3 py-2.5 outline-none text-ink placeholder:text-ink/35 focus-within:ring-2 focus-within:ring-terracotta/40 resize-none"
            />
          </div>

          <div>
            <label className="label-text block mb-1.5">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    category === c
                      ? 'bg-terracotta text-card border-terracotta'
                      : 'bg-card text-ink/70 border-warmgray hover:border-terracotta/50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="pr-cost" className="label-text block mb-1.5">
              Estimated cost
            </label>
            <select
              id="pr-cost"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full bg-card border border-warmgray rounded-btn px-3 py-2.5 outline-none text-ink focus-within:ring-2 focus-within:ring-terracotta/40"
            >
              <option value="" disabled>
                Select a range
              </option>
              {COST_RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-ink/50">
            Opens a 48-hour vote with the people you pick next.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <Input
            id="pr-search"
            label="Search contacts"
            placeholder="Name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-ink/55">{selected.length} selected</span>
            <div className="flex gap-3 text-xs font-medium">
              <button type="button" onClick={selectAll} className="text-terracotta hover:text-terracotta-dark">
                Select all
              </button>
              <button type="button" onClick={clearAll} className="text-ink/55 hover:text-ink">
                Clear
              </button>
            </div>
          </div>

          {selectedNames.length > 0 && (
            <div className="flex items-center gap-2">
              <AvatarStack names={selectedNames} />
              <span className="text-xs text-ink/55">will be invited to vote</span>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto -mx-1 px-1 space-y-1">
            {filtered.map((c) => {
              const on = selected.includes(c.id)
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  className={`w-full flex items-center justify-between rounded-btn px-3 py-2.5 text-left transition-colors ${
                    on
                      ? 'bg-terracotta/10 border border-terracotta/30'
                      : 'bg-card border border-warmgray hover:border-terracotta/40'
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="h-7 w-7 rounded-full bg-olive/15 text-olive text-xs font-semibold flex items-center justify-center shrink-0">
                      {c.name.slice(0, 1)}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm text-ink truncate">{c.name}</span>
                      <span className="block text-[11px] text-ink/50">{c.phone}</span>
                    </span>
                  </span>
                  <span
                    className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                      on ? 'bg-terracotta border-terracotta text-card' : 'border-warmgray'
                    }`}
                  >
                    {on && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                </button>
              )
            })}
            {filtered.length === 0 && (
              <p className="text-xs text-ink/45 text-center py-3">No contacts match “{search}”.</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
