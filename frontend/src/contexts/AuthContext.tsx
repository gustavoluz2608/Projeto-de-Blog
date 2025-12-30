import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api'

export type UserMe = {
  id: string
  email: string
  roles: string[]
}

type AuthResponse = {
  token: string
  expiresAtUtc: string
  user: UserMe
}

type AuthContextValue = {
  user: UserMe | null
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserMe | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    // tenta carregar /me
    api.get<UserMe>('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token')
        setUser(null)
      })
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
  }

  const register = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/register', { email, password })
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = useMemo(() => ({
    user,
    isAdmin: !!user?.roles?.includes('ADMIN'),
    login,
    register,
    logout
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
