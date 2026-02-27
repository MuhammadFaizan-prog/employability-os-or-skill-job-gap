import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/Layout'
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Onboarding } from './pages/Onboarding'
import { Dashboard } from './pages/Dashboard'
import { Skills } from './pages/Skills'
import { RoadmapPage } from './pages/Roadmap'
import { Projects } from './pages/Projects'
import { Resume } from './pages/Resume'
import { Interview } from './pages/Interview'
import { CodingChallenge } from './pages/CodingChallenge'
import { Profile } from './pages/Profile'
import { Verify } from './pages/Verify'

export default function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />

          {/* Auth pages: redirect to dashboard if already logged in */}
          <Route path="login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />

          {/* Protected pages: redirect to login if not authenticated */}
          <Route path="onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="skills" element={<ProtectedRoute><Skills /></ProtectedRoute>} />
          <Route path="roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
          <Route path="projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="resume" element={<ProtectedRoute><Resume /></ProtectedRoute>} />
          <Route path="interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
          <Route path="interview/coding/:challengeId" element={<ProtectedRoute><CodingChallenge /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="verify" element={<ProtectedRoute><Verify /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}
