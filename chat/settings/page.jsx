"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setActiveUser } from "@/store/slices/userSlice";

const defaultSettings = {
  messagePreview: true,
  desktopAlerts: true,
  darkBubbles: false,
};

export default function SettingsPage() {
  const user = useSelector((state) => state.activeUser.value);
  const dispatch = useDispatch();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const key = useMemo(() => `settings-${user?.uid || "guest"}`, [user?.uid]);

  const [settings, setSettings] = useState(() => {
    if (typeof window === "undefined") {
      return defaultSettings;
    }
    const cached = window.localStorage.getItem(key);
    return cached ? JSON.parse(cached) : defaultSettings;
  });
  const MotionDiv = motion.div;
  const MotionArticle = motion.article;

  const persistSettings = (next) => {
    setSettings(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(next));
    }
  };

  const saveProfile = () => {
    const updated = { ...user, displayName: displayName.trim() || user?.displayName };
    dispatch(setActiveUser(updated));
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
    <Card className="glass-panel rounded-3xl border-white/65">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <MotionArticle
          className="frost-card lift-card rounded-xl p-4"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.26 }}
        >
          <h3 className="mb-3 font-semibold">Profile</h3>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display name" />
          <Button className="mt-3" onClick={saveProfile}>Save profile</Button>
        </MotionArticle>

        <MotionArticle
          className="frost-card lift-card rounded-xl p-4"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.26, delay: 0.04 }}
        >
          <h3 className="mb-3 font-semibold">Preferences</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-white/80 p-2">
              <span>Message preview</span>
              <Button size="sm" variant="secondary" onClick={() => persistSettings({ ...settings, messagePreview: !settings.messagePreview })}>
                {settings.messagePreview ? "On" : "Off"}
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/80 p-2">
              <span>Desktop alerts</span>
              <Button size="sm" variant="secondary" onClick={() => persistSettings({ ...settings, desktopAlerts: !settings.desktopAlerts })}>
                {settings.desktopAlerts ? "On" : "Off"}
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/80 p-2">
              <span>Dark bubbles</span>
              <Button size="sm" variant="secondary" onClick={() => persistSettings({ ...settings, darkBubbles: !settings.darkBubbles })}>
                {settings.darkBubbles ? "On" : "Off"}
              </Button>
            </div>
          </div>
        </MotionArticle>
      </CardContent>
    </Card>
    </MotionDiv>
  );
}
