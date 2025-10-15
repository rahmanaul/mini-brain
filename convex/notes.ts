import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getNotes = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("notes"),
    _creationTime: v.number(),
    userId: v.string(),
    title: v.string(),
    content: v.string(),
    embedding: v.array(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })),
  handler: async (ctx, _args) => {
    return await ctx.db.query("notes").collect();
  },
});

// check if its the user's note and user is authenticated
export const deleteNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }
    const note = await ctx.db.get(args.id);
    if (!note) {
      throw new Error("Note not found");
    }
    if (note.userId !== userId) {
      throw new Error("User does not have permission to delete this note");
    }
    await ctx.db.delete(args.id);
  },
});

// Update a note's title, content, and embedding
export const updateNoteWithEmbedding = mutation({
  args: {
    id: v.id("notes"),
    title: v.string(),
    content: v.string(),
    embedding: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }
    const note = await ctx.db.get(args.id);
    if (!note) {
      throw new Error("Note not found");
    }
    if (note.userId !== userId) {
      throw new Error("User does not have permission to edit this note");
    }

    await ctx.db.patch(args.id, {
      title: args.title.trim(),
      content: args.content.trim(),
      embedding: args.embedding,
      updatedAt: Date.now(),
    });
  },
});