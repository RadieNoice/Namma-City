"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Maximize2 } from "lucide-react"

interface Issue {
  id: string
  title: string
  description: string
  category: string
  status: string
  priority: string
  latitude?: number
  longitude?: number
  address?: string
  image_url?: string
  created_at: string
}

interface LocationMapProps {
  issues: Issue[]
  selectedIssue?: Issue | null
  onIssueSelect?: (issue: Issue) => void
  height?: string
}

export function LocationMap({ issues, selectedIssue, onIssueSelect, height = "400px" }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.log("Location access denied:", error)
          // Default to New York City if location access is denied
          setUserLocation({ lat: 40.7128, lng: -74.006 })
        },
      )
    } else {
      // Default location if geolocation is not supported
      setUserLocation({ lat: 40.7128, lng: -74.006 })
    }
  }, [])

  // Initialize map when user location is available
  useEffect(() => {
    if (!userLocation || !mapRef.current) return

    // Create a simple map visualization using CSS and HTML
    const mapContainer = mapRef.current
    mapContainer.innerHTML = ""

    // Create map background
    const mapBackground = document.createElement("div")
    mapBackground.className = "w-full h-full bg-slate-200 relative overflow-hidden rounded-lg"
    mapBackground.style.backgroundImage = `
      linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px),
      linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)
    `
    mapBackground.style.backgroundSize = "20px 20px"

    // Add issues as markers
    const issuesWithLocation = issues.filter((issue) => issue.latitude && issue.longitude)

    issuesWithLocation.forEach((issue, index) => {
      const marker = document.createElement("div")
      marker.className = `absolute w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10 hover:scale-110 transition-transform`

      // Color based on status
      const statusColors = {
        pending: "bg-yellow-500",
        in_progress: "bg-blue-500",
        resolved: "bg-green-500",
        rejected: "bg-red-500",
      }
      marker.className += ` ${statusColors[issue.status as keyof typeof statusColors] || "bg-gray-500"}`

      // Position marker (simplified positioning for demo)
      const x = 50 + (index % 5) * 15 + Math.random() * 10
      const y = 50 + Math.floor(index / 5) * 15 + Math.random() * 10
      marker.style.left = `${Math.min(Math.max(x, 10), 90)}%`
      marker.style.top = `${Math.min(Math.max(y, 10), 90)}%`

      // Add click handler
      marker.addEventListener("click", () => {
        if (onIssueSelect) {
          onIssueSelect(issue)
        }
      })

      // Add tooltip
      marker.title = `${issue.title} - ${issue.status}`

      mapBackground.appendChild(marker)
    })

    // Add user location marker
    const userMarker = document.createElement("div")
    userMarker.className =
      "absolute w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-20"
    userMarker.style.left = "50%"
    userMarker.style.top = "50%"
    userMarker.title = "Your Location"

    // Add pulsing animation
    const pulse = document.createElement("div")
    pulse.className =
      "absolute w-8 h-8 bg-blue-600 rounded-full opacity-30 animate-ping transform -translate-x-1/2 -translate-y-1/2"
    userMarker.appendChild(pulse)

    mapBackground.appendChild(userMarker)
    mapContainer.appendChild(mapBackground)

    setMapLoaded(true)
  }, [userLocation, issues, onIssueSelect])

  const issuesWithLocation = issues.filter((issue) => issue.latitude && issue.longitude)

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Issues Map
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{issuesWithLocation.length} issues with location</span>
          <Button variant="ghost" size="sm">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={mapRef} style={{ height }} className="w-full border rounded-lg">
          {!mapLoaded && (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Resolved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Rejected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span>Your Location</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
