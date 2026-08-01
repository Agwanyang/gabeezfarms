import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import PageLayout from '../components/PageLayout'

function Sales() {
  const [form, setForm] = useState({
    cropName: '',
    quantitySold: '',
    pricePerUnit: '',
    buyerName: '',
    paymentStatus: 'Paid',
  })
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [editId, setEditId] = useState(null)

  const fetchSales = async () => {
    const snapshot = await getDocs(collection(db, 'sales'))
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setSales(data)
  }

  useEffect(() => {
    fetchSales()
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
        quantitySold: Number(form.quantitySold),
        pricePerUnit: Number(form.pricePerUnit),
        totalAmount: Number(form.quantitySold) * Number(form.pricePerUnit),
      }
      if (editId) {
        await updateDoc(doc(db, 'sales', editId), data)
        setEditId(null)
      } else {
        await addDoc(collection(db, 'sales'), { ...data, createdAt: serverTimestamp() })
      }
      setForm({ cropName: '', quantitySold: '', pricePerUnit: '', buyerName: '', paymentStatus: 'Paid' })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      fetchSales()
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleEdit = (sale) => {
    setEditId(sale.id)
    setForm({
      cropName: sale.cropName,
      quantitySold: sale.quantitySold,
      pricePerUnit: sale.pricePerUnit,
      buyerName: sale.buyerName,
      paymentStatus: sale.paymentStatus,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      await deleteDoc(doc(db, 'sales', id))
      fetchSales()
    }
  }

  const totalRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
  const totalSales = sales.length
  const paidSales = sales.filter(s => s.paymentStatus === 'Paid').length

  return (
    <PageLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Sales Records</h2>
        <p className="text-gray-500 mt-1">Track and manage all farm sales</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
          <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-800">₦{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 mb-1">Total Sales</p>
          <p className="text-2xl font-bold text-gray-800">{totalSales}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500 mb-1">Paid Sales</p>
          <p className="text-2xl font-bold text-gray-800">{paidSales}</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 flex items-center gap-2">
          <span>✓</span> {editId ? 'Sale updated!' : 'Sale recorded successfully!'}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 pb-3 border-b">
          {editId ? 'Edit Sale' : 'Add New Sale'}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Crop Name</label>
            <input name="cropName" value={form.cropName} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="e.g. Maize" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Buyer Name</label>
            <input name="buyerName" value={form.buyerName} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="e.g. John Doe" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Quantity Sold (kg)</label>
            <input name="quantitySold" value={form.quantitySold} onChange={handleChange}
              type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="0" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Price Per Unit (₦)</label>
            <input name="pricePerUnit" value={form.pricePerUnit} onChange={handleChange}
              type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="0" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Payment Status</label>
            <select name="paymentStatus" value={form.paymentStatus} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400">
              <option>Paid</option>
              <option>Pending</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : editId ? 'Update Sale' : '+ Add Sale'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm({ cropName: '', quantitySold: '', pricePerUnit: '', buyerName: '', paymentStatus: 'Paid' }) }}
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
          <h3 className="text-lg font-semibold text-gray-800">All Sales</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-left">
                <th className="px-5 py-4 font-medium">Crop</th>
                <th className="px-5 py-4 font-medium">Buyer</th>
                <th className="px-5 py-4 font-medium">Qty (kg)</th>
                <th className="px-5 py-4 font-medium">Price/Unit</th>
                <th className="px-5 py-4 font-medium">Total</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                    No sales recorded yet
                  </td>
                </tr>
              ) : (
                sales.map(sale => (
                  <tr key={sale.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-800">{sale.cropName}</td>
                    <td className="px-5 py-4 text-gray-600">{sale.buyerName}</td>
                    <td className="px-5 py-4 text-gray-600">{sale.quantitySold}</td>
                    <td className="px-5 py-4 text-gray-600">₦{sale.pricePerUnit?.toLocaleString()}</td>
                    <td className="px-5 py-4 font-semibold text-gray-800">₦{sale.totalAmount?.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={sale.paymentStatus === 'Paid' ? 'px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700' : 'px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700'}>
                        {sale.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(sale)}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(sale.id)}
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

export default Sales