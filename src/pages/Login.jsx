import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid))

      if (userDoc.exists()) {
        const role = userDoc.data().role
        if (role === 'supervisor') return navigate('/reports/supervisor')
        if (role === 'manager') return navigate('/reports/manager')
        if (role === 'ceo') return navigate('/reports/ceo')
      }

      navigate('/dashboard')
    } catch (err) {
      setError('Invalid email or password')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f4c2a 0%, #1a7a42 50%, #2d9e5f 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif",
      padding: '20px'
    }}>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)',
        pointerEvents: 'none'
      }}/>

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
        <div style={{textAlign: 'center', marginBottom: '32px'}}>
          <div style={{
            width: '72px', height: '72px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            marginBottom: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>🌿</div>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '700', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>Gabeez Green Farms</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: 0 }}>Farm Management System</p>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '36px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: '0 0 6px 0' }}>Welcome back</h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 28px 0' }}>Sign in to your account</p>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
              padding: '12px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '20px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>⚠️ {error}</div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{marginBottom: '20px'}}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Email Address</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', color: '#1e293b' }}
                placeholder="admin@gggreenfarms.com" required
                onFocus={e => e.target.style.borderColor='#16a34a'}
                onBlur={e => e.target.style.borderColor='#e2e8f0'}
              />
            </div>

            <div style={{marginBottom: '28px'}}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1e293b' }}
                placeholder="Enter your password" required
                onFocus={e => e.target.style.borderColor='#16a34a'}
                onBlur={e => e.target.style.borderColor='#e2e8f0'}
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', background: loading ? '#94a3b8' : 'linear-gradient(135deg, #16a34a, #15803d)',
                color: 'white', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '15px',
                fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(22,163,74,0.4)', transition: 'all 0.2s'
              }}>
              {loading ? '⏳ Signing in...' : '🔐 Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '24px' }}>
          © 2026 G Green Farms. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default Login