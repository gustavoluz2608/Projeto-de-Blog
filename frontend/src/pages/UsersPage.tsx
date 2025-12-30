import { useEffect, useState } from 'react'
import { api } from '../api'

type UserDto = {
  id: string
  email: string
  createdAtUtc: string
  roles: string[]
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<'USER' | 'ADMIN'>('USER')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<UserDto[]>('/users')
      setUsers(res.data)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Não foi possível carregar usuários.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const fmt = (iso: string) => new Date(iso).toLocaleString('pt-BR')

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/users', { email: newEmail, password: newPassword, role: newRole })
      setNewEmail('')
      setNewPassword('')
      setNewRole('USER')
      await load()
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Não foi possível criar usuário.')
    }
  }

  const update = async (u: UserDto) => {
    const role = prompt('Role (USER ou ADMIN):', u.roles?.[0] ?? 'USER')?.toUpperCase()
    if (!role) return
    const newPw = prompt('Nova senha (deixe vazio para não alterar):') ?? ''
    try {
      await api.put(`/users/${u.id}`, { email: u.email, role, newPassword: newPw || null })
      await load()
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Não foi possível atualizar.')
    }
  }

  const remove = async (u: UserDto) => {
    if (!confirm(`Excluir usuário ${u.email}?`)) return
    try {
      await api.delete(`/users/${u.id}`)
      await load()
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Não foi possível excluir.')
    }
  }

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <h1 style={{ marginTop: 0 }}>Usuários</h1>
      <p style={{ opacity: 0.85 }}>Somente ADMIN pode gerenciar usuários.</p>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Criar usuário</h3>
        <form onSubmit={create} style={{ display: 'grid', gap: 10 }}>
          <label>
            Email
            <input className="input" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </label>
          <label>
            Senha
            <input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </label>
          <label>
            Role
            <select className="input" value={newRole} onChange={(e) => setNewRole(e.target.value as any)}>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn" type="submit">Criar</button>
          </div>
        </form>
      </div>

      {loading ? (
        <div style={{ marginTop: 18, opacity: 0.85 }}>Carregando...</div>
      ) : error ? (
        <div style={{ marginTop: 18, color: '#ffb4b4' }}>{error}</div>
      ) : (
        <div className="card" style={{ marginTop: 16, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', opacity: 0.85 }}>
                <th style={{ padding: '10px 6px' }}>Email</th>
                <th style={{ padding: '10px 6px' }}>Role</th>
                <th style={{ padding: '10px 6px' }}>Criado em</th>
                <th style={{ padding: '10px 6px' }}></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <td style={{ padding: '10px 6px' }}>{u.email}</td>
                  <td style={{ padding: '10px 6px' }}>{u.roles?.[0] ?? 'USER'}</td>
                  <td style={{ padding: '10px 6px' }}>{fmt(u.createdAtUtc)}</td>
                  <td style={{ padding: '10px 6px', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn" type="button" onClick={() => update(u)}>Editar</button>
                    <button className="btn" type="button" onClick={() => remove(u)}>Excluir</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={4} style={{ padding: '12px 6px', opacity: 0.85 }}>Nenhum usuário.</td></tr>
              )}
            </tbody>
          </table>

          <div style={{ marginTop: 12, opacity: 0.7, fontSize: 12 }}>
            Dica: ao clicar em “Editar”, você consegue alterar role e, opcionalmente, redefinir senha.
          </div>
        </div>
      )}
    </div>
  )
}
