import { useState } from 'react'
import { api } from '../api'

export function LoginPage({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.login(password)
      sessionStorage.setItem('stl_pwd', password)
      onLogin()
    } catch {
      setError('Incorrect password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'url("/GMEC_GNPD_cured.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: 'rgba(0,0,0,0.45)',
      backgroundBlendMode: 'overlay',
      color: 'white',
      fontFamily: 'sans-serif',
      padding: '1rem',
      textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
    }}>
      <h1 style={{
        fontWeight: 700,
        fontSize: '1.8rem',
        marginBottom: '0.5rem',
        textAlign: 'center',
        color: 'white',
      }}>
        STL Contract Price Computation and FM Calculator
      </h1>

      <br />

      <div style={{
        background: 'rgba(255,255,255,0.15)',
        padding: '2rem',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.3)',
        backdropFilter: 'blur(5px)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '360px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}>
          Enter Password:
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
          style={{
            padding: '0.6rem 0.8rem',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.08)',
            color: 'white',
            fontSize: '1rem',
            outline: 'none',
          }}
        />
        {error && (
          <p style={{ color: '#ff6b6b', fontWeight: 'bold', margin: 0 }}>{error}</p>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: '0.7rem',
            borderRadius: '8px',
            border: 'none',
            background: '#0d6efd',
            color: 'white',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            width: '100%',
          }}
        >
          {loading ? 'Logging in…' : 'Login & Get Started'}
        </button>
      </div>
    </div>
  )
}