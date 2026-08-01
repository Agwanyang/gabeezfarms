import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'
import { Navigate } from 'react-router-dom'

function PrivateRoute({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
    })
    return () => unsub()
  }, [])

  if (user === undefined) return <div className="p-8 text-gray-500">Loading...</div>
  if (!user) return <Navigate to="/login" />
  return children
}

export default PrivateRoute