"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "./AuthContext" // adjust path if needed

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div> // optional: spinner

  if (!user) {
    return <Navigate to="/Login" replace />
  }

  return children
}

export default ProtectedRoute
