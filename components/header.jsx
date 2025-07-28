"use client";

import React, { useState, useEffect } from "react";
import { LayoutDashboard, Menu, X, Github, Star } from "lucide-react";
import Link from "next/link";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useStoreUser } from "@/hooks/use-store-user";
import { BarLoader } from "react-spinners";
import { Authenticated, Unauthenticated } from "convex/react";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

export default function Header() {
  const { isLoading } = useStoreUser();
  const path = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (path.includes("/editor")) {
    return null; // Hide header on editor page
  }

  const navItems = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
  ];

  // Smooth scroll function
  const scrollToSection = (href) => {
    if (href.startsWith("#")) {
      const elementId = href.substring(1);
      const element = document.getElementById(elementId);
      if (element) {
        const offsetTop = element.offsetTop - 100; // Account for fixed header
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-slate-900/90 backdrop-blur-xl border-b border-white/10 shadow-xl"
            : "bg-slate-900/50 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 select-none group"
            >
              <div className="relative">
                <span className="text-2xl lg:text-3xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-cyan-400 to-green-400 bg-clip-text text-transparent uppercase">
                  pixora
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/20 via-cyan-400/20 to-green-400/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </Link>

            {/* Desktop Navigation */}
            {path === "/" && (
              <nav className="hidden lg:flex items-center space-x-8">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.href}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onClick={() => scrollToSection(item.href)}
                    className="relative text-gray-300 hover:text-white font-medium transition-all duration-300 group cursor-pointer"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 group-hover:w-full transition-all duration-300" />
                  </motion.button>
                ))}
              </nav>
            )}

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              {/* GitHub Star Button */}
              <a
                href="https://github.com/Pawandasila/ai-image-editor"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-slate-600/40 hover:from-purple-600/30 hover:to-cyan-600/30 hover:border-purple-400/40 transition-all duration-300 text-white font-medium shadow-lg hover:shadow-purple-500/20 group"
              >
                <Github className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                <Star className="h-3 w-3 text-yellow-400" />
                <span className="text-sm">Star on GitHub</span>
              </a>

              {/* Auth Buttons */}
              <Authenticated>
                <Link href="/dashboard">
                  <Button
                    variant="glass"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-300"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Button>
                </Link>

                <UserButton
                  appearance={{
                    elements: {
                      avatarBox:
                        "w-10 h-10 rounded-xl border-2 border-white/20 hover:border-purple-400/50 transition-colors",
                      userButtonPopoverCard:
                        "shadow-2xl backdrop-blur-xl bg-slate-900/95 border border-white/20 rounded-2xl",
                      userPreviewMainIdentifier: "font-semibold text-white",
                      userPreviewSecondaryIdentifier: "text-gray-400",
                    },
                  }}
                  afterSignOutUrl="/"
                />
              </Authenticated>

              <Unauthenticated>
                <SignInButton>
                  <Button
                    variant="glass"
                    className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-300"
                  >
                    Sign In
                  </Button>
                </SignInButton>

                <SignUpButton>
                  <Button
                    variant="primary"
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 border-0 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 font-semibold"
                  >
                    Get Started
                  </Button>
                </SignUpButton>
              </Unauthenticated>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-3">
              <Authenticated>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 rounded-lg border border-white/20",
                      userButtonPopoverCard:
                        "shadow-xl backdrop-blur-md bg-slate-900/90 border border-white/20",
                      userPreviewMainIdentifier: "font-semibold text-white",
                    },
                  }}
                  afterSignOutUrl="/"
                />
              </Authenticated>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="lg:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
              {/* Mobile Navigation */}
              {path === "/" && (
                <nav className="space-y-3">
                  {navItems.map((item, index) => (
                    <motion.button
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => {
                        scrollToSection(item.href);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left text-gray-300 hover:text-white font-medium py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-300"
                    >
                      {item.label}
                    </motion.button>
                  ))}
                </nav>
              )}

              {/* Mobile Actions */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <a
                  href="https://github.com/Pawandasila/ai-image-editor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-slate-600/40 text-white font-medium shadow-lg"
                >
                  <Github className="h-5 w-5" />
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>Star on GitHub</span>
                </a>

                <Authenticated>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="glass"
                      className="w-full justify-start gap-3 px-4 py-3 rounded-xl bg-white/10 border border-white/20"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Button>
                  </Link>
                </Authenticated>

                <Unauthenticated>
                  <div className="space-y-3">
                    <SignInButton>
                      <Button
                        variant="glass"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign In
                      </Button>
                    </SignInButton>

                    <SignUpButton>
                      <Button
                        variant="primary"
                        className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 border-0 shadow-lg font-semibold"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Get Started
                      </Button>
                    </SignUpButton>
                  </div>
                </Unauthenticated>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading Bar */}
        {isLoading && (
          <div className="fixed bottom-0 left-0 w-full z-40">
            <BarLoader width="100%" height={3} color="#06b6d4" />
          </div>
        )}
      </motion.header>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-20" />
    </>
  );
}
