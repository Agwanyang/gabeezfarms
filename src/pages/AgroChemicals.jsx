import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import PageLayout from '../components/PageLayout'

function AgroChemicals() {
  const [form, setForm] = useState({
    chemicalName: '',
    quantity: '',
    unit: 'Litres',
    costPerUnit: '',
    greenhouse: '',
    purpose: '',
    dateApplied: '',
  })
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const fetchRecords = async () => {
    const snapshot = await getDocs(collection(db, 'agroChemicals'))
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
      const data = {
        ...form,
        quantity: Number(form.quantity),
        costPerUnit: Number(form.costPerUnit),
        totalCost: Number(form.quantity) * Number(form.costPerUnit),
      }
      if (editId) {
        await updateDoc(doc(db, 'agroChemicals', editId), data)
        setEditId(null)
      } else {
        await addDoc(collection(db, 'agroChemicals'), { ...data, createdAt: serverTimestamp() })
      }
      setForm({ chemicalName: '', quantity: '', unit: 'Litres', costPerUnit: '', greenhouse: '', purpose: '', dateApplied: '' })
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
      chemicalName: record.chemicalName,
      quantity: record.quantity,
      unit: record.unit,
      costPerUnit: record.costPerUnit,
      greenhouse: record.greenhouse,
      purpose: record.purpose,
      dateApplied: record.dateApplied,
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      await deleteDoc(doc(db, 'agroChemicals', id))
      fetchRecords()
    }
  }

  const totalCost = records.reduce((sum, r) => sum + (r.totalCost || 0), 0)

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Agro-Chemical Usage</h2>
          <p className="text-slate-500 mt-1 text-sm">Track all chemical applications and costs</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ chemicalName: '', quantity: '', unit: 'Litres', costPerUnit: '', greenhouse: '', purpose: '', dateApplied: '' }) }}
          className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors w-full sm:w-auto">
          {showForm ? 'Close Form' : '+ Add Chemical Record'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-red-500">
          <p className="text-sm text-slate-500 mb-1">Total Chemical Cost</p>
          <p className="text-2xl font-bold text-slate-800">{'₦'}{totalCost.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-slate-500 mb-1">Total Applications</p>
          <p className="text-2xl font-bold text-slate-800">{records.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-purple-500">
          <p className="text-sm text-slate-500 mb-1">Unique Chemicals</p>
          <p className="text-2xl font-bold text-slate-800">{new Set(records.map(r => r.chemicalName)).size}</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 font-medium">
          Chemical record saved successfully!
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-slate-200">
          <h3 className="text-base font-semibold text-slate-800 mb-6 pb-4 border-b">
            {editId ? 'Edit Chemical Record' : 'New Chemical Application'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Chemical Name</label>
              <input name="chemicalName" value={form.chemicalName} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="e.g. Cypermethrin" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Greenhouse</label>
              <input name="greenhouse" value={form.greenhouse} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="e.g. Greenhouse 1" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Quantity</label>
              <input name="quantity" value={form.quantity} onChange={handleChange} type="number"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="0" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Unit</label>
              <select name="unit" value={form.unit} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                <option>Litres</option>
                <option>ML</option>
                <option>KG</option>
                <option>Grams</option>
                <option>Sachets</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Cost Per Unit (₦)</label>
              <input name="costPerUnit" value={form.costPerUnit} onChange={handleChange} type="number"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="0" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Date Applied</label>
              <input name="dateApplied" value={form.dateApplied} onChange={handleChange} type="date"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-2">Purpose</label>
              <input name="purpose" value={form.purpose} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="e.g. Pest control, Fungicide, Herbicide" required />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={loading}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-50">
                {loading ? 'Saving...' : editId ? 'Update Record' : '+ Save Record'}
              </button>
              {editId && (
                <button type="button" onClick={() => { setEditId(null); setShowForm(false); setForm({ chemicalName: '', quantity: '', unit: 'Litres', costPerUnit: '', greenhouse: '', purpose: '', dateApplied: '' }) }}
                  className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">All Chemical Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-5 py-4 text-slate-500 font-medium">Chemical</th>
                <th className="px-5 py-4 text-slate-500 font-medium">Greenhouse</th>
                <th className="px-5 py-4 text-slate-500 font-medium">Quantity</th>
                <th className="px-5 py-4 text-slate-500 font-medium">Cost/Unit</th>
                <th className="px-5 py-4 text-slate-500 font-medium">Total Cost</th>
                <th className="px-5 py-4 text-slate-500 font-medium">Purpose</th>
                <th className="px-5 py-4 text-slate-500 font-medium">Date</th>
                <th className="px-5 py-4 text-slate-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center text-slate-400">
                    <div className="text-4xl mb-3">🧪</div>
                    <div className="font-medium">No chemical records yet</div>
                    <div className="text-xs mt-1">Click "Add Chemical Record" to get started</div>
                  </td>
                </tr>
              ) : (
                records.map(record => (
                  <tr key={record.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-800">{record.chemicalName}</td>
                    <td className="px-5 py-4 text-slate-600">{record.greenhouse}</td>
                    <td className="px-5 py-4 text-slate-600">{record.quantity} {record.unit}</td>
                    <td className="px-5 py-4 text-slate-600">{'₦'}{record.costPerUnit?.toLocaleString()}</td>
                    <td className="px-5 py-4 font-semibold text-red-600">{'₦'}{record.totalCost?.toLocaleString()}</td>
                    <td className="px-5 py-4 text-slate-600">{record.purpose}</td>
                    <td className="px-5 py-4 text-slate-600">{record.dateApplied}</td>
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

export default AgroChemicals