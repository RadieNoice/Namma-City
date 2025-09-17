import { IssuesDashboard } from "@/components/issues-dashboard"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Issues Dashboard</h1>
            <p className="text-slate-300">Track and manage reported urban issues in your community</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-300 text-sm">Welcome, {user.email}</span>
            <form action="/auth/signout" method="post">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white hover:bg-white hover:text-slate-900 bg-transparent"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>

        {/* Dashboard Content */}
        <IssuesDashboard />
      </div>
    </div>
  )
}
