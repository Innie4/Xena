import { Link } from 'react-router-dom'
import Button from '../components/Button'

export default function Landing() {
  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <header className="px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-card bg-terracotta flex items-center justify-center">
            <span className="font-serif text-card text-lg font-semibold">X</span>
          </div>
          <span className="font-serif text-xl font-semibold text-ink">Xena</span>
        </div>
        <Link to="/app" className="text-sm text-olive font-medium hover:text-terracotta">
          Open app →
        </Link>
      </header>

      <section className="px-6 pt-12 pb-10 text-center">
        <span className="inline-block text-xs font-medium uppercase tracking-wider text-terracotta">
          Community payments for Nigerian streets
        </span>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight mt-3 text-ink">
          Pay your street bills together, without the stress.
        </h1>
        <p className="mt-4 text-ink/70 max-w-md mx-auto">
          Xena helps neighbours on streets like Abak Road and Oron Road pool small amounts, clear
          shared bills, and watch the work actually get done.
        </p>
        <div className="mt-7 flex justify-center">
          <Link to="/signup">
            <Button size="lg">Get started — it’s free</Button>
          </Link>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-4">
          {[
            {
              n: '1',
              t: 'Connect your bank',
              d: 'Securely link your account through Open Banking. We never see your password.',
            },
            {
              n: '2',
              t: 'Join your street',
              d: 'Pick your street in Uyo, Lagos or Abuja and find its Community Wallet.',
            },
            {
              n: '3',
              t: 'Watch the work get done',
              d: 'Bills are cleared, projects funded, and you see every naira move.',
            },
          ].map((step) => (
            <div key={step.n} className="card-base p-5">
              <div className="h-9 w-9 rounded-full bg-olive/10 text-olive flex items-center justify-center font-serif font-semibold">
                {step.n}
              </div>
              <h3 className="font-serif text-lg mt-3 text-ink">{step.t}</h3>
              <p className="text-sm text-ink/65 mt-1">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-auto px-6 py-6 border-t border-warmgray text-center text-xs text-ink/50">
        Xena is a demo product. All data shown is fictional and for illustration only.
      </footer>
    </div>
  )
}
