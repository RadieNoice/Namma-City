"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { IssueCard } from "./issue-card"
import { LocationMap } from "./location-map"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Map, List } from "lucide-react"
import Link from "next/link"

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
  user_id: string
}

export function IssuesDashboard() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([])
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const supabase = createClient()

  useEffect(() => {
    fetchIssues()
  }, [])

  useEffect(() => {
    filterIssues()
  }, [issues, searchTerm, statusFilter, categoryFilter, priorityFilter])

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase.from("issues").select("*").order("created_at", { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setIssues(data || [])
      }
    } catch (err) {
      setError("Failed to fetch issues")
    } finally {
      setLoading(false)
    }
  }

  const filterIssues = () => {
    let filtered = issues

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.address?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((issue) => issue.status === statusFilter)
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((issue) => issue.category === categoryFilter)
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((issue) => issue.priority === priorityFilter)
    }

    setFilteredIssues(filtered)
  }

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("issues").update({ status: newStatus }).eq("id", issueId)

      if (error) {
        setError(error.message)
      } else {
        // Update local state
        setIssues((prev) => prev.map((issue) => (issue.id === issueId ? { ...issue, status: newStatus } : issue)))
      }
    } catch (err) {
      setError("Failed to update issue status")
    }
  }

  const getStatusCounts = () => {
    return {
      total: issues.length,
      pending: issues.filter((i) => i.status === "pending").length,
      in_progress: issues.filter((i) => i.status === "in_progress").length,
      resolved: issues.filter((i) => i.status === "resolved").length,
    }
  }

  const statusCounts = getStatusCounts()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading issues...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">{statusCounts.total}</CardTitle>
            <CardDescription>Total Issues</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</CardTitle>
            <CardDescription>Pending</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-blue-600">{statusCounts.in_progress}</CardTitle>
            <CardDescription>In Progress</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-green-600">{statusCounts.resolved}</CardTitle>
            <CardDescription>Resolved</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Actions and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="road_maintenance">Road Maintenance</SelectItem>
                <SelectItem value="lighting">Street Lighting</SelectItem>
                <SelectItem value="vandalism">Vandalism/Graffiti</SelectItem>
                <SelectItem value="waste_management">Waste Management</SelectItem>
                <SelectItem value="public_safety">Public Safety</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                <SelectItem value="parks_recreation">Parks & Recreation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button asChild className="bg-orange-600 hover:bg-orange-700">
          <Link href="/report">
            <Plus className="w-4 h-4 mr-2" />
            Report Issue
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            Map View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Issues List */}
          {filteredIssues.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {issues.length === 0 ? "No issues reported yet." : "No issues match your current filters."}
                </p>
                {issues.length === 0 && (
                  <Button asChild>
                    <Link href="/report">Report the First Issue</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} onStatusChange={handleStatusChange} showActions={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <LocationMap
            issues={filteredIssues}
            selectedIssue={selectedIssue}
            onIssueSelect={setSelectedIssue}
            height="500px"
          />
          {selectedIssue && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Selected Issue</h3>
              <IssueCard issue={selectedIssue} onStatusChange={handleStatusChange} showActions={true} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
