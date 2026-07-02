/** Desktop notifications for session completion. Degrades silently. */

export const notificationsSupported = (): boolean => 'Notification' in window;

export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    return (await Notification.requestPermission()) === 'granted';
  } catch {
    return false;
  }
}

export function sendNotification(title: string, body: string): void {
  if (!notificationsSupported() || Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, silent: true });
  } catch {
    // Some platforms require a service worker — nothing to do here.
  }
}
