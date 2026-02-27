"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type NotifPermission = "default" | "granted" | "denied";

/**
 * Hook for browser notifications (desktop + mobile).
 * Uses a ref internally so `notify` is stable and always reads the latest permission.
 */
export function useNotifications() {
  const [permission, setPermission] = useState<NotifPermission>("default");
  const permissionRef = useRef<NotifPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      permissionRef.current = Notification.permission;
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "denied" as const;
    const result = await Notification.requestPermission();
    permissionRef.current = result;
    setPermission(result);
    return result;
  }, []);

  // Stable function — safe to use in effects without listing it as a dependency
  const notify = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (permissionRef.current !== "granted") return;
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
    [], // stable — reads from ref
  );

  const isSupported = typeof window !== "undefined" && "Notification" in window;

  return { permission, requestPermission, notify, isSupported };
}
