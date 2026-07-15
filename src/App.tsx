import { Routes, Route, Outlet, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Sidebar from './components/Sidebar'
import Landing from './pages/Landing'
import SignupFlow from './pages/SignupFlow'
import ResidentDashboard from './pages/ResidentDashboard'
import BillsDetail from './pages/BillsDetail'
import BillDetail from './pages/BillDetail'
import SmartSweep from './pages/SmartSweep'
import SmartPaymentTiming from './pages/SmartPaymentTiming'
import CommunityProjects from './pages/CommunityProjects'
import CommunityProjectDetail from './pages/CommunityProjectDetail'
import Voting from './pages/Voting'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import OperatorDashboard from './pages/OperatorDashboard'
import AdminDashboard from './pages/AdminDashboard'

function ResidentLayout() {
  const location = useLocation()
  return (
    <div className="min-h-screen flex bg-sand">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <div key={location.pathname} className="page-fade flex-1 pb-24 lg:pb-0">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  )
}

function OperatorLayout() {
  const location = useLocation()
  return (
    <div key={location.pathname} className="page-fade min-h-screen bg-sand">
      <Outlet />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<SignupFlow />} />

      <Route element={<ResidentLayout />}>
        <Route path="/app" element={<ResidentDashboard />} />
        <Route path="/bills" element={<BillsDetail />} />
        <Route path="/bills/:id" element={<BillDetail />} />
        <Route path="/smart-sweep/:billId" element={<SmartSweep />} />
        <Route path="/payment-timing" element={<SmartPaymentTiming />} />
        <Route path="/community" element={<CommunityProjects />} />
        <Route path="/community/:id" element={<CommunityProjectDetail />} />
        <Route path="/vote" element={<Voting />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route element={<OperatorLayout />}>
        <Route path="/operator" element={<OperatorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<Landing />} />
    </Routes>
  )
}
