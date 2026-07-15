interface ToggleSwitchProps {
  checked: boolean
  onChange: (next: boolean) => void
  label?: string
  disabled?: boolean
  id?: string
}

export default function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled,
  id,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta/40 disabled:opacity-40 ${
        checked ? 'bg-olive' : 'bg-warmgray'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-card shadow-soft transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
