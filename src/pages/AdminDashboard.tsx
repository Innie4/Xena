import TopNav from '../components/TopNav'
import Card from '../components/Card'
import Table, { Column } from '../components/Table'
import StatusTag from '../components/StatusTag'
import Button from '../components/Button'
import { useFakeLoad } from '../hooks/useFakeLoad'
import { LoadingState } from '../components/states'
import { useApp } from '../context/AppContext'
import {
  AdminStreetRow,
  HealthStatus,
  formatNaira,
  formatDate,
  adminStreets,
  adminSummary,
} from '../mockData'

const healthLabel: Record<HealthStatus, string> = {
  healthy: 'Healthy',
  warning: 'Warning',
  critical: 'Critical',
}

export default function AdminDashboard() {
  const { workerQueue, approveWorker, rejectWorker } = useApp()
  const loading = useFakeLoad(800)

  const streets = adminStreets
  const pendingWorkers = workerQueue.filter((w) => w.status === 'pending')

  const columns: Column<AdminStreetRow>[] = [
    {
      key: 'name',
      header: 'Street',
      render: (r) => (
        <div>
          <p className="font-medium text-ink">{r.name}</p>
          <p className="text-xs text-ink/50">{r.city}</p>
        </div>
      ),
    },
    { key: 'households', header: 'Households', align: 'right', render: (r) => r.households },
    {
      key: 'collected',
      header: 'Collected',
      align: 'right',
      render: (r) => <span className="text-olive">{formatNaira(r.collected)}</span>,
    },
    {
      key: 'expected',
      header: 'Expected',
      align: 'right',
      render: (r) => <span className="text-ink/60">{formatNaira(r.expected)}</span>,
    },
    {
      key: 'health',
      header: 'Health',
      align: 'center',
      render: (r) => (
        <StatusTag
          status={r.health === 'healthy' ? 'paid' : r.health === 'warning' ? 'pending' : 'overdue'}
          label={healthLabel[r.health]}
        />
      ),
    },
  ]

  if (loading) {
    return (
      <div>
        <TopNav title="City Admin" />
        <LoadingState label="Loading admin dashboard…" />
      </div>
    )
  }

  return (
    <div className="pb-10">
      <TopNav title="City Admin" subtitle="Xena · all streets" />

      <div className="max-w-6xl mx-auto px-5 py-6 space-y-6">
        {/* Citywide summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-ink text-card border-0">
            <p className="text-xs text-card/70">Total funds moved</p>
            <p className="num-lg text-card mt-1">{formatNaira(adminSummary.totalFundsMoved)}</p>
          </Card>
          <Card>
            <p className="label-text">Active streets</p>
            <p className="num-lg text-ink mt-1">{adminSummary.streetsActive}</p>
          </Card>
          <Card>
            <p className="label-text">Workers verified</p>
            <p className="num-lg text-olive mt-1">{adminSummary.workersVerified}</p>
          </Card>
          <Card>
            <p className="label-text">Projects funded</p>
            <p className="num-lg text-terracotta mt-1">{adminSummary.projectsFunded}</p>
          </Card>
        </div>

        {/* Streets table */}
        <section>
          <h2 className="font-serif text-lg text-ink mb-2">Streets · payment health</h2>
          <Table columns={columns} data={streets} rowKey={(r) => r.id} />
        </section>

        {/* Worker verification queue */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-serif text-lg text-ink">Worker verification queue</h2>
            <span className="text-xs text-ink/55">
              {pendingWorkers.length} pending
            </span>
          </div>
          {pendingWorkers.length === 0 ? (
            <Card className="text-sm text-ink/55 text-center py-8">
              No workers waiting for verification. Nice.
            </Card>
          ) : (
            <div className="space-y-2">
              {workerQueue.map((w) => (
                <Card key={w.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink">{w.name}</p>
                    <p className="text-xs text-ink/55">
                      {w.skill} · {w.street}
                    </p>
                    <p className="text-xs text-ink/45 mt-0.5">
                      Submitted {formatDate(w.submittedAt)} · {w.document}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {w.status === 'pending' ? (
                      <>
                        <Button size="sm" onClick={() => approveWorker(w.id)}>
                          Approve
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => rejectWorker(w.id)}>
                          Reject
                        </Button>
                      </>
                    ) : (
                      <StatusTag
                        status={w.status === 'approved' ? 'paid' : 'overdue'}
                        label={w.status === 'approved' ? 'Approved' : 'Rejected'}
                      />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
