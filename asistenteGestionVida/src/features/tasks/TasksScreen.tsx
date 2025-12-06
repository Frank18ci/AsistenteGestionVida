
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import AddTaskButton from "./components/AddTaskButton";
import AddTaskModal from "./components/AddTaskModal";
import CalendarComponent from "./components/Calendar";
import TaskList from "./components/TaskList";
import { Task } from "./data/TaskModel";
import { getTasksByDate } from "./data/tasksDB";

export default function TasksScreen() {
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const loadTasks = async () => {
    const result: Task[] = await getTasksByDate(selectedDate);
    setTasks(result);
  };

  const onTaskSaved = async () => {
    await loadTasks();
  };

  const [refresh, setRefresh] = useState(false);

  const reloadAll = () => {
    setRefresh(r => !r);
    loadTasks();
  };

  useEffect(() => {
    loadTasks();
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      <CalendarComponent
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        refresh={refresh}
      />

      <TaskList
        date={selectedDate}
        tasks={tasks}
        onRefresh={reloadAll}
        onEdit={(task) => {
          setEditingTask(task);
          setModalVisible(true);
        }}

      />

      <AddTaskButton
        open={() => {
          setEditingTask(null); 
          setModalVisible(true);
        }}
      />

      <AddTaskModal
        visible={modalVisible}
        task={editingTask}
        onClose={() => {
          setModalVisible(false);
          setEditingTask(null);
        }}
        onSaved={onTaskSaved}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: 'bold' },
  subText: { color: 'gray', marginTop: 10 }
});
