import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import PageLayout from '../components/PageLayout'

function AuditReport() {
  const [sales, setSales] = useState([])
  const [chemicals, setChemicals] = useState([])
  const [fertilizers, setFertilizers] = useState([])
  const [waterSupply, setWaterSupply] = useState([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filtered, setFiltered] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      const [salesSnap, chemSnap, fertSnap, waterSnap] = await Promise.all([
        getDocs(collection(db, 'sales')),
        getDocs(collection(db, 'agroChemicals')),
        getDocs(collection(db, 'fertilizers')),
        getDocs(collection(db, 'waterSupply')),
      ])
      setSales(salesSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setChemicals(chemSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setFertilizers(fertSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setWaterSupply(waterSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    fetchAll()
  }, [])

  const filterByDate = (records, dateField) => {
    if (!startDate || !endDate) return records
    return records.filter(r => {
      const date = r.createdAt?.seconds
        ? new Date(r.createdAt.seconds * 1000)
        : r.dateApplied ? new Date(r.dateApplied)
        : r.date ? new Date(r.date)
        : null
      if (!date) return true
      return date >= new Date(startDate) && date <= new Date(endDate + 'T23:59:59')
    })
  }

  const filteredSales = filterByDate(sales)
  const filteredChemicals = filterByDate(chemicals)
  const filteredFertilizers = filterByDate(fertilizers)
  const filteredWater = filterByDate(waterSupply)

  const totalSalesRevenue = filteredSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
  const totalWaterRevenue = filteredWater.filter(w => w.paymentStatus === 'Paid').reduce((sum, w) => sum + (w.totalAmount || 0), 0)
  const totalRevenue = totalSalesRevenue + totalWaterRevenue
  const totalChemicalCost = filteredChemicals.reduce((sum, c) => sum + (c.totalCost || 0), 0)
  const totalFertilizerCost = filteredFertilizers.reduce((sum, f) => sum + (f.totalCost || 0), 0)
  const totalExpenses = totalChemicalCost + totalFertilizerCost
  const netProfit = totalRevenue - totalExpenses
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0

  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end date')
      return
    }
    setFiltered(true)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    doc.setFontSize(18)
    doc.setTextColor(15, 76, 42)
    doc.text('G Green Farms', pageWidth / 2, 20, { align: 'center' })
    doc.setFontSize(12)
    doc.setTextColor(100, 116, 139)
    doc.text('Financial Audit Report', pageWidth / 2, 28, { align: 'center' })
    doc.setFontSize(10)
    doc.text('Period: ' + startDate + ' to ' + endDate, pageWidth / 2, 36, { align: 'center' })
    doc.text('Generated: ' + new Date().toLocaleDateString('en-NG'), pageWidth / 2, 42, { align: 'center' })
    doc.setDrawColor(15, 76, 42)
    doc.line(14, 46, pageWidth - 14, 46)
    doc.setFontSize(11)
    doc.setTextColor(0)
    doc.text('Financial Summary', 14, 54)
    autoTable(doc, {
      startY: 58,
      head: [['Description', 'Amount']],
      body: [
        ['Total Sales Revenue', '₦' + totalSalesRevenue.toLocaleString()],
        ['Total Water Supply Revenue', '₦' + totalWaterRevenue.toLocaleString()],
        ['Total Revenue', '₦' + totalRevenue.toLocaleString()],
        ['Total Chemical Expenses', '₦' + totalChemicalCost.toLocaleString()],
        ['Total Fertilizer Expenses', '₦' + totalFertilizerCost.toLocaleString()],
        ['Total Expenses', '₦' + totalExpenses.toLocaleString()],
        ['Net Profit', '₦' + netProfit.toLocaleString()],
        ['Profit Margin', profitMargin + '%'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 76, 42], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 253, 244] },
    })
    doc.setFontSize(11)
    doc.text('Sales Records', 14, doc.lastAutoTable.finalY + 12)
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [['Crop', 'Buyer', 'Qty (kg)', 'Price/Unit', 'Total', 'Status', 'Date']],
      body: filteredSales.map(s => [
        s.cropName, s.buyerName, s.quantitySold,
        '₦' + (s.pricePerUnit || 0).toLocaleString(),
        '₦' + (s.totalAmount || 0).toLocaleString(),
        s.paymentStatus,
        s.createdAt?.seconds ? new Date(s.createdAt.seconds * 1000).toLocaleDateString('en-NG') : '-'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [15, 76, 42], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 253, 244] },
    })
    doc.setFontSize(11)
    doc.text('Water Supply Records', 14, doc.lastAutoTable.finalY + 12)
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [['Customer', 'Volume (L)', 'Price/L', 'Total', 'Status', 'Date']],
      body: filteredWater.map(w => [
        w.customerName,
        w.volumeLitres,
        '₦' + (w.pricePerLitre || 0).toLocaleString(),
        '₦' + (w.totalAmount || 0).toLocaleString(),
        w.paymentStatus,
        w.date || '-'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      alternateRowStyles: { fillColor: [239, 246, 255] },
    })
    doc.setFontSize(11)
    doc.text('Chemical Expenses', 14, doc.lastAutoTable.finalY + 12)
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [['Chemical', 'Greenhouse', 'Qty', 'Cost/Unit', 'Total', 'Date']],
      body: filteredChemicals.map(c => [
        c.chemicalName, c.greenhouse, c.quantity + ' ' + c.unit,
        '₦' + (c.costPerUnit || 0).toLocaleString(),
        '₦' + (c.totalCost || 0).toLocaleString(),
        c.dateApplied || '-'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68], textColor: 255 },
      alternateRowStyles: { fillColor: [254, 242, 242] },
    })
    doc.setFontSize(11)
    doc.text('Fertilizer Expenses', 14, doc.lastAutoTable.finalY + 12)
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [['Fertilizer', 'Crop', 'Greenhouse', 'Qty', 'Total', 'Date']],
      body: filteredFertilizers.map(f => [
        f.fertilizerName, f.cropName, f.greenhouse, f.quantity + ' ' + f.unit,
        '₦' + (f.totalCost || 0).toLocaleString(),
        f.dateApplied || '-'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11], textColor: 255 },
      alternateRowStyles: { fillColor: [255, 251, 235] },
    })
    doc.save('GGreenFarms-AuditReport-' + startDate + '-to-' + endDate + '.pdf')
  }

  if (loading) return (
    <PageLayout>
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Loading...</p>
      </div>
    </PageLayout>
  )

  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Audit Report</h1>
        <p className="text-sm text-slate-500 mt-1">Generate financial reports for audit and tax purposes</p>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Select Report Period</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
          <button onClick={handleGenerateReport}
            className="bg-green-800 text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-green-900 transition-colors">
            Generate Report
          </button>
          <button onClick={() => { setStartDate(''); setEndDate(''); setFiltered(false) }}
            className="bg-slate-100 text-slate-600 rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-slate-200 transition-colors">
            Reset
          </button>
        </div>
      </div>

      {filtered && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-green-600">
              <p className="text-xs text-slate-400 uppercase mb-2">Sales Revenue</p>
              <p className="text-xl font-bold text-green-600">{'₦'}{totalSalesRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-blue-500">
              <p className="text-xs text-slate-400 uppercase mb-2">Water Revenue</p>
              <p className="text-xl font-bold text-blue-600">{'₦'}{totalWaterRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-cyan-500">
              <p className="text-xs text-slate-400 uppercase mb-2">Total Revenue</p>
              <p className="text-xl font-bold text-cyan-600">{'₦'}{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-red-500">
              <p className="text-xs text-slate-400 uppercase mb-2">Total Expenses</p>
              <p className="text-xl font-bold text-red-500">{'₦'}{totalExpenses.toLocaleString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-emerald-600">
              <p className="text-xs text-slate-400 uppercase mb-2">Net Profit</p>
              <p className={netProfit >= 0 ? 'text-xl font-bold text-green-600' : 'text-xl font-bold text-red-500'}>
                {'₦'}{netProfit.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border-t-4 border-purple-500">
              <p className="text-xs text-slate-400 uppercase mb-2">Profit Margin</p>
              <p className="text-xl font-bold text-purple-500">{profitMargin}%</p>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button onClick={handleExportPDF}
              className="bg-green-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-900 transition-colors">
              Export to PDF
            </button>
            <button onClick={() => window.print()}
              className="bg-white text-slate-800 border border-slate-200 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
              Print Report
            </button>
          </div>

          {/* Sales Table */}
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Sales Records ({filteredSales.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[580px]">
                <thead>
                  <tr className="bg-green-50">
                    <th className="px-4 py-3 text-left text-xs text-green-700 font-semibold">Crop</th>
                    <th className="px-4 py-3 text-left text-xs text-green-700 font-semibold">Buyer</th>
                    <th className="px-4 py-3 text-left text-xs text-green-700 font-semibold">Qty (kg)</th>
                    <th className="px-4 py-3 text-left text-xs text-green-700 font-semibold">Price/Unit</th>
                    <th className="px-4 py-3 text-left text-xs text-green-700 font-semibold">Total</th>
                    <th className="px-4 py-3 text-left text-xs text-green-700 font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-xs text-green-700 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.length === 0 ? (
                    <tr><td colSpan="7" className="px-4 py-6 text-center text-slate-400">No sales in this period</td></tr>
                  ) : (
                    filteredSales.map(sale => (
                      <tr key={sale.id} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-medium text-slate-800">{sale.cropName}</td>
                        <td className="px-4 py-3 text-slate-600">{sale.buyerName}</td>
                        <td className="px-4 py-3 text-slate-600">{sale.quantitySold}</td>
                        <td className="px-4 py-3 text-slate-600">{'₦'}{sale.pricePerUnit?.toLocaleString()}</td>
                        <td className="px-4 py-3 font-semibold text-green-600">{'₦'}{sale.totalAmount?.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={sale.paymentStatus === 'Paid' ? 'text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700' : 'text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700'}>
                            {sale.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {sale.createdAt?.seconds ? new Date(sale.createdAt.seconds * 1000).toLocaleDateString('en-NG') : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Water Supply Table */}
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Water Supply Records ({filteredWater.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-4 py-3 text-left text-xs text-blue-600 font-semibold">Customer</th>
                    <th className="px-4 py-3 text-left text-xs text-blue-600 font-semibold">Volume (L)</th>
                    <th className="px-4 py-3 text-left text-xs text-blue-600 font-semibold">Price/Litre</th>
                    <th className="px-4 py-3 text-left text-xs text-blue-600 font-semibold">Total</th>
                    <th className="px-4 py-3 text-left text-xs text-blue-600 font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-xs text-blue-600 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWater.length === 0 ? (
                    <tr><td colSpan="6" className="px-4 py-6 text-center text-slate-400">No water supply records in this period</td></tr>
                  ) : (
                    filteredWater.map(w => (
                      <tr key={w.id} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-medium text-slate-800">{w.customerName}</td>
                        <td className="px-4 py-3 text-slate-600">{w.volumeLitres?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-slate-600">{'₦'}{w.pricePerLitre?.toLocaleString()}</td>
                        <td className="px-4 py-3 font-semibold text-blue-600">{'₦'}{w.totalAmount?.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={w.paymentStatus === 'Paid' ? 'text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700' : 'text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700'}>
                            {w.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{w.date || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chemicals Table */}
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Chemical Expenses ({filteredChemicals.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="bg-red-50">
                    <th className="px-4 py-3 text-left text-xs text-red-600 font-semibold">Chemical</th>
                    <th className="px-4 py-3 text-left text-xs text-red-600 font-semibold">Greenhouse</th>
                    <th className="px-4 py-3 text-left text-xs text-red-600 font-semibold">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs text-red-600 font-semibold">Cost/Unit</th>
                    <th className="px-4 py-3 text-left text-xs text-red-600 font-semibold">Total</th>
                    <th className="px-4 py-3 text-left text-xs text-red-600 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChemicals.length === 0 ? (
                    <tr><td colSpan="6" className="px-4 py-6 text-center text-slate-400">No chemical records in this period</td></tr>
                  ) : (
                    filteredChemicals.map(chem => (
                      <tr key={chem.id} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-medium text-slate-800">{chem.chemicalName}</td>
                        <td className="px-4 py-3 text-slate-600">{chem.greenhouse}</td>
                        <td className="px-4 py-3 text-slate-600">{chem.quantity} {chem.unit}</td>
                        <td className="px-4 py-3 text-slate-600">{'₦'}{chem.costPerUnit?.toLocaleString()}</td>
                        <td className="px-4 py-3 font-semibold text-red-600">{'₦'}{chem.totalCost?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-slate-600">{chem.dateApplied || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fertilizers Table */}
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Fertilizer Expenses ({filteredFertilizers.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="bg-amber-50">
                    <th className="px-4 py-3 text-left text-xs text-amber-600 font-semibold">Fertilizer</th>
                    <th className="px-4 py-3 text-left text-xs text-amber-600 font-semibold">Crop</th>
                    <th className="px-4 py-3 text-left text-xs text-amber-600 font-semibold">Greenhouse</th>
                    <th className="px-4 py-3 text-left text-xs text-amber-600 font-semibold">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs text-amber-600 font-semibold">Total</th>
                    <th className="px-4 py-3 text-left text-xs text-amber-600 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFertilizers.length === 0 ? (
                    <tr><td colSpan="6" className="px-4 py-6 text-center text-slate-400">No fertilizer records in this period</td></tr>
                  ) : (
                    filteredFertilizers.map(fert => (
                      <tr key={fert.id} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-medium text-slate-800">{fert.fertilizerName}</td>
                        <td className="px-4 py-3 text-slate-600">{fert.cropName}</td>
                        <td className="px-4 py-3 text-slate-600">{fert.greenhouse}</td>
                        <td className="px-4 py-3 text-slate-600">{fert.quantity} {fert.unit}</td>
                        <td className="px-4 py-3 font-semibold text-amber-600">{'₦'}{fert.totalCost?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-slate-600">{fert.dateApplied || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>










            
          </div>
        </>
      )}
    </PageLayout>
  )
}

export default AuditReport