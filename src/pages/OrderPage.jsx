import { useState, useEffect } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import FARM_SETTINGS from '../firebase/settings'
import redPepper from '../assets/images/Red pepper.jpg'
import yellowBell from '../assets/images/YellowBell.webp'
import greenPepper from '../assets/images/Green.jpg'
import babyCucumber from '../assets/images/Babycucumber.jpeg'
import broilers from '../assets/images/broilers.jpg'
import greenhouse from '../assets/images/Greenhouse.jpg'

const products = [
  { id: 1, name: 'Bell Peppers (Red)', price: 6000, unit: 'kg', image: redPepper, available: true, tag: 'Vitamin Rich' },
  { id: 2, name: 'Bell Peppers (Yellow)', price: 5500, unit: 'kg', image: yellowBell, available: true, tag: 'Sweet & Mild' },
  { id: 3, name: 'Bell Peppers (Green)', price: 5000, unit: 'kg', image: greenPepper, available: true, tag: 'Most Popular' },
  { id: 4, name: 'Baby Cucumbers', price: 1100, unit: 'kg', image: babyCucumber, available: true, tag: 'Farm Fresh' },
  { id: 5, name: 'Chicken', price: 8000, unit: 'bird', image: broilers, available: true, tag: 'Naturally Raised' },
]

