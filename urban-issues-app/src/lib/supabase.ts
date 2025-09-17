import { createClient } from "@supabase/supabase-js"
import AsyncStorage from "@react-native-async-storage/async-storage"
import "react-native-url-polyfill/auto"

const supabaseUrl = "https://aijlfwseguonlbidloul.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpamxmd3NlZ3VvbmxiaWRsb3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNTgwMDgsImV4cCI6MjA3MjkzNDAwOH0.2XFuGM5yZG7d5IkPOwv_vlgCFkGkMrPfTmVT_8P97hE"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
