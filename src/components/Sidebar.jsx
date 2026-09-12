// import { useState, useEffect } from 'react'
// import { Link, useLocation, useNavigate } from 'react-router-dom'
// import { signOut } from 'firebase/auth'
// import { auth } from '../firebase/config'
// import { collection, getDocs } from 'firebase/firestore'
// import { db } from '../firebase/config'

// function Sidebar() {
//   const location = useLocation()
//   const navigate = useNavigate()
//   const [isOpen, setIsOpen] = useState(false)
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
//   const [pendingCount, setPendingCount] = useState(0)

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 768)
//       if (window.innerWidth >= 768) setIsOpen(false)
//     }
//     window.addEventListener('resize', handleResize)
//     return () => window.removeEventListener('resize', handleResize)
//   }, [])

//   useEffect(() => {
//     setIsOpen(false)
//   }, [location.pathname])

//   useEffect(() => {
//     const fetchPending = async () => {
//       try {
//         const snapshot = await getDocs(collection(db, 'orders'))
//         const pending = snapshot.docs.filter(d => d.data().status === 'Pending').length
//         setPendingCount(pending)
//       } catch (err) {
//         console.error(err)
//       }
//     }
//     fetchPending()
//     const interval = setInterval(fetchPending, 30000)
//     return () => clearInterval(interval)
//   }, [location.pathname])

//   const handleLogout = async () => {
//     await signOut(auth)
//     navigate('/login')
//   }

//   const navLinks = [
//     { path: '/dashboard', label: 'Dashboard' },
//     { path: '/profit-loss', label: 'Profit & Loss' },
//     { path: '/production', label: 'Production' },
//     { path: '/harvest', label: 'Harvest' },
//     { path: '/sales', label: 'Sales Records' },
//     { path: '/agrochemicals', label: 'Chemicals' },
//     { path: '/fertilizers', label: 'Fertilizers' },
//     { path: '/observation-notes', label: 'Observations' },
//     { path: '/water-supply', label: 'Water Supply' },
//     { path: '/broilers', label: 'Broilers' },
//     { path: '/admin/orders', label: 'Orders', badge: pendingCount },
//     { path: '/admin/blog', label: 'Blogs'},
//     { path: '/audit-report', label: 'Audit Report' },
//   ]

//   const sidebarContent = (
//     <div style={{
//       width: '240px', background: 'linear-gradient(180deg, #0a3d1f, #0f4c2a)',
//       display: 'flex', flexDirection: 'column', height: '100vh',
//       boxShadow: '4px 0 20px rgba(0,0,0,0.15)', zIndex: 200,
//       position: 'fixed', top: 0, left: 0,
//       transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
//       transition: 'transform 0.3s ease',
//     }}>
//       {/* Header */}
//       <div style={{ padding: '28px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
//         <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '18px', marginBottom: '12px' }}>G</div>
//         <h2 style={{ color: 'white', fontSize: '15px', fontWeight: '700', margin: '0 0 4px 0' }}>Gabeez Green Farms</h2>
//         <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>Admin Panel</p>

//         {/* Notification Bell */}
//         {pendingCount > 0 && (
//           <Link to="/admin/orders" style={{
//             display: 'flex', alignItems: 'center', gap: '8px',
//             marginTop: '12px', backgroundColor: 'rgba(239,68,68,0.15)',
//             border: '1px solid rgba(239,68,68,0.3)',
//             borderRadius: '8px', padding: '8px 12px',
//             textDecoration: 'none'
//           }}>
//             <span style={{ fontSize: '16px' }}>🔔</span>
//             <span style={{ color: '#fca5a5', fontSize: '12px', fontWeight: '600' }}>
//               {pendingCount} pending {pendingCount === 1 ? 'order' : 'orders'}
//             </span>
//           </Link>
//         )}
//       </div>

