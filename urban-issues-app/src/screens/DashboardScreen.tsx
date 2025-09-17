"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "../lib/supabase";
import IssueCard from "../components/IssueCard";
import { useAuth } from "../hooks/useAuth";

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  image_url?: string;
  created_at: string;
  user_id: string;
}

export default function DashboardScreen({ navigation }: any) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const { user, signOut } = useAuth();

  useEffect(() => {
    fetchIssues();
  }, [user]); // Add user dependency to refetch when user changes

  useEffect(() => {
    filterIssues();
  }, [issues, searchTerm, statusFilter, categoryFilter, priorityFilter]);

  const fetchIssues = async () => {
    // Add a guard clause to prevent the query if the user is not authenticated
    if (!user?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("issues")
        .select("*")
        .eq("user_id", user.id) // Use the user.id, which is now guaranteed to exist
        .order("created_at", { ascending: false });

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        setIssues(data || []);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to fetch issues");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterIssues = () => {
    let filtered = issues;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((issue) => issue.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((issue) => issue.category === categoryFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((issue) => issue.priority === priorityFilter);
    }

    setFilteredIssues(filtered);
  };

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("issues")
        .update({ status: newStatus })
        .eq("id", issueId);

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        // Update local state
        setIssues((prev) =>
          prev.map((issue) =>
            issue.id === issueId ? { ...issue, status: newStatus } : issue
          )
        );
        Alert.alert("Success", "Issue status updated successfully");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to update issue status");
    }
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            // Navigation will be handled automatically by auth state change
          } catch (error) {
            Alert.alert("Error", "Failed to sign out");
          }
        },
      },
    ]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchIssues();
  };

  const getStatusCounts = () => {
    return {
      total: issues.length,
      pending: issues.filter((i) => i.status === "pending").length,
      in_progress: issues.filter((i) => i.status === "in_progress").length,
      resolved: issues.filter((i) => i.status === "resolved").length,
    };
  };

  const statusCounts = getStatusCounts();

  const renderIssueItem = ({ item }: { item: Issue }) => (
    <IssueCard
      issue={item}
      onStatusChange={handleStatusChange}
      showActions={true}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading issues...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>My Issues</Text>
            <Text style={styles.headerSubtitle}>
              Track and manage your reported urban issues
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredIssues}
        renderItem={renderIssueItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={() => (
          <View>
            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{statusCounts.total}</Text>
                <Text style={styles.statLabel}>My Issues</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, styles.pendingColor]}>
                  {statusCounts.pending}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, styles.progressColor]}>
                  {statusCounts.in_progress}
                </Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, styles.resolvedColor]}>
                  {statusCounts.resolved}
                </Text>
                <Text style={styles.statLabel}>Resolved</Text>
              </View>
            </View>

            {/* Search and Filters */}
            <View style={styles.filtersContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search issues..."
                value={searchTerm}
                onChangeText={setSearchTerm}
              />

              <View style={styles.filterRow}>
                <View style={styles.filterItem}>
                  <Text style={styles.filterLabel}>Status</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={statusFilter}
                      onValueChange={setStatusFilter}
                      style={styles.picker}
                    >
                      <Picker.Item label="All Status" value="all" />
                      <Picker.Item label="Pending" value="pending" />
                      <Picker.Item label="In Progress" value="in_progress" />
                      <Picker.Item label="Resolved" value="resolved" />
                      <Picker.Item label="Rejected" value="rejected" />
                    </Picker>
                  </View>
                </View>

                <View style={styles.filterItem}>
                  <Text style={styles.filterLabel}>Category</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={categoryFilter}
                      onValueChange={setCategoryFilter}
                      style={styles.picker}
                    >
                      <Picker.Item label="All Categories" value="all" />
                      <Picker.Item
                        label="Road Maintenance"
                        value="road_maintenance"
                      />
                      <Picker.Item label="Street Lighting" value="lighting" />
                      <Picker.Item
                        label="Vandalism/Graffiti"
                        value="vandalism"
                      />
                      <Picker.Item
                        label="Waste Management"
                        value="waste_management"
                      />
                      <Picker.Item
                        label="Public Safety"
                        value="public_safety"
                      />
                      <Picker.Item
                        label="Infrastructure"
                        value="infrastructure"
                      />
                      <Picker.Item
                        label="Parks & Recreation"
                        value="parks_recreation"
                      />
                      <Picker.Item label="Other" value="other" />
                    </Picker>
                  </View>
                </View>
              </View>

              <View style={styles.filterRow}>
                <View style={styles.filterItem}>
                  <Text style={styles.filterLabel}>Priority</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={priorityFilter}
                      onValueChange={setPriorityFilter}
                      style={styles.picker}
                    >
                      <Picker.Item label="All Priority" value="all" />
                      <Picker.Item label="Low" value="low" />
                      <Picker.Item label="Medium" value="medium" />
                      <Picker.Item label="High" value="high" />
                      <Picker.Item label="Urgent" value="urgent" />
                    </Picker>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.reportButton}
                  onPress={() => navigation.navigate("Report")}
                >
                  <Text style={styles.reportButtonText}>+ Report Issue</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {issues.length === 0
                ? "No issues reported yet."
                : "No issues match your current filters."}
            </Text>
            {issues.length === 0 && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate("Report")}
              >
                <Text style={styles.emptyButtonText}>
                  Report the First Issue
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 60,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#cbd5e1",
  },
  headerRight: {
    alignItems: "flex-end",
    justifyContent: "center",
    paddingLeft: 16,
  },
  userEmail: {
    fontSize: 12,
    color: "#cbd5e1",
    marginBottom: 8,
    textAlign: "right",
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: "#ef4444",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  signOutText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    backgroundColor: "#f8fafc",
    paddingBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  pendingColor: {
    color: "#eab308",
  },
  progressColor: {
    color: "#3b82f6",
  },
  resolvedColor: {
    color: "#16a34a",
  },
  filtersContainer: {
    backgroundColor: "#ffffff",
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  picker: {
    height: 50,
  },
  reportButton: {
    backgroundColor: "#ea580c",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 120,
  },
  reportButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  issuesContainer: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    backgroundColor: "#ffffff",
    margin: 16,
    padding: 48,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: "#ea580c",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  separator: {
    height: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    fontSize: 18,
    color: "#64748b",
  },
});