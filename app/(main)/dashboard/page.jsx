"use client";

import React, { useState } from "react";
import {
  Plus,
  Image,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Grid3X3,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { NewProjectModal } from "./_components/new-project-modal";
import { ProjectGrid } from "./_components/project-grid";
import { FolderSidebar } from "./_components/folder-sidebar";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: projects, isLoading } = useConvexQuery(
    api.projects.getProjectsByFolder,
    isSignedIn ? { folderId: selectedFolderId } : "skip"
  );

  const { data: currentUser } = useConvexQuery(
    api.users.getCurrentUser,
    isSignedIn ? {} : "skip"
  );

  const { mutate: updatePlan } = useConvexMutation(api.users.updatePlan);

  const { data: folders = [] } = useConvexQuery(
    api.projects.getUserFolders,
    isSignedIn ? {} : "skip"
  );
  const currentFolder = folders.find((f) => f._id === selectedFolderId);

  const handleSyncPlan = async () => {
    try {
      setIsSyncing(true);
      await updatePlan({ plan: "pro" });
      toast.success("Plan updated to Pro successfully!");
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error("Failed to update plan. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoaded && !isSignedIn) {
    redirect("/sign-in");
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-10">
      <div className="flex h-full">
        <FolderSidebar
          selectedFolderId={selectedFolderId}
          onFolderSelect={setSelectedFolderId}
          onCreateFolder={(folderId) => setSelectedFolderId(folderId)}
        />

        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent pointer-events-none" />

          <div className="container mx-auto px-8 relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center space-x-2 text-sm text-slate-400 mb-3">
                  <span
                    onClick={() => setSelectedFolderId(null)}
                    className="hover:text-cyan-400 cursor-pointer transition-colors duration-200 flex items-center gap-1"
                  >
                    <Grid3X3 className="h-3 w-3" />
                    All Projects
                  </span>
                  {currentFolder && (
                    <>
                      <ChevronRight className="h-4 w-4" />
                      <span className="text-white flex items-center gap-1">
                        <FolderOpen className="h-3 w-3" />
                        {currentFolder.name}
                      </span>
                    </>
                  )}
                </div>

                <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-4">
                  {currentFolder ? currentFolder.name : "Your Projects"}
                  {currentUser && (
                    <span
                      className={`text-sm px-3 py-1.5 rounded-full font-medium ${
                        currentUser.plan === "pro"
                          ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/20"
                          : "bg-gradient-to-r from-slate-600/50 to-slate-500/50 text-slate-300 border border-slate-500/40"
                      }`}
                    >
                      {currentUser.plan === "pro" ? "PRO" : "FREE"}
                    </span>
                  )}
                </h1>
                <p className="text-white/70 text-lg">
                  {currentFolder
                    ? `Projects in ${currentFolder.name} folder`
                    : "Create and manage your AI-powered image designs"}
                </p>
              </div>

              <div className="flex gap-3">
                {currentUser && currentUser.plan === "free" && (
                  <Button
                    onClick={handleSyncPlan}
                    disabled={isSyncing}
                    variant="outline"
                    size="lg"
                    className="gap-2 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400/50 transition-all duration-200"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                    />
                    {isSyncing ? "Syncing..." : "Sync Pro Plan"}
                  </Button>
                )}

                <Button
                  onClick={() => setShowNewProjectModal(true)}
                  variant="primary"
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/25 transition-all duration-200"
                >
                  <Plus className="h-5 w-5" />
                  New Project
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
              </div>
            ) : projects && projects.length > 0 ? (
              <ProjectGrid
                projects={projects}
                currentFolderId={selectedFolderId}
              />
            ) : (
              <EmptyState
                onCreateProject={() => setShowNewProjectModal(true)}
                isInFolder={!!currentFolder}
                folderName={currentFolder?.name}
              />
            )}

            <NewProjectModal
              isOpen={showNewProjectModal}
              onClose={() => setShowNewProjectModal(false)}
              defaultFolderId={selectedFolderId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onCreateProject, isInFolder, folderName }) {
  return (
    <div className="flex flex-col items-center justify-center  text-center">
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 flex items-center justify-center backdrop-blur-sm border border-white/10">
          <Image className="h-16 w-16 text-cyan-400" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      </div>

      <h3 className="text-3xl font-bold text-white mb-4">
        {isInFolder
          ? `No projects in ${folderName}`
          : "Create Your First Project"}
      </h3>

      <p className="text-white/70 mb-10 max-w-md text-lg leading-relaxed">
        {isInFolder
          ? `This folder is empty. Create a new project or move existing projects here.`
          : "Upload an image to start editing with our powerful AI tools, or create a blank canvas to design from scratch."}
      </p>

      <Button
        onClick={onCreateProject}
        variant="primary"
        size="xl"
        className="gap-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-xl shadow-blue-500/25 px-8 py-4 text-lg"
      >
        <Sparkles className="h-6 w-6" />
        {isInFolder ? "Create Project Here" : "Start Creating"}
      </Button>
    </div>
  );
}
