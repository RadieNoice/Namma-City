const supabaseUrl = "https://aijlfwseguonlbidloul.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpamxmd3NlZ3VvbmxiaWRsb3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNTgwMDgsImV4cCI6MjA3MjkzNDAwOH0.2XFuGM5yZG7d5IkPOwv_vlgCFkGkMrPfTmVT_8P97hE"

// Mock Supabase client for preview environment
export function createClient() {
  return {
    auth: {
      signUp: async (credentials: any) => {
        console.log("[v0] Mock signUp called with:", credentials)
        return { data: { user: { id: "mock-user", email: credentials.email } }, error: null }
      },
      signInWithPassword: async (credentials: any) => {
        console.log("[v0] Mock signIn called with:", credentials)
        return { data: { user: { id: "mock-user", email: credentials.email } }, error: null }
      },
      signOut: async () => {
        console.log("[v0] Mock signOut called")
        return { error: null }
      },
      getUser: async () => {
        console.log("[v0] Mock getUser called")
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
        console.log("[v0] Mock insert to", table, "with data:", data)
        return Promise.resolve({ data: [{ id: Date.now(), ...data }], error: null })
      },
      update: (data: any) => ({
        eq: (column: string, value: any) => {
          console.log("[v0] Mock update to", table, "with data:", data)
          return Promise.resolve({ data: [{ id: value, ...data }], error: null })
        },
      }),
    }),
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, file: File) => {
          console.log("[v0] Mock storage upload to", bucket, "path:", path)
          return { data: { path }, error: null }
        },
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `/placeholder.svg?height=200&width=300&query=uploaded-image` },
        }),
      }),
    },
  }
}
