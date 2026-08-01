import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import babyCucumber from '../assets/images/Babycucumber.jpeg'
import bellPepper from '../assets/images/Bell Pepper.jpeg'
import broilers from '../assets/images/broilers.jpg'
import greenYellow from '../assets/images/GREEN AND YELLOW.jpeg'
import greenhouse from '../assets/images/Greenhouse.jpg'
import greenhouse2 from '../assets/images/Greenhouse2.jpg'
import redGreenPepper from '../assets/images/red and green pepper.jpeg'

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

function AnimSection({ children, className = '', delay = 0 }) {
  const [ref, inView] = useInView()
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(40px)',
      transition: 'opacity 0.7s ease ' + delay + 'ms, transform 0.7s ease ' + delay + 'ms'
    }}>
      {children}
    </div>
  )
}

function ImageCarousel({ images, height = 420 }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % images.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [images.length])

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
      {images.map((img, i) => (
        <img
          key={i}
          src={img.src}
          alt={img.alt}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: i === index ? 1 : 0,
            transform: i === index ? 'scale(1)' : 'scale(1.05)',
            transition: 'opacity 1s ease, transform 6s ease',
          }}
        />
      ))}

      {/* Caption overlay */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '32px 24px 20px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
      }}>
        <span style={{ color: 'white', fontWeight: 700, fontSize: 14, letterSpacing: '0.02em' }}>
          {images[index].alt}
        </span>
      </div>

      {/* Dots */}
      <div style={{ position: 'absolute', bottom: 14, right: 20, display: 'flex', gap: 6 }}>
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            style={{
              width: i === index ? 20 : 7,
              height: 7,
              borderRadius: 4,
              border: 'none',
              background: i === index ? '#4ade80' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [count, setCount] = useState({ years: 0, customers: 0, products: 0 })
  const [countRef, countInView] = useInView()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!countInView) return
    const targets = { years: 4, customers: 500, products: 5 }
    const duration = 1500
    const steps = 60
    const interval = duration / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount({
        years: Math.round(targets.years * ease),
        customers: Math.round(targets.customers * ease),
        products: Math.round(targets.products * ease),
      })
      if (step >= steps) clearInterval(timer)
    }, interval)
    return () => clearInterval(timer)
  }, [countInView])

  return (
    <div className="font-sans overflow-x-hidden" style={{ scrollBehavior: 'smooth' }}>

      {/* NAVBAR */}
      <nav className={'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ' + (scrolled ? 'bg-white shadow-lg py-3' : 'bg-transparent py-5')}>
        <div className="max-w-6xl mx-auto px-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-700 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md">G</div>
            <div>
              <div className={scrolled ? 'text-green-900 font-black text-base' : 'text-white font-black text-base'}>Gabeez Green Farms</div>
              <div className={scrolled ? 'text-green-600 text-xs' : 'text-green-300 text-xs'}>Fresh. Natural. Trusted.</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['About', 'Products', 'Why Us', 'Contact'].map((item, i) => (
              <a key={i} href={'#' + item.toLowerCase().replace(' ', '-')}
                className={'text-sm font-medium transition-colors ' + (scrolled ? 'text-gray-600 hover:text-green-700' : 'text-white/80 hover:text-white')}>
                {item}
              </a>
            ))}
            <Link to="/blog" className={'text-sm font-medium transition-colors ' + (scrolled ? 'text-gray-600 hover:text-green-700' : 'text-white/80 hover:text-white')}>
             Blog
            </Link>
            <Link to="/shop" className="bg-green-500 hover:bg-green-400 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-green-400/30 hover:scale-105">
              Order Now
            </Link>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className={'md:hidden p-2 rounded-lg ' + (scrolled ? 'text-gray-700' : 'text-white')}>
            <div className={'w-5 h-0.5 bg-current transition-all ' + (menuOpen ? 'rotate-45 translate-y-1.5' : '')} style={{ marginBottom: menuOpen ? 0 : 4 }}></div>
            <div className={'w-5 h-0.5 bg-current transition-all ' + (menuOpen ? 'opacity-0' : '')} style={{ marginBottom: 4 }}></div>
            <div className={'w-5 h-0.5 bg-current transition-all ' + (menuOpen ? '-rotate-45 -translate-y-1.5' : '')}></div>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-5 py-4 flex flex-col gap-4 shadow-xl">
            {['About', 'Products', 'Why Us', 'Contact'].map((item, i) => (
              <a key={i} href={'#' + item.toLowerCase().replace(' ', '-')}
                onClick={() => setMenuOpen(false)} className="text-gray-700 text-sm font-medium hover:text-green-600">
                {item}
              </a>
            ))}
            <Link to="/blog" className={'text-sm font-medium transition-colors ' + (scrolled ? 'text-gray-600 hover:text-green-700' : 'text-white/80 hover:text-white')}>
             Blog
            </Link>
            <Link to="/shop" onClick={() => setMenuOpen(false)} className="bg-green-600 text-white px-5 py-3 rounded-xl text-sm font-bold text-center">
              Order Now
            </Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <div className="min-h-screen relative overflow-hidden flex items-center" style={{ background: 'linear-gradient(135deg, #052e16 0%, #064e3b 40%, #065f46 100%)' }}>
        {/* Animated background circles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)', animation: 'pulse 4s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', animation: 'pulse 6s ease-in-out infinite reverse' }} />
          <div style={{ position: 'absolute', top: '40%', left: '40%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)', animation: 'pulse 5s ease-in-out infinite 1s' }} />
        </div>

        <style>{`
          @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.1); opacity: 1; } }
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
          @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .hero-badge { animation: fadeInUp 0.6s ease forwards; }
          .hero-title { animation: fadeInUp 0.8s ease 0.2s both; }
          .hero-sub { animation: fadeInUp 0.8s ease 0.4s both; }
          .hero-btns { animation: fadeInUp 0.8s ease 0.6s both; }
          .hero-cards { animation: slideInRight 0.8s ease 0.4s both; }
          .float-card { animation: float 3s ease-in-out infinite; }
          .float-card-2 { animation: float 3s ease-in-out infinite 0.5s; }
          .float-card-3 { animation: float 3s ease-in-out infinite 1s; }
          .float-card-4 { animation: float 3s ease-in-out infinite 1.5s; }
          .shimmer-text { background: linear-gradient(90deg, #4ade80, #86efac, #4ade80); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: shimmer 3s linear infinite; }
          .product-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
          .product-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
          .why-card { transition: transform 0.3s ease, background 0.3s ease; }
          .why-card:hover { transform: translateY(-4px); background: rgba(255,255,255,0.12) !important; }
          .nav-link-underline { position: relative; }
          .nav-link-underline::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px; background: #22c55e; transition: width 0.3s ease; }
          .nav-link-underline:hover::after { width: 100%; }
        `}</style>

        <div className="relative max-w-6xl mx-auto px-5 pt-28 pb-20 w-full">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="hero-badge inline-flex items-center gap-2 mb-8" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 100, padding: '8px 18px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
                <span style={{ color: '#86efac', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Now Accepting Orders</span>
              </div>

              <h1 className="hero-title text-5xl md:text-6xl font-black text-white leading-none mb-3" style={{ opacity: 0 }}>
                Always Fresh
              </h1>
              <h1 className="hero-title text-5xl md:text-6xl font-black leading-none mb-3 shimmer-text" style={{ opacity: 0, animationDelay: '0.1s' }}>
                From The Farm
              </h1>
              <h2 className="hero-title text-2xl md:text-3xl font-bold text-green-200/80 leading-tight mb-6" style={{ opacity: 0, animationDelay: '0.2s' }}>
                Down To Your Household
              </h2>

              <p className="hero-sub text-green-100/60 text-base leading-relaxed mb-10 max-w-md" style={{ opacity: 0 }}>
                Gabeez Green Farms delivers premium greenhouse-grown bell peppers, baby cucumbers and broilers — fresh from our greenhouses to your doorstep since 2022.
              </p>

              <div className="hero-btns flex flex-wrap gap-4" style={{ opacity: 0 }}>
                <Link to="/shop" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', padding: '14px 36px', borderRadius: 50, fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: '0 8px 30px rgba(34,197,94,0.4)', transition: 'all 0.3s', display: 'inline-block' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(34,197,94,0.5)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(34,197,94,0.4)' }}>
                  Order Now →
                </Link>
                <a href="#products" style={{ border: '2px solid rgba(255,255,255,0.2)', color: 'white', padding: '14px 36px', borderRadius: 50, fontWeight: 700, fontSize: 15, textDecoration: 'none', transition: 'all 0.3s', display: 'inline-block' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#4ade80'; e.currentTarget.style.color = '#4ade80' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white' }}>
                  See Products
                </a>
              </div>
            </div>

            {/* Hero floating product cards */}


            <div className="hero-cards hidden md:grid grid-cols-2 gap-4" style={{ opacity: 0 }}>
              {[
                { emoji: '', name: 'Green and Yellow Peppers', sub: 'Crisp & Fresh', cls: 'float-card', bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)' },
                { emoji: '', name: 'Red Peppers', sub: 'Rich in Vitamin C', cls: 'float-card-2', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)' },
                { name: 'Baby Cucumbers', sub: 'Farm Fresh', cls: 'float-card-3', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
                { emoji: '', name: 'Broilers', sub: 'Naturally Raised', cls: 'float-card-4', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
              ].map((item, i) => (
                <div key={i} className={item.cls} style={{ background: item.bg, border: '1px solid ' + item.border, borderRadius: 20, padding: 20, backdropFilter: 'blur(10px)' }}>
                  <div style={{ fontSize: 48, marginBottom: 10 }}>{item.emoji}</div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{item.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2">
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll</span>
            <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)', animation: 'pulse 2s infinite' }}></div>
          </div>
        </div>
      </div>

      {/* STATS COUNTER */}
      <div ref={countRef} style={{ background: 'linear-gradient(90deg, #15803d, #059669)', padding: '48px 20px' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: count.years + '+', label: 'Years Growing' },
            { value: count.customers + '+', label: 'Happy Customers' },
            { value: count.products, label: 'Product Types' },
          ].map((stat, i) => (
            <div key={i}>
              <div style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: 'white', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FARM GALLERY - ABOVE ABOUT */}
      <div className="py-16 px-5 bg-white">
        <div className="max-w-6xl mx-auto">
          <AnimSection>
            <ImageCarousel
              images={[
                { src: greenhouse, alt: 'Our Greenhouse' },
                { src: greenhouse2, alt: 'Inside the Greenhouse' },
                { src: bellPepper, alt: 'Fresh Bell Peppers' },
                { src: greenYellow, alt: 'Green & Yellow Peppers' },
              ]}
              height={420}
            />
          </AnimSection>
        </div>
      </div>

      {/* ABOUT */}
      <div id="about" className="py-24 px-5 bg-white">
        <div className="max-w-6xl mx-auto">
          <AnimSection className="text-center mb-16">
            <p className="text-green-600 text-xs font-bold uppercase tracking-widest mb-3">Our Story</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Growing With Purpose</h2>
            <div style={{ width: 60, height: 4, background: 'linear-gradient(90deg, #16a34a, #059669)', borderRadius: 2, margin: '0 auto' }}></div>
          </AnimSection>

          <div className="grid md:grid-cols-2 gap-16 items-start">
            <AnimSection delay={100}>
              <p className="text-gray-600 leading-relaxed text-base mb-5">
                Gabeez Green Farms was founded with a simple but powerful mission — to bring the freshest, most nutritious greenhouse-grown produce directly to Nigerian households and businesses.
              </p>
              <p className="text-gray-600 leading-relaxed text-base mb-5">
                Our greenhouse utilizes a <span className="text-green-600 font-semibold">drip irrigation system</span> — an efficient water management technology that delivers water directly to the root zone of plants. This method minimizes water wastage, promotes healthy crop growth, and ensures optimal moisture levels within our greenhouse environment.
              </p>
              <p className="text-gray-600 leading-relaxed text-base mb-8">
                Over the years we have refined our growing techniques, expanded our product range, and built lasting relationships with our growing community of satisfied customers.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '🌱', text: 'Greenhouse Controlled' },
                  { icon: '💧', text: 'Drip Irrigation' },
                  { icon: '✅', text: 'Quality Inspected' },
                  { icon: '🚚', text: 'Fast Delivery' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '10px 14px', transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#14532d' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </AnimSection>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '🌿', title: 'Sustainable Farming', desc: 'Eco-friendly practices that protect the environment for future generations', color: '#dcfce7', border: '#86efac' },
                { icon: '🔬', title: 'Modern Techniques', desc: 'Drip irrigation and greenhouse tech for optimal crop growth all year', color: '#ecfdf5', border: '#6ee7b7' },
                { icon: '👨‍🌾', title: 'Expert Team', desc: 'Experienced farmers with deep agricultural knowledge and passion', color: '#f0fdfa', border: '#99f6e4' },
                { icon: '📋', title: 'Full Traceability', desc: 'Every product tracked from greenhouse to your doorstep', color: '#ecfeff', border: '#a5f3fc' },
              ].map((item, i) => (
                <AnimSection key={i} delay={i * 100}>
                  <div style={{ background: item.color, border: '1px solid ' + item.border, borderRadius: 20, padding: 20, height: '100%', transition: 'transform 0.3s, box-shadow 0.3s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#064e3b', marginBottom: 6 }}>{item.title}</h3>
                    <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </AnimSection>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCTS */}
      <div id="products" style={{ background: '#f8fafc', padding: '96px 20px' }}>
        <div className="max-w-6xl mx-auto">
          <AnimSection className="text-center mb-16">
            <p className="text-green-600 text-xs font-bold uppercase tracking-widest mb-3">What We Grow</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Farm Fresh Products</h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm">Grown with care, harvested at peak freshness, delivered with pride.</p>
            <div style={{ width: 60, height: 4, background: 'linear-gradient(90deg, #16a34a, #059669)', borderRadius: 2, margin: '16px auto 0' }}></div>
          </AnimSection>

          {/* Bell Peppers section */}
          <AnimSection delay={100}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }}></div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>Bell Peppers</span>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }}></div>
            </div>
          </AnimSection>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {[
              { name: 'Green Bell Pepper', desc: 'Crisp and sweet with a fresh garden taste. Perfect for stir-fries, salads and cooking.', tag: 'Most Popular', tagBg: '#dcfce7', tagColor: '#15803d', headerBg: 'linear-gradient(135deg, #16a34a, #052e16)', delay: 0 },
              { name: 'Yellow Bell Pepper', desc: 'Sweet and fruity with a mild flavour. Great for roasting, grilling and garnishing dishes.', tag: 'Sweet & Mild', tagBg: '#fef9c3', tagColor: '#854d0e', headerBg: 'linear-gradient(135deg, #d97706, #92400e)', delay: 100 },
              {  name: 'Red Bell Pepper', desc: 'The sweetest of all peppers, rich in Vitamin C. Ideal for stuffing and sauces.', tag: 'Vitamin Rich', tagBg: '#fee2e2', tagColor: '#991b1b', headerBg: 'linear-gradient(135deg, #dc2626, #7f1d1d)', delay: 200 },
            ].map((product, i) => (
              <AnimSection key={i} delay={product.delay}>
                <div className="product-card bg-white rounded-3xl overflow-hidden shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
                  <div style={{ background: product.headerBg, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, position: 'relative' }}>
                    <span style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>{product.emoji}</span>
                  </div>
                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <h3 style={{ fontWeight: 700, color: '#111827', fontSize: 14 }}>{product.name}</h3>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: product.tagBg, color: product.tagColor }}>{product.tag}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{product.desc}</p>
                  </div>
                </div>
              </AnimSection>
            ))}
          </div>

          {/* More products */}
          <AnimSection delay={100}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }}></div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>More From Our Farm</span>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }}></div>
            </div>
          </AnimSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {name: 'Baby Cucumbers', desc: 'Tender, crunchy and perfectly sized baby cucumbers grown in our controlled greenhouse environment. Fresh, crisp and full of flavour — perfect for snacking, salads, and pickling.', tag: 'Farm Fresh', tagBg: '#d1fae5', tagColor: '#065f46', headerBg: 'linear-gradient(135deg, #059669, #064e3b)', delay: 0 },
              {name: 'Broilers', desc: 'Healthy, well-fed broilers raised in a clean and spacious environment. No harmful additives — just natural, high-quality poultry your family can trust and enjoy.', tag: 'Naturally Raised', tagBg: '#fed7aa', tagColor: '#9a3412', headerBg: 'linear-gradient(135deg, #f97316, #7c2d12)', delay: 150 },
            ].map((product, i) => (
              <AnimSection key={i} delay={product.delay}>
                <div className="product-card bg-white rounded-3xl overflow-hidden shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
                  <div style={{ background: product.headerBg, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>
                    <span style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>{product.emoji}</span>
                  </div>
                  <div style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <h3 style={{ fontWeight: 700, color: '#111827', fontSize: 16 }}>{product.name}</h3>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: product.tagBg, color: product.tagColor }}>{product.tag}</span>
                    </div>
                    <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>{product.desc}</p>
                  </div>
                </div>
              </AnimSection>
            ))}
          </div>
        </div>
      </div>

      {/* FARM GALLERY - BELOW PRODUCTS */}
      <div className="py-16 px-5 bg-white">
        <div className="max-w-6xl mx-auto">
          <AnimSection>
            <ImageCarousel
              images={[
                { src: babyCucumber, alt: 'Baby Cucumbers' },
                { src: broilers, alt: 'Our Broilers' },
                { src: redGreenPepper, alt: 'Red & Green Peppers' },
              ]}
              height={380}
            />
          </AnimSection>
        </div>
      </div>

      {/* WHY CHOOSE US */}
      <div id="why-us" style={{ background: 'linear-gradient(135deg, #052e16 0%, #064e3b 100%)', padding: '96px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

        <div className="max-w-6xl mx-auto relative">
          <AnimSection className="text-center mb-16">
            <p style={{ color: '#4ade80', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Why Choose Us</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: 'white', marginBottom: 12 }}>The Gabeez Difference</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 400, margin: '0 auto', fontSize: 14 }}>
              We know what it takes to deliver excellence every single time.
            </p>
          </AnimSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { icon: '🏆', title: '4 Years Strong', desc: 'Building a reputation for excellence since 2022 with consistent quality.' },
              { icon: '🌡️', title: 'Climate Controlled', desc: 'State-of-the-art greenhouses maintain perfect growing conditions year-round.' },
              { icon: '✅', title: 'Quality Inspected', desc: 'Every product passes strict quality checks before reaching your doorstep.' },
              { icon: '🚚', title: 'Same Day Delivery', desc: 'Harvested and delivered fresh on the same day for maximum quality.' },
              { icon: '📦', title: 'Bulk Orders', desc: 'Serving both individual households and large commercial buyers with ease.' },
              { icon: '🤝', title: 'Community Trusted', desc: 'Hundreds of satisfied customers trust us for their daily fresh produce.' },
            ].map((item, i) => (
              <AnimSection key={i} delay={i * 80}>
                <div className="why-card" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 24, cursor: 'default' }}>
                  <div style={{ fontSize: 32, marginBottom: 14 }}>{item.icon}</div>
                  <h3 style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </AnimSection>
            ))}
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div style={{ background: 'white', padding: '80px 20px' }}>
        <div className="max-w-5xl mx-auto">
          <AnimSection className="text-center mb-14">
            <p className="text-green-600 text-xs font-bold uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">What Customers Say</h2>
          </AnimSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: 'The bell peppers from Gabeez Green Farms are always so fresh and vibrant. Best quality I have found in the market!', name: 'Mrs. Adaeze O.', role: 'Regular Customer' },
              { quote: 'We order in bulk for our restaurant every week. Consistent quality, great pricing, and always on time. Highly recommend!', name: 'Chef Emeka N.', role: 'Restaurant Owner' },
              { quote: 'The baby cucumbers are perfect for our salads. My family loves the freshness and taste. Will keep ordering!', name: 'Mr. Babatunde L.', role: 'Household Customer' },
            ].map((t, i) => (
              <AnimSection key={i} delay={i * 100}>
                <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: 20, padding: 24, height: '100%', transition: 'transform 0.3s, box-shadow 0.3s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(22,163,74,0.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                  <div style={{ color: '#16a34a', fontSize: 36, lineHeight: 1, marginBottom: 12 }}>"</div>
                  <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{t.quote}</p>
                  <div style={{ borderTop: '1px solid #bbf7d0', paddingTop: 14 }}>
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: 14 }}>{t.name}</div>
                    <div style={{ color: '#16a34a', fontSize: 12 }}>{t.role}</div>
                  </div>
                </div>
              </AnimSection>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <AnimSection>
        <div style={{ background: 'linear-gradient(135deg, #16a34a, #059669)', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: 'white', marginBottom: 16 }}>Ready for Fresh Produce?</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, lineHeight: 1.7, marginBottom: 36 }}>
              Join hundreds of satisfied customers. Place your order today and experience the Gabeez Green Farms difference!
            </p>
            <Link to="/shop" style={{ display: 'inline-block', background: 'white', color: '#15803d', padding: '16px 48px', borderRadius: 50, fontWeight: 900, fontSize: 16, textDecoration: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.2)', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)' }}>
              Order Fresh Now →
            </Link>
          </div>
        </div>
      </AnimSection>

      {/* CONTACT */}
      <div id="contact" style={{ background: '#f8fafc', padding: '80px 20px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <AnimSection className="text-center mb-12">
            <p className="text-green-600 text-xs font-bold uppercase tracking-widest mb-3">Contact Us</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Get In Touch</h2>
            <p className="text-gray-500 text-sm">Ready to order or have questions? We love hearing from you.</p>
          </AnimSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            <AnimSection delay={0}>
              <a href="tel:+2348102861873" style={{ background: 'white', borderRadius: 20, padding: 28, textAlign: 'center', textDecoration: 'none', display: 'block', border: '1px solid #e5e7eb', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(22,163,74,0.12)'; e.currentTarget.style.borderColor = '#86efac' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e5e7eb' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 14px' }}>📞</div>
                <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 6 }}>Call Us</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 6 }}>+234 810 286 1873</p>
                <p style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>Tap to call →</p>
              </a>
            </AnimSection>

            <AnimSection delay={150}>
              <a href="mailto:agdaniel159@yahoo.com" style={{ background: 'white', borderRadius: 20, padding: 28, textAlign: 'center', textDecoration: 'none', display: 'block', border: '1px solid #e5e7eb', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(59,130,246,0.12)'; e.currentTarget.style.borderColor = '#bfdbfe' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e5e7eb' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 14px' }}>✉️</div>
                <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 6 }}>Email Us</p>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 6 }}>agdaniel159@yahoo.com</p>
                <p style={{ fontSize: 12, color: '#2563eb', fontWeight: 600 }}>Send us a message →</p>
              </a>
            </AnimSection>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ background: '#0a0a0a', padding: '48px 20px' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 24, marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #4ade80, #16a34a)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 18 }}>G</div>
              <div>
                <div style={{ color: 'white', fontWeight: 900, fontSize: 15 }}>Gabeez Green Farms</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Fresh. Natural. Trusted.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              {['About', 'Products', 'Why Us', 'Contact'].map((item, i) => (
                <a key={i} href={'#' + item.toLowerCase().replace(' ', '-')} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#4ade80'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                  {item}
                </a>
              ))}
            </div>
            {/* <Link to="/shop" style={{ background: '#16a34a', color: 'white', padding: '10px 24px', borderRadius: 50, fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#22c55e'}
              onMouseLeave={e => e.currentTarget.style.background = '#16a34a'}>
              Order Now
            </Link> */}
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginBottom: 4 }}>Always Fresh From The Greenhouse Down To Your Household</p>
            <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, marginBottom: 8 }}>2026 Gabeez Green Farms. All rights reserved.</p>
            <Link to="/login" style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.15)'}>
              ©
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}

export default LandingPage