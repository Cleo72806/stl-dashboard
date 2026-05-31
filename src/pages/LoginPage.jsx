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
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      fontFamily: 'sans-serif',
    }}>
      {/* Background image */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url("/GMEC_GNPD_cured.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#1a2a40',
        filter: 'brightness(0.55)',
        zIndex: 0,
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        padding: '1rem',
        boxSizing: 'border-box',
      }}>
        <h1 style={{
          fontWeight: 700,
          fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
          marginBottom: '1.5rem',
          textAlign: 'center',
          color: 'white',
          textShadow: '2px 2px 6px rgba(0,0,0,0.8)',
          maxWidth: '600px',
          letterSpacing: 'normal',
          lineHeight: 1.3,
        }}>
          STL Contract Price Computation and FM Calculator
        </h1>

        <div style={{
          background: 'rgba(255,255,255,0.15)',
          padding: '2rem',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.3)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '360px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxSizing: 'border-box',
          textAlign: 'left',
        }}>
          <label style={{
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 500,
            fontFamily: 'sans-serif',
          }}>
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
              border: '1px solid rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.12)',
              color: 'white',
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box',
              width: '100%',
              fontFamily: 'sans-serif',
            }}
          />
          {error && (
            <p style={{
              color: '#ff6b6b',
              fontWeight: 'bold',
              margin: 0,
              fontSize: '0.85rem',
              fontFamily: 'sans-serif',
            }}>{error}</p>
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
              fontFamily: 'sans-serif',
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? 'Logging in…' : 'Login & Get Started'}
          </button>
        </div>
      </div>
    </div>
  )
}