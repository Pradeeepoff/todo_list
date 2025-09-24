import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  View,
  Keyboard,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { BarChart } from "react-native-chart-kit";

export default function HomeScreen() {
  const today = new Date();
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState<
    { id: string; text: string; completed: boolean; date: string }[]
  >([]);
  const [date, setDate] = useState<Date>(today);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Safe date string function
  const getDateString = (d: Date | null) =>
    d ? d.toISOString().split("T")[0] : today.toISOString().split("T")[0];

  // Load tasks from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem("tasks").then((stored) => {
      if (stored) setTasks(JSON.parse(stored));
    });
  }, []);

  // Save tasks whenever they change
  useEffect(() => {
    AsyncStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!task.trim()) return;

    const taskDate = getDateString(date);

    if (editingId) {
      setTasks(
        tasks.map((t) =>
          t.id === editingId ? { ...t, text: task } : t
        )
      );
      setEditingId(null);
    } else {
      setTasks([
        ...tasks,
        {
          id: Date.now().toString(),
          text: task.trim(),
          completed: false,
          date: taskDate,
        },
      ]);
    }

    setTask("");
    Keyboard.dismiss();
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const editTask = (id: string) => {
    const taskToEdit = tasks.find((t) => t.id === id);
    if (taskToEdit) {
      setTask(taskToEdit.text);
      setEditingId(id);
    }
  };

  // Increment / Decrement date
  const incrementDate = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 1);
    setDate(newDate);
  };
  const decrementDate = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - 1);
    setDate(newDate);
  };

  // Tasks for selected date
  const todayTasks = tasks.filter(
    (t) => t.date === getDateString(date)
  );
  const completedCount = todayTasks.filter((t) => t.completed).length;
  const pendingCount = todayTasks.length - completedCount;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>✅ To-Do List</Text>

        {/* Date Selector */}
        <View style={styles.dateRow}>
          <TouchableOpacity onPress={decrementDate} style={styles.dateBtn}>
            <Text style={styles.dateText}>◀</Text>
          </TouchableOpacity>

          <Text style={styles.dateTextLarge}>{date.toDateString()}</Text>

          <TouchableOpacity onPress={incrementDate} style={styles.dateBtn}>
            <Text style={styles.dateText}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* Task Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter a new task..."
            value={task}
            onChangeText={setTask}
            onSubmitEditing={addTask}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addTask}>
            <Text style={styles.addText}>{editingId ? "✎" : "＋"}</Text>
          </TouchableOpacity>
        </View>

        {/* Pending & Completed Tasks */}
        <FlatList
          data={todayTasks}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.taskItem}>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
                onPress={() => toggleTask(item.id)}
              >
                <Text style={{ fontSize: 24, marginRight: 12 }}>
                  {item.completed ? "✅" : "⬜"}
                </Text>
                <Text
                  style={[
                    styles.taskText,
                    item.completed && {
                      textDecorationLine: "line-through",
                      color: "#888",
                    },
                  ]}
                >
                  {item.text}
                </Text>
              </TouchableOpacity>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  onPress={() => editTask(item.id)}
                  style={styles.editBtn}
                >
                  <Text style={styles.editText}>✎</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteTask(item.id)}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        {/* Bar Chart - Selected Date */}
        {todayTasks.length > 0 && (
          <View style={{ marginVertical: 20 }}>
            <Text style={styles.chartTitle}>Tasks Today</Text>
            <BarChart
              data={{
                labels: ["Pending", "Completed"],
                datasets: [{ data: [pendingCount, completedCount] }],
              }}
              width={Dimensions.get("window").width - 32}
              height={220}
              yAxisLabel=""
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              }}
              style={{ borderRadius: 16 }}
            />
          </View>
        )}

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.push("/calendar")}
        >
          <Text style={styles.navText}>Go to Calendar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#1E1E2F", // Dark modern background
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  dateBtn: {
    padding: 12,
    backgroundColor: "#292B3E",
    borderRadius: 12,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  dateText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  dateTextLarge: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFCB05", // Accent color for current date
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: "#292B3E",
    padding: 14,
    borderRadius: 12,
    borderWidth: 0,
    fontSize: 16,
    color: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  addBtn: {
    marginLeft: 10,
    backgroundColor: "#FFCB05", // Accent button color
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    elevation: 4,
  },
  addText: {
    color: "#1E1E2F",
    fontSize: 28,
    fontWeight: "bold",
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2E2F48",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  taskText: {
    fontSize: 16,
    flex: 1,
    color: "#fff",
  },
  editBtn: {
    marginRight: 8,
    backgroundColor: "#FFA500",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  editText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  deleteBtn: {
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  deleteText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  navBtn: {
    marginTop: 24,
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  navText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
  chartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#FFCB05",
  },
});
