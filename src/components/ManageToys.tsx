"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, X, Save } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import type { Toy, ToyCategory } from "@/types";
import { TOY_CATEGORIES } from "@/types";
import { saveToys } from "@/lib/storage";

interface ManageToysProps {
  initialToys: Toy[];
  onClose: () => void;
}

export default function ManageToys({ initialToys, onClose }: ManageToysProps) {
  const [toys, setToys] = useState<Toy[]>(initialToys);
  const [newToyName, setNewToyName] = useState("");
  const [newToyCategory, setNewToyCategory] = useState<ToyCategory>("other");
  const [showAddToy, setShowAddToy] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleAddToy = () => {
    if (!newToyName.trim()) return;

    const toy: Toy = {
      id: uuidv4(),
      name: newToyName.trim(),
      category: newToyCategory,
    };

    setToys([...toys, toy]);
    setNewToyName("");
    setNewToyCategory("other");
    setShowAddToy(false);
    setHasChanges(true);
  };

  const handleRemoveToy = (id: string) => {
    setToys(toys.filter((t) => t.id !== id));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveToys(toys);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100%" }}
      className="fixed inset-0 bg-cream-100 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-4 border-b border-cream-200">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-cream-200 hover:bg-cream-300 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-navy-600" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-xl font-semibold text-navy-800">
            Manage Toys
          </h1>
          <p className="text-sm text-navy-500">{toys.length} items</p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            className="btn-primary flex items-center gap-2 py-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Toy list */}
        <div className="space-y-3 mb-4">
          <AnimatePresence>
            {toys.map((toy) => {
              const category = TOY_CATEGORIES.find(
                (c) => c.value === toy.category
              );
              return (
                <motion.div
                  key={toy.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, height: 0 }}
                  className="card flex items-center gap-3 p-4"
                >
                  <span className="text-2xl">{category?.emoji}</span>
                  <div className="flex-1">
                    <p className="font-medium text-navy-800">{toy.name}</p>
                    <p className="text-sm text-navy-500">{category?.label}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveToy(toy.id)}
                    className="p-2 hover:bg-cream-200 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-navy-400" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Add toy form */}
        <AnimatePresence>
          {showAddToy ? (
            <motion.div
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
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowAddToy(true)}
              className="w-full card border-2 border-dashed border-cream-300 hover:border-terracotta-300 hover:bg-terracotta-50/50 flex items-center justify-center gap-2 py-4 transition-colors"
            >
              <Plus className="w-5 h-5 text-terracotta-500" />
              <span className="font-medium text-navy-600">
                Add a toy or material
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
