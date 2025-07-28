"use client";

import React, { useState } from "react";
import { Plus, Image, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { NewProjectModal } from "./_components/new-project-modal";
import { ProjectGrid } from "./_components/project-grid";

export default function DashboardPage() {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  // Get user's projects
  const { data: projects, isLoading } = useConvexQuery(
    api.projects.getUserProjects
  );

  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="container mx-auto px-6">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Your Projects
            </h1>
            <p className="text-white/70">
              Create and manage your AI-powered image designs
            </p>
          </div>

          <Button
            onClick={() => setShowNewProjectModal(true)}
            variant="primary"
            size="lg"
            className="gap-2"
          >
            <Plus className="h-5 w-5" />
            New Project
          </Button>
        </div>

        {/* Projects Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          </div>
        ) : projects && projects.length > 0 ? (
          <ProjectGrid projects={projects} />
        ) : (
          <EmptyState onCreateProject={() => setShowNewProjectModal(true)} />
        )}

        {/* New Project Modal */}
        <NewProjectModal
          isOpen={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
        />
      </div>
    </div>
  );
}

// Empty state when user has no projects
function EmptyState({ onCreateProject }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 flex items-center justify-center mb-6">
        <Image className="h-12 w-12 text-cyan-400" />
      </div>

      <h3 className="text-2xl font-semibold text-white mb-3">
        Create Your First Project
      </h3>

      <p className="text-white/70 mb-8 max-w-md">
        Upload an image to start editing with our powerful AI tools, or create a
        blank canvas to design from scratch.
      </p>

      <Button
        onClick={onCreateProject}
        variant="primary"
        size="xl"
        className="gap-2"
      >
        <Sparkles className="h-5 w-5" />
        Start Creating
      </Button>
    </div>
  );
}
