import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "./components/Layout"
import { Landing } from "./pages/Landing"
import { Onboarding } from "./pages/Onboarding"
import { Dashboard } from "./pages/Dashboard"
import { Skills } from "./pages/Skills"
import { RoadmapPage } from "./pages/Roadmap"
import { Projects } from "./pages/Projects"
import { Resume } from "./pages/Resume"
import { Interview } from "./pages/Interview"
import { Profile } from "./pages/Profile"
import { Verify } from "./pages/Verify"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="skills" element={<Skills />} />
          <Route path="roadmap" element={<RoadmapPage />} />
          <Route path="projects" element={<Projects />} />
          <Route path="resume" element={<Resume />} />
          <Route path="interview" element={<Interview />} />
          <Route path="profile" element={<Profile />} />
          <Route path="verify" element={<Verify />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
