import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Check if we've already stored this identity before
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (user !== null) {
      // If we've seen this identity before but the name has changed, patch the value.
      if (user.name !== identity.name) {
        await ctx.db.patch(user._id, { name: identity.name });
      }
      return user._id;
    }

    // If it's a new identity, create a new `User`.
    return await ctx.db.insert("users", {
      name: identity.name ?? "Anonymous",
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email,
      imageUrl: identity.pictureUrl,
      plan: "free", // Default plan
      projectsUsed: 0, // Initialize usage counters
      exportsThisMonth: 0,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    });
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },
});

// Update user plan (called after successful subscription upgrade)
export const updatePlan = mutation({
  args: {
    plan: v.union(v.literal("free"), v.literal("pro")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Update the user's plan
    await ctx.db.patch(user._id, {
      plan: args.plan,
      lastActiveAt: Date.now(),
    });

    return { success: true, plan: args.plan };
  },
});

// Admin function to manually update any user's plan (for testing/support)
export const adminUpdateUserPlan = mutation({
  args: {
    userId: v.id("users"),
    plan: v.union(v.literal("free"), v.literal("pro")),
  },
  handler: async (ctx, args) => {
    // In a real app, you'd check if the current user is an admin
    // For now, we'll allow any authenticated user to call this for testing
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(args.userId, {
      plan: args.plan,
      lastActiveAt: Date.now(),
    });

    return { success: true, userId: args.userId, plan: args.plan };
  },
});

// Get current user's plan info
export const getUserPlan = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    return {
      plan: user.plan,
      projectsUsed: user.projectsUsed,
      exportsThisMonth: user.exportsThisMonth,
      email: user.email,
      name: user.name,
    };
  },
});
