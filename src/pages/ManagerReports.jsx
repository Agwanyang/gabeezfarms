import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore'
import { db, auth } from '../firebase/config'
import PageLayout from '../components/PageLayout'

function ManagerReports() {
  const [myReports, setMyReports] = useState([])
  const [supervisorReports, setSupervisorReports] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [tab, setTab] = useState('mine')

  const fetchReports = async () => {
    try {
      const uid = auth.currentUser.uid
      const myQ = query(collection(db, 'reports'), where('authorUid', '==', uid), orderBy('createdAt', 'desc'))
      const supQ = query(collection(db, 'reports'), where('role', '==', 'supervisor'), orderBy('createdAt', 'desc'))
      const [mySnap, supSnap] = await Promise.all([getDocs(myQ), getDocs(supQ)])
      setMyReports(mySnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setSupervisorReports(supSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error('Reports fetch error:', err)
    }
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
        authorName: 'Manager',
        role: 'manager',
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

  const listToShow = tab === 'mine' ? myReports : supervisorReports


  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Manager Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Submit your report to the CEO, and review supervisor reports</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Today's Report to CEO</label>
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
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab('mine')}
            className={'text-xs font-semibold px-4 py-2 rounded-lg transition-colors ' + (tab === 'mine' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
            My Reports
          </button>
          <button onClick={() => setTab('supervisor')}
            className={'text-xs font-semibold px-4 py-2 rounded-lg transition-colors ' + (tab === 'supervisor' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
            Supervisor Reports
          </button>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : listToShow.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">No reports yet</p>
        ) : (
          <div className="space-y-3">
            {listToShow.map(r => (
  <div key={r.id} className="border border-slate-100 rounded-xl p-4">
    <div className="flex justify-between items-start mb-2">
      <span className="text-xs font-semibold text-slate-600">{r.authorName}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
        {tab === 'mine' && canDelete(r.createdAt) && (
          <button onClick={() => handleDelete(r.id)} className="text-xs text-red-500 hover:text-red-600 font-semibold">Delete</button>
        )}
      </div>
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

export default ManagerReports