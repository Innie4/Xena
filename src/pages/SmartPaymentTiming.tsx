import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import ToggleSwitch from '../components/ToggleSwitch'
import Modal, { SuccessModal } from '../components/Modal'
import { useApp } from '../context/AppContext'

export default function SmartPaymentTiming() {
  const navigate = useNavigate()
  const { timing, toggleTiming } = useApp()
  const [confirmOff, setConfirmOff] = useState(false)
  const [saved, setSaved] = useState(false)

  const day = timing.payPatternDay

  const handleToggle = (next: boolean) => {
    if (!next) {
      setConfirmOff(true)
      return
    }
    toggleTiming(true)
    setSaved(true)
  }

  return (
    <div className="pb-4">
      <PageHeader title="Smart Payment Timing" subtitle="Collect when you’re paid" backTo="/profile" />

      <div className="mx-auto w-full max-w-md lg:max-w-6xl lg:px-8 lg:py-7 px-5 py-5 space-y-4">
        <Card>
          <p className="label-text">Detected pay pattern</p>
          <p className="font-serif text-xl text-ink mt-1">
            You usually get paid around the {day}
            {day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th'}
          </p>
          <p className="text-xs text-ink/55 mt-1">
            Based on your last 4 months of bank activity.
          </p>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-ink">Time bills to your payday</p>
              <p className="text-sm text-ink/65 mt-1">
                Instead of collecting on a fixed date, Xena waits until around the {day}
                {day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}: when money has just
                landed, then sweeps your bills. This avoids failed collections when your balance is low.
              </p>
            </div>
            <ToggleSwitch
              checked={timing.enabled}
              onChange={handleToggle}
              label="Time bills to payday"
            />
          </div>

          {timing.enabled && (
            <div className="mt-3 pt-3 border-t border-warmgray flex items-center justify-between">
              <span className="text-xs text-olive font-medium">Active: collecting after the {day}th</span>
              <Button variant="danger" size="sm" onClick={() => setConfirmOff(true)}>
                Cancel
              </Button>
            </div>
          )}
        </Card>

        {!timing.enabled && (
          <p className="text-xs text-ink/50 text-center">
            Your bills are collected on their fixed due dates. Turn this on to align with your payday.
          </p>
        )}
      </div>

      <Modal
        open={confirmOff}
        onClose={() => setConfirmOff(false)}
        title="Turn off Payment Timing?"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirmOff(false)}>
              Keep it on
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                toggleTiming(false)
                setConfirmOff(false)
                setSaved(true)
              }}
            >
              Turn off
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink/75">
          Xena will go back to collecting your bills on their fixed due dates. You can re-enable this
          any time.
        </p>
      </Modal>

      <SuccessModal
        open={saved}
        onClose={() => {
          setSaved(false)
          navigate('/profile')
        }}
        title={timing.enabled ? 'Payment Timing on' : 'Payment Timing off'}
        message={
          timing.enabled
            ? `Bills will now collect around the ${day}th of each month.`
            : 'Bills will collect on their fixed due dates again.'
        }
      />
    </div>
  )
}
