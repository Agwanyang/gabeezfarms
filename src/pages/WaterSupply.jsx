import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import PageLayout from '../components/PageLayout'

function WaterSupply() {
  const [form, setForm] = useState({
    customerName: '',
    volumeLitres: '',
    pricePerLitre: '',
    date: '',
    paymentStatus: 'Paid',
    notes: '',
  })
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [editId, setEditId] = useState(null)

  const fetchRecords = async () => {
    const snapshot = await getDocs(collection(db, 'waterSupply'))
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
      const data = {
        ...form,
        volumeLitres: Number(form.volumeLitres),
        pricePerLitre: Number(form.pricePerLitre),
        totalAmount: Number(form.volumeLitres) * Number(form.pricePerLitre),
      }
      if (editId) {
        await updateDoc(doc(db, 'waterSupply', editId), data)
        setEditId(null)
      } else {
        await addDoc(collection(db, 'waterSupply'), { ...data, createdAt: serverTimestamp() })
      }
      setForm({ customerName: '', volumeLitres: '', pricePerLitre: '', date: '', paymentStatus: 'Paid', notes: '' })
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
      customerName: record.customerName,
      volumeLitres: record.volumeLitres,
      pricePerLitre: record.pricePerLitre,
      date: record.date,
      paymentStatus: record.paymentStatus,
      notes: record.notes || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this water supply record?')) {
      await deleteDoc(doc(db, 'waterSupply', id))
      fetchRecords()
    }
  }

  const totalRevenue = records.filter(r => r.paymentStatus === 'Paid').reduce((sum, r) => sum + (r.totalAmount || 0), 0)
  const totalVolume = records.reduce((sum, r) => sum + (r.volumeLitres || 0), 0)
  const totalRecords = records.length
  const pendingPayments = records.filter(r => r.paymentStatus === 'Pending').length

  return (
    <PageLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Water Supply Records</h2>
        <p className="text-slate-500 mt-1 text-sm">Track all water sales and supply records</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-blue-600">{'₦'}{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-cyan-400">
          <p className="text-sm text-slate-500 mb-1">Total Volume (L)</p>
          <p className="text-2xl font-bold text-cyan-600">{totalVolume.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
          <p className="text-sm text-slate-500 mb-1">Total Sales</p>
          <p className="text-2xl font-bold text-slate-800">{totalRecords}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-amber-400">
          <p className="text-sm text-slate-500 mb-1">Pending Payments</p>
          <p className="text-2xl font-bold text-amber-500">{pendingPayments}</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 font-medium">
          Water supply record saved successfully!
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-slate-200">
        <h3 className="text-base font-semibold text-slate-800 mb-6 pb-4 border-b">
          {editId ? 'Edit Record' : 'Add New Water Supply Record'}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Customer Name</label>
            <input name="customerName" value={form.customerName} onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="e.g. John Doe" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Date</label>
            <input name="date" value={form.date} onChange={handleChange} type="date"
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Volume (Litres)</label>
            <input name="volumeLitres" value={form.volumeLitres} onChange={handleChange} type="number"
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="0" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Price Per Litre (₦)</label>
            <input name="pricePerLitre" value={form.pricePerLitre} onChange={handleChange} type="number"
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="0" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Payment Status</label>
            <select name="paymentStatus" value={form.paymentStatus} onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option>Paid</option>
              <option>Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Notes (optional)</label>
            <input name="notes" value={form.notes} onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Any additional notes..." />
          </div>
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : editId ? 'Update Record' : '+ Add Record'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm({ customerName: '', volumeLitres: '', pricePerLitre: '', date: '', paymentStatus: 'Paid', notes: '' }) }}
                className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">All Water Supply Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-5 py-4 text-slate-500 font-medium">Customer</th>
                <th className="px-5 py-4 text-slate-500 font-medium">Date</th>
                <th className="px-5 py-4 text-slate-500 font-medium">Volume (L)</th>
                <th className="px-5 py-4 text-slate-500 font-medium">Price/Litre</th>
                <th className="px-5 py-4 text-slate-500 font-medium">Total</th>
                <th className="px-5 py-4 text-slate-500 font-medium">Status</th>
                <th className="px-5 py-4 text-slate-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-slate-400">
                    <div className="text-4xl mb-3">💧</div>
                    <div className="font-medium">No water supply records yet</div>
                    <div className="text-xs mt-1">Add your first water sale above</div>
                  </td>
                </tr>
              ) : (
                records.map(record => (
                  <tr key={record.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-800">{record.customerName}</td>
                    <td className="px-5 py-4 text-slate-600">{record.date}</td>
                    <td className="px-5 py-4 text-slate-600">{record.volumeLitres?.toLocaleString()}</td>
                    <td className="px-5 py-4 text-slate-600">{'₦'}{record.pricePerLitre?.toLocaleString()}</td>
                    <td className="px-5 py-4 font-semibold text-blue-600">{'₦'}{record.totalAmount?.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={record.paymentStatus === 'Paid' ? 'px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700' : 'px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700'}>
                        {record.paymentStatus}
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

export default WaterSupply