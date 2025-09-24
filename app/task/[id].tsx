import { SafeAreaView } from "react-native-safe-area-context";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>📝 Task Detail</Text>
      <Text style={styles.task}>Task ID: {id}</Text>

      <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
        <Text style={styles.navText}>Go Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16, backgroundColor: "#f5f5f5" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 12 },
  task: { fontSize: 20, color: "gray", marginBottom: 20 },
  navBtn: { marginTop: 12, backgroundColor: "#007AFF", padding: 14, borderRadius: 10 },
  navText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
});
