import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './index.css'

function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      if (localStorage.getItem('ptba_sid')) {
        navigate('/data-shipment', { replace: true })
      }
    } catch {
      // ignore
    }
  }, [navigate])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const json = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(json?.error || `${res.status} ${res.statusText}`)
      }

      localStorage.setItem('ptba_sid', json.sid)
      localStorage.setItem('ptba_user', JSON.stringify(json.user))
      navigate('/data-shipment', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card" role="dialog" aria-label="Login">
        <div className="login-logo">
          <img src="/logo/Logo BA - Login.svg" alt="Bukit Asam" />
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          <label className="login-label" htmlFor="username">
            Username :
          </label>
          <input
            id="username"
            className="login-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          /> <br />

          <label className="login-label" htmlFor="password">
            Password :
          </label>
          <input
            id="password"
            className="login-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error && <div className="login-error">{error}</div>}

          <button className="login-button" type="submit" disabled={submitting}>
            {submitting ? 'Loading...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
