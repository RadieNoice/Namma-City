"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

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

interface IssueCardProps {
  issue: Issue
  onStatusChange?: (issueId: string, newStatus: string) => void
  showActions?: boolean
}

const STATUS_COLORS = {
  pending: "bg-yellow-500",
  in_progress: "bg-blue-500",
  resolved: "bg-green-500",
  rejected: "bg-red-500",
}

const PRIORITY_COLORS = {
  low: "bg-gray-500",
  medium: "bg-orange-500",
  high: "bg-red-500",
  urgent: "bg-red-700",
}

const CATEGORY_LABELS = {
  road_maintenance: "Road Maintenance",
  lighting: "Street Lighting",
  vandalism: "Vandalism/Graffiti",
  waste_management: "Waste Management",
  public_safety: "Public Safety",
  infrastructure: "Infrastructure",
  parks_recreation: "Parks & Recreation",
  other: "Other",
}

export function IssueCard({ issue, onStatusChange, showActions = false }: IssueCardProps) {
  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(issue.id, newStatus)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight mb-2">{issue.title}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className={`${STATUS_COLORS[issue.status as keyof typeof STATUS_COLORS]} text-white`}
              >
                {issue.status.replace("_", " ").toUpperCase()}
              </Badge>
              <Badge
                variant="outline"
                className={`${PRIORITY_COLORS[issue.priority as keyof typeof PRIORITY_COLORS]} text-white border-0`}
              >
                {issue.priority.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                {CATEGORY_LABELS[issue.category as keyof typeof CATEGORY_LABELS] || issue.category}
              </Badge>
            </div>
          </div>
          {issue.image_url && (
            <div className="flex-shrink-0">
              <img
                src={issue.image_url || "/placeholder.svg"}
                alt="Issue"
                className="w-20 h-20 object-cover rounded-md"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm leading-relaxed">{issue.description}</p>

        {issue.address && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{issue.address}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>ID: {issue.user_id.slice(0, 8)}...</span>
          </div>
        </div>

        {showActions && issue.status !== "resolved" && (
          <div className="flex gap-2 pt-2">
            {issue.status === "pending" && (
              <Button size="sm" variant="outline" onClick={() => handleStatusChange("in_progress")}>
                Start Progress
              </Button>
            )}
            {issue.status === "in_progress" && (
              <Button size="sm" onClick={() => handleStatusChange("resolved")}>
                Mark Resolved
              </Button>
            )}
            <Button size="sm" variant="destructive" onClick={() => handleStatusChange("rejected")}>
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
