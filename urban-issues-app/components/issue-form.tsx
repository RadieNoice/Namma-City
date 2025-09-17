"use client"

import type React from "react"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LocationPicker } from "./location-picker"
import { useRouter } from "next/navigation"
import { Camera } from "lucide-react"

const ISSUE_CATEGORIES = [
  { value: "road_maintenance", label: "Road Maintenance" },
  { value: "lighting", label: "Street Lighting" },
  { value: "vandalism", label: "Vandalism/Graffiti" },
  { value: "waste_management", label: "Waste Management" },
  { value: "public_safety", label: "Public Safety" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "parks_recreation", label: "Parks & Recreation" },
  { value: "other", label: "Other" },
]

const PRIORITY_LEVELS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
]

interface LocationData {
  latitude: number
  longitude: number
  address: string
}

export function IssueForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [priority, setPriority] = useState("medium")
  const [location, setLocation] = useState<LocationData | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("Image size must be less than 5MB")
        return
      }

      setImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `issue-images/${fileName}`

    const { error: uploadError } = await supabase.storage.from("images").upload(filePath, file)

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return null
    }

    const { data } = supabase.storage.from("images").getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("You must be logged in to report an issue")
        setLoading(false)
        return
      }

      let imageUrl = null
      if (image) {
        imageUrl = await uploadImage(image)
        if (!imageUrl) {
          setError("Failed to upload image. Please try again.")
          setLoading(false)
          return
        }
      }

      const issueData = {
        title,
        description,
        category,
        priority,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        address: location?.address || null,
        image_url: imageUrl,
        user_id: user.id,
      }

      const { error: insertError } = await supabase.from("issues").insert([issueData])

      if (insertError) {
        setError(insertError.message)
      } else {
        setSuccess(true)
        // Reset form
        setTitle("")
        setDescription("")
        setCategory("")
        setPriority("medium")
        setLocation(null)
        setImage(null)
        setImagePreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    }

    setLoading(false)
  }

  if (success) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-600">Issue Reported Successfully!</CardTitle>
          <CardDescription>
            Thank you for reporting this issue. We'll review it and update you on its status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => setSuccess(false)} className="w-full">
            Report Another Issue
          </Button>
          <Button onClick={() => router.push("/dashboard")} variant="outline" className="w-full">
            View All Issues
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Report an Issue</CardTitle>
        <CardDescription>Help improve your community by reporting urban problems that need attention.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Issue Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Brief description of the issue"
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Provide more details about the issue, including any relevant context"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select issue category" />
                </SelectTrigger>
                <SelectContent>
                  {ISSUE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <LocationPicker onLocationSelect={setLocation} initialLocation={location} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Photo (Optional)</Label>
            <div className="flex flex-col space-y-2">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                {image ? "Change Photo" : "Add Photo"}
              </Button>
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Issue preview"
                    className="w-full max-w-sm h-48 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setImage(null)
                      setImagePreview(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ""
                      }
                    }}
                    className="absolute top-2 right-2"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !title || !description || !category}>
            {loading ? "Submitting..." : "Submit Issue Report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
