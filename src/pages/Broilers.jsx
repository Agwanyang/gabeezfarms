import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, deleteDoc, updateDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import PageLayout from '../components/PageLayout'
import { cleanBroilerBatches, cleanBroilerExpenses, cleanBroilerDeaths, cleanBroilerSales } from '../data/cleanBroilerData'

function Broilers() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [batches, setBatches] = useState([])
  const [expenses, setExpenses] = useState([])
  const [deaths, setDeaths] = useState([])
  const [sales, setSales] = useState([])
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [loading, setLoading] = useState(true)

  const [batchForm, setBatchForm] = useState({
    batchName: '', arrivalDate: '', numberOfBirds: '',
    costPerBird: '', transportCost: '', deathsOnArrival: '0', notes: ''
  })
  const [expenseForm, setExpenseForm] = useState({
    batchId: '', type: 'Starter Feed', amount: '', date: '', notes: ''
  })
  const [deathForm, setDeathForm] = useState({
    batchId: '', date: '', numberOfDeaths: '', cause: ''
  })
  const [saleForm, setSaleForm] = useState({
    batchId: '', date: '', numberOfBirds: '', weightPerBird: '', pricePerBird: '', buyerName: ''
  })

  const [showBatchForm, setShowBatchForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showDeathForm, setShowDeathForm] = useState(false)
  const [showSaleForm, setShowSaleForm] = useState(false)
  const [success, setSuccess] = useState('')

  const fetchAll = async () => {
    const [batchSnap, expSnap, deathSnap, saleSnap] = await Promise.all([
      getDocs(collection(db, 'broilerBatches')),
      getDocs(collection(db, 'broilerExpenses')),
      getDocs(collection(db, 'broilerDeaths')),
      getDocs(collection(db, 'broilerSales')),
    ])
    setBatches(batchSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    setExpenses(expSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    setDeaths(deathSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    setSales(saleSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const showMsg = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }

  const importCleanBatches = async () => {
    if (!window.confirm('Import the cleaned Batch 1-6 records? Existing records will not be deleted.')) return

    try {
      await Promise.all([
        ...cleanBroilerBatches.map(({ id, ...batch }) => setDoc(doc(db, 'broilerBatches', id), { ...batch, createdAt: serverTimestamp() }, { merge: true })),
        ...cleanBroilerExpenses.map(({ id, ...expense }) => setDoc(doc(db, 'broilerExpenses', id), { ...expense, createdAt: serverTimestamp() }, { merge: true })),
        ...cleanBroilerDeaths.map(({ id, ...death }) => setDoc(doc(db, 'broilerDeaths', id), { ...death, createdAt: serverTimestamp() }, { merge: true })),
        ...cleanBroilerSales.filter(sale => !sale.isProjection).map(({ id, ...sale }) => setDoc(doc(db, 'broilerSales', id), { ...sale, createdAt: serverTimestamp() }, { merge: true })),
      ])
      showMsg('Cleaned Batch 1-6 records imported without deleting existing data.')
      fetchAll()
    } catch (err) {
      console.error(err)
      showMsg('Import failed. Check your Firebase permissions and try again.')
    }
  }

  const getBatchStats = (batch) => {
    const batchExpenses = expenses.filter(e => e.batchId === batch.id)
    const batchDeaths = deaths.filter(d => d.batchId === batch.id)
    const batchSales = sales.filter(s => s.batchId === batch.id)

    const purchaseCost = (Number(batch.numberOfBirds) * Number(batch.costPerBird)) || 0
    const transportCost = Number(batch.transportCost) || 0
    const totalExpenses = batchExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
    const totalCost = purchaseCost + transportCost + totalExpenses

    const totalDeaths = Number(batch.deathsOnArrival || 0) + batchDeaths.reduce((sum, d) => sum + (Number(d.numberOfDeaths) || 0), 0)
    const totalSold = batchSales.reduce((sum, s) => sum + (Number(s.numberOfBirds) || 0), 0)
    const remaining = Number(batch.numberOfBirds) - totalDeaths - totalSold

    const totalRevenue = batchSales.reduce((sum, s) => sum + (Number(s.numberOfBirds) * Number(s.pricePerBird) || 0), 0)
    const netProfit = totalRevenue - totalCost

    return { purchaseCost, transportCost, totalExpenses, totalCost, totalDeaths, totalSold, remaining, totalRevenue, netProfit }
  }

  const handleAddBatch = async (e) => {
    e.preventDefault()
    await addDoc(collection(db, 'broilerBatches'), { ...batchForm, createdAt: serverTimestamp() })
    setBatchForm({ batchName: '', arrivalDate: '', numberOfBirds: '', costPerBird: '', transportCost: '', deathsOnArrival: '0', notes: '' })
    setShowBatchForm(false)
    showMsg('Batch added successfully!')
    fetchAll()
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()
    await addDoc(collection(db, 'broilerExpenses'), { ...expenseForm, createdAt: serverTimestamp() })
    setExpenseForm({ batchId: '', type: 'Starter Feed', amount: '', date: '', notes: '' })
    setShowExpenseForm(false)
    showMsg('Expense recorded!')
    fetchAll()
  }

  const handleAddDeath = async (e) => {
    e.preventDefault()
    await addDoc(collection(db, 'broilerDeaths'), { ...deathForm, createdAt: serverTimestamp() })
    setDeathForm({ batchId: '', date: '', numberOfDeaths: '', cause: '' })
    setShowDeathForm(false)
    showMsg('Death record added!')
    fetchAll()
  }

  const handleAddSale = async (e) => {
    e.preventDefault()
    await addDoc(collection(db, 'broilerSales'), { ...saleForm, createdAt: serverTimestamp() })
    setSaleForm({ batchId: '', date: '', numberOfBirds: '', weightPerBird: '', pricePerBird: '', buyerName: '' })
    setShowSaleForm(false)
    showMsg('Sale recorded!')
    fetchAll()
  }

  const handleDelete = async (collectionName, id) => {
    if (window.confirm('Delete this record?')) {
      await deleteDoc(doc(db, collectionName, id))
      fetchAll()
    }
  }

  // Overall stats
  const totalBirdsEver = batches.reduce((sum, b) => sum + (Number(b.numberOfBirds) || 0), 0)
  const allStats = batches.map(b => getBatchStats(b))
  const totalRevenue = allStats.reduce((sum, s) => sum + s.totalRevenue, 0)
  const totalCost = allStats.reduce((sum, s) => sum + s.totalCost, 0)
  const totalProfit = totalRevenue - totalCost
  const totalDeaths = allStats.reduce((sum, s) => sum + s.totalDeaths, 0)
  const totalSold = allStats.reduce((sum, s) => sum + s.totalSold, 0)
  const totalRemaining = allStats.reduce((sum, s) => sum + s.remaining, 0)

  const tabs = ['dashboard', 'batches', 'expenses', 'deaths', 'sales']

  if (loading) return (
    <PageLayout>
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Loading broiler records...</p>
      </div>
    </PageLayout>
  )

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Broiler Records</h1>
          <p className="text-slate-500 mt-1 text-sm">Track batches, expenses, deaths, sales and profit/loss</p>
        </div>
        <button
          type="button"
          onClick={importCleanBatches}
          className="w-full rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 shadow-sm hover:bg-green-100 sm:w-auto sm:bg-white sm:px-4 sm:py-2"
        >
          Import clean Batch 1-6
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? 'px-4 py-2 rounded-lg text-sm font-semibold bg-green-700 text-white' : 'px-4 py-2 rounded-lg text-sm font-medium bg-white text-slate-500 shadow-sm hover:bg-slate-50 border border-slate-200'}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Overall P&L */}
          <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-3">Overall Summary</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-blue-500">
              <p className="text-xs text-slate-400 uppercase mb-1">Total Birds</p>
              <p className="text-2xl font-bold text-slate-800">{totalBirdsEver}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-green-600">
              <p className="text-xs text-slate-400 uppercase mb-1">Total Revenue</p>
              <p className="text-xl font-bold text-green-600">{'₦'}{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-red-500">
              <p className="text-xs text-slate-400 uppercase mb-1">Total Cost</p>
              <p className="text-xl font-bold text-red-500">{'₦'}{totalCost.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-purple-500">
              <p className="text-xs text-slate-400 uppercase mb-1">Net Profit/Loss</p>
              <p className={totalProfit >= 0 ? 'text-xl font-bold text-green-600' : 'text-xl font-bold text-red-500'}>
                {'₦'}{totalProfit.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-slate-400">
              <p className="text-xs text-slate-400 uppercase mb-1">Total Deaths</p>
              <p className="text-2xl font-bold text-slate-600">{totalDeaths}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-amber-400">
              <p className="text-xs text-slate-400 uppercase mb-1">Total Sold</p>
              <p className="text-2xl font-bold text-amber-500">{totalSold}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-cyan-500">
              <p className="text-xs text-slate-400 uppercase mb-1">Remaining</p>
              <p className="text-2xl font-bold text-cyan-600">{totalRemaining}</p>
            </div>
          </div>

          {/* Per Batch P&L */}
          <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-3">Profit & Loss Per Batch</p>
          {batches.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center text-slate-400 shadow-sm">
              <div className="text-5xl mb-3">🐔</div>
              <p className="font-medium">No batches yet</p>
              <p className="text-xs mt-1">Go to Batches tab to add your first batch</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {batches.map(batch => {
                const stats = getBatchStats(batch)
                return (
                  <div key={batch.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div>
                        <h3 className="font-bold text-slate-800 text-base">{batch.batchName}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Arrived: {batch.arrivalDate} | {batch.numberOfBirds} birds</p>
                      </div>
                      <span className={stats.netProfit >= 0 ? 'text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full' : 'text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full'}>
                        {stats.netProfit >= 0 ? 'Profit: ' : 'Loss: '}{'₦'}{Math.abs(stats.netProfit).toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-400 mb-1">Purchase Cost</p>
                        <p className="font-semibold text-slate-700 text-sm">{'₦'}{stats.purchaseCost.toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-400 mb-1">Other Expenses</p>
                        <p className="font-semibold text-slate-700 text-sm">{'₦'}{(stats.transportCost + stats.totalExpenses).toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-400 mb-1">Total Cost</p>
                        <p className="font-semibold text-red-600 text-sm">{'₦'}{stats.totalCost.toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-400 mb-1">Revenue</p>
                        <p className="font-semibold text-green-600 text-sm">{'₦'}{stats.totalRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-slate-400 mb-1">Deaths</p>
                        <p className="font-bold text-slate-600">{stats.totalDeaths}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-slate-400 mb-1">Sold</p>
                        <p className="font-bold text-amber-500">{stats.totalSold}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-slate-400 mb-1">Remaining</p>
                        <p className="font-bold text-cyan-600">{stats.remaining}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* BATCHES TAB */}
      {activeTab === 'batches' && (
        <div>
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-semibold text-slate-800">All Batches</h3>
            <button onClick={() => setShowBatchForm(!showBatchForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
              {showBatchForm ? 'Close' : '+ New Batch'}
            </button>
          </div>

          {showBatchForm && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-5">
              <h3 className="font-semibold text-slate-800 mb-5 pb-3 border-b">New Broiler Batch</h3>
              <form onSubmit={handleAddBatch} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Batch Name</label>
                  <input value={batchForm.batchName} onChange={e => setBatchForm({ ...batchForm, batchName: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="e.g. Batch 1 - July 2026" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Date of Arrival</label>
                  <input type="date" value={batchForm.arrivalDate} onChange={e => setBatchForm({ ...batchForm, arrivalDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Number of Birds</label>
                  <input type="number" value={batchForm.numberOfBirds} onChange={e => setBatchForm({ ...batchForm, numberOfBirds: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="e.g. 100" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Cost Per Bird (₦)</label>
                  <input type="number" value={batchForm.costPerBird} onChange={e => setBatchForm({ ...batchForm, costPerBird: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="e.g. 500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Transport Cost (₦)</label>
                  <input type="number" value={batchForm.transportCost} onChange={e => setBatchForm({ ...batchForm, transportCost: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="e.g. 5000" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Deaths on Arrival</label>
                  <input type="number" value={batchForm.deathsOnArrival} onChange={e => setBatchForm({ ...batchForm, deathsOnArrival: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="0" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-2">Notes (optional)</label>
                  <textarea value={batchForm.notes} onChange={e => setBatchForm({ ...batchForm, notes: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    rows="2" placeholder="Any additional notes..." />
                </div>
                {batchForm.numberOfBirds && batchForm.costPerBird && (
                  <div className="sm:col-span-2 bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-sm text-green-700 font-medium">
                      Total Purchase Cost: {'₦'}{(Number(batchForm.numberOfBirds) * Number(batchForm.costPerBird)).toLocaleString()}
                      {batchForm.transportCost ? ' + ₦' + Number(batchForm.transportCost).toLocaleString() + ' transport = ₦' + (Number(batchForm.numberOfBirds) * Number(batchForm.costPerBird) + Number(batchForm.transportCost)).toLocaleString() : ''}
                    </p>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <button type="submit" className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors">
                    + Add Batch
                  </button>
                </div>
              </form>
            </div>
          )}

          {batches.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center text-slate-400 shadow-sm">
              <div className="text-5xl mb-3">🐔</div>
              <p className="font-medium">No batches yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {batches.map(batch => {
                const stats = getBatchStats(batch)
                return (
                  <div key={batch.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-slate-800">{batch.batchName}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Arrived: {batch.arrivalDate}</p>
                      </div>
                      <button onClick={() => handleDelete('broilerBatches', batch.id)}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100">
                        Delete
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-400 mb-1">Birds</p>
                        <p className="font-bold text-slate-700">{batch.numberOfBirds}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-400 mb-1">Cost/Bird</p>
                        <p className="font-bold text-slate-700">{'₦'}{Number(batch.costPerBird).toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-400 mb-1">Transport</p>
                        <p className="font-bold text-slate-700">{'₦'}{Number(batch.transportCost).toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-400 mb-1">Deaths on Arrival</p>
                        <p className="font-bold text-red-500">{batch.deathsOnArrival}</p>
                      </div>
                    </div>
                    {batch.notes && <p className="text-xs text-slate-400 mt-3 italic">{batch.notes}</p>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* EXPENSES TAB */}
      {activeTab === 'expenses' && (
        <div>
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-semibold text-slate-800">Expenses (Feed & Medication)</h3>
            <button onClick={() => setShowExpenseForm(!showExpenseForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
              {showExpenseForm ? 'Close' : '+ Add Expense'}
            </button>
          </div>

          {showExpenseForm && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-5">
              <h3 className="font-semibold text-slate-800 mb-5 pb-3 border-b">Record Expense</h3>
              <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Select Batch</label>
                  <select value={expenseForm.batchId} onChange={e => setExpenseForm({ ...expenseForm, batchId: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" required>
                    <option value="">-- Select Batch --</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.batchName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Expense Type</label>
                  <select value={expenseForm.type} onChange={e => setExpenseForm({ ...expenseForm, type: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                    <option>Starter Feed</option>
                    <option>Grower Feed</option>
                    <option>Finisher Feed</option>
                    <option>Medication</option>
                    <option>Vaccines</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Amount (₦)</label>
                  <input type="number" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="0" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Date</label>
                  <input type="date" value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-2">Notes (optional)</label>
                  <input value={expenseForm.notes} onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="e.g. 2 bags of starter feed" />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors">
                    + Save Expense
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-5 py-4 text-slate-500 font-medium">Batch</th>
                    <th className="px-5 py-4 text-slate-500 font-medium">Type</th>
                    <th className="px-5 py-4 text-slate-500 font-medium">Amount</th>
                    <th className="px-5 py-4 text-slate-500 font-medium">Date</th>
                    <th className="px-5 py-4 text-slate-500 font-medium">Notes</th>
                    <th className="px-5 py-4 text-slate-500 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr><td colSpan="6" className="px-5 py-12 text-center text-slate-400">No expenses recorded yet</td></tr>
                  ) : (
                    expenses.map(exp => {
                      const batch = batches.find(b => b.id === exp.batchId)
                      return (
                        <tr key={exp.id} className="border-t border-slate-100 hover:bg-slate-50">
                          <td className="px-5 py-4 font-medium text-slate-800">{batch ? batch.batchName : '-'}</td>
                          <td className="px-5 py-4">
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">{exp.type}</span>
                          </td>
                          <td className="px-5 py-4 font-semibold text-red-600">{'₦'}{Number(exp.amount).toLocaleString()}</td>
                          <td className="px-5 py-4 text-slate-500">{exp.date}</td>
                          <td className="px-5 py-4 text-slate-400 text-xs">{exp.notes || '-'}</td>
                          <td className="px-5 py-4">
                            <button onClick={() => handleDelete('broilerExpenses', exp.id)}
                              className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100">
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DEATHS TAB */}
      {activeTab === 'deaths' && (
        <div>
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-semibold text-slate-800">Death Records</h3>
            <button onClick={() => setShowDeathForm(!showDeathForm)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
              {showDeathForm ? 'Close' : '+ Record Death'}
            </button>
          </div>

          {showDeathForm && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-5">
              <h3 className="font-semibold text-slate-800 mb-5 pb-3 border-b">Record Bird Death</h3>
              <form onSubmit={handleAddDeath} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Select Batch</label>
                  <select value={deathForm.batchId} onChange={e => setDeathForm({ ...deathForm, batchId: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" required>
                    <option value="">-- Select Batch --</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.batchName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Date</label>
                  <input type="date" value={deathForm.date} onChange={e => setDeathForm({ ...deathForm, date: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Number of Deaths</label>
                  <input type="number" value={deathForm.numberOfDeaths} onChange={e => setDeathForm({ ...deathForm, numberOfDeaths: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="1" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Cause (optional)</label>
                  <input value={deathForm.cause} onChange={e => setDeathForm({ ...deathForm, cause: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="e.g. Disease, Unknown" />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="w-full bg-red-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors">
                    + Record Death
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-5 py-4 text-slate-500 font-medium">Batch</th>
                    <th className="px-5 py-4 text-slate-500 font-medium">Date</th>
                    <th className="px-5 py-4 text-slate-500 font-medium">Deaths</th>
                    <th className="px-5 py-4 text-slate-500 font-medium">Cause</th>
                    <th className="px-5 py-4 text-slate-500 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deaths.length === 0 ? (
                    <tr><td colSpan="5" className="px-5 py-12 text-center text-slate-400">No death records yet</td></tr>
                  ) : (
                    deaths.map(death => {
                      const batch = batches.find(b => b.id === death.batchId)
                      return (
                        <tr key={death.id} className="border-t border-slate-100 hover:bg-slate-50">
                          <td className="px-5 py-4 font-medium text-slate-800">{batch ? batch.batchName : '-'}</td>
                          <td className="px-5 py-4 text-slate-500">{death.date}</td>
                          <td className="px-5 py-4 font-bold text-red-600">{death.numberOfDeaths}</td>
                          <td className="px-5 py-4 text-slate-400">{death.cause || '-'}</td>
                          <td className="px-5 py-4">
                            <button onClick={() => handleDelete('broilerDeaths', death.id)}
                              className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100">
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SALES TAB */}
      {activeTab === 'sales' && (
        <div>
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-semibold text-slate-800">Sales Records</h3>
            <button onClick={() => setShowSaleForm(!showSaleForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
              {showSaleForm ? 'Close' : '+ Record Sale'}
            </button>
          </div>

          {showSaleForm && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-5">
              <h3 className="font-semibold text-slate-800 mb-5 pb-3 border-b">Record Bird Sale</h3>
              <form onSubmit={handleAddSale} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Select Batch</label>
                  <select value={saleForm.batchId} onChange={e => setSaleForm({ ...saleForm, batchId: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" required>
                    <option value="">-- Select Batch --</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.batchName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Date</label>
                  <input type="date" value={saleForm.date} onChange={e => setSaleForm({ ...saleForm, date: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Number of Birds Sold</label>
                  <input type="number" value={saleForm.numberOfBirds} onChange={e => setSaleForm({ ...saleForm, numberOfBirds: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="e.g. 10" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Weight Per Bird (kg)</label>
                  <input type="number" step="0.1" value={saleForm.weightPerBird} onChange={e => setSaleForm({ ...saleForm, weightPerBird: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="e.g. 3.0" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Price Per Bird (₦)</label>
                  <input type="number" value={saleForm.pricePerBird} onChange={e => setSaleForm({ ...saleForm, pricePerBird: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="e.g. 8000" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Buyer Name</label>
                  <input value={saleForm.buyerName} onChange={e => setSaleForm({ ...saleForm, buyerName: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="e.g. John Doe" required />
                </div>
                {saleForm.numberOfBirds && saleForm.pricePerBird && (
                  <div className="sm:col-span-2 bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-sm text-green-700 font-medium">
                      Total Sale Amount: {'₦'}{(Number(saleForm.numberOfBirds) * Number(saleForm.pricePerBird)).toLocaleString()}
                      {saleForm.weightPerBird ? ' | Total Weight: ' + (Number(saleForm.numberOfBirds) * Number(saleForm.weightPerBird)).toFixed(1) + 'kg' : ''}
                    </p>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <button type="submit" className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors">
                    + Record Sale
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-5 py-4 text-slate-500 font-medium">Batch</th>
                    <th className="px-5 py-4 text-slate-500 font-medium">Date</th>
                    <th className="px-5 py-4 text-slate-500 font-medium">Birds</th>
                    <th className="px-5 py-4 text-slate-500 font-medium">Weight/Bird</th>
                    <th className="px-5 py-4 text-slate-500 font-medium">Price/Bird</th>
                    <th className="px-5 py-4 text-slate-500 font-medium">Total</th>
                    <th className="px-5 py-4 text-slate-500 font-medium">Buyer</th>
                    <th className="px-5 py-4 text-slate-500 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length === 0 ? (
                    <tr><td colSpan="8" className="px-5 py-12 text-center text-slate-400">No sales recorded yet</td></tr>
                  ) : (
                    sales.map(sale => {
                      const batch = batches.find(b => b.id === sale.batchId)
                      return (
                        <tr key={sale.id} className="border-t border-slate-100 hover:bg-slate-50">
                          <td className="px-5 py-4 font-medium text-slate-800">{batch ? batch.batchName : '-'}</td>
                          <td className="px-5 py-4 text-slate-500">{sale.date}</td>
                          <td className="px-5 py-4 text-slate-600">{sale.numberOfBirds}</td>
                          <td className="px-5 py-4 text-slate-600">{sale.weightPerBird}kg</td>
                          <td className="px-5 py-4 text-slate-600">{'₦'}{Number(sale.pricePerBird).toLocaleString()}</td>
                          <td className="px-5 py-4 font-semibold text-green-600">{'₦'}{(Number(sale.numberOfBirds) * Number(sale.pricePerBird)).toLocaleString()}</td>
                          <td className="px-5 py-4 text-slate-600">{sale.buyerName}</td>
                          <td className="px-5 py-4">
                            <button onClick={() => handleDelete('broilerSales', sale.id)}
                              className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100">
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}

export default Broilers