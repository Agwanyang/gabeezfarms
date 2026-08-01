import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase/config'

function BlogPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, 'blogPosts'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetchPosts()
  }, [])

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`
        .blog-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .blog-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
        .blog-card-img { transition: transform 0.5s ease; }
        .blog-card:hover .blog-card-img { transform: scale(1.06); }
      `}</style>

      <div style={{ background: 'linear-gradient(135deg, #052e16 0%, #0f4c2a 50%, #1a7a42 100%)', padding: '56px 32px', color: 'white', textAlign: 'center' }}>
        <p style={{ color: '#86efac', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Gabeez Green Farms Blog</p>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, margin: 0 }}>Stories From The Farm</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 10 }}>Tips, updates, and news from our greenhouse</p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 20px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>No blog posts yet. Check back soon!</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {posts.map(post => (
              <Link key={post.id} to={'/blog/' + post.slug} style={{ textDecoration: 'none' }}>
                <div className="blog-card" style={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #eef2f6', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', height: '100%' }}>
                  {post.coverImage && (
                    <div style={{ height: '180px', overflow: 'hidden' }}>
                      <img src={post.coverImage} alt={post.title} className="blog-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ padding: '20px' }}>
                    <p style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>{formatDate(post.createdAt)}</p>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 8px 0', lineHeight: 1.4 }}>{post.title}</h3>
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>{post.excerpt}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogPage