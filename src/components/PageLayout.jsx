import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'

function PageLayout({ children }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{
        marginLeft: isMobile ? '0' : '296px',
        flex: 1,
        padding: isMobile ? '16px' : '32px',
        paddingTop: isMobile ? '72px' : '32px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {children}
      </div>
    </div>
  )
}

export default PageLayout