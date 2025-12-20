import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

// ----------------------------------------
// Programar notificación local
// ----------------------------------------


// Configuramos cómo se muestran las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ----------------------------------------
// Registrar permisos y obtener token
// ----------------------------------------
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    alert("Debes usar un dispositivo físico para recibir notificaciones");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Permisos de notificación denegados");
    return null;
  }

  // Intentar obtener el projectId para notificaciones push (opcional)
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  // Solo obtener el token push si tenemos projectId (para notificaciones push)
  // Si no hay projectId, continuamos sin error ya que usamos notificaciones locales
  if (projectId) {
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      return token.data;
    } catch (error) {
      console.log("No se pudo obtener el token push (solo notificaciones locales disponibles):", error);
      return null;
    }
  } else {
    console.log("No hay projectId configurado. Usando solo notificaciones locales.");
    return null;
  }
}

// ----------------------------------------
// Canal Android
// ----------------------------------------
export async function configureNotificationChannel() {
  if (Device.osName === "Android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
}

export async function scheduleTaskNootification(
  title: string,
  body: string,
  triggerDate: Date
) {
  if (triggerDate <= new Date()) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: "default", // soportado
    },

trigger: {
  type: Notifications.SchedulableTriggerInputTypes.DATE,
  date: triggerDate,
}
  });

  return id;
}

export async function scheduleTaskNotification(
  title: string,
  body: string,
  triggerDate: Date | null
): Promise<string | null> {
  if (!triggerDate || triggerDate <= new Date()) {
    console.log("No se puede programar notificación: fecha inválida o en el pasado", triggerDate);
    return null;
  }

  try {
    console.log("Programando notificación:", {
      title,
      body,
      triggerDate: triggerDate.toISOString(),
      triggerDateLocal: triggerDate.toLocaleString(),
    });

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      }
    });

    console.log("Notificación programada exitosamente con ID:", id);
    return id; // string
  } catch (err) {
    console.error("Error programando notificación:", err);
    return null;
  }
}
// ----------------------------------------
// Cancelar una notificación
// ----------------------------------------
export async function cancelTaskNotification(notificationId?: string | null) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (err) {
    console.log("Error cancelando notificación:", err);
  }
}