function OrderPage() {
  const [cart, setCart] = useState([])
  const [step, setStep] = useState('shop')
  const [form, setForm] = useState({ customerName: '', phone: '', email: '', address: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [toast, setToast] = useState('')
  const [cartBarVisible, setCartBarVisible] = useState(false)

  useEffect(() => {
    if (cart.length > 0) {
      const t = setTimeout(() => setCartBarVisible(true), 10)
      return () => clearTimeout(t)
    } else {
      setCartBarVisible(false)
    }
  }, [cart.length])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 1800)
  }

  const addToCart = (product) => {
    const existing = cart.find(c => c.id === product.id)
    if (existing) {
      setCart(cart.map(c => c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
    showToast(product.name + ' added to cart')
  }

  const removeFromCart = (id) => {
    setCart(cart.filter(c => c.id !== id))
  }

  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id)
    setCart(cart.map(c => c.id === id ? { ...c, quantity: qty } : c))
  }

  const totalAmount = cart.reduce((sum, c) => sum + (c.price * c.quantity), 0)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const sendWhatsAppNotification = (orderRef) => {
    const itemsList = cart.map(item =>
      item.name + ' x ' + item.quantity + ' ' + item.unit + ' = N' + (item.price * item.quantity).toLocaleString()
    ).join('\n')

    const message =
      'NEW ORDER - Gabeez Green Farms\n\n' +
      'Customer: ' + form.customerName + '\n' +
      'Phone: ' + form.phone + '\n' +
      (form.email ? 'Email: ' + form.email + '\n' : '') +
      'Address: ' + form.address + '\n\n' +
      'ITEMS:\n' + itemsList + '\n\n' +
      'Total: N' + totalAmount.toLocaleString() + '\n' +
      'Order Ref: #' + orderRef + '\n\n' +
      (form.notes ? 'Notes: ' + form.notes + '\n\n' : '') +
      'Go to admin panel to confirm!'

    const whatsappNumber = FARM_SETTINGS.whatsappNumber.replace('+', '')
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = 'https://wa.me/' + whatsappNumber + '?text=' + encodedMessage

    window.open(whatsappUrl, '_blank')
  }

  const handleOrder = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const ref = await addDoc(collection(db, 'orders'), {
        ...form,
        items: cart,
        totalAmount,
        status: 'Pending',
        createdAt: serverTimestamp(),
      })
      const orderRef = ref.id.slice(0, 8).toUpperCase()
      setOrderId(orderRef)
      sendWhatsAppNotification(orderRef)
      setOrderPlaced(true)
      setCart([])
      setForm({ customerName: '', phone: '', email: '', address: '', notes: '' })
      setStep('shop')
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  if (orderPlaced) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #052e16 0%, #064e3b 40%, #065f46 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Segoe UI', sans-serif" }}>
        <style>{`
          @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
          @keyframes checkBounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        `}</style>
        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '48px 36px', textAlign: 'center', maxWidth: '440px', width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.35)', animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px', animation: 'checkBounce 0.6s ease 0.4s' }}>✅</div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0' }}>Order Placed!</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px 0' }}>Thank you for your order. We'll contact you shortly to confirm delivery.</p>
          <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '18px', marginBottom: '28px' }}>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Reference</p>
            <p style={{ fontSize: '24px', fontWeight: '800', color: '#15803d', margin: 0 }}>#{orderId}</p>
          </div>
          <button onClick={() => setOrderPlaced(false)}
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none', borderRadius: '50px', padding: '14px 36px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 8px 24px rgba(34,197,94,0.35)', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            Shop Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`
        @keyframes slideUp { from { transform: translate(-50%, 30px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes toastIn { from { transform: translate(-50%, -20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .gf-product-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .gf-product-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
        .gf-product-img { transition: transform 0.5s ease; }
        .gf-product-card:hover .gf-product-img { transform: scale(1.08); }
        .gf-add-btn { transition: all 0.25s ease; }
        .gf-add-btn:hover { transform: scale(1.03); box-shadow: 0 8px 20px rgba(22,163,74,0.35); }
        .gf-step-fade { animation: fadeIn 0.4s ease both; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', zIndex: 200,
          background: '#1e293b', color: 'white', padding: '12px 22px', borderRadius: '50px',
          fontSize: '13px', fontWeight: '600', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: '8px', animation: 'toastIn 0.3s ease',
        }}>
          <span style={{ color: '#4ade80', fontSize: '16px' }}>✓</span> {toast}
        </div>
      )}

      {/* Header with subtle pattern */}
      <div style={{ background: 'linear-gradient(135deg, #052e16 0%, #0f4c2a 50%, #1a7a42 100%)', padding: '28px 32px', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.15) 0%, transparent 70%)' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span style={{ fontSize: '28px' }}>🌿</span>
              <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0, letterSpacing: '-0.01em' }}>Gabeez Green Farms</h1>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', margin: 0 }}>Fresh from our greenhouse to your table</p>
          </div>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => cart.length > 0 && setStep('checkout')}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', borderRadius: '14px', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.18)', transition: 'background 0.2s' }}>
              <span style={{ fontSize: '20px' }}>🛒</span>
              <span style={{ fontWeight: '700', fontSize: '14px' }}>{cart.length} items</span>
            </div>
            {cart.length > 0 && (
              <div style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', boxShadow: '0 2px 8px rgba(239,68,68,0.5)' }}>
                {cart.length}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Farm banner strip - only on shop step */}
      {step === 'shop' && (
        <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
          <img src={greenhouse} alt="Our Greenhouse" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(5,46,22,0.75), rgba(5,46,22,0.2))', display: 'flex', alignItems: 'center', padding: '0 32px' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
              <p style={{ color: '#86efac', fontSize: '12px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px 0' }}>Straight From The Greenhouse</p>
              <p style={{ color: 'white', fontSize: '18px', fontWeight: '700', margin: 0 }}>Harvested fresh, delivered the same day</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px 100px' }}>

        {step === 'shop' && (
          <div className="gf-step-fade">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <div style={{ width: 4, height: 24, background: 'linear-gradient(180deg, #16a34a, #059669)', borderRadius: 2 }} />
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Our Products</h2>
            </div>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '6px 0 28px 16px' }}>Fresh greenhouse produce, harvested daily</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '22px' }}>
              {products.map(product => (
                <div key={product.id} className="gf-product-card" style={{
                  backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #eef2f6',
                  opacity: product.available ? 1 : 0.6
                }}>
                  <div style={{ position: 'relative', height: '170px', overflow: 'hidden' }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="gf-product-img"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: product.available ? 1 : 0.5 }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent 50%)' }} />
                    <span style={{
                      position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
                      color: '#15803d', fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px',
                    }}>{product.tag}</span>
                  </div>
                  <div style={{ padding: '18px 20px 20px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 6px 0' }}>{product.name}</h3>
                    <p style={{ fontSize: '19px', fontWeight: '800', color: '#16a34a', margin: '0 0 16px 0' }}>
                      ₦{product.price.toLocaleString()} <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>per {product.unit}</span>
                    </p>
                    {product.available ? (
                      <button onClick={() => addToCart(product)} className="gf-add-btn"
                        style={{ width: '100%', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none', borderRadius: '10px', padding: '11px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                        + Add to Cart
                      </button>
                    ) : (
                      <div style={{ width: '100%', backgroundColor: '#f1f5f9', color: '#94a3b8', borderRadius: '10px', padding: '11px', fontWeight: '700', fontSize: '13px', textAlign: 'center' }}>
                        Out of Stock
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div style={{
                position: 'fixed', bottom: '24px', left: '50%', transform: cartBarVisible ? 'translate(-50%, 0)' : 'translate(-50%, 30px)',
                opacity: cartBarVisible ? 1 : 0, background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white',
                borderRadius: '50px', padding: '14px 14px 14px 26px', display: 'flex', alignItems: 'center', gap: '20px',
                boxShadow: '0 15px 40px rgba(0,0,0,0.35)', zIndex: 100, transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
              }}>
                <span style={{ fontSize: '14px' }}>🛒 {cart.length} item{cart.length > 1 ? 's' : ''} — <strong>₦{totalAmount.toLocaleString()}</strong></span>
                <button onClick={() => setStep('checkout')}
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none', borderRadius: '50px', padding: '10px 24px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                  Checkout →
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'checkout' && (
          <div className="gf-step-fade">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#16a34a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>✓</div>
                <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 700 }}>Shop</span>
              </div>
              <div style={{ width: 32, height: 2, background: '#bbf7d0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#16a34a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>2</div>
                <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 700 }}>Details</span>
              </div>
              <div style={{ width: 32, height: 2, background: '#e2e8f0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#e2e8f0', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>3</div>
                <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Confirmed</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '28px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 20px 0' }}>Your Details</h2>
                <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #eef2f6' }}>
                  <form onSubmit={handleOrder}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Full Name</label>
                        <input name="customerName" value={form.customerName} onChange={handleChange}
                          style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                          onFocus={e => e.target.style.borderColor = '#16a34a'}
                          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                          placeholder="John Doe" required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Phone Number</label>
                        <input name="phone" value={form.phone} onChange={handleChange}
                          style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                          onFocus={e => e.target.style.borderColor = '#16a34a'}
                          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                          placeholder="08012345678" required />
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Email (optional)</label>
                      <input name="email" value={form.email} onChange={handleChange}
                        style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                        onFocus={e => e.target.style.borderColor = '#16a34a'}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                        placeholder="john@email.com" />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Delivery Address</label>
                      <textarea name="address" value={form.address} onChange={handleChange}
                        style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'none', transition: 'border-color 0.2s' }}
                        onFocus={e => e.target.style.borderColor = '#16a34a'}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                        placeholder="Enter your delivery address" rows="3" required />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Additional Notes (optional)</label>
                      <textarea name="notes" value={form.notes} onChange={handleChange}
                        style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'none', transition: 'border-color 0.2s' }}
                        onFocus={e => e.target.style.borderColor = '#16a34a'}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                        placeholder="Any special instructions..." rows="2" />
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button type="button" onClick={() => setStep('shop')}
                        style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', padding: '13px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                        onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}>
                        ← Back
                      </button>
                      <button type="submit" disabled={loading}
                        style={{ flex: 2, background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none', borderRadius: '10px', padding: '13px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 6px 18px rgba(22,163,74,0.3)', transition: 'transform 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                        {loading ? 'Placing Order...' : 'Place Order'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 20px 0' }}>Order Summary</h2>
                <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #eef2f6' }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <img src={item.image} alt={item.name} style={{ width: '34px', height: '34px', borderRadius: '8px', objectFit: 'cover', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} />
                          <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: 0 }}>{item.name}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <button onClick={() => updateQty(item.id, item.quantity - 1)}
    style={{ width: '24px', height: '24px', border: '1px solid #e2e8f0', borderRadius: '50%', backgroundColor: 'white', cursor: 'pointer', fontSize: '14px' }}>-</button>
  <input
    type="number"
    min="1"
    value={item.quantity}
    onChange={(e) => {
      const val = parseInt(e.target.value)
      if (!isNaN(val) && val >= 1) updateQty(item.id, val)
    }}
    style={{
      width: '48px', textAlign: 'center', fontSize: '13px', color: '#1e293b',
      border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 2px',
      outline: 'none', MozAppearance: 'textfield',
    }}
  />
  <span style={{ fontSize: '13px', color: '#64748b' }}>{item.unit}</span>
  <button onClick={() => updateQty(item.id, item.quantity + 1)}
    style={{ width: '24px', height: '24px', border: '1px solid #e2e8f0', borderRadius: '50%', backgroundColor: 'white', cursor: 'pointer', fontSize: '14px' }}>+</button>
</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0 }}>₦{(item.price * item.quantity).toLocaleString()}</p>
                        <button onClick={() => removeFromCart(item.id)}
                          style={{ fontSize: '11px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: '600' }}>Remove</button>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>Total</span>
                    <span style={{ fontSize: '22px', fontWeight: '800', color: '#16a34a' }}>₦{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderPage