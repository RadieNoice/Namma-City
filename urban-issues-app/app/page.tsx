import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-white mb-6 text-balance">Report Urban Issues</h1>
          <p className="text-xl text-slate-300 mb-8 text-pretty">
            Help improve your community by reporting potholes, broken streetlights, graffiti, and other urban problems.
            Together, we can make our cities better.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-white border-white hover:bg-white hover:text-slate-900 bg-transparent"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Report Issues</h3>
              <p className="text-slate-300">Easily report problems with photos and location data</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Community Driven</h3>
              <p className="text-slate-300">Work together to identify and solve urban problems</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Track Progress</h3>
              <p className="text-slate-300">Monitor the status of reported issues and their resolution</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
