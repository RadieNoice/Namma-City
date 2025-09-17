"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet } from "react-native"
import { supabase } from "../lib/supabase"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error("Error checking user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    )
  }

  if (!user) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <View style={styles.unauthenticatedContainer}>
        <Text style={styles.unauthenticatedText}>Please sign in to continue</Text>
      </View>
    )
  }

  return <>{children}</>
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    color: "#64748b",
    fontSize: 16,
  },
  unauthenticatedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  unauthenticatedText: {
    color: "#64748b",
    fontSize: 18,
    textAlign: "center",
  },
})
