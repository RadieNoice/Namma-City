import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native"
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
  pending: "#eab308",
  in_progress: "#3b82f6",
  resolved: "#16a34a",
  rejected: "#ef4444",
}

const PRIORITY_COLORS = {
  low: "#6b7280",
  medium: "#f97316",
  high: "#ef4444",
  urgent: "#dc2626",
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

export default function IssueCard({ issue, onStatusChange, showActions = false }: IssueCardProps) {
  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange) {
      Alert.alert("Update Status", `Change status to ${newStatus.replace("_", " ")}?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => onStatusChange(issue.id, newStatus) },
      ])
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{issue.title}</Text>
          <View style={styles.badges}>
            <View
              style={[
                styles.badge,
                { backgroundColor: STATUS_COLORS[issue.status as keyof typeof STATUS_COLORS] || "#6b7280" },
              ]}
            >
              <Text style={styles.badgeText}>{(issue.status || "unknown").replace("_", " ").toUpperCase()}</Text>
            </View>
            <View
              style={[
                styles.badge,
                { backgroundColor: PRIORITY_COLORS[issue.priority as keyof typeof PRIORITY_COLORS] || "#6b7280" },
              ]}
            >
              <Text style={styles.badgeText}>{(issue.priority || "unknown").toUpperCase()}</Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {CATEGORY_LABELS[issue.category as keyof typeof CATEGORY_LABELS] || issue.category || "Unknown"}
              </Text>
            </View>
          </View>
        </View>
        {issue.image_url && <Image source={{ uri: issue.image_url }} style={styles.image} />}
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>{issue.description}</Text>

        {issue.address && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{issue.address}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.timestamp}>
            📅 {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
          </Text>
          <Text style={styles.userId}>👤 ID: {issue.user_id.slice(0, 8)}...</Text>
        </View>

        {showActions && issue.status && issue.status !== "resolved" && (
          <View style={styles.actions}>
            {issue.status === "pending" && (
              <TouchableOpacity style={styles.actionButton} onPress={() => handleStatusChange("in_progress")}>
                <Text style={styles.actionButtonText}>Start Progress</Text>
              </TouchableOpacity>
            )}
            {issue.status === "in_progress" && (
              <TouchableOpacity
                style={[styles.actionButton, styles.resolveButton]}
                onPress={() => handleStatusChange("resolved")}
              >
                <Text style={styles.actionButtonText}>Mark Resolved</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleStatusChange("rejected")}
            >
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    paddingBottom: 12,
  },
  headerContent: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
    lineHeight: 24,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
  categoryBadge: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: "#374151",
    fontSize: 10,
    fontWeight: "500",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: "cover",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  description: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  locationText: {
    fontSize: 12,
    color: "#64748b",
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 11,
    color: "#64748b",
  },
  userId: {
    fontSize: 11,
    color: "#64748b",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  resolveButton: {
    backgroundColor: "#16a34a",
    borderColor: "#16a34a",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
})
