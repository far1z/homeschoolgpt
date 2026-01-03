"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  childName?: string;
}

export default function LoadingScreen({
  message = "Creating today's curriculum...",
  childName,
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen min-h-dvh flex flex-col items-center justify-center px-6">
      {/* Animated circles */}
      <div className="relative w-32 h-32 mb-8">
        <motion.div
          className="absolute inset-0 rounded-full bg-terracotta-200"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-4 rounded-full bg-terracotta-300"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2,
          }}
        />
        <motion.div
          className="absolute inset-8 rounded-full bg-gradient-to-br from-terracotta-400 to-terracotta-500 flex items-center justify-center shadow-lg"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
      </div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="font-display text-2xl font-semibold text-navy-800 mb-2">
          {message}
        </h2>
        {childName && (
          <p className="text-navy-500">
            Personalizing activities for {childName}
          </p>
        )}
      </motion.div>

      {/* Animated dots */}
      <div className="flex gap-2 mt-8">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-terracotta-400"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
