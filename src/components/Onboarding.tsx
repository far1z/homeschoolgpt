"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Plus, X, Sparkles, Camera } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import type { Child, Toy, ToyCategory } from "@/types";
import { TOY_CATEGORIES } from "@/types";
import { saveChild, saveToys, completeOnboarding } from "@/lib/storage";
import CameraCapture from "./CameraCapture";

interface OnboardingProps {
  onComplete: () => void;
}

type Step = "welcome" | "child" | "toys" | "complete";

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<Step>("welcome");
  const [childName, setChildName] = useState("");
  const [childAgeYears, setChildAgeYears] = useState(2);
  const [childAgeMonths, setChildAgeMonths] = useState(0);
  const [toys, setToys] = useState<Toy[]>([]);
  const [newToyName, setNewToyName] = useState("");
  const [newToyCategory, setNewToyCategory] = useState<ToyCategory>("other");
  const [showAddToy, setShowAddToy] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleToyFromCamera = (toy: Toy) => {
    setToys([...toys, toy]);
    setShowCamera(false);
  };

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
  };

  const handleRemoveToy = (id: string) => {
    setToys(toys.filter((t) => t.id !== id));
  };

  const handleComplete = () => {
    const child: Child = {
      id: uuidv4(),
      name: childName,
      age: childAgeYears * 12 + childAgeMonths,
      createdAt: new Date().toISOString(),
    };

    saveChild(child);
    saveToys(toys);
    completeOnboarding();
    onComplete();
  };

  const canProceed = () => {
    switch (step) {
      case "child":
        return childName.trim().length > 0;
      case "toys":
        return toys.length >= 3;
      default:
        return true;
    }
  };

  const steps: Step[] = ["welcome", "child", "toys", "complete"];

  return (
    <div className="min-h-screen min-h-dvh flex flex-col px-6 py-8">
      {/* Progress indicator */}
      {step !== "welcome" && step !== "complete" && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-2 mb-8"
        >
          {["child", "toys"].map((s, i) => (
            <div
              key={s}
              className={`h-1.5 w-12 rounded-full transition-colors duration-300 ${
                steps.indexOf(step) > i || step === s
                  ? "bg-terracotta-500"
                  : "bg-cream-300"
              }`}
            />
          ))}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col justify-center items-center text-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-honey-300 to-terracotta-400 flex items-center justify-center mb-8 shadow-lg"
            >
              <Sparkles className="w-12 h-12 text-white" />
            </motion.div>

            <h1 className="font-display text-4xl font-semibold text-navy-800 mb-4">
              HomeschoolGPT
            </h1>

            <p className="text-navy-600 text-lg mb-12 max-w-sm leading-relaxed">
              Personalized play-based learning activities designed just for your
              little one.
            </p>

            <button
              onClick={() => setStep("child")}
              className="btn-primary flex items-center gap-2 text-lg px-8"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === "child" && (
          <motion.div
            key="child"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="font-display text-3xl font-semibold text-navy-800 mb-2">
              Tell us about your child
            </h2>
            <p className="text-navy-500 mb-8">
              We&apos;ll personalize activities for their age and development.
            </p>

            <div className="space-y-6 flex-1">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Child&apos;s Name
                </label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Enter their name"
                  className="input-field text-lg"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Age
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <select
                      value={childAgeYears}
                      onChange={(e) => setChildAgeYears(Number(e.target.value))}
                      className="input-field"
                    >
                      {[0, 1, 2, 3, 4, 5, 6].map((y) => (
                        <option key={y} value={y}>
                          {y} year{y !== 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <select
                      value={childAgeMonths}
                      onChange={(e) =>
                        setChildAgeMonths(Number(e.target.value))
                      }
                      className="input-field"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>
                          {i} month{i !== 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep("welcome")}
                className="btn-ghost flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={() => setStep("toys")}
                disabled={!canProceed()}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === "toys" && (
          <motion.div
            key="toys"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="font-display text-3xl font-semibold text-navy-800 mb-2">
              What toys do you have?
            </h2>
            <p className="text-navy-500 mb-6">
              Add at least 3 toys or materials. We&apos;ll create activities
              using what you have.
            </p>

            <div className="flex-1 overflow-y-auto -mx-6 px-6">
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
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="card flex items-center gap-3 p-4"
                      >
                        <span className="text-2xl">{category?.emoji}</span>
                        <div className="flex-1">
                          <p className="font-medium text-navy-800">
                            {toy.name}
                          </p>
                          <p className="text-sm text-navy-500">
                            {category?.label}
                          </p>
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
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <button
                      onClick={() => setShowCamera(true)}
                      className="flex-1 card border-2 border-dashed border-sage-300 hover:border-sage-400 hover:bg-sage-50/50 flex items-center justify-center gap-2 py-4 transition-colors"
                    >
                      <Camera className="w-5 h-5 text-sage-600" />
                      <span className="font-medium text-navy-600">
                        Take Photo
                      </span>
                    </button>
                    <button
                      onClick={() => setShowAddToy(true)}
                      className="flex-1 card border-2 border-dashed border-cream-300 hover:border-terracotta-300 hover:bg-terracotta-50/50 flex items-center justify-center gap-2 py-4 transition-colors"
                    >
                      <Plus className="w-5 h-5 text-terracotta-500" />
                      <span className="font-medium text-navy-600">
                        Type Name
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick add suggestions */}
              {toys.length < 3 && (
                <div className="mt-6">
                  <p className="text-sm text-navy-500 mb-3">Quick add:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: "Building Blocks", category: "blocks" as const },
                      { name: "Crayons", category: "art" as const },
                      { name: "Picture Books", category: "books" as const },
                      { name: "Play Dough", category: "sensory" as const },
                      { name: "Stacking Cups", category: "motor-skills" as const },
                      { name: "Musical Shaker", category: "music" as const },
                    ]
                      .filter(
                        (s) =>
                          !toys.some(
                            (t) => t.name.toLowerCase() === s.name.toLowerCase()
                          )
                      )
                      .slice(0, 4)
                      .map((suggestion) => (
                        <button
                          key={suggestion.name}
                          onClick={() => {
                            setToys([
                              ...toys,
                              {
                                id: uuidv4(),
                                name: suggestion.name,
                                category: suggestion.category,
                              },
                            ]);
                          }}
                          className="px-3 py-1.5 bg-cream-200 hover:bg-cream-300 rounded-full text-sm text-navy-700 transition-colors"
                        >
                          + {suggestion.name}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t border-cream-200">
              <button
                onClick={() => setStep("child")}
                className="btn-ghost flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={!canProceed()}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                Create Curriculum
                <Sparkles className="w-5 h-5" />
              </button>
            </div>

            {toys.length < 3 && (
              <p className="text-center text-sm text-navy-400 mt-3">
                Add {3 - toys.length} more toy{toys.length === 2 ? "" : "s"} to
                continue
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera capture modal */}
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
