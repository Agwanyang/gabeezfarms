import { useState, useEffect } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase/config'
import PageLayout from '../components/PageLayout'

function CEOReports() {
  const [allReports, setAllReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchReports = async () => {
      const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setAllReports(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    fetchReports()
  }, [])

  const formatDate = (ts) => {
    if (!ts) return ''
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('en-NG', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const filtered = filter === 'all' ? allReports : allReports.filter(r => r.role === filter)

  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">All Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Full visibility — supervisor and manager reports</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex gap-2 mb-4">
          {[
            { key: 'all', label: 'All' },
            { key: 'supervisor', label: 'Supervisor' },
            { key: 'manager', label: 'Manager' },
          ].map(opt => (
            <button key={opt.key} onClick={() => setFilter(opt.key)}
              className={'text-xs font-semibold px-4 py-2 rounded-lg transition-colors ' + (filter === opt.key ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">No reports yet</p>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => (
              <div key={r.id} className="border border-slate-100 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className={'text-xs font-semibold px-2 py-1 rounded-full ' + (r.role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700')}>
                    {r.authorName} ({r.role})
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
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

export default CEOReports