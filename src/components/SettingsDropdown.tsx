"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, User, Share2 } from "lucide-react";

interface SettingsDropdownProps {
  onProfileClick: () => void;
  onShareClick: () => void;
}

export default function SettingsDropdown({
  onProfileClick,
  onShareClick,
}: SettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleProfileClick = () => {
    setIsOpen(false);
    onProfileClick();
  };

  const handleShareClick = () => {
    setIsOpen(false);
    onShareClick();
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          isOpen
            ? "bg-cream-300"
            : "bg-cream-200 hover:bg-cream-300"
        }`}
      >
        <Settings className={`w-5 h-5 text-navy-600 transition-transform ${isOpen ? "rotate-90" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-cream-200 overflow-hidden z-50"
          >
            <button
              onClick={handleProfileClick}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-cream-50 transition-colors text-left"
            >
              <User className="w-5 h-5 text-navy-500" />
              <span className="font-medium text-navy-700">Profile</span>
            </button>
            <div className="h-px bg-cream-200" />
            <button
              onClick={handleShareClick}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-cream-50 transition-colors text-left"
            >
              <Share2 className="w-5 h-5 text-navy-500" />
              <span className="font-medium text-navy-700">Share App</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
