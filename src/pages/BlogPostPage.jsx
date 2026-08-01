import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase/config'

function BlogPostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const q = query(collection(db, 'blogPosts'), where('slug', '==', slug))
        const snap = await getDocs(q)
        if (!snap.empty) {
          setPost({ id: snap.docs[0].id, ...snap.docs[0].data() })
        }
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetchPost()
  }, [slug])

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
  }

  if (!post) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p style={{ color: '#64748b' }}>Post not found.</p>
        <Link to="/blog" style={{ color: '#16a34a', fontWeight: 700 }}>← Back to Blog</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Segoe UI', sans-serif" }}>
      {post.coverImage && (
        <div style={{ height: '360px', overflow: 'hidden', position: 'relative' }}>
          <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent 50%)' }} />
        </div>
      )}

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 20px 80px' }}>
        <Link to="/blog" style={{ color: '#16a34a', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>← Back to Blog</Link>

        <p style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '24px 0 8px 0' }}>
          {formatDate(post.createdAt)} {post.author ? '· ' + post.author : ''}
        </p>
        <h1 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, color: '#1e293b', lineHeight: 1.2, margin: '0 0 24px 0' }}>{post.title}</h1>

        <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {post.content}
        </div>
      </div>
    </div>
  )
}

export default BlogPostPage