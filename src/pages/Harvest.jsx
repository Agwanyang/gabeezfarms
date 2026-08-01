import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import PageLayout from '../components/PageLayout'

function Harvest() {
  const [form, setForm] = useState({
    cropName: '',
    yieldKg: '',
    greenhouse: '',
    season: '',
    qualityGrade: 'A',
    harvestDate: '',
  })
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [editId, setEditId] = useState(null)

  const fetchRecords = async () => {
    const snapshot = await getDocs(collection(db, 'harvest'))
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
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
      const data = { ...form, yieldKg: Number(form.yieldKg) }
      if (editId) {
        await updateDoc(doc(db, 'harvest', editId), data)
        setEditId(null)
      } else {
        await addDoc(collection(db, 'harvest'), { ...data, createdAt: serverTimestamp() })
      }
      setForm({ cropName: '', yieldKg: '', greenhouse: '', season: '', qualityGrade: 'A', harvestDate: '' })
      setSuccess(true)
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
      cropName: record.cropName,
      yieldKg: record.yieldKg,
      greenhouse: record.greenhouse,
      season: record.season,
      qualityGrade: record.qualityGrade,
      harvestDate: record.harvestDate,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      await deleteDoc(doc(db, 'harvest', id))
      fetchRecords()
    }
  }

  const totalYield = records.reduce((sum, r) => sum + (r.yieldKg || 0), 0)

  const gradeClass = (grade) => {
    if (grade === 'A') return 'bg-green-100 text-green-700'
    if (grade === 'B') return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <PageLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Harvest Tracking</h2>
        <p className="text-gray-500 mt-1">Log and monitor all harvest records</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
          <p className="text-sm text-gray-500 mb-1">Total Yield (kg)</p>
          <p className="text-2xl font-bold text-gray-800">{totalYield.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 mb-1">Total Harvests</p>
          <p className="text-2xl font-bold text-gray-800">{records.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500 mb-1">Greenhouses</p>
          <p className="text-2xl font-bold text-gray-800">{new Set(records.map(r => r.greenhouse)).size}</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 flex items-center gap-2">
          <span>✓</span> Harvest record saved successfully!
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 pb-3 border-b">
          {editId ? 'Edit Harvest Record' : 'Add New Harvest Record'}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Crop Name</label>
            <input name="cropName" value={form.cropName} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="e.g. Bell Peppers" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Greenhouse</label>
            <input name="greenhouse" value={form.greenhouse} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="e.g. Greenhouse 1" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Yield (kg)</label>
            <input name="yieldKg" value={form.yieldKg} onChange={handleChange}
              type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="0" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Harvest Date</label>
            <input name="harvestDate" value={form.harvestDate} onChange={handleChange}
              type="date" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400"
              required />
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Season</label>
            <input name="season" value={form.season} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="e.g. Dry Season 2024" required />
          </div> */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Quality Grade</label>
            <select name="qualityGrade" value={form.qualityGrade} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400">
              <option>A</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : editId ? 'Update Record' : '+ Add Record'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm({ cropName: '', yieldKg: '', greenhouse: '', season: '', qualityGrade: 'A', harvestDate: '' }) }}
                className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">All Harvest Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-left">
                <th className="px-5 py-4 font-medium">Crop</th>
                <th className="px-5 py-4 font-medium">Greenhouse</th>
                <th className="px-5 py-4 font-medium">Yield (kg)</th>
                <th className="px-5 py-4 font-medium">Date</th>
                {/* <th className="px-5 py-4 font-medium">Season</th> */}
                <th className="px-5 py-4 font-medium">Grade</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                    No harvest records yet
                  </td>
                </tr>
              ) : (
                records.map(record => (
                  <tr key={record.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-800">{record.cropName}</td>
                    <td className="px-5 py-4 text-gray-600">{record.greenhouse}</td>
                    <td className="px-5 py-4 text-gray-600">{record.yieldKg?.toLocaleString()}</td>
                    <td className="px-5 py-4 text-gray-600">{record.harvestDate}</td>
                    <td className="px-5 py-4 text-gray-600">{record.season}</td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${gradeClass(record.qualityGrade)}`}>
                        Grade {record.qualityGrade}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(record)}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(record.id)}
                          className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  )
}

export default Harvest 