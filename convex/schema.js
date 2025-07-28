// convex/schema.js
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - synced with Clerk authentication
  users: defineTable({
    // Basic user info from Clerk
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(), // Clerk user ID for auth
    imageUrl: v.optional(v.string()), // Profile picture

    // Subscription plan (managed by Clerk billing)
    plan: v.union(v.literal("free"), v.literal("pro")),

    // Usage tracking for plan limits
    projectsUsed: v.number(), // Current project count
    exportsThisMonth: v.number(), // Monthly export limit tracking

    // Activity timestamps
    createdAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index("by_token", ["tokenIdentifier"]) // Primary auth lookup
    .index("by_email", ["email"]) // Email lookups
    .searchIndex("search_name", { searchField: "name" }) // User search
    .searchIndex("search_email", { searchField: "email" }),

  // Main projects table - stores editing sessions
  projects: defineTable({
    // Basic project info
    title: v.string(),
    userId: v.id("users"), // Owner reference

    // Canvas dimensions and state
    canvasState: v.any(), // Fabric.js canvas JSON (objects, layers, etc.)
    width: v.number(), // Canvas width in pixels
    height: v.number(), // Canvas height in pixels

    // Image pipeline - tracks image transformations
    originalImageUrl: v.optional(v.string()), // Initial uploaded image
    currentImageUrl: v.optional(v.string()), // Current processed image
    thumbnailUrl: v.optional(v.string()), // HW - Small preview for dashboard

    // ImageKit transformation state
    activeTransformations: v.optional(v.string()), // Current ImageKit URL params

    // AI features state - tracks what AI processing has been applied
    backgroundRemoved: v.optional(v.boolean()), // Has background been removed

    // Organization
    folderId: v.optional(v.id("folders")), // HW - Optional folder organization

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(), // Last edit time
  })
    .index("by_user", ["userId"]) // Get user's projects
    .index("by_user_updated", ["userId", "updatedAt"]) // Recent projects
    .index("by_folder", ["folderId"]), // Projects in folder

  // Simple folder organization
  folders: defineTable({
    name: v.string(), // Folder name
    userId: v.id("users"), // Owner
    createdAt: v.number(),
  }).index("by_user", ["userId"]), // User's folders
});

/* 
PLAN LIMITS EXAMPLE:
- Free: 3 projects, 20 exports/month, basic features only
- Pro: Unlimited projects/exports, all AI features
*/
