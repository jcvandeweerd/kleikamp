"use client";

import { useCallback, useEffect, useState } from "react";

type NotificationPermission = "default" | "granted" | "denied";

/**
 * Hook for browser notifications (desktop + mobile).
 * Returns permission state, a request function, and a notify function.
 */
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "denied" as const;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const notify = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (permission !== "granted") return;
      try {
        new Notification(title, {
          icon: "/icon.svg",
          badge: "/icon.svg",
          ...options,
        });
      } catch {
        // Safari / iOS may not support Notification constructor
      }
    },
    [permission],
  );

  const isSupported = typeof window !== "undefined" && "Notification" in window;

  return { permission, requestPermission, notify, isSupported };
}
