import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore'
import { db, auth } from '../firebase/config'
import PageLayout from '../components/PageLayout'

function SupervisorReports() {
  const [reports, setReports] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchReports = async () => {
    const uid = auth.currentUser.uid
    const q = query(collection(db, 'reports'), where('authorUid', '==', uid), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => { fetchReports() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'reports'), {
        authorUid: auth.currentUser.uid,
        authorName: 'Supervisor',
        role: 'supervisor',
        content,
        createdAt: serverTimestamp(),
      })
      setContent('')
      fetchReports()
    } catch (err) {
      console.error(err)
    }
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return
    try {
      await deleteDoc(doc(db, 'reports', id))
      fetchReports()
    } catch (err) {
      console.error(err)
    }
  }

  const formatDate = (ts) => {
    if (!ts) return ''
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('en-NG', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const canDelete = (createdAt) => {
    if (!createdAt) return false
    const created = createdAt.toDate ? createdAt.toDate() : new Date(createdAt)
    const now = new Date()
    const hoursPassed = (now - created) / (1000 * 60 * 60)
    return hoursPassed < 1
  }

  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Daily Report</h1>
        <p className="text-sm text-slate-500 mt-1">Submit your report to the manager</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Today's Report</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows="5"
          placeholder="Summarize today's activities, issues, and updates..."
          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
          required
        />
        <button type="submit" disabled={submitting}
          className="mt-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50">
          {submitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">My Past Reports</h3>
        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : reports.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">No reports submitted yet</p>
        ) : (
          <div className="space-y-3">
            {reports.map(r => (
  <div key={r.id} className="border border-slate-100 rounded-xl p-4">
    <div className="flex justify-between items-start mb-2">
      <p className="text-xs text-slate-400">{formatDate(r.createdAt)}</p>
      {canDelete(r.createdAt) && (
        <button onClick={() => handleDelete(r.id)} className="text-xs text-red-500 hover:text-red-600 font-semibold">Delete</button>
      )}
    </div>
    <p className="text-sm text-slate-700 whitespace-pre-wrap">{r.content}</p>
  </div>
))}
          </div>
        )}
      </div>
    </PageLayout>
  )
}

export default SupervisorReports