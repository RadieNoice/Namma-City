"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Navigation, Search } from "lucide-react"

interface LocationData {
  latitude: number
  longitude: number
  address: string
}

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void
  initialLocation?: LocationData | null
}

export function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const [location, setLocation] = useState<LocationData | null>(initialLocation || null)
  const [manualAddress, setManualAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation)
      setManualAddress(initialLocation.address)
    }
  }, [initialLocation])

  const getCurrentLocation = () => {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          // Simple reverse geocoding fallback
          const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`

          const locationData = { latitude, longitude, address }
          setLocation(locationData)
          setManualAddress(address)
          onLocationSelect(locationData)
        } catch (err) {
          const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          const locationData = { latitude, longitude, address }
          setLocation(locationData)
          setManualAddress(address)
          onLocationSelect(locationData)
        }

        setLoading(false)
      },
      (error) => {
        setError(`Location error: ${error.message}`)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }

  const searchAddress = async () => {
    if (!manualAddress.trim()) return

    setLoading(true)
    setError(null)

    try {
      // For demo purposes, we'll create a mock geocoding result
      // In a real app, you'd use a geocoding service like Google Maps API
      const mockCoordinates = {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.006 + (Math.random() - 0.5) * 0.1,
        address: manualAddress,
      }

      setLocation(mockCoordinates)
      onLocationSelect(mockCoordinates)
    } catch (err) {
      setError("Failed to find location. Please try again.")
    }

    setLoading(false)
  }

  const clearLocation = () => {
    setLocation(null)
    setManualAddress("")
    setError(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={getCurrentLocation}
          disabled={loading}
          className="flex items-center gap-2 bg-transparent"
        >
          <Navigation className="w-4 h-4" />
          {loading ? "Getting location..." : "Use Current Location"}
        </Button>

        <div className="flex gap-2 flex-1">
          <Input
            placeholder="Enter address or location"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchAddress()}
          />
          <Button type="button" variant="outline" onClick={searchAddress} disabled={loading || !manualAddress.trim()}>
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {location && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Location Selected</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{location.address}</p>
                <p className="text-xs text-muted-foreground">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={clearLocation}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
