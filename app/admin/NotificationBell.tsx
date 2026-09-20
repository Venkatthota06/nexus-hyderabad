"use client";

import { Bell, CheckCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  href: string;
  isRead: boolean;
};

type NotificationPayload = {
  unreadCount?: number;
  notifications?: NotificationItem[];
};

function relativeTime(value: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export default function NotificationBell() {
  const router = useRouter();
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadNotifications(silent = false) {
    if (!silent) setLoading(true);

    try {
      const response = await fetch("/api/notifications", {
        cache: "no-store",
      });

      if (!response.ok) return;

      const data = (await response.json()) as NotificationPayload;
      setUnreadCount(data.unreadCount ?? 0);
      setNotifications(data.notifications ?? []);
    } catch (error) {
      console.error("Notification load error:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();

    const interval = window.setInterval(() => {
      loadNotifications(true);
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        shellRef.current &&
        !shellRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  async function markRead(id: string) {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) return false;

      setNotifications((current) =>
        current.map((item) =>
          item.id === id ? { ...item, isRead: true } : item
        )
      );
      setUnreadCount((current) => Math.max(0, current - 1));
      return true;
    } catch (error) {
      console.error("Mark notification read error:", error);
      return false;
    }
  }

  async function markAllRead() {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });

      if (!response.ok) return;

      setNotifications((current) =>
        current.map((item) => ({ ...item, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Mark all notifications read error:", error);
    }
  }

  async function openNotification(item: NotificationItem) {
    if (!item.isRead) {
      await markRead(item.id);
    }

    setOpen(false);
    router.push(item.href);
  }

  return (
    <div className="v3-notification-shell" ref={shellRef}>
      <button
        type="button"
        className="v3-bell"
        aria-label={
          unreadCount
            ? `${unreadCount} unread notifications`
            : "Notifications"
        }
        aria-expanded={open}
        onClick={() => {
          setOpen((current) => !current);
          if (!open) loadNotifications(true);
        }}
      >
        <Bell size={19} />
        {unreadCount > 0 ? (
          <span className="v3-notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="v3-notification-panel">
          <div className="v3-notification-head">
            <div>
              <strong>Notifications</strong>
              <span>
                {unreadCount
                  ? `${unreadCount} unread`
                  : "You're all caught up"}
              </span>
            </div>

            {unreadCount > 0 ? (
              <button type="button" onClick={markAllRead}>
                <CheckCheck size={15} />
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="v3-notification-list">
            {loading ? (
              <div className="v3-notification-state">
                Loading notifications...
              </div>
            ) : notifications.length ? (
              notifications.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`v3-notification-item ${
                    item.isRead ? "" : "is-unread"
                  }`}
                  onClick={() => openNotification(item)}
                >
                  <span className="v3-notification-dot" />
                  <span className="v3-notification-copy">
                    <strong>{item.title}</strong>
                    <span>{item.message}</span>
                    <small>{relativeTime(item.createdAt)}</small>
                  </span>
                </button>
              ))
            ) : (
              <div className="v3-notification-state">
                No notifications yet.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
