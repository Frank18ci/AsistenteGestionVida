
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { Task } from "../data/TaskModel";
import { addTask, hasTaskConflict, updateTask } from "../data/tasksDB";

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  task?: Task | null;        // ← NUEVO
}

export default function AddTaskModal({
  visible,
  onClose,
  onSaved,
  task
}: AddTaskModalProps) {

  const isEditing = !!task;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [startTime, setStartTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);

  const [endTime, setEndTime] = useState(new Date());
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Actualizar hora de fin automáticamente cuando cambia la hora de inicio
  useEffect(() => {
    if (!task) { // Solo para nuevas tareas, no al editar
      const newEndTime = new Date(startTime);
      newEndTime.setHours(newEndTime.getHours() + 1);
      setEndTime(newEndTime);
    }
  }, [startTime, task]);

  const [alarmBefore, setAlarmBefore] = useState<string>("");
  const [type, setType] = useState<"work" | "personal">("work");


  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");

      setDate(new Date(task.date + "T00:00:00"));
      setStartTime(new Date(`2000-01-01T${task.startTime}:00`));
      setEndTime(new Date(`2000-01-01T${task.endTime}:00`));

      setAlarmBefore(task.alarmBefore?.toString() || "");
      setType(task.type);
    } else {
      // Si es nueva, limpiar todo
      setTitle("");
      setDescription("");
      const now = new Date();
      setDate(now);
      setStartTime(now);
      // Establecer hora de fin una hora después de la hora de inicio
      const endTimeDefault = new Date(now);
      endTimeDefault.setHours(endTimeDefault.getHours() + 1);
      setEndTime(endTimeDefault);
      setAlarmBefore("");
      setType("work");
    }
  }, [task, visible]);


  const formatDate = (d: Date) =>
    d.toISOString().split("T")[0];

  const formatTime = (d: Date) =>
    d.toTimeString().substring(0, 5);


  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "El título es obligatorio.");
      return;
    }

    const start = formatTime(startTime);
    const end = formatTime(endTime);

    if (start >= end) {
      Alert.alert("Error", "La hora de inicio debe ser menor que la hora de fin.");
      return;
    }

    const fDate = formatDate(date);

    // Validar conflicto solo si NO es edición
    if (!isEditing) {
      const conflict = await hasTaskConflict(fDate, start, end);
      if (conflict) {
        Alert.alert("Conflicto", "Ya existe una tarea para ese horario.");
        return;
      }
    }

    const newTask: Task = {
      id: task?.id,
      title,
      description,
      date: fDate,
      startTime: start,
      endTime: end,
      alarmBefore: parseInt(alarmBefore || "0"),
      type,
      isCompleted: task?.isCompleted ?? false
    };

    if (isEditing) {
      await updateTask(newTask);
    } else {
      await addTask(newTask);
    }

    onSaved();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.header}>
            {isEditing ? "Editar tarea" : "Nueva tarea"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Título"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.input, { height: 70 }]}
            placeholder="Descripción"
            multiline
            value={description}
            onChangeText={setDescription}
          />


          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.selector}
          >
            <Text>Fecha: {formatDate(date)}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              onChange={(e, selected) => {
                setShowDatePicker(false);
                if (selected) setDate(selected);
              }}
            />
          )}

          {/* HORA INICIO */}
          <TouchableOpacity
            onPress={() => setShowStartPicker(true)}
            style={styles.selector}
          >
            <Text>Hora inicio: {formatTime(startTime)}</Text>
          </TouchableOpacity>

          {showStartPicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              is24Hour={true}
              onChange={(e, selected) => {
                setShowStartPicker(false);
                if (selected) {
                  setStartTime(selected);
                  // Actualizar hora de fin automáticamente (una hora después)
                  if (!task) {
                    const newEndTime = new Date(selected);
                    newEndTime.setHours(newEndTime.getHours() + 1);
                    setEndTime(newEndTime);
                  }
                }
              }}
            />
          )}

          {/* HORA FIN */}
          <TouchableOpacity
            onPress={() => setShowEndPicker(true)}
            style={styles.selector}
          >
            <Text>Hora fin: {formatTime(endTime)}</Text>
          </TouchableOpacity>

          {showEndPicker && (
            <DateTimePicker
              value={endTime}
              mode="time"
              is24Hour={true}
              onChange={(e, selected) => {
                setShowEndPicker(false);
                if (selected) setEndTime(selected);
              }}
            />
          )}


          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={alarmBefore}
            onChangeText={(v) => {
              if (/^\d*$/.test(v)) setAlarmBefore(v);
            }}
            placeholder="Minutos antes para alarma"
          />


          <View style={styles.pickerContainer}>
            <Picker selectedValue={type} onValueChange={setType}>
              <Picker.Item label="Trabajo" value="work" />
              <Picker.Item label="Personal" value="personal" />
            </Picker>
          </View>


          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancel} onPress={onClose}>
              <Text style={styles.btnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.save} onPress={handleSave}>
              <Text style={styles.btnText}>
                {isEditing ? "Actualizar" : "Guardar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 20
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10
  },
  selector: {
    padding: 12,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    marginBottom: 10
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10
  },
  cancel: {
    backgroundColor: "#666",
    padding: 12,
    borderRadius: 8,
    width: "45%",
    alignItems: "center"
  },
  save: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    width: "45%",
    alignItems: "center"
  },
  btnText: {
    color: "white",
    fontWeight: "bold"
  }
});
