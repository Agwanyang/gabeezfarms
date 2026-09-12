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
      <div className={`page-content${isMobile ? ' is-mobile' : ''}`}>
        {children}
      </div>
    </div>
  )
}

export default PageLayout