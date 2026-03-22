"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const defaultAlerts = [
  {
    id: 1,
    title: "New friend request",
    description: "Someone wants to connect with you. Review requests from Home.",
  },
  {
    id: 2,
    title: "Chat tips",
    description: "Pick any friend from Friend List to start a realtime conversation.",
  },
  {
    id: 3,
    title: "Security reminder",
    description: "Use verified email login and secure your account settings.",
  },
];

export default function NotificationPage() {
  const activeUser = useSelector((state) => state.activeUser.value);
  const storageKey = `notifications-${activeUser?.uid || "guest"}`;
  const [notifications, setNotifications] = useState(() => {
    if (typeof window === "undefined") {
      return defaultAlerts.map((item) => ({ ...item, isRead: false }));
    }
    const cached = window.localStorage.getItem(storageKey);
    if (cached) return JSON.parse(cached);
    return defaultAlerts.map((item) => ({ ...item, isRead: false }));
  });

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );
  const MotionDiv = motion.div;
  const MotionArticle = motion.article;

  const updateNotifications = (next) => {
    setNotifications(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    }
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
    <Card className="glass-panel rounded-3xl border-white/65">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>You have {unreadCount} unread alerts.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => updateNotifications(notifications.map((n) => ({ ...n, isRead: true })))}>
            Mark all read
          </Button>
          <Button size="sm" variant="secondary" onClick={() => updateNotifications([])}>
            Clear all
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {notifications.length === 0 && <p className="text-sm text-slate-500">All caught up.</p>}
        {notifications.map((item) => (
          <MotionArticle
            key={item.id}
            className={`lift-card rounded-xl border p-4 ${item.isRead ? "frost-card" : "bg-sky-50/90 border-sky-200"}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
          >
            <h4 className="font-semibold">{item.title}</h4>
            <p className="mt-1 text-sm text-slate-500">{item.description}</p>
            <Button
              className="mt-3"
              size="sm"
              variant="secondary"
              onClick={() =>
                updateNotifications(
                  notifications.map((n) => (n.id === item.id ? { ...n, isRead: !n.isRead } : n)),
                )
              }
            >
              {item.isRead ? "Mark unread" : "Mark read"}
            </Button>
          </MotionArticle>
        ))}
      </CardContent>
    </Card>
    </MotionDiv>
  );
}
