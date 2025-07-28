import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Get all projects for the current user with folder information
export const getUserProjects = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    // Get user's projects, ordered by most recently updated
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user_updated", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return projects;
  },
});

// Get projects by folder
export const getProjectsByFolder = query({
  args: { folderId: v.optional(v.union(v.id("folders"), v.null())) },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    if (args.folderId) {
      // Get projects in specific folder
      return await ctx.db
        .query("projects")
        .withIndex("by_folder", (q) => q.eq("folderId", args.folderId))
        .filter((q) => q.eq(q.field("userId"), user._id))
        .order("desc")
        .collect();
    } else {
      // Get projects not in any folder (folderId is null, undefined, or falsy)
      return await ctx.db
        .query("projects")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.or(
          q.eq(q.field("folderId"), undefined),
          q.eq(q.field("folderId"), null)
        ))
        .order("desc")
        .collect();
    }
  },
});

// Get all folders for the current user
export const getUserFolders = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    return await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("asc")
      .collect();
  },
});

// Create a new folder
export const createFolder = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    const now = Date.now();
    return await ctx.db.insert("folders", {
      name: args.name,
      userId: user._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Move project to folder
export const moveToFolder = mutation({
  args: {
    projectId: v.id("projects"),
    folderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    // Verify project ownership
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) {
      throw new Error("Project not found or access denied");
    }

    // Update project folder
    await ctx.db.patch(args.projectId, {
      folderId: args.folderId,
      updatedAt: Date.now(),
    });
  },
});

// Delete folder (moves all projects to root)
export const deleteFolder = mutation({
  args: { folderId: v.id("folders") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    // Verify folder ownership
    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== user._id) {
      throw new Error("Folder not found or access denied");
    }

    // Move all projects in this folder to root
    const projectsInFolder = await ctx.db
      .query("projects")
      .withIndex("by_folder", (q) => q.eq("folderId", args.folderId))
      .collect();

    for (const project of projectsInFolder) {
      await ctx.db.patch(project._id, {
        folderId: undefined,
        updatedAt: Date.now(),
      });
    }

    // Delete the folder
    await ctx.db.delete(args.folderId);
  },
});

// Rename folder
export const renameFolder = mutation({
  args: { 
    folderId: v.id("folders"),
    name: v.string()
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    // Verify folder ownership
    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== user._id) {
      throw new Error("Folder not found or access denied");
    }

    // Validate name
    const trimmedName = args.name.trim();
    if (!trimmedName) {
      throw new Error("Folder name cannot be empty");
    }

    // Check if folder with same name already exists
    const existingFolder = await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("name"), trimmedName))
      .first();

    if (existingFolder && existingFolder._id !== args.folderId) {
      throw new Error("A folder with this name already exists");
    }

    // Update folder name
    await ctx.db.patch(args.folderId, {
      name: trimmedName,
      updatedAt: Date.now(),
    });

    return args.folderId;
  },
});

// Create a new project
export const create = mutation({
  args: {
    title: v.string(),
    originalImageUrl: v.optional(v.string()),
    currentImageUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    width: v.number(),
    height: v.number(),
    canvasState: v.optional(v.any()),
    folderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    // Check plan limits for free users
    if (user.plan === "free") {
      const projectCount = await ctx.db
        .query("projects")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      if (projectCount.length >= 3) {
        throw new Error(
          "Free plan limited to 3 projects. Upgrade to Pro for unlimited projects."
        );
      }
    }

    // Create the project
    const projectId = await ctx.db.insert("projects", {
      title: args.title,
      userId: user._id,
      originalImageUrl: args.originalImageUrl,
      currentImageUrl: args.currentImageUrl,
      thumbnailUrl: args.thumbnailUrl,
      width: args.width,
      height: args.height,
      canvasState: args.canvasState,
      folderId: args.folderId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update user's project count
    await ctx.db.patch(user._id, {
      projectsUsed: user.projectsUsed + 1,
      lastActiveAt: Date.now(),
    });

    return projectId;
  },
});

// Delete a project
export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (!user || project.userId !== user._id) {
      throw new Error("Access denied");
    }

    // Delete the project
    await ctx.db.delete(args.projectId);

    // Update user's project count
    await ctx.db.patch(user._id, {
      projectsUsed: Math.max(0, user.projectsUsed - 1),
      lastActiveAt: Date.now(),
    });

    return { success: true };
  },
});

// Get a single project by ID
export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (!user || project.userId !== user._id) {
      throw new Error("Access denied");
    }

    return project;
  },
});

// Update project canvas state and metadata
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    canvasState: v.optional(v.any()),
    width: v.optional(v.number()), // ← Add this
    height: v.optional(v.number()), // ← Add this
    currentImageUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    activeTransformations: v.optional(v.string()),
    backgroundRemoved: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (!user || project.userId !== user._id) {
      throw new Error("Access denied");
    }

    // Update the project
    const updateData = {
      updatedAt: Date.now(),
    };

    // Only update provided fields
    if (args.canvasState !== undefined)
      updateData.canvasState = args.canvasState;
    if (args.width !== undefined) updateData.width = args.width;
    if (args.height !== undefined) updateData.height = args.height;
    if (args.currentImageUrl !== undefined)
      updateData.currentImageUrl = args.currentImageUrl;
    if (args.thumbnailUrl !== undefined)
      updateData.thumbnailUrl = args.thumbnailUrl;
    if (args.activeTransformations !== undefined)
      updateData.activeTransformations = args.activeTransformations;
    if (args.backgroundRemoved !== undefined)
      updateData.backgroundRemoved = args.backgroundRemoved;

    await ctx.db.patch(args.projectId, updateData);

    // Update user's last active time
    await ctx.db.patch(user._id, {
      lastActiveAt: Date.now(),
    });

    return args.projectId;
  },
});
