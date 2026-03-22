"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/chat/sidebar";
import { RouteGuard } from "@/components/chat/route-guard";

export default function ChatLayout({ children }) {
  const MotionDiv = motion.div;
  const MotionButton = motion.button;
  const MotionAside = motion.aside;
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <RouteGuard>
      <MotionDiv
        className="mx-auto max-w-[1500px] px-3 py-3 sm:px-4 sm:py-5 md:px-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Simple Mobile Header - Only shows on smaller screens */}
        <div className="md:hidden flex items-center justify-between mb-4 bg-white/60 backdrop-blur-md border border-white/50 shadow-sm rounded-2xl px-4 py-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center justify-center p-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-all"
            type="button"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">BartaBox</h1>
          <div className="w-10"></div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              <MotionAside
                className="fixed left-0 top-0 bottom-0 z-50 w-[280px] max-w-[85vw] p-2 md:hidden"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <Sidebar compact onNavigate={() => setMobileOpen(false)} />
              </MotionAside>
            </>
          )}
        </AnimatePresence>

        <div className="grid gap-5 md:grid-cols-[280px_1fr]">
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <main className="apple-shell rounded-3xl p-2.5 sm:p-3 md:p-4">{children}</main>
        </div>
      </MotionDiv>
    </RouteGuard>
  );
}
