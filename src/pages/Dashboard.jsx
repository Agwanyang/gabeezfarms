import { useState, useEffect } from 'react'
// import { collection, getDocs } from 'firebase/firestore'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase/config'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import PageLayout from '../components/PageLayout'

function Dashboard() {
  const [sales, setSales] = useState([])
  const [chemicals, setChemicals] = useState([])
  const [fertilizers, setFertilizers] = useState([])
  const [orders, setOrders] = useState([])
  const [harvest, setHarvest] = useState([])
  const [waterSupply, setWaterSupply] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedGH, setSelectedGH] = useState('All')

  useEffect(() => {
    const fetchAll = async () => {
      const [salesSnap, chemSnap, fertSnap, ordersSnap, harvestSnap, waterSnap] = await Promise.all([
        getDocs(collection(db, 'sales')),
        getDocs(collection(db, 'agroChemicals')),
        getDocs(collection(db, 'fertilizers')),
        getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100))),
        getDocs(query(collection(db, 'harvest'), orderBy('createdAt', 'desc'), limit(100))),
        getDocs(collection(db, 'waterSupply')),
      ])
      setSales(salesSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setChemicals(chemSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setFertilizers(fertSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setHarvest(harvestSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setWaterSupply(waterSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    fetchAll()
  }, [])

  const salesRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
  const orderRevenue = orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  const waterRevenue = waterSupply.filter(w => w.paymentStatus === 'Paid').reduce((sum, w) => sum + (w.totalAmount || 0), 0)
  const totalRevenue = salesRevenue + orderRevenue + waterRevenue

  const totalChemicalCost = chemicals.reduce((sum, c) => sum + (c.totalCost || 0), 0)
  const totalFertilizerCost = fertilizers.reduce((sum, f) => sum + (f.totalCost || 0), 0)
  const totalExpenses = totalChemicalCost + totalFertilizerCost
  const netProfit = totalRevenue - totalExpenses

  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'Pending').length
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length
  const totalYield = harvest.reduce((sum, h) => sum + (h.yieldKg || 0), 0)

  const greenhouses = ['GH1', 'GH2', 'GH3', 'GH4', 'GH5', 'GH6', 'GH7', 'GH8']

  const getGHData = (ghName) => {
    const ghRecords = harvest.filter(h =>
      h.greenhouse && h.greenhouse.toUpperCase().replace(/\s/g, '') === ghName.replace(/\s/g, '')
    )
    const totalKg = ghRecords.reduce((sum, h) => sum + (h.yieldKg || 0), 0)
    const crops = [...new Set(ghRecords.map(h => h.cropName).filter(Boolean))]
    return { totalKg, crops }
  }

  const allGHData = greenhouses.map(gh => ({
    name: gh,
    ...getGHData(gh)
  }))

  const maxYield = Math.max(...allGHData.map(g => g.totalKg), 1)

  const filteredGHData = selectedGH === 'All'
    ? allGHData
    : allGHData.filter(g => g.name === selectedGH)

  const expenseData = [
    { name: 'Chemicals', value: totalChemicalCost, color: '#ef4444' },
    { name: 'Fertilizers', value: totalFertilizerCost, color: '#f59e0b' },
  ]

  const salesByCrop = sales.reduce((acc, s) => {
    const existing = acc.find(a => a.name === s.cropName)
    if (existing) existing.revenue += s.totalAmount || 0
    else acc.push({ name: s.cropName, revenue: s.totalAmount || 0 })
    return acc
  }, [])

  const getStatusClass = (status) => {
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-800'
    if (status === 'Delivered') return 'bg-green-100 text-green-800'
    return 'bg-blue-100 text-blue-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-900 to-green-700">
        <p className="text-white text-base">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Farm Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Revenue KPIs */}
      <p className="text-xs text-slate-400 uppercase tracking-widest mb-2 font-medium">Revenue Summary</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-green-600">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Sales Revenue</p>
          <p className="text-xl font-bold text-green-600">{'₦'}{salesRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Crop sales</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-blue-500">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Order Revenue</p>
          <p className="text-xl font-bold text-blue-600">{'₦'}{orderRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Delivered orders</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-cyan-500">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Water Revenue</p>
          <p className="text-xl font-bold text-cyan-600">{'₦'}{waterRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Water supply</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-emerald-600 ring-2 ring-emerald-100">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Revenue</p>
          <p className="text-xl font-bold text-emerald-600">{'₦'}{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">All sources</p>
        </div>
      </div>

      {/* Other KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-red-500">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Total Expenses</p>
          <p className="text-xl font-bold text-red-500">{'₦'}{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-purple-500">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Net Profit</p>
          <p className={netProfit >= 0 ? 'text-xl font-bold text-green-600' : 'text-xl font-bold text-red-500'}>
            {'₦'}{netProfit.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-indigo-500">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Total Yield (kg)</p>
          <p className="text-xl font-bold text-indigo-500">{totalYield.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-amber-400">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Pending Orders</p>
          <p className="text-xl font-bold text-amber-500">{pendingOrders}</p>
        </div>
      </div>

      {/* Revenue Breakdown Bar */}
      {totalRevenue > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Revenue Breakdown</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Crop Sales</span>
                <span>{'₦'}{salesRevenue.toLocaleString()} ({totalRevenue > 0 ? Math.round((salesRevenue / totalRevenue) * 100) : 0}%)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: totalRevenue > 0 ? Math.round((salesRevenue / totalRevenue) * 100) + '%' : '0%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Customer Orders</span>
                <span>{'₦'}{orderRevenue.toLocaleString()} ({totalRevenue > 0 ? Math.round((orderRevenue / totalRevenue) * 100) : 0}%)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: totalRevenue > 0 ? Math.round((orderRevenue / totalRevenue) * 100) + '%' : '0%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Water Supply</span>
                <span>{'₦'}{waterRevenue.toLocaleString()} ({totalRevenue > 0 ? Math.round((waterRevenue / totalRevenue) * 100) : 0}%)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: totalRevenue > 0 ? Math.round((waterRevenue / totalRevenue) * 100) + '%' : '0%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Greenhouse Harvest Tracker */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
          <h3 className="text-sm font-semibold text-slate-900">Greenhouse Harvest Tracker</h3>
          <select
            value={selectedGH}
            onChange={e => setSelectedGH(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-400 w-full sm:w-48">
            <option value="All">All Greenhouses</option>
            {greenhouses.map(gh => (
              <option key={gh} value={gh}>{gh}</option>
            ))}
          </select>
        </div>

        {selectedGH === 'All' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {allGHData.map(gh => (
              <div key={gh.name} className="border border-slate-100 rounded-xl p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-700">{gh.name}</span>
                  <span className="text-xs text-slate-400">{gh.totalKg} kg</span>
                </div>
                <p className="text-xs text-slate-500 mb-2 truncate">
                  {gh.crops.length > 0 ? gh.crops.join(', ') : 'No records yet'}
                </p>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: maxYield > 0 ? Math.round((gh.totalKg / maxYield) * 100) + '%' : '0%' }}>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-slate-100 rounded-xl p-5">
            {filteredGHData.map(gh => {
              const pct = maxYield > 0 ? Math.round((gh.totalKg / maxYield) * 100) : 0
              return (
                <div key={gh.name}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">{gh.name}</h4>
                      <p className="text-sm text-slate-500">
                        {gh.crops.length > 0 ? gh.crops.join(', ') : 'No harvest records yet'}
                      </p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold self-start">
                      {pct}% of peak
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-400 mb-1">Total Yield</p>
                      <p className="text-lg font-bold text-slate-800">{gh.totalKg} kg</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-400 mb-1">Harvest Records</p>
                      <p className="text-lg font-bold text-slate-800">
                        {harvest.filter(h => h.greenhouse && h.greenhouse.toUpperCase().replace(/\s/g, '') === gh.name).length}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-400 mb-1">Crops</p>
                      <p className="text-lg font-bold text-slate-800">{gh.crops.length}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">Yield relative to highest greenhouse</p>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: pct + '%' }}></div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{gh.totalKg} kg harvested</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Revenue by Crop</h3>
          {salesByCrop.length === 0 ? (
            <p className="text-slate-400 text-center py-10 text-sm">No sales data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={salesByCrop} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Expense Breakdown</h3>
          {totalExpenses === 0 ? (
            <p className="text-slate-400 text-center py-10 text-sm">No expense data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={expenseData} cx="50%" cy="45%" outerRadius={80} innerRadius={40} dataKey="value" paddingAngle={4}>
                  {expenseData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Orders Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-blue-500">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Total Orders</p>
          <p className="text-2xl font-bold text-slate-900">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-amber-400">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Pending</p>
          <p className="text-2xl font-bold text-amber-500">{pendingOrders}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-green-600">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Delivered</p>
          <p className="text-2xl font-bold text-green-600">{deliveredOrders}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Recent Orders</h3>
          <Link to="/admin/orders" className="text-xs font-semibold text-green-600 border border-green-300 px-3 py-1.5 rounded-lg hover:bg-green-50">
            View all
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-slate-400 text-center py-6 text-sm">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase font-medium">Customer</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase font-medium">Items</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase font-medium">Amount</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map(order => (
                  <tr key={order.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">{order.customerName}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{order.items?.map(i => i.name).join(', ')}</td>
                    <td className="px-4 py-3 font-semibold text-green-600">{'₦'}{order.totalAmount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ` + getStatusClass(order.status)}>
                        {order.status}
                      </span>
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

export default Dashboard   