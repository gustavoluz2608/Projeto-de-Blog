import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const nav = useNavigate()

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      backdropFilter: 'blur(10px)',
      background: 'rgba(11,16,32,0.85)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      zIndex: 10
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontWeight: 800, letterSpacing: 0.5 }}>✨ Blog</div>
          </Link>
          {isAdmin && (
            <Link to="/admin/users" style={{ opacity: 0.9 }}>Usuários</Link>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {user ? (
            <>
              <div style={{ opacity: 0.85, fontSize: 14 }}>{user.email}</div>
              <button className="btn" onClick={() => { logout(); nav('/login') }}>Sair</button>
            </>
          ) : (
            <Link className="btn" to="/login">Entrar</Link>
          )}
        </div>
      </div>
    </div>
  )
}
