import { useState, useEffect, useMemo } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import PageLayout from '../components/PageLayout'

function toDateSafe(value) {
  if (!value) return null
  if (value.toDate) return value.toDate()
  const d = new Date(value)
  return isNaN(d) ? null : d
}

function ProfitLoss() {
  const [sales, setSales] = useState([])
  const [orders, setOrders] = useState([])
  const [waterSupply, setWaterSupply] = useState([])
  const [chemicals, setChemicals] = useState([])
  const [fertilizers, setFertilizers] = useState([])
  const [loading, setLoading] = useState(true)

  const [preset, setPreset] = useState('all')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [salesSnap, ordersSnap, waterSnap, chemSnap, fertSnap] = await Promise.all([
          getDocs(collection(db, 'sales')),
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'waterSupply')),
          getDocs(collection(db, 'agroChemicals')),
          getDocs(collection(db, 'fertilizers')),
        ])
        setSales(salesSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        setOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        setWaterSupply(waterSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        setChemicals(chemSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        setFertilizers(fertSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error('P&L fetch error:', err)
      }
      setLoading(false)
    }
    fetchAll()
  }, [])

  const { rangeStart, rangeEnd } = useMemo(() => {
    const now = new Date()
    if (preset === 'thisMonth') {
      return {
        rangeStart: new Date(now.getFullYear(), now.getMonth(), 1),
        rangeEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
      }
    }
    if (preset === 'lastMonth') {
      return {
        rangeStart: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        rangeEnd: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
      }
    }
    if (preset === 'custom' && customStart && customEnd) {
      return {
        rangeStart: new Date(customStart),
        rangeEnd: new Date(customEnd + 'T23:59:59'),
      }
    }
    return { rangeStart: null, rangeEnd: null }
  }, [preset, customStart, customEnd])

  const inRange = (dateVal) => {
    if (!rangeStart || !rangeEnd) return true
    const d = toDateSafe(dateVal)
    if (!d) return false
    return d >= rangeStart && d <= rangeEnd
  }

  const filteredSales = sales.filter(s => inRange(s.createdAt || s.date))
  const filteredOrders = orders.filter(o => o.status === 'Delivered' && inRange(o.createdAt))
  const filteredWater = waterSupply.filter(w => w.paymentStatus === 'Paid' && inRange(w.createdAt || w.date))
  const filteredChemicals = chemicals.filter(c => inRange(c.createdAt || c.date))
  const filteredFertilizers = fertilizers.filter(f => inRange(f.createdAt || f.date))

  const salesRevenue = filteredSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
  const orderRevenue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  const waterRevenue = filteredWater.reduce((sum, w) => sum + (w.totalAmount || 0), 0)
  const totalRevenue = salesRevenue + orderRevenue + waterRevenue

  const chemicalCost = filteredChemicals.reduce((sum, c) => sum + (c.totalCost || 0), 0)
  const fertilizerCost = filteredFertilizers.reduce((sum, f) => sum + (f.totalCost || 0), 0)
  const totalExpenses = chemicalCost + fertilizerCost

  const netProfit = totalRevenue - totalExpenses
  const margin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0

  const formatDate = (val) => {
    const d = toDateSafe(val)
    return d ? d.toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
  }

  const allLineItems = [
    ...filteredSales.map(s => ({ date: s.createdAt || s.date, desc: 'Sale — ' + (s.cropName || 'Crop'), type: 'Revenue', amount: s.totalAmount || 0 })),
    ...filteredOrders.map(o => ({ date: o.createdAt, desc: 'Order — ' + (o.customerName || 'Customer'), type: 'Revenue', amount: o.totalAmount || 0 })),
    ...filteredWater.map(w => ({ date: w.createdAt || w.date, desc: 'Water Supply — ' + (w.customerName || 'Customer'), type: 'Revenue', amount: w.totalAmount || 0 })),
    ...filteredChemicals.map(c => ({ date: c.createdAt || c.date, desc: 'Chemical — ' + (c.chemicalName || c.name || 'Item'), type: 'Expense', amount: c.totalCost || 0 })),
    ...filteredFertilizers.map(f => ({ date: f.createdAt || f.date, desc: 'Fertilizer — ' + (f.fertilizerName || f.name || 'Item'), type: 'Expense', amount: f.totalCost || 0 })),
  ].sort((a, b) => {
    const da = toDateSafe(a.date)
    const db_ = toDateSafe(b.date)
    if (!da || !db_) return 0
    return db_ - da
  })

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-slate-500 text-sm">Loading profit &amp; loss data...</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Profit &amp; Loss</h1>
        <p className="text-sm text-slate-500 mt-1">Revenue, expenses, and net profit breakdown</p>
      </div>

      {/* Date filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-5 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Time' },
            { key: 'thisMonth', label: 'This Month' },
            { key: 'lastMonth', label: 'Last Month' },
            { key: 'custom', label: 'Custom Range' },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setPreset(opt.key)}
              className={
                'text-xs font-semibold px-4 py-2 rounded-lg transition-colors ' +
                (preset === opt.key ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
        {preset === 'custom' && (
          <div className="flex items-center gap-2">
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-400" />
            <span className="text-slate-400 text-sm">to</span>
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-green-600">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Revenue</p>
          <p className="text-xl font-bold text-green-600">{'₦'}{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-red-500">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Expenses</p>
          <p className="text-xl font-bold text-red-500">{'₦'}{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-purple-500">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Net Profit</p>
          <p className={(netProfit >= 0 ? 'text-green-600' : 'text-red-500') + ' text-xl font-bold'}>
            {'₦'}{netProfit.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-indigo-500">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Profit Margin</p>
          <p className={(margin >= 0 ? 'text-indigo-600' : 'text-red-500') + ' text-xl font-bold'}>{margin}%</p>
        </div>
      </div>

      {/* Revenue breakdown */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Revenue Sources</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">Crop Sales</p>
            <p className="text-lg font-bold text-slate-800">{'₦'}{salesRevenue.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">{filteredSales.length} record{filteredSales.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">Customer Orders</p>
            <p className="text-lg font-bold text-slate-800">{'₦'}{orderRevenue.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">{filteredOrders.length} delivered</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">Water Supply</p>
            <p className="text-lg font-bold text-slate-800">{'₦'}{waterRevenue.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">{filteredWater.length} paid</p>
          </div>
        </div>
      </div>

      {/* Expense breakdown */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Expense Sources</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">Agro Chemicals</p>
            <p className="text-lg font-bold text-slate-800">{'₦'}{chemicalCost.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">{filteredChemicals.length} purchase{filteredChemicals.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">Fertilizers</p>
            <p className="text-lg font-bold text-slate-800">{'₦'}{fertilizerCost.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">{filteredFertilizers.length} purchase{filteredFertilizers.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Itemized table */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Itemized Transactions ({allLineItems.length})</h3>
        {allLineItems.length === 0 ? (
          <p className="text-slate-400 text-center py-8 text-sm">No transactions in this period</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase font-medium">Description</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase font-medium">Type</th>
                  <th className="px-4 py-3 text-right text-xs text-slate-500 uppercase font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {allLineItems.map((item, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(item.date)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{item.desc}</td>
                    <td className="px-4 py-3">
                      <span className={
                        'text-xs font-semibold px-3 py-1 rounded-full ' +
                        (item.type === 'Revenue' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
                      }>
                        {item.type}
                      </span>
                    </td>
                    <td className={'px-4 py-3 text-right font-semibold ' + (item.type === 'Revenue' ? 'text-green-600' : 'text-red-500')}>
                      {item.type === 'Revenue' ? '+' : '-'}{'₦'}{item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

export default ProfitLoss