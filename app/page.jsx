"use client";

import FeaturesSection from "@/components/features";
import InteractiveStats from "@/components/interactive-stats";
import PricingSection from "@/components/pricing";


import React, { useState, useEffect, useRef } from "react";
import {
  Brain,
  Crop,
  Download,
  Layers,
  Palette,
  Scissors,
  Sparkles,
  Wand2,
  Zap,
  Play,
  ArrowRight,
  MousePointer,
  Brush,
  Eraser,
} from "lucide-react";

// Hero Section Component
const HeroSection = () => {
  const [textVisible, setTextVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("enhance");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [animationFrame, setAnimationFrame] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setTextVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePosition({ x, y });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      return () => container.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame((prev) => prev + 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const aiTools = [
    {
      id: "enhance",
      icon: Sparkles,
      label: "AI Enhance",
      color: "from-purple-500 via-fuchsia-500 to-pink-500",
      description: "Transform your images with neural enhancement",
      demo: "Sharpening details, reducing noise, enhancing colors...",
      particles: 12,
      effect: "enhance",
    },
    {
      id: "generate",
      icon: Brain,
      label: "AI Generate",
      color: "from-blue-500 via-cyan-500 to-teal-500",
      description: "Create stunning images from text prompts",
      demo: 'Generating: "A majestic dragon in cyberpunk city"...',
      particles: 15,
      effect: "generate",
    },
    {
      id: "remove",
      icon: Wand2,
      label: "Magic Erase",
      color: "from-orange-500 via-red-500 to-rose-500",
      description: "Remove unwanted objects seamlessly",
      demo: "Analyzing objects, intelligent removal in progress...",
      particles: 8,
      effect: "remove",
    },
    {
      id: "upscale",
      icon: Zap,
      label: "Super Scale",
      color: "from-green-500 via-emerald-500 to-teal-400",
      description: "AI-powered resolution enhancement",
      demo: "Upscaling to 4K resolution, preserving details...",
      particles: 10,
      effect: "upscale",
    },
  ];

  const editTools = [
    { icon: Crop, label: "Crop", shortcut: "C", color: "hover:bg-blue-500/20" },
    {
      icon: Scissors,
      label: "Cut",
      shortcut: "X",
      color: "hover:bg-red-500/20",
    },
    {
      icon: Palette,
      label: "Color",
      shortcut: "P",
      color: "hover:bg-purple-500/20",
    },
    {
      icon: Layers,
      label: "Layers",
      shortcut: "L",
      color: "hover:bg-green-500/20",
    },
    {
      icon: Brush,
      label: "Paint",
      shortcut: "B",
      color: "hover:bg-orange-500/20",
    },
    {
      icon: Eraser,
      label: "Erase",
      shortcut: "E",
      color: "hover:bg-pink-500/20",
    },
  ];

  const renderCanvasContent = () => {
    const currentTool = aiTools.find((tool) => tool.id === activeTab);

    const baseTransform = isClient
      ? `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg) translateZ(${isHovering ? "20px" : "0px"})`
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';

    return (
      <div
        className="relative h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-600/50 overflow-hidden"
        style={{
          transform: baseTransform,
          transition: "transform 0.3s ease-out",
        }}
      >
        {/* Dynamic Grid Background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(148, 163, 184, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148, 163, 184, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "30px 30px",
            transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`,
          }}
        />

        {/* Main Canvas */}
        <div className="absolute inset-8 rounded-xl overflow-hidden">
          {/* Tool-specific background */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${currentTool.color} opacity-80 rounded-xl`}
            style={{
              filter: isClient ? `hue-rotate(${animationFrame * 2}deg) brightness(1.1)` : 'brightness(1.1)',
            }}
          />

          {/* Interactive particles based on selected tool */}
          {[...Array(currentTool.particles)].map((_, i) => {
            const left = 15 + ((i * 7) % 70);
            const top = 20 + ((i * 11) % 60);
            const translateX = isClient ? Math.sin(animationFrame * 0.1 + i) * 20 : 0;
            const translateY = isClient ? Math.cos(animationFrame * 0.1 + i) * 15 : 0;
            const particleOpacity = isClient ? 0.4 + Math.sin(animationFrame * 0.05 + i) * 0.3 : 0.4;

            return (
              <div
                key={`${activeTab}-${i}`}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "2s",
                  transform: `translate(${translateX}px, ${translateY}px)`,
                  opacity: particleOpacity,
                }}
              />
            );
          })}

          {/* Tool-specific visual effects */}
          {activeTab === "enhance" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-32 h-32 border-2 border-white/30 rounded-lg mb-4 mx-auto overflow-hidden bg-black/20">
                  <div
                    className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 opacity-80"
                    style={{
                      filter: `contrast(${1 + Math.sin(animationFrame * 0.1) * 0.3}) brightness(${1 + Math.sin(animationFrame * 0.15) * 0.2})`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div className="text-center">
                  <Sparkles
                    className="w-8 h-8 mx-auto mb-2 text-white animate-spin"
                    style={{ animationDuration: "3s" }}
                  />
                  <div className="text-white text-sm font-medium">
                    Enhancing Quality
                  </div>
                  <div className="text-white/70 text-xs">
                    {currentTool.demo}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "generate" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-40 h-32 border-2 border-white/30 rounded-lg mb-4 overflow-hidden bg-black/20">
                  <div className="relative h-full">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-full h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"
                        style={{
                          top: `${i * 15}%`,
                          transform: `translateX(${-100 + ((animationFrame * 2 + i * 20) % 200)}%)`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <Brain className="w-8 h-8 mx-auto mb-2 text-white animate-pulse" />
                  <div className="text-white text-sm font-medium">
                    AI Generating
                  </div>
                  <div className="text-white/70 text-xs">
                    {currentTool.demo}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "remove" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-36 h-28 border-2 border-white/30 rounded-lg mb-4 overflow-hidden bg-black/20 relative">
                  <div className="absolute inset-2 bg-gradient-to-br from-orange-400 to-red-400 rounded opacity-60" />
                  <div
                    className="absolute w-16 h-16 border-2 border-white rounded-lg bg-black/40"
                    style={{
                      top: "20%",
                      left: "30%",
                      opacity: Math.max(0, 1 - ((animationFrame * 0.02) % 2)),
                    }}
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -rotate-12"
                    style={{
                      transform: `translateX(${-100 + ((animationFrame * 3) % 200)}%) rotate(-12deg)`,
                    }}
                  />
                </div>
                <div className="text-center">
                  <Wand2
                    className="w-8 h-8 mx-auto mb-2 text-white"
                    style={{ transform: `rotate(${animationFrame * 2}deg)` }}
                  />
                  <div className="text-white text-sm font-medium">
                    Magic Erasing
                  </div>
                  <div className="text-white/70 text-xs">
                    {currentTool.demo}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "upscale" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="flex space-x-4 mb-4">
                  <div className="w-16 h-16 border-2 border-white/30 rounded bg-black/20 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-400 opacity-60" />
                  </div>
                  <div className="flex items-center">
                    <ArrowRight className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div
                    className="border-2 border-white/30 rounded bg-black/20 overflow-hidden transition-all duration-1000"
                    style={{
                      width: `${32 + Math.sin(animationFrame * 0.1) * 16}px`,
                      height: `${32 + Math.sin(animationFrame * 0.1) * 16}px`,
                    }}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-400 opacity-80" />
                  </div>
                </div>
                <div className="text-center">
                  <Zap className="w-8 h-8 mx-auto mb-2 text-white animate-bounce" />
                  <div className="text-white text-sm font-medium">
                    Super Scaling
                  </div>
                  <div className="text-white/70 text-xs">
                    {currentTool.demo}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scanning effect overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none"
            style={{
              transform: `translateY(${-100 + ((animationFrame * 2) % 200)}%)`,
              height: "200%",
            }}
          />
        </div>

        {/* 3D depth layers */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-2xl border border-white/10"
              style={{
                transform: `translateZ(${(i + 1) * 5}px)`,
                opacity: 0.1 - i * 0.03,
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="relative h-full overflow-hidden">
      <div className="text-center z-10 px-6">
        <div
          className={`transition-all duration-1000 ${textVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h1 className="text-7xl md:text-9xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              Create
            </span>
            <br />
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              Without Limits
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Professional image editing powered by cutting-edge AI. Transform
            your vision into reality with neural-enhanced tools.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button className="group cursor-pointer relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-2xl shadow-purple-500/25">
              <span className="flex items-center">
                ✨ Start Creating Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <button className="group cursor-pointer px-8 py-4 bg-white/10 backdrop-blur-lg rounded-full font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300">
              <span className="flex items-center">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </span>
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative max-w-6xl mx-auto"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Main Editor Container */}
          <div className="relative backdrop-blur-xl bg-slate-950/80 border border-slate-700/50 rounded-3xl p-1 shadow-2xl">
            {/* Animated border glow */}
            <div
              className="absolute inset-0 rounded-3xl opacity-60 blur-sm"
              style={{
                background: `conic-gradient(from ${animationFrame * 2}deg, #8b5cf6, #06b6d4, #10b981, #f59e0b, #ef4444, #8b5cf6)`,
                zIndex: -1,
              }}
            />

            <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          Pixxel
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
                            AI Pro
                          </span>
                          <span className="text-xs text-green-400 flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />
                            Online
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors group">
                      <Download className="w-5 h-5 text-slate-400 group-hover:text-white" />
                    </button>
                    <div className="text-slate-400 text-sm">Ready to create</div>
                  </div>
                </div>

                <div className="flex h-[700px]">
                  {/* Left Sidebar - AI Tools */}
                  <div className="w-80 p-6 border-r border-slate-700/50 bg-slate-900/50">
                    <h3 className="text-white font-semibold mb-6 flex items-center text-lg">
                      <Brain className="w-6 h-6 mr-3 text-purple-400" />
                      AI Tools
                    </h3>

                    <div className="space-y-4 mb-8">
                      {aiTools.map((tool, index) => {
                        const IconComponent = tool.icon;
                        const isActive = activeTab === tool.id;
                        
                        return (
                          <div
                            key={tool.id}
                            className={`group relative p-2 rounded-2xl cursor-pointer transition-all duration-500 transform ${
                              isActive
                                ? `bg-gradient-to-r ${tool.color} shadow-2xl shadow-purple-500/25 scale-105`
                                : "bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:scale-102"
                            }`}
                            onClick={() => setActiveTab(tool.id)}
                            style={{ 
                              animationDelay: `${index * 100}ms`,
                              transform: isActive ? 'scale(1.05) translateZ(10px)' : 'scale(1)',
                            }}
                          >
                            <div className="flex items-center space-x-4">
                              <div
                                className={`p-3 rounded-xl transition-all duration-300 ${
                                  isActive
                                    ? "bg-white/20 shadow-lg"
                                    : "bg-slate-700/50 group-hover:bg-slate-600/50"
                                }`}
                              >
                                <IconComponent
                                  className={`w-6 h-6 transition-all duration-300 ${
                                    isActive
                                      ? "text-white animate-pulse"
                                      : "text-slate-300 group-hover:text-white"
                                  }`}
                                />
                              </div>
                              <div className="flex-1">
                                <div
                                  className={`font-semibold text-lg ${
                                    isActive
                                      ? "text-white"
                                      : "text-slate-200 group-hover:text-white"
                                  }`}
                                >
                                  {tool.label}
                                </div>
                                <div
                                  className={`text-xs ${
                                    isActive
                                      ? "text-white/80"
                                      : "text-slate-400 group-hover:text-slate-300"
                                  }`}
                                >
                                  {tool.description}
                                </div>
                              </div>
                            </div>

                            {isActive && (
                              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-transparent opacity-50 animate-pulse" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Tools */}
                    <h4 className="text-slate-300 font-semibold mb-4 text-sm uppercase tracking-wide">
                      Quick Edit
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {editTools.map((tool, index) => {
                        const IconComponent = tool.icon;
                        return (
                          <div
                            key={index}
                            className={`group p-4 bg-slate-800/30 hover:bg-slate-700/50 rounded-xl cursor-pointer transition-all duration-300 hover:scale-110 ${tool.color} border border-slate-700/30 hover:border-slate-600`}
                            title={`${tool.label} (${tool.shortcut})`}
                          >
                            <IconComponent className="w-5 h-5 text-slate-400 group-hover:text-white mx-auto mb-2 transition-colors" />
                            <div className="text-xs text-slate-500 group-hover:text-slate-300 text-center font-medium">
                              {tool.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Main Canvas Area */}
                  <div className="flex-1 p-6">
                    <div className="h-full rounded-2xl relative overflow-hidden">
                      {renderCanvasContent()}

                      {/* Status Bar */}
                      <div className="absolute bottom-6 left-6 right-6 bg-slate-800/90 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                              <span className="text-slate-300 font-medium">AI Ready</span>
                            </div>
                            <div className="text-slate-500">|</div>
                            <div className="text-slate-400">Canvas: 1920 × 1080</div>
                            <div className="text-slate-500">|</div>
                            <div className="text-slate-400 flex items-center">
                              <MousePointer className="w-4 h-4 mr-1" />
                              Interactive
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-slate-400">Processing</div>
                            <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                                style={{ width: isClient ? `${60 + Math.sin(animationFrame * 0.1) * 40}%` : '60%' }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </section>
  );
};

// Main App Component
const App = () => {
  return (
    <div className="pt-36">
      <HeroSection />
      <InteractiveStats />
      <FeaturesSection />
      <PricingSection />

      {/* Final CTA Section */}
      <section className="relative z-10 py-20 text-center px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            Ready to{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Create Magic?
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Join thousands of creators who are already using AI to transform their images and bring their wildest visions to life.
          </p>
          <button className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-full font-bold text-xl hover:scale-105 transition-all duration-300 shadow-2xl shadow-purple-500/25">
            <span className="flex items-center">
              🌟 Start Creating Now
              <Sparkles className="ml-3 w-6 h-6 group-hover:animate-spin" />
            </span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default App;
