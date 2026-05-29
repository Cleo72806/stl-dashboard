import { useState, useEffect } from 'react'
import { LoginPage }     from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'

export default function App() {
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('stl_pwd')) setAuthed(true)
  }, [])

  return authed
    ? <DashboardPage />
    : <LoginPage onLogin={() => setAuthed(true)} />
}
