export interface Task {
  id?: number;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  alarmBefore: number;
  type: "work" | "personal";
  isCompleted: boolean;
  notificationId?: string | null;

}
