import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('As senhas não conferem.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await register(email, password)
      nav('/')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Não foi possível criar sua conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ paddingTop: 48 }}>
      <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h2 style={{ marginTop: 0 }}>Criar conta</h2>
        <p style={{ opacity: 0.85 }}>Cadastro rápido (Email + Senha).</p>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
          <label>
            Email
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
          </label>
          <label>
            Senha
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mínimo 6 caracteres" />
          </label>
          <label>
            Confirmar senha
            <input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </label>
          {error && <div style={{ color: '#ffb4b4' }}>{error}</div>}
          <button className="btn" disabled={loading} type="submit">{loading ? 'Criando...' : 'Criar conta'}</button>
        </form>

        <div style={{ marginTop: 14, opacity: 0.9 }}>
          Já tem conta? <Link to="/login">Entrar</Link>
        </div>
      </div>
    </div>
  )
}
