const supabaseUrl = "https://aijlfwseguonlbidloul.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpamxmd3NlZ3VvbmxiaWRsb3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNTgwMDgsImV4cCI6MjA3MjkzNDAwOH0.2XFuGM5yZG7d5IkPOwv_vlgCFkGkMrPfTmVT_8P97hE"

// Mock server Supabase client for preview environment
export function createServerSupabaseClient() {
  return {
    auth: {
      getUser: async () => {
        console.log("[v0] Mock server getUser called")
        return { data: { user: null }, error: null }
      },
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          data: [],
          error: null,
        }),
        order: (column: string, options?: any) => ({
          data: [],
          error: null,
        }),
      }),
      insert: (data: any) => {
        console.log("[v0] Mock server insert to", table, "with data:", data)
        return Promise.resolve({ data: [{ id: Date.now(), ...data }], error: null })
      },
    }),
  }
}
