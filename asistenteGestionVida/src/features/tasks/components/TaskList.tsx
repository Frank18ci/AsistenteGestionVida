import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Task } from "../data/TaskModel";
import { deleteTask, toggleTask } from "../data/tasksDB";

interface TaskListProps {
  date: string;
  tasks: Task[];
  onRefresh: () => void;
  onEdit: (task: Task) => void;
}

export default function TaskList({ date, tasks, onRefresh, onEdit }: TaskListProps) {
  
  const handleToggle = async (task: Task) => {
    await toggleTask(task.id!, !task.isCompleted);
    onRefresh();
  };

  const handleDelete = (task: Task) => {
    Alert.alert(
      "Eliminar tarea",
      `¿Seguro que quieres eliminar "${task.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await deleteTask(task.id!);
            onRefresh();
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Task }) => {
    const color = item.type === "work" ? "#007bff" : "#28a745";

    return (
      <>
        <View style={styles.taskContainer}>
          <View style={[styles.sideColor, { backgroundColor: color }]} />

          <View style={styles.info}>
            <Text style={[styles.title, item.isCompleted && styles.completedText]}>
              {item.title}
            </Text>

            <Text style={styles.time}>
              {item.startTime} - {item.endTime}
            </Text>

            {item.description ? (
              <Text style={styles.desc}>{item.description}</Text>
            ) : null}
          </View>

          
          <View style={styles.actions}>

            
            <TouchableOpacity style={styles.iconBtn} onPress={() => handleToggle(item)}>
              <Ionicons
                name={item.isCompleted ? "checkmark-done" : "checkmark"}
                size={22}
                color={item.isCompleted ? "green" : "#555"}
              />
            </TouchableOpacity>

            
            <TouchableOpacity style={styles.iconBtn} onPress={() => onEdit(item)}>
              <Ionicons name="create-outline" size={22} color="#1e90ff" />
            </TouchableOpacity>

            
            <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item)}>
              <Ionicons name="trash" size={22} color="#d11a2a" />
            </TouchableOpacity>

          </View>
        </View>
      </>
    );
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.header}>Tareas del día {date}</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id!.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay tareas para este día.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: 15,
    marginTop: 10,
  },

  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  taskContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },

  sideColor: {
    width: 8,
    borderRadius: 20,
    marginRight: 10,
  },

  info: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
  },

  completedText: {
    textDecorationLine: "line-through",
    color: "gray",
  },

  time: {
    fontSize: 14,
    color: "#555",
  },

  desc: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },

  actions: {
    justifyContent: "space-between",
    alignItems: "center",
  },

  iconBtn: {
    padding: 5,
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 14,
    color: "gray",
  },
});
