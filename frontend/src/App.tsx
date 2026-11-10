import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Chat from './pages/Chat'
import PDFLibraryPage from './pages/PDFLibrary'
import History from './pages/History'
import HealthInfo from './pages/HealthInfo'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:sessionId" element={<Chat />} />
        <Route path="/library" element={<PDFLibraryPage />} />
        <Route path="/history" element={<History />} />
        <Route path="/health-info" element={<HealthInfo />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
