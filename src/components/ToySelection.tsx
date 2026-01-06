"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Sparkles, Camera, Check } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import posthog from "posthog-js";
import type { Toy, ToyCategory } from "@/types";
import { TOY_CATEGORIES } from "@/types";
import CameraCapture from "./CameraCapture";
import SettingsDropdown from "./SettingsDropdown";

interface ToySelectionProps {
  childName: string;
  toyHistory: Toy[];
  onStartSession: (selectedToys: Toy[]) => void;
  onAddToHistory: (toy: Toy) => void;
  onProfileClick?: () => void;
  onShareClick?: () => void;
}

export default function ToySelection({
  childName,
  toyHistory,
  onStartSession,
  onAddToHistory,
  onProfileClick,
  onShareClick,
}: ToySelectionProps) {
  const [selectedToyIds, setSelectedToyIds] = useState<Set<string>>(new Set());
  const [showAddToy, setShowAddToy] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [newToyName, setNewToyName] = useState("");
  const [newToyCategory, setNewToyCategory] = useState<ToyCategory>("other");

  const toggleToy = (toyId: string) => {
    setSelectedToyIds((prev) => {
      const next = new Set(prev);
      if (next.has(toyId)) {
        next.delete(toyId);
      } else {
        next.add(toyId);
      }
      return next;
    });
  };

  const handleAddToy = () => {
    if (!newToyName.trim()) return;

    const toy: Toy = {
      id: uuidv4(),
      name: newToyName.trim(),
      category: newToyCategory,
    };

    onAddToHistory(toy);
    setSelectedToyIds((prev) => new Set([...prev, toy.id]));

    // Track toy added via manual entry
    posthog.capture('toy_added', {
      toy_name: toy.name,
      toy_category: toy.category,
      add_method: 'manual_entry',
    });

    setNewToyName("");
    setNewToyCategory("other");
    setShowAddToy(false);
  };

  const handleToyFromCamera = (toy: Toy) => {
    onAddToHistory(toy);
    setSelectedToyIds((prev) => new Set([...prev, toy.id]));

    // Track toy added via camera
    posthog.capture('toy_added', {
      toy_name: toy.name,
      toy_category: toy.category,
      add_method: 'camera',
    });

    setShowCamera(false);
  };

  const handleStartSession = () => {
    const selectedToys = toyHistory.filter((t) => selectedToyIds.has(t.id));

    // Track session started - key conversion event
    posthog.capture('session_started', {
      toys_selected_count: selectedToys.length,
      toy_categories: [...new Set(selectedToys.map(t => t.category))],
    });

    onStartSession(selectedToys);
  };

  const selectedCount = selectedToyIds.size;
  const canStart = selectedCount >= 1;

  return (
    <div className="min-h-screen min-h-dvh flex flex-col px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-navy-800 mb-2">
              Today&apos;s Toys
            </h1>
            <p className="text-navy-500">
              What does {childName} have to play with today?
            </p>
          </div>
          {onProfileClick && onShareClick && (
            <SettingsDropdown
              onProfileClick={onProfileClick}
              onShareClick={onShareClick}
            />
          )}
        </div>
      </motion.div>

      {/* Toy grid */}
      <div className="flex-1 overflow-y-auto -mx-6 px-6">
        {toyHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <p className="text-sm text-navy-500 mb-3">
              Tap to select what&apos;s available:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {toyHistory.map((toy, index) => {
                const category = TOY_CATEGORIES.find(
                  (c) => c.value === toy.category
                );
                const isSelected = selectedToyIds.has(toy.id);

                return (
                  <motion.button
                    key={toy.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => toggleToy(toy.id)}
                    className={`relative p-4 rounded-2xl text-left transition-all ${
                      isSelected
                        ? "bg-terracotta-100 border-2 border-terracotta-400 shadow-sm"
                        : "bg-white border-2 border-cream-200 hover:border-cream-300"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-terracotta-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="text-2xl block mb-2">{category?.emoji}</span>
                    <p className="font-medium text-navy-800 text-sm leading-tight">
                      {toy.name}
                    </p>
                    <p className="text-xs text-navy-400 mt-0.5">
                      {category?.label}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Add new toy section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {toyHistory.length > 0 && (
            <p className="text-sm text-navy-500 mb-3">Or add something new:</p>
          )}

          <AnimatePresence mode="wait">
            {showAddToy ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="card border-2 border-dashed border-terracotta-300 bg-terracotta-50/50 space-y-4"
              >
                <input
                  type="text"
                  value={newToyName}
                  onChange={(e) => setNewToyName(e.target.value)}
                  placeholder="Toy or material name"
                  className="input-field"
                  autoFocus
                />
                <select
                  value={newToyCategory}
                  onChange={(e) =>
                    setNewToyCategory(e.target.value as ToyCategory)
                  }
                  className="input-field"
                >
                  {TOY_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddToy(false)}
                    className="btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddToy}
                    disabled={!newToyName.trim()}
                    className="btn-primary flex-1"
                  >
                    Add Toy
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="buttons"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <button
                  onClick={() => setShowCamera(true)}
                  className="flex-1 card border-2 border-dashed border-sage-300 hover:border-sage-400 hover:bg-sage-50/50 flex items-center justify-center gap-2 py-4 transition-colors"
                >
                  <Camera className="w-5 h-5 text-sage-600" />
                  <span className="font-medium text-navy-600">Take Photo</span>
                </button>
                <button
                  onClick={() => setShowAddToy(true)}
                  className="flex-1 card border-2 border-dashed border-cream-300 hover:border-terracotta-300 hover:bg-terracotta-50/50 flex items-center justify-center gap-2 py-4 transition-colors"
                >
                  <Plus className="w-5 h-5 text-terracotta-500" />
                  <span className="font-medium text-navy-600">Type Name</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick add for first time */}
          {toyHistory.length === 0 && (
            <div className="mt-6">
              <p className="text-sm text-navy-500 mb-3">Quick add:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Building Blocks", category: "blocks" as const },
                  { name: "Crayons", category: "art" as const },
                  { name: "Picture Books", category: "books" as const },
                  { name: "Play Dough", category: "sensory" as const },
                  { name: "Stacking Cups", category: "motor-skills" as const },
                  { name: "Ball", category: "outdoor" as const },
                ].map((suggestion) => (
                  <button
                    key={suggestion.name}
                    onClick={() => {
                      const toy: Toy = {
                        id: uuidv4(),
                        name: suggestion.name,
                        category: suggestion.category,
                      };
                      onAddToHistory(toy);
                      setSelectedToyIds((prev) => new Set([...prev, toy.id]));

                      // Track toy added via quick add
                      posthog.capture('toy_added', {
                        toy_name: toy.name,
                        toy_category: toy.category,
                        add_method: 'quick_add',
                      });
                    }}
                    className="px-3 py-1.5 bg-cream-200 hover:bg-cream-300 rounded-full text-sm text-navy-700 transition-colors"
                  >
                    + {suggestion.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 pt-4 border-t border-cream-200"
      >
        <button
          onClick={handleStartSession}
          disabled={!canStart}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg"
        >
          <Sparkles className="w-6 h-6" />
          {selectedCount === 0
            ? "Select toys to start"
            : `Start with ${selectedCount} toy${selectedCount !== 1 ? "s" : ""}`}
        </button>
        {selectedCount === 0 && (
          <p className="text-center text-sm text-navy-400 mt-3">
            Select at least 1 toy to create activities
          </p>
        )}
      </motion.div>

      {/* Camera modal */}
      <AnimatePresence>
        {showCamera && (
          <CameraCapture
            onToyDetected={handleToyFromCamera}
            onClose={() => setShowCamera(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
