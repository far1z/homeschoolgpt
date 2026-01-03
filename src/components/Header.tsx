"use client";

import { motion } from "framer-motion";
import { Settings, Sun, CloudSun, Moon } from "lucide-react";

interface HeaderProps {
  childName: string;
  onSettingsClick?: () => void;
}

function getGreeting(): { text: string; icon: React.ReactNode } {
  const hour = new Date().getHours();

  if (hour < 12) {
    return { text: "Good morning", icon: <Sun className="w-5 h-5 text-honey-500" /> };
  } else if (hour < 17) {
    return {
      text: "Good afternoon",
      icon: <CloudSun className="w-5 h-5 text-honey-500" />,
    };
  } else {
    return { text: "Good evening", icon: <Moon className="w-5 h-5 text-navy-400" /> };
  }
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function Header({ childName, onSettingsClick }: HeaderProps) {
  const greeting = getGreeting();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-6 py-4 flex items-center justify-between"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          {greeting.icon}
          <span className="text-navy-600">{greeting.text}</span>
        </div>
        <h1 className="font-display text-xl font-semibold text-navy-800">
          {childName}&apos;s Learning
        </h1>
        <p className="text-sm text-navy-400">{formatDate()}</p>
      </div>

      {onSettingsClick && (
        <button
          onClick={onSettingsClick}
          className="w-10 h-10 rounded-full bg-cream-200 hover:bg-cream-300 flex items-center justify-center transition-colors"
        >
          <Settings className="w-5 h-5 text-navy-600" />
        </button>
      )}
    </motion.header>
  );
}
