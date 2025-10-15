// query to get user email by id
import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getUserEmailById = query({
  args: {},
  returns: v.string(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const user = await ctx.db.get(userId);
    return user?.email as string;
  },
});