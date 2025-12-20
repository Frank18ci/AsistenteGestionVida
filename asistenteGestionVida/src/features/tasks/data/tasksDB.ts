import * as SQLite from "expo-sqlite";
import {
  cancelTaskNotification,
  scheduleTaskNotification,
} from "../service/NotificationService";
import { Task } from "./TaskModel";

const db = SQLite.openDatabaseAsync("asistente.db");

// ----------------------------------------------------
// Función para calcular cuándo debe sonar la notificación
// ----------------------------------------------------

const getNotificationDate = (
  date: string,
  startTime: string,
  alarmBefore?: number
) => {
  const [year, month, day] = date.split("-").map(Number);
  const [h, m] = startTime.split(":").map(Number);

  const start = new Date(year, month - 1, day, h, m);

  // normaliza alarmBefore
  const minutesBefore = Math.max(0, Number(alarmBefore ?? 0));

  const trigger = new Date(start.getTime() - minutesBefore * 60_000);

  // Evita notificaciones en el pasado
  if (trigger <= new Date()) {
    return null;
  }

  return trigger;
};
// ----------------------------------------------------
// Marcar completado
// ----------------------------------------------------
export const toggleTask = async (id: number, completed: boolean) => {
  const database = await db;
  await database.runAsync("UPDATE tasks SET isCompleted = ? WHERE id = ?", [
    completed ? 1 : 0,
    id,
  ]);
};

// ----------------------------------------------------
// GET tasks por fecha
// ----------------------------------------------------
export const getTasksByDate = async (date: string) => {
  const database = await db;
  return await database.getAllAsync<Task>(
    "SELECT * FROM tasks WHERE date = ? ORDER BY startTime ASC",
    [date]
  );
};
// Verificar choque de tareas
export const hasTaskConflict = async (date: string, start: string, end: string) => {
  const database = await db;

  const result = await database.getFirstAsync(
    `SELECT * FROM tasks
     WHERE date = ?
     AND (
       (startTime <= ? AND endTime > ?) OR
       (startTime < ? AND endTime >= ?)
     )`,
    [date, start, start, end, end]
  );

  return result ? true : false;
};

// ----------------------------------------------------
// Añadir tarea con notificación
// ----------------------------------------------------
export const addTask = async (task: Task) => {
  const database = await db;

  // Insertar tarea
  await database.runAsync(
    `INSERT INTO tasks
     (title, description, date, startTime, endTime, alarmBefore, type, isCompleted)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      task.title,
      task.description ?? null,
      task.date,
      task.startTime,
      task.endTime,
      task.alarmBefore ?? null,
      task.type,
      task.isCompleted ? 1 : 0,
    ]
  );

  // Obtener la tarea recién creada
  const created = await database.getFirstAsync<Task>(
    "SELECT * FROM tasks ORDER BY id DESC LIMIT 1"
  );

  if (!created) {
    console.error("No se pudo obtener la tarea creada.");
    return; // Evita que la app crashee
  }

  //* Programar la notificación
  let notificationId = null;

  if (created.alarmBefore && created.alarmBefore > 0) {
    const trigger = getNotificationDate(
      created.date,
      created.startTime,
      created.alarmBefore
    );

    if (trigger) {
      notificationId = await scheduleTaskNotification(
        "Tu tarea está por empezar",
        `${created.title} comienza a las ${created.startTime}`,
        trigger
      );
    } else {
      console.log("No se pudo programar notificación: la fecha está en el pasado");
    }
  }

  // Guardar notificationId
  await database.runAsync(
    "UPDATE tasks SET notificationId = ? WHERE id = ?",
    [notificationId, created.id]
  );
};

// ----------------------------------------------------
// Actualizar tarea con reprogramación de notificación
// ----------------------------------------------------
export const updateTask = async (task: Task) => {
  if (!task.id) return;

  const database = await db;

  // Obtener notificación previa
  const old = await database.getFirstAsync<Task>(
    "SELECT notificationId FROM tasks WHERE id = ?",
    [task.id]
  );

  // Cancelar notificación previa
  await cancelTaskNotification(old?.notificationId);

  // Actualizar datos en BD
  await database.runAsync(
    `UPDATE tasks SET
      title=?, description=?, date=?, startTime=?, endTime=?,
      alarmBefore=?, type=?, isCompleted=?
     WHERE id=?`,
    [
      task.title,
      task.description ?? null,
      task.date,
      task.startTime,
      task.endTime,
      task.alarmBefore ?? null,
      task.type,
      task.isCompleted ? 1 : 0,
      task.id,
    ]
  );

  // Programar nueva notificación
  let notificationId = null;

  if (task.alarmBefore && task.alarmBefore > 0) {
    const trigger = getNotificationDate(
      task.date,
      task.startTime,
      task.alarmBefore
    );

    if (trigger) {
      notificationId = await scheduleTaskNotification(
        "Tarea reprogramada",
        `${task.title} inicia a las ${task.startTime}`,
        trigger
      );
    } else {
      console.log("No se pudo programar notificación: la fecha está en el pasado");
    }
  }

  // Guardar nueva notificación
  await database.runAsync(
    "UPDATE tasks SET notificationId = ? WHERE id = ?",
    [notificationId, task.id]
  );
};

// ----------------------------------------------------
// Eliminar tarea + cancelar notificación
// ----------------------------------------------------
export const deleteTask = async (id: number) => {
  const database = await db;

  const task = await database.getFirstAsync<Task>(
    "SELECT notificationId FROM tasks WHERE id = ?",
    [id]
  );

  await cancelTaskNotification(task?.notificationId);

  await database.runAsync("DELETE FROM tasks WHERE id = ?", [id]);
};
