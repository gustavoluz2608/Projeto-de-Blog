import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../contexts/AuthContext'

type PostDto = {
  id: string
  title: string
  content: string
  createdAtUtc: string
  authorId: string
  authorEmail: string
}

export default function PostsPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<PostDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<PostDto[]>('/posts')
      setPosts(res.data)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Não foi possível carregar as postagens.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const myId = user?.id
  const total = useMemo(() => posts.length, [posts.length])

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    try {
      await api.post('/posts', { title, content })
      setTitle('')
      setContent('')
      await load()
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Não foi possível criar a postagem.')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (p: PostDto) => {
    setEditingId(p.id)
    setEditTitle(p.title)
    setEditContent(p.content)
  }

  const saveEdit = async () => {
    if (!editingId) return
    setSaving(true)
    try {
      await api.put(`/posts/${editingId}`, { title: editTitle, content: editContent })
      setEditingId(null)
      await load()
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Não foi possível atualizar.')
    } finally {
      setSaving(false)
    }
  }

  const removePost = async (id: string) => {
    if (!confirm('Excluir esta postagem?')) return
    setSaving(true)
    try {
      await api.delete(`/posts/${id}`)
      await load()
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Não foi possível excluir.')
    } finally {
      setSaving(false)
    }
  }

  const fmt = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('pt-BR')
  }

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Mural</h1>
          <div style={{ opacity: 0.85 }}>Postagens mais recentes • {total}</div>
        </div>
        <div style={{ opacity: 0.75, fontSize: 14 }}>
          Você está logado como <b>{user?.email}</b>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Nova postagem</h3>
        <form onSubmit={createPost} style={{ display: 'grid', gap: 10 }}>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" maxLength={200} />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Escreva algo..." rows={5} maxLength={20000} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn" disabled={saving} type="submit">{saving ? 'Publicando...' : 'Publicar'}</button>
          </div>
        </form>
      </div>

      {loading ? (
        <div style={{ marginTop: 18, opacity: 0.85 }}>Carregando...</div>
      ) : error ? (
        <div style={{ marginTop: 18, color: '#ffb4b4' }}>{error}</div>
      ) : (
        <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
          {posts.map((p) => {
            const isMine = p.authorId === myId
            const isEditing = editingId === p.id
            return (
              <div key={p.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    {isEditing ? (
                      <input className="input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} maxLength={200} />
                    ) : (
                      <h3 style={{ marginTop: 0, marginBottom: 6 }}>{p.title}</h3>
                    )}
                    <div style={{ opacity: 0.75, fontSize: 14 }}>
                      por <b>{p.authorEmail || '—'}</b> • {fmt(p.createdAtUtc)}
                    </div>
                  </div>

                  {isMine && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      {isEditing ? (
                        <>
                          <button className="btn" disabled={saving} onClick={saveEdit} type="button">Salvar</button>
                          <button className="btn" disabled={saving} onClick={() => setEditingId(null)} type="button">Cancelar</button>
                        </>
                      ) : (
                        <>
                          <button className="btn" disabled={saving} onClick={() => startEdit(p)} type="button">Editar</button>
                          <button className="btn" disabled={saving} onClick={() => removePost(p.id)} type="button">Excluir</button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>
                  {isEditing ? (
                    <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={6} maxLength={20000} />
                  ) : (
                    p.content
                  )}
                </div>
              </div>
            )
          })}

          {posts.length === 0 && (
            <div style={{ opacity: 0.85 }}>Ainda não há postagens. Seja a primeira pessoa a publicar 😀</div>
          )}
        </div>
      )}

      <div style={{ marginTop: 28, opacity: 0.6, fontSize: 12 }}>
        Dica: apenas você pode editar/excluir as suas próprias postagens.
      </div>
    </div>
  )
}
