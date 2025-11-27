import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { MainLayout } from '@/components/layout/MainLayout'

// Pages
import Index from '@/pages/Index'
import { CreatorProfile } from '@/pages/CreatorProfile'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'
import BecomeCreator from '@/pages/BecomeCreator'
import CreatorDashboard from '@/pages/CreatorDashboard'
import Overview from '@/pages/CreatorDashboard/Overview'
import Settings from '@/pages/CreatorDashboard/Settings'
import StripeSetup from '@/pages/CreatorDashboard/StripeSetup'

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
            <Route path="/creator/:username" element={<CreatorProfile />} />
            <Route path="/@:username" element={<CreatorProfile />} />
            <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
            <Route path="/signup" element={<MainLayout><Signup /></MainLayout>} />
            <Route path="/become-creator" element={<MainLayout><BecomeCreator /></MainLayout>} />
            <Route path="/dashboard" element={<CreatorDashboard />}>
              <Route index element={<Overview />} />
              <Route path="settings" element={<Settings />} />
              <Route path="stripe-setup" element={<StripeSetup />} />
            </Route>
          </Routes>
        </Router>
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
