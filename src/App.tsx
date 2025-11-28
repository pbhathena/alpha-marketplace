import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { MainLayout } from '@/components/layout/MainLayout'

// Pages
import Index from '@/pages/Index'
import Explore from '@/pages/Explore'
import { CreatorProfile } from '@/pages/CreatorProfile'
import { PostDetail } from '@/pages/PostDetail'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'
import BecomeCreator from '@/pages/BecomeCreator'
import CreatorDashboard from '@/pages/CreatorDashboard'
import Overview from '@/pages/CreatorDashboard/Overview'
import Posts from '@/pages/CreatorDashboard/Posts'
import Analytics from '@/pages/CreatorDashboard/Analytics'
import Settings from '@/pages/CreatorDashboard/Settings'
import StripeSetup from '@/pages/CreatorDashboard/StripeSetup'

// Patron Dashboard
import PatronDashboard from '@/pages/PatronDashboard'
import PatronOverview from '@/pages/PatronDashboard/Overview'
import PatronSubscriptions from '@/pages/PatronDashboard/Subscriptions'
import PatronMessages from '@/pages/PatronDashboard/Messages'
import PatronBilling from '@/pages/PatronDashboard/Billing'
import PatronSettings from '@/pages/PatronDashboard/Settings'

// Admin Portal
import AdminPortal from '@/pages/AdminPortal'
import AdminDashboard from '@/pages/AdminPortal/Dashboard'
import AdminUsers from '@/pages/AdminPortal/Users'
import AdminCreators from '@/pages/AdminPortal/Creators'
import AdminRevenue from '@/pages/AdminPortal/Revenue'
import AdminContent from '@/pages/AdminPortal/Content'
import AdminSettings from '@/pages/AdminPortal/Settings'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout><Index /></MainLayout>} />
            <Route path="/explore" element={<MainLayout><Explore /></MainLayout>} />
            <Route path="/creator/:username" element={<CreatorProfile />} />
            <Route path="/creator/:username/post/:postId" element={<PostDetail />} />
            <Route path="/@:username" element={<CreatorProfile />} />
            <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
            <Route path="/signup" element={<MainLayout><Signup /></MainLayout>} />
            <Route path="/become-creator" element={<MainLayout><BecomeCreator /></MainLayout>} />
            <Route path="/dashboard" element={<CreatorDashboard />}>
              <Route index element={<Overview />} />
              <Route path="posts" element={<Posts />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="stripe-setup" element={<StripeSetup />} />
            </Route>
            <Route path="/my-account" element={<PatronDashboard />}>
              <Route index element={<PatronOverview />} />
              <Route path="subscriptions" element={<PatronSubscriptions />} />
              <Route path="messages" element={<PatronMessages />} />
              <Route path="billing" element={<PatronBilling />} />
              <Route path="settings" element={<PatronSettings />} />
            </Route>
            <Route path="/admin" element={<AdminPortal />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="creators" element={<AdminCreators />} />
              <Route path="revenue" element={<AdminRevenue />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </Router>
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
