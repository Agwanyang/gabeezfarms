import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { Navigate } from 'react-router-dom'

function RoleRoute({ children, allowedRoles }) {
  const [user, setUser] = useState(undefined)
  const [role, setRole] = useState(undefined)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const userDoc = await getDoc(doc(db, 'users', u.uid))
        setRole(userDoc.exists() ? userDoc.data().role : null)
      } else {
        setRole(null)
      }
    })
    return () => unsub()
  }, [])

  if (user === undefined || role === undefined) return <div className="p-8 text-gray-500">Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (!allowedRoles.includes(role)) return <Navigate to="/login" />
  return children
}

export default RoleRoute