import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0f172a", "#1e293b", "#0f172a"]} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Report Urban Issues</Text>
            <Text style={styles.subtitle}>
              Help improve your community by reporting potholes, broken streetlights, graffiti, and other urban
              problems. Together, we can make our cities better.
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => navigation.navigate("Signup")}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.secondaryButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.featuresContainer}>
              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureEmoji}>📍</Text>
                </View>
                <Text style={styles.featureTitle}>Report Issues</Text>
                <Text style={styles.featureDescription}>Easily report problems with photos and location data</Text>
              </View>

              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureEmoji}>👥</Text>
                </View>
                <Text style={styles.featureTitle}>Community Driven</Text>
                <Text style={styles.featureDescription}>Work together to identify and solve urban problems</Text>
              </View>

              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureEmoji}>📊</Text>
                </View>
                <Text style={styles.featureTitle}>Track Progress</Text>
                <Text style={styles.featureDescription}>
                  Monitor the status of reported issues and their resolution
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 64,
  },
  content: {
    flex: 1,
    alignItems: "center",
    maxWidth: 400,
    alignSelf: "center",
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 56,
  },
  subtitle: {
    fontSize: 20,
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 28,
  },
  buttonContainer: {
    flexDirection: "column",
    gap: 16,
    width: "100%",
    marginBottom: 64,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#ea580c",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ffffff",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  featuresContainer: {
    gap: 32,
    width: "100%",
  },
  feature: {
    alignItems: "center",
  },
  featureIcon: {
    width: 64,
    height: 64,
    backgroundColor: "#ea580c",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  featureEmoji: {
    fontSize: 32,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 16,
    color: "#cbd5e1",
    textAlign: "center",
    lineHeight: 22,
  },
})
