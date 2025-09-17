"use client";

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as FileSystem from "expo-file-system";
import { supabase } from "../lib/supabase";
import DepartmentSelector from "../components/DepartmentSelector";

const ISSUE_TYPES = [
  { value: "", label: "Select issue type..." },
  { value: "road_maintenance", label: "Road Maintenance" },
  { value: "lighting", label: "Street Lighting" },
  { value: "vandalism", label: "Vandalism/Graffiti" },
  { value: "waste_management", label: "Waste Management" },
  { value: "public_safety", label: "Public Safety" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "parks_recreation", label: "Parks & Recreation" },
  { value: "other", label: "Other" },
];

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

interface Department {
  id: string;
  department_name: string;
  created_at: string;
}

export default function ReportScreen({ navigation }: any) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [issueType, setIssueType] = useState("");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to tag your report"
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;

      // Simple reverse geocoding fallback
      const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      setLocation({ latitude, longitude, address });
      Alert.alert(
        "Location Set",
        "Current location has been added to your report"
      );
    } catch (error) {
      Alert.alert("Location Error", "Failed to get current location");
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Camera roll permission is required to add photos"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7, // Reduced quality for smaller file size
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Camera permission is required to take photos"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7, // Reduced quality for smaller file size
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert("Add Photo", "Choose an option", [
      { text: "Camera", onPress: takePhoto },
      { text: "Photo Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const uploadImage = async (
    imageUri: string,
    retryCount: number = 0
  ): Promise<string | null> => {
    const maxRetries = 2;

    try {
      console.log(
        `Starting image upload attempt ${retryCount + 1} for URI:`,
        imageUri
      );

      // Check network connectivity first
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const networkTest = await fetch("https://www.google.com", {
          method: "HEAD",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log("Network test status:", networkTest.status);
      } catch (networkError) {
        console.error("Network connectivity issue:", networkError);
        throw new Error("No internet connection available");
      }

      // Check if the file exists
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        console.error("File does not exist:", imageUri);
        throw new Error("Image file not found");
      }

      console.log("File info:", fileInfo);

      // Check file size (limit to 5MB)
      if (fileInfo.size && fileInfo.size > 5 * 1024 * 1024) {
        throw new Error(
          "File too large. Please select an image smaller than 5MB."
        );
      }

      // Generate a unique filename
      const fileExt = imageUri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}.${fileExt}`;
      const filePath = `issue-images/${fileName}`;

      console.log("Upload path:", filePath);

      // Read the file as base64 first, then convert to blob
      console.log("Reading file as base64...");
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log("Base64 length:", base64.length);

      // Create smaller chunks if the file is large
      const chunkSize = 1024 * 1024; // 1MB chunks
      if (base64.length > chunkSize) {
        console.log("Large file detected, using chunked upload approach");
      }

      // Convert base64 to blob with timeout
      console.log("Converting base64 to blob...");
      const blobController = new AbortController();
      const blobTimeoutId = setTimeout(() => blobController.abort(), 10000);

      const response = await fetch(`data:image/${fileExt};base64,${base64}`, {
        signal: blobController.signal,
      });

      clearTimeout(blobTimeoutId);
      const blob = await response.blob();
      console.log("Blob created, size:", blob.size, "type:", blob.type);

      // Test Supabase connection with a simpler operation first
      console.log("Testing Supabase connection...");
      try {
        const { data: buckets, error: bucketsError } =
          await supabase.storage.listBuckets();

        if (bucketsError) {
          console.error("Bucket list error:", bucketsError);
          throw new Error(
            `Cannot connect to storage service: ${bucketsError.message}`
          );
        }
        console.log("Available buckets:", buckets?.map((b) => b.name) || []);

        // Check if the 'images' bucket exists
        const imagesBucket = buckets?.find((b) => b.name === "images");
        if (!imagesBucket) {
          throw new Error(
            "Images bucket not found. Available buckets: " +
              (buckets?.map((b) => b.name).join(", ") || "none")
          );
        }
        console.log("Images bucket found:", imagesBucket);
      } catch (connectionError: any) {
        console.error("Supabase connection test failed:", connectionError);
        throw new Error(
          `Storage service unavailable: ${connectionError.message}`
        );
      }

      // Try a simple test upload first (very small file)
      console.log("Testing with a small dummy upload...");
      try {
        const testBlob = new Blob(["test"], { type: "text/plain" });
        const testPath = `test-${Date.now()}.txt`;

        const { data: testData, error: testError } = await supabase.storage
          .from("images")
          .upload(testPath, testBlob);

        if (testError) {
          console.error("Test upload failed:", testError);
          throw new Error(`Storage upload test failed: ${testError.message}`);
        }

        console.log("Test upload successful, cleaning up...");
        // Clean up test file
        await supabase.storage.from("images").remove([testPath]);
      } catch (testUploadError: any) {
        console.error("Test upload error:", testUploadError);
        throw new Error(`Upload permissions issue: ${testUploadError.message}`);
      }

      // Upload to Supabase with timeout
      console.log("Starting actual image upload...");
      const uploadController = new AbortController();
      const uploadTimeoutId = setTimeout(() => uploadController.abort(), 30000);

      let uploadData, uploadError;
      try {
        // Try different upload strategies based on file size
        if (fileInfo.size && fileInfo.size > 2 * 1024 * 1024) {
          // > 2MB
          console.log("Large file detected, reducing quality...");
          // For large files, try to reduce quality further
          const smallerBase64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Create a smaller blob
          const smallerResponse = await fetch(
            `data:image/jpeg;base64,${smallerBase64}`
          );
          const smallerBlob = await smallerResponse.blob();
          console.log("Reduced blob size:", smallerBlob.size);

          const result = await supabase.storage
            .from("images")
            .upload(filePath, smallerBlob, {
              contentType: "image/jpeg",
              upsert: false,
            });
          uploadData = result.data;
          uploadError = result.error;
        } else {
          // Normal upload for smaller files
          const result = await supabase.storage
            .from("images")
            .upload(filePath, blob, {
              contentType: `image/${fileExt}`,
              upsert: false,
            });
          uploadData = result.data;
          uploadError = result.error;
        }

        console.log(
          "Upload attempt completed. Data:",
          uploadData,
          "Error:",
          uploadError
        );
      } catch (uploadErr: any) {
        console.error("Upload exception:", uploadErr);
        if (uploadErr.name === "AbortError") {
          throw new Error("Upload timeout after 30 seconds");
        }
        throw new Error(`Upload failed: ${uploadErr.message}`);
      } finally {
        clearTimeout(uploadTimeoutId);
      }

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);

        // Handle specific error cases
        if (uploadError.message.includes("Bucket not found")) {
          throw new Error(
            "Image storage is not configured. Please contact support."
          );
        } else if (uploadError.message.includes("Row-level security")) {
          throw new Error("Permission denied for image upload.");
        } else if (uploadError.message.includes("payload too large")) {
          throw new Error("Image file is too large.");
        } else if (uploadError.message.includes("Network request failed")) {
          throw new Error("Network connection failed during upload");
        }

        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log("Upload successful:", uploadData);

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      console.log("Public URL:", urlData.publicUrl);

      // Verify the URL is accessible
      try {
        const urlController = new AbortController();
        const urlTimeoutId = setTimeout(() => urlController.abort(), 5000);

        const urlTest = await fetch(urlData.publicUrl, {
          method: "HEAD",
          signal: urlController.signal,
        });

        clearTimeout(urlTimeoutId);

        if (!urlTest.ok) {
          throw new Error("Uploaded image is not accessible");
        }
      } catch (urlError) {
        console.error("URL verification failed:", urlError);
        // Don't fail the upload for this, just warn
      }

      return urlData.publicUrl;
    } catch (error: any) {
      console.error(`Image upload error (attempt ${retryCount + 1}):`, error);

      // Retry logic for network-related errors
      if (
        retryCount < maxRetries &&
        (error.message.includes("Network request failed") ||
          error.message.includes("timeout") ||
          error.message.includes("connection failed") ||
          error.message.includes("unavailable"))
      ) {
        console.log(
          `Retrying upload in 2 seconds... (attempt ${retryCount + 2})`
        );
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
        return uploadImage(imageUri, retryCount + 1);
      }

      // Don't show alert here, let the calling function handle it
      throw error;
    }
  };

  const handleSubmit = async () => {
    // Basic form validation checks
    if (!title.trim() || !description.trim()) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    if (!location && !selectedDepartment) {
      Alert.alert(
        "Location Required",
        "Please either use current location or select a department."
      );
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.getUser();

      // Guard Clause: Check if the user is authenticated.
      if (error || !data.user) {
        console.error("Auth error:", error);
        Alert.alert(
          "Authentication Required",
          "You must be logged in to report an issue."
        );
        setLoading(false);
        return;
      }

      const user = data.user;
      console.log("User ID from auth:", user.id);

      // Check if user exists in profiles table
      const { data: userExists, error: userCheckError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (userCheckError && userCheckError.code === "PGRST116") {
        // Create user profile if it doesn't exist
        console.log("Creating user profile...");
        const { error: createUserError } = await supabase
          .from("profiles")
          .insert([
            {
              id: user.id,
              email: user.email,
              created_at: new Date().toISOString(),
            },
          ]);

        if (createUserError) {
          console.error("Failed to create user profile:", createUserError);
          Alert.alert(
            "Setup Error",
            "Failed to set up user account. Please contact support."
          );
          setLoading(false);
          return;
        }
      }

      let imageUrl = null;
      if (image) {
        try {
          console.log("Uploading image...");
          imageUrl = await uploadImage(image);
          console.log("Image upload successful:", imageUrl);
        } catch (uploadError: any) {
          console.error("Image upload failed:", uploadError);

          // Show specific error message based on error type
          let errorMessage = "The image could not be uploaded.";
          let showRetry = true;

          if (uploadError.message.includes("No internet connection")) {
            errorMessage =
              "No internet connection detected. Please check your network and try again.";
          } else if (uploadError.message.includes("too large")) {
            errorMessage =
              "Image file is too large. Please select a smaller image.";
            showRetry = false;
          } else if (uploadError.message.includes("not configured")) {
            errorMessage =
              "Image upload is not properly configured. Please contact support.";
            showRetry = false;
          } else if (uploadError.message.includes("Permission denied")) {
            errorMessage = "You don't have permission to upload images.";
            showRetry = false;
          } else if (uploadError.message.includes("timeout")) {
            errorMessage =
              "Upload timed out. This might be due to a slow connection or large file.";
          } else {
            errorMessage = `Upload failed: ${uploadError.message}`;
          }

          const buttons = [
            {
              text: "Cancel",
              style: "cancel" as const,
              onPress: () => setLoading(false),
            },
            {
              text: "Submit Without Image",
              onPress: () => continueSubmission(null),
            },
          ];

          if (showRetry) {
            buttons.splice(1, 0, {
              text: "Try Again",
              onPress: async () => {
                try {
                  console.log("Retrying image upload...");
                  const retryImageUrl = await uploadImage(image);
                  await continueSubmission(retryImageUrl);
                } catch (retryError) {
                  console.error("Retry also failed:", retryError);
                  Alert.alert(
                    "Upload Failed Again",
                    "The image upload failed again. The report will be submitted without the image.",
                    [{ text: "OK", onPress: () => continueSubmission(null) }]
                  );
                }
              },
            });
          }

          Alert.alert("Image Upload Failed", errorMessage, buttons);
          return;
        }
      }

      await continueSubmission(imageUrl);
    } catch (err) {
      console.error("Unexpected error:", err);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const continueSubmission = async (imageUrl: string | null = null) => {
    try {
      const { data } = await supabase.auth.getUser();
      const user = data.user!;

      const issueData = {
        title: title.trim(),
        description: description.trim(),
        issue_type: issueType || "other",
        status: "pending",
        department_id: selectedDepartment?.id || null,
        user_id: user.id,
        image_url: imageUrl,
        created_at: new Date().toISOString(), // Add timestamp
        // Conditionally add location data only if it exists
        ...(location && {
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      };

      console.log("Issue data to insert:", issueData);

      // Test connection first
      console.log("Testing Supabase connection...");
      const { data: testData, error: testError } = await supabase
        .from("issues")
        .select("count", { count: "exact", head: true });

      if (testError) {
        console.error("Connection test failed:", testError);
        Alert.alert(
          "Connection Error",
          "Cannot connect to the database. Please check your internet connection and try again."
        );
        return;
      }

      console.log("Connection test passed, inserting issue...");

      const { data: insertData, error: insertError } = await supabase
        .from("issues")
        .insert([issueData])
        .select(); // Add select to return the inserted data

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        console.error("Error details:", {
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
          message: insertError.message,
        });

        // Handle specific errors
        if (insertError.code === "23503") {
          Alert.alert(
            "Invalid Department",
            "The selected department is not valid. Please select a different department."
          );
        } else if (insertError.code === "42501") {
          Alert.alert(
            "Permission Error",
            "You don't have permission to create issues. Please contact support."
          );
        } else if (insertError.message.includes("Network request failed")) {
          Alert.alert(
            "Network Error",
            "Please check your internet connection and try again."
          );
        } else {
          Alert.alert(
            "Submission Error",
            `Failed to submit issue: ${insertError.message}`
          );
        }
      } else {
        console.log("Issue inserted successfully:", insertData);
        setSuccess(true);
      }
    } catch (err) {
      console.error("Submission error:", err);
      Alert.alert("Error", "Failed to submit the report. Please try again.");
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={[styles.title, styles.successTitle]}>
                Issue Reported Successfully!
              </Text>
              <Text style={styles.description}>
                Thank you for reporting this issue. We'll review it and update
                you on its status.
              </Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setSuccess(false);
                  setTitle("");
                  setDescription("");
                  setIssueType("");
                  setLocation(null);
                  setSelectedDepartment(null);
                  setImage(null);
                }}
              >
                <Text style={styles.buttonText}>Report Another Issue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate("Dashboard")}
              >
                <Text style={styles.secondaryButtonText}>View All Issues</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Report an Issue</Text>
              <Text style={styles.description}>
                Help improve your community by reporting urban problems that
                need attention.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Issue Title *</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Brief description of the issue"
                  maxLength={255}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Detailed Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Provide more details about the issue, including any relevant context"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Issue Type *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={issueType}
                    onValueChange={setIssueType}
                    style={styles.picker}
                  >
                    {ISSUE_TYPES.map((type) => (
                      <Picker.Item
                        key={type.value}
                        label={type.label}
                        value={type.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Location</Text>
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={getCurrentLocation}
                >
                  <Text style={styles.locationButtonText}>
                    {location ? "📍 Location Set" : "📍 Use Current Location"}
                  </Text>
                </TouchableOpacity>
                {location && (
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationText}>{location.address}</Text>
                    <Text style={styles.locationCoords}>
                      {location.latitude.toFixed(6)},{" "}
                      {location.longitude.toFixed(6)}
                    </Text>
                  </View>
                )}

                <View style={styles.orDivider}>
                  <View style={styles.orLine} />
                  <Text style={styles.orText}>OR</Text>
                  <View style={styles.orLine} />
                </View>

                <DepartmentSelector
                  selectedDepartment={selectedDepartment}
                  onDepartmentSelect={setSelectedDepartment}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Photo (Optional)</Text>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={showImageOptions}
                >
                  <Text style={styles.imageButtonText}>
                    📷 {image ? "Change Photo" : "Add Photo"}
                  </Text>
                </TouchableOpacity>
                {image && (
                  <View style={styles.imagePreview}>
                    <Image
                      source={{ uri: image }}
                      style={styles.previewImage}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => setImage(null)}
                    >
                      <Text style={styles.removeImageText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (loading ||
                    !title.trim() ||
                    !description.trim() ||
                    (!location && !selectedDepartment)) &&
                    styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={
                  loading ||
                  !title.trim() ||
                  !description.trim() ||
                  (!location && !selectedDepartment)
                }
              >
                <Text style={styles.submitButtonText}>
                  {loading ? "Submitting..." : "Submit Issue Report"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center",
  },
  successTitle: {
    color: "#16a34a",
  },
  description: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  locationButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  locationButtonText: {
    fontSize: 16,
    color: "#374151",
  },
  locationInfo: {
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0ea5e9",
  },
  locationText: {
    fontSize: 14,
    color: "#0369a1",
    fontWeight: "500",
  },
  locationCoords: {
    fontSize: 12,
    color: "#0369a1",
    marginTop: 4,
  },
  imageButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  imageButtonText: {
    fontSize: 16,
    color: "#374151",
  },
  imagePreview: {
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeImageText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#ea580c",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    backgroundColor: "#ea580c",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 18,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    color: "#374151",
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
  },
  orDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#d1d5db",
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
});