//       {/* Nav Links */}
//       <nav style={{ flex: 1, padding: '16px 10px', overflowY: 'auto' }}>
//         {navLinks.map(link => {
//           const isActive = location.pathname === link.path
//           return (
//             <Link
//               key={link.path}
//               to={link.path}
//               onMouseEnter={e => {
//                 if (!isActive) {
//                   e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'
//                   e.currentTarget.style.color = 'white'
//                   e.currentTarget.style.borderLeft = '3px solid rgba(34,197,94,0.5)'
//                 }
//               }}
//               onMouseLeave={e => {
//                 if (!isActive) {
//                   e.currentTarget.style.backgroundColor = 'transparent'
//                   e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
//                   e.currentTarget.style.borderLeft = '3px solid transparent'
//                 }
//               }}
//               style={{
//                 display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//                 padding: '10px 14px', borderRadius: '8px', marginBottom: '2px',
//                 color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
//                 backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
//                 textDecoration: 'none', fontSize: '14px',
//                 fontWeight: isActive ? '600' : '400',
//                 borderLeft: isActive ? '3px solid #22c55e' : '3px solid transparent',
//                 transition: 'all 0.2s',
//               }}
//             >
//               <span>{link.label}</span>
//               {link.badge > 0 && (
//                 <span style={{
//                   backgroundColor: '#ef4444',
//                   color: 'white',
//                   fontSize: '11px',
//                   fontWeight: '700',
//                   padding: '2px 7px',
//                   borderRadius: '20px',
//                   minWidth: '20px',
//                   textAlign: 'center'
//                 }}>
//                   {link.badge}
//                 </span>
//               )}
//             </Link>
//           )
//         })}
//       </nav>

//       {/* Sign Out */}
//       <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
//         <button
//           onClick={handleLogout}
//           onMouseEnter={e => {
//             e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.2)'
//             e.currentTarget.style.color = '#fca5a5'
//             e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'
//           }}
//           onMouseLeave={e => {
//             e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'
//             e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
//             e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
//           }}
//           style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}
//         >
//           Sign Out
//         </button>
//       </div>
//     </div>
//   )

//   return (
//     <>
//       {/* Mobile top bar */}
//       {isMobile && (
//         <div style={{
//           position: 'fixed', top: 0, left: 0, right: 0, height: '56px',
//           background: '#0a3d1f', display: 'flex', alignItems: 'center',
//           padding: '0 16px', zIndex: 150, boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
//         }}>
//           <button
//             onClick={() => setIsOpen(!isOpen)}
//             style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', flexDirection: 'column', gap: '5px' }}
//           >
//             <span style={{ display: 'block', width: '22px', height: '2px', background: 'white', borderRadius: '1px' }}></span>
//             <span style={{ display: 'block', width: '22px', height: '2px', background: 'white', borderRadius: '1px' }}></span>
//             <span style={{ display: 'block', width: '22px', height: '2px', background: 'white', borderRadius: '1px' }}></span>
//           </button>
//           <span style={{ color: 'white', fontWeight: '700', fontSize: '15px', marginLeft: '14px' }}>Gabeez Farms</span>

//           {/* Mobile notification bell */}
//           {pendingCount > 0 && (
//             <Link to="/admin/orders" style={{
//               marginLeft: 'auto', display: 'flex', alignItems: 'center',
//               gap: '6px', textDecoration: 'none'
//             }}>
//               <span style={{ fontSize: '18px' }}>🔔</span>
//               <span style={{
//                 backgroundColor: '#ef4444', color: 'white',
//                 fontSize: '11px', fontWeight: '700',
//                 padding: '2px 6px', borderRadius: '20px'
//               }}>
//                 {pendingCount}
//               </span>
//             </Link>
//           )}
//         </div>
//       )}

//       {/* Overlay */}
//       {isMobile && isOpen && (
//         <div
//           onClick={() => setIsOpen(false)}
//           style={{
//             position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
//             zIndex: 190
//           }}
//         />
//       )}

