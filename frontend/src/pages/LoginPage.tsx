import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      nav('/')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Não foi possível entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ paddingTop: 48 }}>
      <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h2 style={{ marginTop: 0 }}>Entrar</h2>
        <p style={{ opacity: 0.85 }}>Acesse o blog com seu e-mail e senha.</p>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
          <label>
            Email
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
          </label>
          <label>
            Senha
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
          </label>
          {error && <div style={{ color: '#ffb4b4' }}>{error}</div>}
          <button className="btn" disabled={loading} type="submit">{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>

        <div style={{ marginTop: 14, opacity: 0.9 }}>
          Não tem conta? <Link to="/register">Criar agora</Link>
        </div>
      </div>
    </div>
  )
}
