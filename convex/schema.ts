import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
  notes: defineTable({
    userId: v.string(),
    title: v.string(),
    content: v.string(),
    embedding: v.array(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_user_createdAt_desc", ["userId", "createdAt"]),
  questions: defineTable({
    userId: v.string(),
    question: v.string(),
    createdAt: v.number(),
  }).index("by_user_createdAt_desc", ["userId", "createdAt"]),
  answers: defineTable({
    userId: v.string(),
    questionId: v.id("questions"),
    answer: v.string(),
    createdAt: v.number(),
  }).index("by_user_createdAt_desc", ["userId", "createdAt"]),
});
