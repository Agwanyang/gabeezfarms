import { useState, useEffect } from 'react'
import { collection, getDocs, updateDoc, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import PageLayout from '../components/PageLayout'

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [syncMessage, setSyncMessage] = useState('')

  const fetchOrders = async () => {
    const snapshot = await getDocs(collection(db, 'orders'))
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
    setOrders(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateStatus = async (id, status) => {
    const order = orders.find(o => o.id === id)
    await updateDoc(doc(db, 'orders', id), { status })

    if (status === 'Delivered' && order && order.status !== 'Delivered') {
      try {
        if (order.items && order.items.length > 0) {
          for (const item of order.items) {
            await addDoc(collection(db, 'sales'), {
              cropName: item.name,
              buyerName: order.customerName,
              quantitySold: item.quantity,
              pricePerUnit: item.price,
              totalAmount: item.price * item.quantity,
              paymentStatus: 'Paid',
              source: 'Online Order',
              orderId: id,
              createdAt: serverTimestamp(),
            })
          }
        } else {
          await addDoc(collection(db, 'sales'), {
            cropName: 'Online Order',
            buyerName: order.customerName,
            quantitySold: 1,
            pricePerUnit: order.totalAmount || 0,
            totalAmount: order.totalAmount || 0,
            paymentStatus: 'Paid',
            source: 'Online Order',
            orderId: id,
            createdAt: serverTimestamp(),
          })
        }
        setSyncMessage('Order marked as Delivered and added to Sales Records!')
        setTimeout(() => setSyncMessage(''), 4000)
      } catch (err) {
        console.error('Sales sync error:', err)
      }
    }

    fetchOrders()
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this order?')) {
      await deleteDoc(doc(db, 'orders', id))
      fetchOrders()
    }
  }

  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter)

  const getStatusClass = (status) => {
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-800'
    if (status === 'Confirmed') return 'bg-blue-100 text-blue-800'
    if (status === 'Delivered') return 'bg-green-100 text-green-800'
    if (status === 'Cancelled') return 'bg-red-100 text-red-800'
    return 'bg-slate-100 text-slate-600'
  }

  const getActionClass = (status, current) => {
    if (status === current) return getStatusClass(status) + ' font-semibold'
    return 'bg-slate-100 text-slate-600'
  }

  const getStatusEmoji = (status) => {
    if (status === 'Pending') return 'Pending'
    if (status === 'Confirmed') return 'Confirmed'
    if (status === 'Delivered') return 'Delivered'
    if (status === 'Cancelled') return 'Cancelled'
    return status
  }

  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'Pending').length
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length
  const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + (o.totalAmount || 0), 0)

  return (
    <PageLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Customer Orders</h2>
        <p className="text-slate-500 mt-1 text-sm">Manage and track all incoming orders</p>
      </div>

      {syncMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 font-medium text-sm">
          {syncMessage}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-slate-500 mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-slate-800">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-amber-400">
          <p className="text-sm text-slate-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-slate-800">{pendingOrders}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
          <p className="text-sm text-slate-500 mb-1">Delivered</p>
          <p className="text-2xl font-bold text-slate-800">{deliveredOrders}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-purple-500">
          <p className="text-sm text-slate-500 mb-1">Revenue (Delivered)</p>
          <p className="text-2xl font-bold text-slate-800">{'₦'}{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['All', 'Pending', 'Confirmed', 'Delivered', 'Cancelled'].map(status => (
          <button key={status} onClick={() => setFilter(status)}
            className={filter === status ? 'px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-white' : 'px-4 py-2 rounded-lg text-sm font-medium bg-white text-slate-500 shadow-sm hover:bg-slate-50'}>
            {status}
          </button>
        ))}
        <button onClick={fetchOrders}
          className="ml-auto px-4 py-2 rounded-lg text-sm font-medium bg-white text-slate-500 shadow-sm hover:bg-slate-50">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-3">📭</div>
          <div className="font-medium">No orders found</div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(order => (
            <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-slate-800">{order.customerName}</h3>
                    <span className={getStatusClass(order.status) + ' px-2.5 py-0.5 rounded-full text-xs font-semibold'}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Phone: {order.phone} {order.email ? '| ' + order.email : ''}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Address: {order.address}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xl font-bold text-green-600">{'₦'}{order.totalAmount?.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">
                    {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Just now'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Order Items</p>
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span className="text-slate-600">{item.name} x {item.quantity} {item.unit}</span>
                    <span className="font-medium text-slate-800">{'₦'}{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <p className="text-xs text-slate-600 bg-yellow-50 px-4 py-2.5 rounded-lg mb-4">
                  Note: {order.notes}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {['Pending', 'Confirmed', 'Delivered', 'Cancelled'].map(status => (
                  <button key={status} onClick={() => updateStatus(order.id, status)}
                    className={getActionClass(status, order.status) + ' px-3 py-1.5 rounded-lg text-xs transition-colors'}>
                    {getStatusEmoji(status)}
                  </button>
                ))}
                <button onClick={() => handleDelete(order.id)}
                  className="ml-auto px-3 py-1.5 rounded-lg text-xs bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
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

export default AdminOrders