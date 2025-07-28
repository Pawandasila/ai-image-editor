"use client";

import React, { useState } from "react";
import {
  Folder,
  FolderPlus,
  Grid3X3,
  MoreVertical,
  Edit,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

export function FolderSidebar({ 
  selectedFolderId, 
  onFolderSelect, 
  onCreateFolder 
}) {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingName, setEditingName] = useState("");

  // Get user's folders
  const { data: folders = [], isLoading } = useConvexQuery(
    api.projects.getUserFolders
  );

  // Mutations
  const createFolder = useMutation(api.projects.createFolder);
  const deleteFolder = useMutation(api.projects.deleteFolder);
  const renameFolder = useMutation(api.projects.renameFolder);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const folderId = await createFolder({ name: newFolderName.trim() });
      setNewFolderName("");
      setIsCreatingFolder(false);
      onFolderSelect(folderId);
      if (onCreateFolder) onCreateFolder(folderId);
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      await deleteFolder({ folderId });
      if (selectedFolderId === folderId) {
        onFolderSelect(null); // Go back to all projects
      }
    } catch (error) {
      console.error("Failed to delete folder:", error);
    }
  };

  const handleRenameFolder = async () => {
    if (!editingName.trim() || !editingFolderId) return;

    try {
      await renameFolder({ 
        folderId: editingFolderId, 
        name: editingName.trim() 
      });
      setEditingFolderId(null);
      setEditingName("");
    } catch (error) {
      console.error("Failed to rename folder:", error);
      // Reset editing state on error
      setEditingFolderId(null);
      setEditingName("");
    }
  };

  const handleCancelEdit = () => {
    setEditingFolderId(null);
    setEditingName("");
  };

  return (
    <div className="w-72 bg-gradient-to-b from-slate-900/80 to-slate-800/80 backdrop-blur-xl border-r border-slate-700/30 h-full relative">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      
      <div className="p-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Organization</h3>
            <p className="text-xs text-slate-400">Manage your projects</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreatingFolder(true)}
            className="h-9 w-9 p-0 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-200"
          >
            <FolderPlus className="h-4 w-4 text-slate-300" />
          </Button>
        </div>

        {/* All Projects */}
        <div
          onClick={() => onFolderSelect(null)}
          className={`group flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 mb-4 relative overflow-hidden ${
            selectedFolderId === null
              ? "bg-gradient-to-r from-blue-500/30 to-cyan-500/20 text-white shadow-lg shadow-blue-500/20 border border-blue-500/30"
              : "hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 text-slate-300 hover:text-white"
          }`}
        >
          <div className={`p-2 rounded-lg ${
            selectedFolderId === null 
              ? "bg-white/10" 
              : "bg-slate-700/50 group-hover:bg-slate-600/50"
          }`}>
            <Grid3X3 className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">All Projects</span>
          {selectedFolderId === null && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 animate-pulse" />
          )}
        </div>

        {/* Create New Folder Input */}
        {isCreatingFolder && (
          <div className="mb-4 p-4 bg-gradient-to-r from-slate-800/80 to-slate-700/80 rounded-xl border border-slate-600/30 backdrop-blur-sm">
            <div className="mb-3">
              <label className="text-xs font-medium text-slate-300 mb-2 block">New Folder Name</label>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name..."
                className="bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-400"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateFolder();
                  } else if (e.key === "Escape") {
                    setIsCreatingFolder(false);
                    setNewFolderName("");
                  }
                }}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                Create
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName("");
                }}
                className="hover:bg-slate-700/50"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Folders List */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
            </div>
          ) : (
            folders.map((folder) => (
              <div
                key={folder._id}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 relative overflow-hidden ${
                  selectedFolderId === folder._id
                    ? "bg-gradient-to-r from-purple-500/30 to-pink-500/20 text-white shadow-lg shadow-purple-500/20 border border-purple-500/30"
                    : "hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 text-slate-300 hover:text-white"
                }`}
              >
                {editingFolderId === folder._id ? (
                  // Editing mode
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      selectedFolderId === folder._id 
                        ? "bg-white/10" 
                        : "bg-slate-700/50"
                    }`}>
                      <Edit className="h-4 w-4" />
                    </div>
                    <div className="flex-1 flex items-center space-x-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="bg-slate-900/50 border-slate-600/50 text-white text-sm h-8"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleRenameFolder();
                          } else if (e.key === "Escape") {
                            handleCancelEdit();
                          }
                        }}
                        onBlur={handleRenameFolder}
                      />
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          onClick={handleRenameFolder}
                          disabled={!editingName.trim()}
                          className="h-6 w-6 p-0 bg-green-500/20 hover:bg-green-500/30 text-green-400"
                        >
                          ✓
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          className="h-6 w-6 p-0 hover:bg-slate-600/50"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Normal mode
                  <>
                    <div
                      onClick={() => onFolderSelect(folder._id)}
                      className="flex items-center space-x-3 flex-1"
                    >
                      <div className={`p-2 rounded-lg ${
                        selectedFolderId === folder._id 
                          ? "bg-white/10" 
                          : "bg-slate-700/50 group-hover:bg-slate-600/50"
                      }`}>
                        {selectedFolderId === folder._id ? (
                          <FolderOpen className="h-4 w-4" />
                        ) : (
                          <Folder className="h-4 w-4" />
                        )}
                      </div>
                      <span className="text-sm font-medium truncate">
                        {folder.name}
                      </span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-slate-600/50"
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingFolderId(folder._id);
                            setEditingName(folder.name);
                          }}
                          className="text-slate-300 hover:text-white hover:bg-slate-700"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteFolder(folder._id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
                
                {selectedFolderId === folder._id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-pulse" />
                )}
              </div>
            ))
          )}
        </div>

        {folders.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-slate-700/50 to-slate-600/50 flex items-center justify-center">
              <Folder className="h-8 w-8 text-slate-400" />
            </div>
            <h4 className="text-slate-300 font-medium mb-1">No folders yet</h4>
            <p className="text-xs text-slate-400">Create one to organize your projects</p>
          </div>
        )}
      </div>
    </div>
  );
}
