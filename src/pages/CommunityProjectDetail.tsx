import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import ProgressBar from '../components/ProgressBar'
import Input from '../components/Input'
import Modal, { SuccessModal } from '../components/Modal'
import ToggleSwitch from '../components/ToggleSwitch'
import { useApp } from '../context/AppContext'
import { formatNaira, formatDate, Contributor } from '../mockData'

export default function CommunityProjectDetail() {
  const { id } = useParams()
  const { projects, user, contribute } = useApp()
  const project = projects.find((p) => p.id === id)

  const [amount, setAmount] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [open, setOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const [contributed, setContributed] = useState(0)

  if (!project) {
    return (
      <div>
        <PageHeader title="Project" backTo="/community" />
        <div className="mx-auto w-full max-w-md lg:max-w-6xl lg:px-8 lg:py-7 px-5 py-10 text-center text-ink/60">Project not found.</div>
      </div>
    )
  }

  const isFunded = project.status === 'funded' || project.status === 'completed'
  const amountNum = Number(amount.replace(/,/g, ''))
  const valid = amountNum > 0 && amountNum <= 500000

  const doContribute = () => {
    if (!valid || !user) return
    contribute(project.id, amountNum, {
      name: user.firstName,
      amount: amountNum,
      anonymous,
    })
    setContributed(amountNum)
    setOpen(false)
    setSuccess(true)
    setAmount('')
  }

  return (
    <div className="pb-4">
      <PageHeader title="Community Wallet" subtitle={project.category} backTo="/community" />

      <div className="mx-auto w-full max-w-md lg:max-w-6xl lg:px-8 lg:py-7 px-5 py-5 space-y-4">
        <Card>
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-serif text-xl text-ink leading-snug">{project.title}</h2>
            <AnimatePresence>
              {isFunded && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  className="h-9 w-9 shrink-0 rounded-full bg-gold/20 flex items-center justify-center"
                >
                  <motion.svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#D9A441"
                    strokeWidth="2.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.svg>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="text-sm text-ink/70 mt-2">{project.description}</p>

          <div className="mt-4">
            <ProgressBar value={project.raised} max={project.goal} color={isFunded ? 'gold' : 'olive'} />
          </div>
          <div className="flex justify-between mt-2">
            <span className="num text-olive">{formatNaira(project.raised)}</span>
            <span className="text-sm text-ink/60">
              of {formatNaira(project.goal)}
              {project.daysRemaining > 0 && ` · ${project.daysRemaining} days left`}
            </span>
          </div>

          {isFunded && project.worker && (
            <div className="mt-4 bg-gold/10 border border-gold/40 rounded-btn p-3">
              <p className="text-xs font-medium text-[#8a6516]">Fully funded. Work assigned</p>
              <p className="text-sm text-ink mt-1">
                {project.worker.name} · {project.worker.skill}
              </p>
              {project.jobStartDate && (
                <p className="text-xs text-ink/60 mt-0.5">
                  Job starts {formatDate(project.jobStartDate)}
                </p>
              )}
            </div>
          )}
        </Card>

        {!isFunded && (
          <Button fullWidth size="lg" onClick={() => setOpen(true)}>
            Contribute to this project
          </Button>
        )}

        <Card>
          <p className="label-text mb-3">Contributors ({project.contributors.length})</p>
          <div className="space-y-2">
            {project.contributors.map((c: Contributor, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-ink/80">{c.anonymous ? 'Anonymous' : c.name}</span>
                <span className="num text-ink/70">{formatNaira(c.amount)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Contribute to ${project.title}`}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={doContribute} disabled={!valid}>
              Contribute {valid ? formatNaira(amountNum) : ''}
            </Button>
          </>
        }
      >
        <Input
          id="contr-amount"
          label="Amount"
          type="currency"
          placeholder="5,000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          leading="₦"
        />
        <p className="text-xs text-ink/50 mt-1">No fee is charged on community contributions.</p>
        <div className="flex items-center justify-between mt-4 bg-sand rounded-btn px-3 py-2.5">
          <div>
            <p className="text-sm text-ink">Hide my name</p>
            <p className="text-xs text-ink/50">Show as “Anonymous”</p>
          </div>
          <ToggleSwitch checked={anonymous} onChange={setAnonymous} label="Hide name" />
        </div>
      </Modal>

      <SuccessModal
        open={success}
        onClose={() => setSuccess(false)}
        title="Thank you!"
        message={
          isFundedAfter(contributed, project.raised, project.goal)
            ? 'Your contribution pushed this project to 100%. Work will be assigned!'
            : 'Your contribution was added to the Community Wallet.'
        }
        detail={formatNaira(contributed)}
      />
    </div>
  )
}

// Whether this contribution completed the project
function isFundedAfter(contributed: number, raisedAfter: number, goal: number) {
  // raisedAfter already includes contributed; check if it just crossed the line
  return raisedAfter >= goal && raisedAfter - contributed < goal
}
