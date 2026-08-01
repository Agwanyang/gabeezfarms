import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import PageLayout from '../components/PageLayout'

function ObservationNotes() {
  const [form, setForm] = useState({
    category: 'Pest',
    location: '',
    description: '',
    severity: 'Low',
    actionTaken: '',
    date: '',
  })
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [filterCategory, setFilterCategory] = useState('All')

  const fetchRecords = async () => {
    const snapshot = await getDocs(collection(db, 'observationNotes'))
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
    setRecords(data)
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editId) {
        await updateDoc(doc(db, 'observationNotes', editId), form)
        setEditId(null)
      } else {
        await addDoc(collection(db, 'observationNotes'), { ...form, createdAt: serverTimestamp() })
      }
      setForm({ category: 'Pest', location: '', description: '', severity: 'Low', actionTaken: '', date: '' })
      setSuccess(true)
      setShowForm(false)
      setTimeout(() => setSuccess(false), 3000)
      fetchRecords()
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleEdit = (record) => {
    setEditId(record.id)
    setForm({
      category: record.category,
      location: record.location,
      description: record.description,
      severity: record.severity,
      actionTaken: record.actionTaken,
      date: record.date,
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this observation record?')) {
      await deleteDoc(doc(db, 'observationNotes', id))
      fetchRecords()
    }
  }

  const getSeverityClass = (severity) => {
    if (severity === 'Low') return 'bg-green-100 text-green-700'
    if (severity === 'Medium') return 'bg-yellow-100 text-yellow-700'
    if (severity === 'High') return 'bg-red-100 text-red-700'
    return 'bg-slate-100 text-slate-600'
  }

  const getCategoryClass = (category) => {
    if (category === 'Pest') return 'bg-orange-100 text-orange-700'
    if (category === 'Disease') return 'bg-red-100 text-red-700'
    if (category === 'Animal Death') return 'bg-slate-200 text-slate-700'
    if (category === 'Equipment') return 'bg-blue-100 text-blue-700'
    return 'bg-purple-100 text-purple-700'
  }

  const filtered = filterCategory === 'All' ? records : records.filter(r => r.category === filterCategory)

  const totalRecords = records.length
  const highSeverity = records.filter(r => r.severity === 'High').length
  const pestCount = records.filter(r => r.category === 'Pest').length
  const deathCount = records.filter(r => r.category === 'Animal Death').length

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Observation Notes</h2>
          <p className="text-slate-500 mt-1 text-sm">Track pest issues, diseases, animal deaths and farm incidents</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ category: 'Pest', location: '', description: '', severity: 'Low', actionTaken: '', date: '' }) }}
          className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors w-full sm:w-auto">
          {showForm ? 'Close Form' : '+ Add Observation'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-slate-500 mb-1">Total Records</p>
          <p className="text-2xl font-bold text-slate-800">{totalRecords}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-red-500">
          <p className="text-sm text-slate-500 mb-1">High Severity</p>
          <p className="text-2xl font-bold text-red-600">{highSeverity}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-orange-400">
          <p className="text-sm text-slate-500 mb-1">Pest Records</p>
          <p className="text-2xl font-bold text-orange-500">{pestCount}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-slate-400">
          <p className="text-sm text-slate-500 mb-1">Animal Deaths</p>
          <p className="text-2xl font-bold text-slate-600">{deathCount}</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 font-medium">
          Observation record saved successfully!
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-slate-200">
          <h3 className="text-base font-semibold text-slate-800 mb-6 pb-4 border-b">
            {editId ? 'Edit Observation' : 'New Observation Record'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Category</label>
              <select name="category" value={form.category} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                <option>Pest</option>
                <option>Disease</option>
                <option>Animal Death</option>
                <option>Equipment</option>
                <option>General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Location / Greenhouse</label>
              <input name="location" value={form.location} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="e.g. Greenhouse 1, Pen A" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Severity</label>
              <select name="severity" value={form.severity} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Date</label>
              <input name="date" value={form.date} onChange={handleChange} type="date"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-2">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Describe what was observed in detail..." rows="3" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-2">Action Taken</label>
              <textarea name="actionTaken" value={form.actionTaken} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="What action was taken or recommended..." rows="2" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={loading}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-50">
                {loading ? 'Saving...' : editId ? 'Update Record' : '+ Save Record'}
              </button>
              {editId && (
                <button type="button" onClick={() => { setEditId(null); setShowForm(false); setForm({ category: 'Pest', location: '', description: '', severity: 'Low', actionTaken: '', date: '' }) }}
                  className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {['All', 'Pest', 'Disease', 'Animal Death', 'Equipment', 'General'].map(cat => (
          <button key={cat} onClick={() => setFilterCategory(cat)}
            className={filterCategory === cat ? 'px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-white' : 'px-4 py-2 rounded-lg text-sm font-medium bg-white text-slate-500 shadow-sm hover:bg-slate-50'}>
            {cat}
          </button>
        ))}
      </div>

      {/* Records */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-3">📋</div>
          <div className="font-medium">No observation records yet</div>
          <div className="text-xs mt-1">Click "Add Observation" to get started</div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(record => (
            <div key={record.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className={getCategoryClass(record.category) + ' px-3 py-1 rounded-full text-xs font-semibold'}>
                    {record.category}
                  </span>
                  <span className={getSeverityClass(record.severity) + ' px-3 py-1 rounded-full text-xs font-semibold'}>
                    {record.severity} Severity
                  </span>
                  <span className="text-xs text-slate-400">{record.date}</span>
                </div>
                <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">{record.location}</span>
              </div>
              <p className="text-sm text-slate-700 mb-2 font-medium">{record.description}</p>
              {record.actionTaken && (
                <p className="text-xs text-slate-500 bg-blue-50 px-4 py-2.5 rounded-lg mb-3">
                  Action: {record.actionTaken}
                </p>
              )}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button onClick={() => handleEdit(record)}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                  Edit
                </button>
                <button onClick={() => handleDelete(record.id)}
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  )
}

export default ObservationNotes