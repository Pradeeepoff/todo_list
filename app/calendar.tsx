import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function CalendarScreen() {
  const [tasks, setTasks] = useState<
    { id: string; text: string; completed: boolean; date: string }[]
  >([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Load tasks from AsyncStorage
  useEffect(() => {
    const loadTasks = async () => {
      const stored = await AsyncStorage.getItem("tasks");
      if (stored) setTasks(JSON.parse(stored));
    };
    loadTasks();
  }, []);

  // Filter tasks for the selected date
  const tasksForDate = tasks.filter((t) => t.date === selectedDate);

  // Prepare marked dates for calendar
  const markedDates: { [key: string]: any } = {};
  tasks.forEach((task) => {
    markedDates[task.date] = { marked: true, dotColor: "#007AFF" };
  });
  markedDates[selectedDate] = {
    ...(markedDates[selectedDate] || {}),
    selected: true,
    selectedColor: "#007AFF",
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>📅 Calendar</Text>

      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        style={styles.calendar}
      />

      <Text style={styles.dateTitle}>Tasks for {selectedDate}</Text>
      {tasksForDate.length === 0 ? (
        <Text style={styles.noTasks}>No tasks for this date.</Text>
      ) : (
        <FlatList
          data={tasksForDate}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskItem}>
              <Text style={styles.taskText}>{item.text}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
        <Text style={styles.navText}>Go Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  calendar: { marginBottom: 16 },
  dateTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  noTasks: { fontSize: 16, color: "gray", marginBottom: 12 },
  taskItem: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  taskText: { fontSize: 16 },
  navBtn: { marginTop: 12, backgroundColor: "#007AFF", padding: 14, borderRadius: 10 },
  navText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
});
