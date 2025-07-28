"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Crop,
  CheckCheck,
  X,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Smartphone,
  Maximize,
} from "lucide-react";
import { useCanvas } from "@/context/context";
import { FabricImage, Rect } from "fabric";

const ASPECT_RATIOS = [
  { label: "Freeform", value: null, icon: Maximize },
  { label: "Square", value: 1, icon: Square, ratio: "1:1" },
  {
    label: "Widescreen",
    value: 16 / 9,
    icon: RectangleHorizontal,
    ratio: "16:9",
  },
  { label: "Portrait", value: 4 / 5, icon: RectangleVertical, ratio: "4:5" },
  { label: "Story", value: 9 / 16, icon: Smartphone, ratio: "9:16" },
];

export function CropContent() {
  const { canvasEditor, activeTool } = useCanvas();

  const [selectedImage, setSelectedImage] = useState(null);
  const [isCropMode, setIsCropMode] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState(null);
  const [cropRect, setCropRect] = useState(null);
  const [originalProps, setOriginalProps] = useState(null);

  // Get the currently selected or main image
  const getActiveImage = () => {
    if (!canvasEditor) return null;

    const activeObject = canvasEditor.getActiveObject();
    if (activeObject && activeObject.type === "image") {
      return activeObject;
    }

    const objects = canvasEditor.getObjects();
    return objects.find((obj) => obj.type === "image") || null;
  };

  // Remove all Rect objects from canvas (cleanup crop rectangles)
  const removeAllCropRectangles = () => {
    if (!canvasEditor) return;

    const objects = canvasEditor.getObjects();
    const rectsToRemove = objects.filter((obj) => obj.type === "rect");

    rectsToRemove.forEach((rect) => {
      canvasEditor.remove(rect);
    });

    canvasEditor.requestRenderAll();
  };

  // Initialize crop mode when tool becomes active
  useEffect(() => {
    if (activeTool === "crop" && canvasEditor && isCropMode) {
      const image = getActiveImage();
      if (image) {
        initializeCropMode(image);
      }
    } else if (activeTool !== "crop" && isCropMode) {
      exitCropMode();
    }
  }, [activeTool, canvasEditor]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (isCropMode) {
        exitCropMode();
      }
    };
  }, []);

  // Initialize crop mode
  const initializeCropMode = (image) => {
    if (!image || isCropMode) return;

    // First, remove any existing crop rectangles
    removeAllCropRectangles();

    // Store original image properties
    const original = {
      left: image.left,
      top: image.top,
      width: image.width,
      height: image.height,
      scaleX: image.scaleX,
      scaleY: image.scaleY,
      angle: image.angle || 0,
      selectable: image.selectable,
      evented: image.evented,
    };

    setOriginalProps(original);
    setSelectedImage(image);
    setIsCropMode(true);

    // Make image non-selectable to prevent default scaling
    image.set({
      selectable: false,
      evented: false,
    });

    // Create crop rectangle overlay
    createCropRectangle(image);

    canvasEditor.requestRenderAll();
  };

  // Create the crop rectangle overlay
  const createCropRectangle = (image) => {
    // Calculate image bounds on canvas
    const bounds = image.getBoundingRect();

    const cropRectangle = new Rect({
      left: bounds.left + bounds.width * 0.1,
      top: bounds.top + bounds.height * 0.1,
      width: bounds.width * 0.8,
      height: bounds.height * 0.8,
      fill: "transparent",
      stroke: "#00bcd4",
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: true,
      evented: true,
      name: "cropRect",
      cornerColor: "#00bcd4",
      cornerSize: 12,
      transparentCorners: false,
      cornerStyle: "circle",
      borderColor: "#00bcd4",
      borderScaleFactor: 1,
      // Add a custom property to identify crop rectangles
      isCropRectangle: true,
    });

    // Add custom control behavior
    cropRectangle.on("scaling", (e) => {
      const rect = e.target;

      // Apply aspect ratio constraint if selected
      if (selectedRatio && selectedRatio !== null) {
        const currentRatio =
          (rect.width * rect.scaleX) / (rect.height * rect.scaleY);
        if (Math.abs(currentRatio - selectedRatio) > 0.01) {
          // Adjust height to maintain ratio
          const newHeight =
            (rect.width * rect.scaleX) / selectedRatio / rect.scaleY;
          rect.set("height", newHeight);
        }
      }

      canvasEditor.requestRenderAll();
    });

    canvasEditor.add(cropRectangle);
    canvasEditor.setActiveObject(cropRectangle);
    setCropRect(cropRectangle);
  };

  // Exit crop mode and cleanup
  const exitCropMode = () => {
    if (!isCropMode) return;

    // Remove ALL rectangles from canvas (since we only use them for cropping)
    removeAllCropRectangles();

    // Clear crop rect reference
    setCropRect(null);

    // Restore original image properties
    if (selectedImage && originalProps) {
      selectedImage.set({
        selectable: originalProps.selectable,
        evented: originalProps.evented,
        // Restore other properties if needed
        left: originalProps.left,
        top: originalProps.top,
        scaleX: originalProps.scaleX,
        scaleY: originalProps.scaleY,
        angle: originalProps.angle,
      });

      // Select the restored image
      canvasEditor.setActiveObject(selectedImage);
    }

    setIsCropMode(false);
    setSelectedImage(null);
    setOriginalProps(null);
    setSelectedRatio(null);

    if (canvasEditor) {
      canvasEditor.requestRenderAll();
    }

    console.log("Crop mode cleanup complete");
  };

  // Apply aspect ratio constraint to crop rectangle
  const applyAspectRatio = (ratio) => {
    setSelectedRatio(ratio);

    if (!cropRect || ratio === null) return;

    // Calculate new dimensions maintaining aspect ratio
    const currentWidth = cropRect.width * cropRect.scaleX;
    const newHeight = currentWidth / ratio;

    cropRect.set({
      height: newHeight / cropRect.scaleY,
      scaleY: cropRect.scaleX,
    });

    canvasEditor.requestRenderAll();
  };

  // Apply crop transformation using Fabric.js built-in cropping
  const applyCrop = async () => {
    if (!selectedImage || !cropRect) return;

    try {
      // Get crop rectangle bounds
      const cropBounds = cropRect.getBoundingRect();
      const imageBounds = selectedImage.getBoundingRect();

      // Calculate crop relative to the original image
      const cropX = Math.max(0, cropBounds.left - imageBounds.left);
      const cropY = Math.max(0, cropBounds.top - imageBounds.top);
      const cropWidth = Math.min(cropBounds.width, imageBounds.width - cropX);
      const cropHeight = Math.min(
        cropBounds.height,
        imageBounds.height - cropY
      );

      // Convert to image coordinate system (accounting for image scaling)
      const imageScaleX = selectedImage.scaleX || 1;
      const imageScaleY = selectedImage.scaleY || 1;

      const actualCropX = cropX / imageScaleX;
      const actualCropY = cropY / imageScaleY;
      const actualCropWidth = cropWidth / imageScaleX;
      const actualCropHeight = cropHeight / imageScaleY;

      // Create a new cropped image using Fabric.js cropping
      const croppedImage = new FabricImage(selectedImage._element, {
        left: cropBounds.left + cropBounds.width / 2,
        top: cropBounds.top + cropBounds.height / 2,
        originX: "center",
        originY: "center",
        selectable: true,
        evented: true,
        // Apply crop using Fabric.js crop properties
        cropX: actualCropX,
        cropY: actualCropY,
        width: actualCropWidth,
        height: actualCropHeight,
        scaleX: imageScaleX,
        scaleY: imageScaleY,
      });

      // Replace the original image
      canvasEditor.remove(selectedImage);
      canvasEditor.add(croppedImage);
      canvasEditor.setActiveObject(croppedImage);
      canvasEditor.requestRenderAll();

      // Exit crop mode
      exitCropMode();
    } catch (error) {
      console.error("Error applying crop:", error);
      alert("Failed to apply crop. Please try again.");
      exitCropMode();
    }
  };

  // Cancel crop and reset
  const cancelCrop = () => {
    exitCropMode();
  };

  if (!canvasEditor) {
    return (
      <div className="p-4">
        <p className="text-white/70 text-sm">Canvas not ready</p>
      </div>
    );
  }

  const activeImage = getActiveImage();
  if (!activeImage && !isCropMode) {
    return (
      <div className="p-4">
        <p className="text-white/70 text-sm">Select an image to crop</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Crop Mode Status */}
      {isCropMode && (
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
          <p className="text-cyan-400 text-sm font-medium">
            ✂️ Crop Mode Active
          </p>
          <p className="text-cyan-300/80 text-xs mt-1">
            Adjust the blue rectangle to set crop area
          </p>
        </div>
      )}

      {/* Start Crop Button */}
      {!isCropMode && activeImage && (
        <Button
          onClick={() => initializeCropMode(activeImage)}
          className="w-full"
          variant="primary"
        >
          <Crop className="h-4 w-4 mr-2" />
          Start Cropping
        </Button>
      )}

      {/* Aspect Ratio Selection - Only show in crop mode */}
      {isCropMode && (
        <div>
          <h3 className="text-sm font-medium text-white mb-3">
            Crop Aspect Ratios
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {ASPECT_RATIOS.map((ratio) => {
              const IconComponent = ratio.icon;
              return (
                <button
                  key={ratio.label}
                  onClick={() => applyAspectRatio(ratio.value)}
                  className={`text-center p-3 border rounded-lg transition-colors cursor-pointer ${
                    selectedRatio === ratio.value
                      ? "border-cyan-400 bg-cyan-400/10"
                      : "border-white/20 hover:border-white/40 hover:bg-white/5"
                  }`}
                >
                  <IconComponent className="h-6 w-6 mx-auto mb-2 text-white" />
                  <div className="text-xs text-white">{ratio.label}</div>
                  {ratio.ratio && (
                    <div className="text-xs text-white/70">{ratio.ratio}</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Crop Actions - Only show in crop mode */}
      {isCropMode && (
        <div className="space-y-3 pt-4 border-t border-white/10">
          <Button onClick={applyCrop} className="w-full" variant="primary">
            <CheckCheck className="h-4 w-4 mr-2" />
            Apply Crop
          </Button>

          <Button onClick={cancelCrop} variant="outline" className="w-full">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-slate-700/30 rounded-lg p-3">
        <p className="text-xs text-white/70">
          <strong>How to crop:</strong>
          <br />
          1. Click "Start Cropping"
          <br />
          2. Drag the blue rectangle to select crop area
          <br />
          3. Choose aspect ratio (optional)
          <br />
          4. Click "Apply Crop" to finalize
        </p>
      </div>
    </div>
  );
}
