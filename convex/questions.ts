import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";


// get list of questions and its answers for a user
export const getQuestionsAndAnswers = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("questions"),
    userId: v.string(),
    question: v.string(),
    createdAt: v.number(),
    answer: v.optional(v.string()),
    _creationTime: v.number(),
    
  })),
  handler: async (ctx, _args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }
    const questions = await ctx.db.query("questions").withIndex("by_user_createdAt_desc", (q) => q.eq("userId", userId)).collect();
    const answers = await ctx.db.query("answers").withIndex("by_user_createdAt_desc", (q) => q.eq("userId", userId)).collect();
    return questions.reverse().map((question) => ({
      ...question,
      answer: answers.find((answer) => answer.questionId === question._id)?.answer || undefined,
      _creationTime: question._creationTime,
    }));
  },
});

// add a question and its answer for a user
export const addQuestion = mutation({
  args: { question: v.string(), answer: v.string() },
  returns: v.id("questions"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }
    const questionId =await ctx.db.insert("questions", { userId, question: args.question, createdAt: Date.now() });
    await ctx.db.insert("answers", { userId, questionId: questionId, answer: args.answer, createdAt: Date.now() });
    return questionId;
  },
});