"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Wand2 } from "lucide-react";
import { useCanvas } from "@/context/context";
import { FabricImage } from "fabric";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";

const DIRECTIONS = [
  { key: "top", label: "Top", icon: ArrowUp },
  { key: "bottom", label: "Bottom", icon: ArrowDown },
  { key: "left", label: "Left", icon: ArrowLeft },
  { key: "right", label: "Right", icon: ArrowRight },
];

const FOCUS_MAP = {
  left: "fo-right",
  right: "fo-left",
  top: "fo-bottom",
  bottom: "fo-top",
};

export function AIExtenderControls({ project }) {
  const { canvasEditor, setProcessingMessage } = useCanvas();
  const [selectedDirection, setSelectedDirection] = useState(null);
  const [extensionAmount, setExtensionAmount] = useState(200);
  const { mutate: updateProject } = useConvexMutation(
    api.projects.updateProject
  );

  const getMainImage = () =>
    canvasEditor?.getObjects().find((obj) => obj.type === "image") || null;

  const getImageSrc = (image) =>
    image?.getSrc?.() || image?._element?.src || image?.src;

  const hasBackgroundRemoval = () => {
    const imageSrc = getImageSrc(getMainImage());
    return (
      imageSrc?.includes("e-bgremove") ||
      imageSrc?.includes("e-removedotbg") ||
      imageSrc?.includes("e-changebg")
    );
  };

  const calculateDimensions = () => {
    const image = getMainImage();
    if (!image || !selectedDirection) return { width: 0, height: 0 };

    const currentWidth = image.width * (image.scaleX || 1);
    const currentHeight = image.height * (image.scaleY || 1);

    const isHorizontal = ["left", "right"].includes(selectedDirection);
    const isVertical = ["top", "bottom"].includes(selectedDirection);

    return {
      width: Math.round(currentWidth + (isHorizontal ? extensionAmount : 0)),
      height: Math.round(currentHeight + (isVertical ? extensionAmount : 0)),
    };
  };

  const buildExtensionUrl = (imageUrl) => {
    if (!imageUrl || !selectedDirection) return imageUrl;

    // Always use the base URL without existing transformations to avoid duplicates
    const baseUrl = imageUrl.split("?")[0];
    const { width, height } = calculateDimensions();

    const transformations = [
      "bg-genfill",
      `w-${width}`,
      `h-${height}`,
      "cm-pad_resize",
    ];

    // Add focus positioning
    const focus = FOCUS_MAP[selectedDirection];
    if (focus) transformations.push(focus);

    return `${baseUrl}?tr=${transformations.join(",")}`;
  };

  const selectDirection = (direction) => {
    // Toggle selection - if same direction is clicked, deselect it
    setSelectedDirection((prev) => (prev === direction ? null : direction));
  };

  const applyExtension = async () => {
    const mainImage = getMainImage();
    if (!mainImage || !selectedDirection) return;

    setProcessingMessage("Extending image with AI...");

    try {
      const currentImageUrl = getImageSrc(mainImage);
      const extendedUrl = buildExtensionUrl(currentImageUrl);

      const extendedImage = await FabricImage.fromURL(extendedUrl, {
        crossOrigin: "anonymous",
      });

      // Scale to fit canvas
      const scale = Math.min(
        project.width / extendedImage.width,
        project.height / extendedImage.height,
        1
      );

      extendedImage.set({
        left: project.width / 2,
        top: project.height / 2,
        originX: "center",
        originY: "center",
        scaleX: scale,
        scaleY: scale,
        selectable: true,
        evented: true,
      });

      // Replace image
      canvasEditor.remove(mainImage);
      canvasEditor.add(extendedImage);
      canvasEditor.setActiveObject(extendedImage);
      canvasEditor.requestRenderAll();

      // Save to database
      await updateProject({
        projectId: project._id,
        currentImageUrl: extendedUrl,
        canvasState: canvasEditor.toJSON(),
      });

      setSelectedDirection(null);
    } catch (error) {
      console.error("Error applying extension:", error);
      alert("Failed to extend image. Please try again.");
    } finally {
      setProcessingMessage(null);
    }
  };

  // Early returns for error states
  if (!canvasEditor) {
    return <div className="p-4 text-white/70 text-sm">Canvas not ready</div>;
  }

  const mainImage = getMainImage();
  if (!mainImage) {
    return (
      <div className="p-4 text-white/70 text-sm">Please add an image first</div>
    );
  }

  if (hasBackgroundRemoval()) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
        <h3 className="text-amber-400 font-medium mb-2">
          Extension Not Available
        </h3>
        <p className="text-amber-300/80 text-sm">
          AI Extension cannot be used on images with removed backgrounds. Use
          extension first, then remove background.
        </p>
      </div>
    );
  }

  const { width: newWidth, height: newHeight } = calculateDimensions();
  const currentImage = getMainImage();

  return (
    <div className="space-y-6">
      {/* Direction Selection */}
      <div>
        <h3 className="text-sm font-medium text-white mb-3">
          Select Extension Direction
        </h3>
        <p className="text-xs text-white/70 mb-3">
          Choose one direction to extend your image
        </p>
        <div className="grid grid-cols-2 gap-3">
          {DIRECTIONS.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              onClick={() => selectDirection(key)}
              variant={selectedDirection === key ? "default" : "outline"}
              className={`flex items-center gap-2 ${
                selectedDirection === key ? "bg-cyan-500 hover:bg-cyan-600" : ""
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Extension Amount */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm text-white">Extension Amount</label>
          <span className="text-xs text-white/70">{extensionAmount}px</span>
        </div>
        <Slider
          value={[extensionAmount]}
          onValueChange={([value]) => setExtensionAmount(value)}
          min={50}
          max={500}
          step={25}
          className="w-full"
          disabled={!selectedDirection}
        />
      </div>

      {/* Dimensions Preview */}
      {selectedDirection && (
        <div className="bg-slate-700/30 rounded-lg p-3">
          <h4 className="text-sm font-medium text-white mb-2">
            Extension Preview
          </h4>
          <div className="text-xs text-white/70 space-y-1">
            <div>
              Current:{" "}
              {Math.round(currentImage.width * (currentImage.scaleX || 1))} ×{" "}
              {Math.round(currentImage.height * (currentImage.scaleY || 1))}px
            </div>
            <div className="text-cyan-400">
              Extended: {newWidth} × {newHeight}px
            </div>
            <div className="text-white/50">
              Canvas: {project.width} × {project.height}px (unchanged)
            </div>
            <div className="text-cyan-300">
              Direction:{" "}
              {DIRECTIONS.find((d) => d.key === selectedDirection)?.label}
            </div>
          </div>
        </div>
      )}

      {/* Apply Button */}
      <Button
        onClick={applyExtension}
        disabled={!selectedDirection}
        className="w-full"
        variant="primary"
      >
        <Wand2 className="h-4 w-4 mr-2" />
        Apply AI Extension
      </Button>

      {/* Instructions */}
      <div className="bg-slate-700/30 rounded-lg p-3">
        <p className="text-xs text-white/70">
          <strong>How it works:</strong> Select one direction → Set amount →
          Apply extension. AI will intelligently fill the new area in that
          direction.
        </p>
      </div>
    </div>
  );
}