//       {sidebarContent}
//     </>
//   )
// }

// export default Sidebar

import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../firebase/config'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [pendingCount, setPendingCount] = useState(0)
  const [role, setRole] = useState(undefined)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) setIsOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const userDoc = await getDoc(doc(db, 'users', u.uid))
        setRole(userDoc.exists() ? userDoc.data().role : 'admin')
      } else {
        setRole(null)
      }
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (role !== 'admin') return
    const fetchPending = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'orders'))
        const pending = snapshot.docs.filter(d => d.data().status === 'Pending').length
        setPendingCount(pending)
      } catch (err) {
        console.error(err)
      }
    }
    fetchPending()
    const interval = setInterval(fetchPending, 30000)
    return () => clearInterval(interval)
  }, [location.pathname, role])

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }

  const fullNavLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/production', label: 'Production' },
    { path: '/harvest', label: 'Harvest' },
    { path: '/sales', label: 'Sales Records' },
    { path: '/agrochemicals', label: 'Chemicals' },
    { path: '/fertilizers', label: 'Fertilizers' },
    { path: '/observation-notes', label: 'Observations' },
    { path: '/water-supply', label: 'Water Supply' },
    { path: '/broilers', label: 'Broilers' },
    { path: '/admin/orders', label: 'Orders', badge: pendingCount },
    { path: '/admin/blog', label: 'Blog' },
    { path: '/profit-loss', label: 'Profit & Loss' },
    { path: '/audit-report', label: 'Audit Report' },
  ]

  const roleNavLinks = {
    supervisor: [{ path: '/reports/supervisor', label: 'My Reports' }],
    manager: [{ path: '/reports/manager', label: 'Reports' }],
    ceo: [{ path: '/reports/ceo', label: 'All Reports' }],
  }

  const navLinks = role === 'admin' ? fullNavLinks : (roleNavLinks[role] || [])

  if (role === undefined) return null

  const sidebarContent = (
    <div
      className="sidebar-shell"
      style={{ transform: isMobile && !isOpen ? 'translateX(-120%)' : 'translateX(0)' }}
    >
      <div className="sidebar-brand">
        <div className="sidebar-logo">G</div>
        <h2>Gabeez Green Farms</h2>
        <p>
          {role === 'admin' ? 'Admin Panel' : role.charAt(0).toUpperCase() + role.slice(1) + ' Panel'}
        </p>

        {role === 'admin' && pendingCount > 0 && (
          <Link to="/admin/orders" className="sidebar-alert">
            <span style={{ fontSize: '16px' }}>🔔</span>
            <span style={{ color: '#fca5a5', fontSize: '12px', fontWeight: '600' }}>
              {pendingCount} pending {pendingCount === 1 ? 'order' : 'orders'}
            </span>
          </Link>
        )}
      </div>

      <nav className="sidebar-nav">
        {navLinks.map(link => {
          const isActive = location.pathname === link.path
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`sidebar-link${isActive ? ' is-active' : ''}`}
            >
              <span>{link.label}</span>
              {link.badge > 0 && (
                <span className="sidebar-badge">
                  {link.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="sidebar-signout"
        >
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {isMobile && (
        <div className="mobile-nav">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="mobile-menu-button"
          >
            <span></span><span></span><span></span>
          </button>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '15px', marginLeft: '14px' }}>Gabeez Farms</span>

          {role === 'admin' && pendingCount > 0 && (
            <Link to="/admin/orders" style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none'
            }}>
              <span style={{ fontSize: '18px' }}>🔔</span>
              <span style={{
                backgroundColor: '#ef4444', color: 'white', fontSize: '11px', fontWeight: '700',
                padding: '2px 6px', borderRadius: '20px'
              }}>
                {pendingCount}
              </span>
            </Link>
          )}
        </div>
      )}

      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="sidebar-overlay"
        />
      )}

      {sidebarContent}
    </>
  )
}

export default Sidebar