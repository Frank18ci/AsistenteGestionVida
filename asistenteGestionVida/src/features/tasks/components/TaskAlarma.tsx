// TaskAlarm.tsx
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Task } from "../data/TaskModel";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface TaskAlarmProps {
  task: Task;
}

export default function TaskAlarm({ task }: TaskAlarmProps) {

  useEffect(() => {
    if (!task.id) return;

    // Ejecutar programación
    reprogramAlarm();

    // Cleanup (NO async)
    return () => {
      cancelAlarm(task.id!); // ← ahora sí es válido
    };
  }, [task]);

  const reprogramAlarm = async () => {
    await cancelAlarm(task.id!);
    await scheduleAlarm();
  };

  const scheduleAlarm = async () => {
    if (!task.alarmBefore || task.alarmBefore <= 0) return;

    const [h, m] = task.startTime.split(":").map(Number);
    const [year, month, day] = task.date.split("-").map(Number);

    const start = new Date(year, month - 1, day, h, m);

    const alarmDate = new Date(start.getTime() - task.alarmBefore * 60000);

    if (alarmDate <= new Date()) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ Recordatorio: ${task.title}`,
        body: task.description || "Tienes una tarea pendiente.",
        sound: true,
      },
      identifier: task.id!.toString(),
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: alarmDate
      },

    });
  };

  const cancelAlarm = async (id: number) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(id.toString());
    } catch {}
  };

  return null;
}
