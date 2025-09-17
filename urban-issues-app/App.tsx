"use client"

import { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { View, Text, StyleSheet } from "react-native"

import { supabase } from "./src/lib/supabase"
import HomeScreen from "./src/screens/HomeScreen"
import LoginScreen from "./src/screens/LoginScreen"
import SignupScreen from "./src/screens/SignupScreen"
import ReportScreen from "./src/screens/ReportScreen"
import DashboardScreen from "./src/screens/DashboardScreen"

const Stack = createStackNavigator()

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check initial session
    checkUser()

    // Listen for auth changes
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
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
        <StatusBar style="light" />
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: "#1e293b",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          {user ? (
            <>
              <Stack.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                  title: "My Reports",
                  headerLeft: () => null, // Prevent going back
                }}
              />
              <Stack.Screen name="Report" component={ReportScreen} options={{ title: "Report Issue" }} />
            </>
          ) : (
            <>
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  title: "Urban Issues Reporter",
                  headerShown: false, // Hide header for home screen
                }}
              />
              <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Sign In" }} />
              <Stack.Screen name="Signup" component={SignupScreen} options={{ title: "Sign Up" }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e293b",
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "500",
  },
})
