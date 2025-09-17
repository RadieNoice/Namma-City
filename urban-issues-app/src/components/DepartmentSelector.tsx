"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, FlatList, ActivityIndicator } from "react-native"
import { supabase } from "../lib/supabase"

interface Department {
  id: string
  department_name: string
  created_at: string
}

interface DepartmentSelectorProps {
  selectedDepartment: Department | null
  onDepartmentSelect: (department: Department | null) => void
}

export default function DepartmentSelector({ selectedDepartment, onDepartmentSelect }: DepartmentSelectorProps) {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("departments")
        .select("id, department_name, created_at")
        .order("department_name", { ascending: true })

      if (error) {
        Alert.alert("Error", "Failed to load departments")
        console.error("Department fetch error:", error)
      } else {
        setDepartments(data || [])
      }
    } catch (err) {
      Alert.alert("Error", "Failed to load departments")
      console.error("Department fetch error:", err)
    }
    setLoading(false)
  }

  const handleDepartmentSelect = (department: Department) => {
    onDepartmentSelect(department)
    setModalVisible(false)
  }

  const renderDepartmentItem = ({ item }: { item: Department }) => (
    <TouchableOpacity
      style={[styles.departmentItem, selectedDepartment?.id === item.id && styles.selectedDepartmentItem]}
      onPress={() => handleDepartmentSelect(item)}
    >
      <Text style={[styles.departmentName, selectedDepartment?.id === item.id && styles.selectedDepartmentName]}>
        {item.department_name}
      </Text>
    </TouchableOpacity>
  )

  return (
    <View>
      <TouchableOpacity style={styles.selectorButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.selectorButtonText}>
          {selectedDepartment ? `📍 ${selectedDepartment.department_name}` : "📍 Select Department/Location"}
        </Text>
      </TouchableOpacity>

      {selectedDepartment && (
        <View style={styles.selectedInfo}>
          <Text style={styles.selectedText}>Selected: {selectedDepartment.department_name}</Text>
          <TouchableOpacity style={styles.clearButton} onPress={() => onDepartmentSelect(null)}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Department/Location</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ea580c" />
                <Text style={styles.loadingText}>Loading departments...</Text>
              </View>
            ) : (
              <FlatList
                data={departments}
                renderItem={renderDepartmentItem}
                keyExtractor={(item) => item.id}
                style={styles.departmentList}
                showsVerticalScrollIndicator={false}
              />
            )}

            <TouchableOpacity style={styles.refreshButton} onPress={fetchDepartments} disabled={loading}>
              <Text style={styles.refreshButtonText}>{loading ? "Loading..." : "Refresh Departments"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  selectorButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  selectorButtonText: {
    fontSize: 16,
    color: "#374151",
  },
  selectedInfo: {
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0ea5e9",
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedText: {
    fontSize: 14,
    color: "#0369a1",
    fontWeight: "500",
    flex: 1,
  },
  clearButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#64748b",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
  },
  departmentList: {
    maxHeight: 400,
  },
  departmentItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  selectedDepartmentItem: {
    backgroundColor: "#f0f9ff",
    borderColor: "#0ea5e9",
  },
  departmentName: {
    fontSize: 16,
    color: "#374151",
  },
  selectedDepartmentName: {
    color: "#0369a1",
    fontWeight: "500",
  },
  refreshButton: {
    backgroundColor: "#ea580c",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  refreshButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
})
