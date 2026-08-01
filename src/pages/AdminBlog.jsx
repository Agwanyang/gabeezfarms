import { useState, useEffect } from 'react'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

function AdminBlog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', coverImage: '', author: '' })
  const [saving, setSaving] = useState(false)

  const fetchPosts = async () => {
    const q = query(collection(db, 'blogPosts'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => {
      const updated = { ...prev, [name]: value }
      if (name === 'title' && !editingId) {
        updated.slug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }
      return updated
    })
  }

  const resetForm = () => {
    setForm({ title: '', slug: '', excerpt: '', content: '', coverImage: '', author: '' })
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await updateDoc(doc(db, 'blogPosts', editingId), { ...form })
      } else {
        await addDoc(collection(db, 'blogPosts'), { ...form, createdAt: serverTimestamp() })
      }
      resetForm()
      fetchPosts()
    } catch (err) {
      console.error(err)
    }
    setSaving(false)
  }

  const handleEdit = (post) => {
    setForm({
      title: post.title || '', slug: post.slug || '', excerpt: post.excerpt || '',
      content: post.content || '', coverImage: post.coverImage || '', author: post.author || '',
    })
    setEditingId(post.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return
    await deleteDoc(doc(db, 'blogPosts', id))
    fetchPosts()
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Segoe UI', sans-serif", padding: '32px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', marginBottom: 24 }}>Manage Blog Posts</h1>

        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', marginBottom: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Title</label>
              <input name="title" value={form.title} onChange={handleChange} required
                style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Slug (URL)</label>
              <input name="slug" value={form.slug} onChange={handleChange} required
                style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Cover Image URL</label>
            <input name="coverImage" value={form.coverImage} onChange={handleChange} placeholder="https://..."
              style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Author</label>
            <input name="author" value={form.author} onChange={handleChange} placeholder="Gabeez Green Farms Team"
              style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Excerpt (short summary)</label>
            <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows="2" required
              style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 14, boxSizing: 'border-box', resize: 'none' }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Full Content</label>
            <textarea name="content" value={form.content} onChange={handleChange} rows="8" required
              style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" disabled={saving}
              style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, padding: '12px 24px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              {saving ? 'Saving...' : editingId ? 'Update Post' : 'Publish Post'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm}
                style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, padding: '12px 24px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>All Posts ({posts.length})</h2>
        {loading ? <p>Loading...</p> : posts.map(post => (
          <div key={post.id} style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0', fontSize: 14 }}>{post.title}</p>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>/blog/{post.slug}</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleEdit(post)} style={{ background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
              <button onClick={() => handleDelete(post.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminBlog