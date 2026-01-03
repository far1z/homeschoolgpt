"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, RotateCcw, Check, Loader2, AlertCircle } from "lucide-react";
import type { Toy, ToyCategory } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface CameraCaptureProps {
  onToyDetected: (toy: Toy) => void;
  onClose: () => void;
}

type CaptureState = "ready" | "captured" | "analyzing" | "success" | "error";

export default function CameraCapture({ onToyDetected, onClose }: CameraCaptureProps) {
  const [state, setState] = useState<CaptureState>("ready");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedToy, setDetectedToy] = useState<{ name: string; category: ToyCategory } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setCapturedImage(base64);
      setState("captured");
    };
    reader.readAsDataURL(file);
  }, []);

  const analyzeImage = useCallback(async () => {
    if (!capturedImage) return;

    setState("analyzing");
    setErrorMessage("");

    try {
      // Extract base64 data and media type
      const matches = capturedImage.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        throw new Error("Invalid image format");
      }

      const mediaType = matches[1] as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
      const base64Data = matches[2];

      const response = await fetch("/api/analyze-toy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Data,
          mediaType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const result = await response.json();

      if (result.isRelevant && result.toy) {
        setDetectedToy(result.toy);
        setState("success");
      } else {
        setErrorMessage(result.reason || "This doesn't appear to be a toy or play item.");
        setState("error");
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      setErrorMessage("Failed to analyze the image. Please try again.");
      setState("error");
    }
  }, [capturedImage]);

  const handleConfirm = useCallback(() => {
    if (!detectedToy) return;

    const toy: Toy = {
      id: uuidv4(),
      name: detectedToy.name,
      category: detectedToy.category,
    };

    onToyDetected(toy);
  }, [detectedToy, onToyDetected]);

  const handleRetry = useCallback(() => {
    setCapturedImage(null);
    setDetectedToy(null);
    setErrorMessage("");
    setState("ready");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-navy-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-cream-200">
          <h2 className="font-display text-lg font-semibold text-navy-800">
            {state === "ready" && "Take a Photo"}
            {state === "captured" && "Review Photo"}
            {state === "analyzing" && "Analyzing..."}
            {state === "success" && "Toy Detected!"}
            {state === "error" && "Try Again"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cream-100 hover:bg-cream-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-navy-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Ready state - show camera button */}
            {state === "ready" && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-terracotta-100 to-terracotta-200 flex items-center justify-center mx-auto mb-6">
                  <Camera className="w-16 h-16 text-terracotta-500" />
                </div>
                <p className="text-navy-600 mb-6">
                  Take a photo of a toy and we&apos;ll automatically identify it
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={handleCapture}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Open Camera
                </button>
              </motion.div>
            )}

            {/* Captured state - show preview */}
            {state === "captured" && capturedImage && (
              <motion.div
                key="captured"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="relative rounded-2xl overflow-hidden mb-6">
                  <img
                    src={capturedImage}
                    alt="Captured toy"
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleRetry}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Retake
                  </button>
                  <button
                    onClick={analyzeImage}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Analyze
                  </button>
                </div>
              </motion.div>
            )}

            {/* Analyzing state */}
            {state === "analyzing" && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 rounded-full bg-terracotta-100 flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-10 h-10 text-terracotta-500 animate-spin" />
                </div>
                <p className="text-navy-600">
                  Identifying the toy...
                </p>
              </motion.div>
            )}

            {/* Success state */}
            {state === "success" && detectedToy && capturedImage && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="relative rounded-2xl overflow-hidden mb-4">
                  <img
                    src={capturedImage}
                    alt="Captured toy"
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-sage-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white font-medium">Found it!</span>
                    </div>
                  </div>
                </div>

                <div className="bg-cream-100 rounded-xl p-4 mb-6">
                  <p className="text-sm text-navy-500 mb-1">Detected toy:</p>
                  <p className="font-display text-xl font-semibold text-navy-800">
                    {detectedToy.name}
                  </p>
                  <p className="text-sm text-navy-500 capitalize">
                    Category: {detectedToy.category.replace("-", " ")}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleRetry}
                    className="btn-secondary flex-1"
                  >
                    Try Another
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Add Toy
                  </button>
                </div>
              </motion.div>
            )}

            {/* Error state */}
            {state === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                {capturedImage && (
                  <div className="relative rounded-2xl overflow-hidden mb-4">
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-32 object-cover opacity-50"
                    />
                  </div>
                )}
                <div className="w-16 h-16 rounded-full bg-terracotta-100 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-terracotta-500" />
                </div>
                <p className="text-navy-600 mb-6">
                  {errorMessage}
                </p>
                <button
                  onClick={handleRetry}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
