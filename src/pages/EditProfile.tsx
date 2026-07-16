import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import { SuccessModal } from '../components/Modal'
import { useApp } from '../context/AppContext'

export default function EditProfile() {
  const { user, activeStreetId, getStreetName, updateUser } = useApp()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name ?? '')
  const [done, setDone] = useState(false)

  const trimmed = name.trim()
  const nameError = trimmed ? undefined : 'Enter your full name'

  const handleSave = () => {
    if (!trimmed) return
    const firstName = trimmed.split(/\s+/)[0]
    updateUser({ name: trimmed, firstName })
    setDone(true)
  }

  return (
    <div className="pb-4">
      <PageHeader title="Edit profile" backTo="/profile" showBell={false} />

      <div className="mx-auto w-full max-w-md lg:max-w-6xl lg:px-8 lg:py-7 px-5 py-5 space-y-4">
        <Card className="space-y-4">
          <Input
            id="name"
            label="Full name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={nameError}
            autoComplete="name"
          />

          <Input
            id="phone"
            label="Phone number"
            type="phone"
            value={user?.phone ?? ''}
            readOnly
            className="text-ink/60"
            hint="Changing your number needs OTP verification."
          />
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="label-text">Street</p>
              <p className="font-medium text-ink mt-0.5">{getStreetName(activeStreetId)}</p>
            </div>
            <Link
              to="/signup"
              className="text-sm text-terracotta font-medium hover:text-terracotta-dark"
            >
              Switch
            </Link>
          </div>
          <p className="text-[11px] text-ink/45 mt-2">
            Your street sets which bills and projects you see.
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="label-text">Linked bank</p>
              <p className="font-medium text-ink mt-0.5">{user?.bankName}</p>
              <p className="text-xs text-ink/55">{user?.accountName}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-olive font-medium bg-olive/10 px-2.5 py-1 rounded-full">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Connected
            </span>
          </div>
          <p className="text-[11px] text-ink/45 mt-2">Secured via Open Banking · read-only access</p>
        </Card>

        <div className="flex gap-2 pt-1">
          <Button variant="ghost" size="md" fullWidth onClick={() => navigate('/profile')}>
            Cancel
          </Button>
          <Button variant="primary" size="md" fullWidth disabled={!trimmed} onClick={handleSave}>
            Save changes
          </Button>
        </div>
      </div>

      <SuccessModal
        open={done}
        onClose={() => {
          setDone(false)
          navigate('/profile')
        }}
        title="Profile updated"
        message="Your details have been saved."
      />
    </div>
  )
}
