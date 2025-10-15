import { v } from "convex/values";
import {
  query,
  action,
  internalQuery,
  internalMutation,
} from "./_generated/server";
import { api, internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import OpenAI from "openai";
import type { Id } from "./_generated/dataModel";

// Constants for validation and limits
const MAX_NOTE_CONTENT_LENGTH = 8000;
const MAX_QUESTION_LENGTH = 2000;
const SIMILARITY_THRESHOLD = 0.15;
const TOP_K_NOTES = 3;
const MAX_NOTES_FOR_SIMILARITY = 2000;

type NoteForSimilarity = {
  _id: Id<"notes">;
  title: string;
  embedding: number[];
};

type ScoredNote = NoteForSimilarity & { score: number };

/**
 * Insert a note with embedding into the database.
 */
export const insertNote = internalMutation({
  args: {
    userId: v.string(),
    title: v.string(),
    content: v.string(),
    embedding: v.array(v.number()),
    createdAt: v.number(),
  },
  returns: v.id("notes"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("notes", {
      userId: args.userId,
      title: args.title,
      content: args.content,
      embedding: args.embedding,
      createdAt: args.createdAt,
    });
  },
});

/**
 * Get notes for similarity search with embeddings.
 */
export const getNotesForSimilarity = internalQuery({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("notes"),
      title: v.string(),
      embedding: v.array(v.number()),
    }),
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? MAX_NOTES_FOR_SIMILARITY;
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user_createdAt_desc", (q) =>
        q.eq("userId", args.userId),
      )
      .order("desc")
      .take(limit);

    return notes.map((note) => ({
      _id: note._id,
      title: note.title,
      embedding: note.embedding,
    }));
  },
});

/**
 * Fetch the full content for a set of notes.
 */
export const getNotesContent = internalQuery({
  args: {
    noteIds: v.array(v.id("notes")),
  },
  returns: v.array(
    v.object({
      _id: v.id("notes"),
      content: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const results: Array<{ _id: Id<"notes">; content: string }> = [];
    for (const noteId of args.noteIds) {
      const note = await ctx.db.get(noteId);
      if (note) {
        results.push({
          _id: note._id,
          content: note.content,
        });
      }
    }
    return results;
  },
});

/**
 * Add a note with OpenAI embedding generation.
 */
export const addNoteWithEmbedding = action({
  args: {
    content: v.string(),
  },
  returns: v.object({
    id: v.id("notes"),
    title: v.string(),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    // Validate content length
    if (args.content.length === 0 || args.content.length > MAX_NOTE_CONTENT_LENGTH) {
      throw new Error(`Content must be between 1 and ${MAX_NOTE_CONTENT_LENGTH} characters`);
    }

    const openai = new OpenAI();

    try {
      // Generate embedding for the note content
      const embeddingResponse = await openai.embeddings.create({
        input: args.content,
        model: "text-embedding-3-small",
      });

      const embedding = embeddingResponse.data[0].embedding;

      // Normalize the embedding for cosine similarity
      const normalizedEmbedding = normalizeVector(embedding);

      // Derive title from first 20 characters
      const title = args.content.length > 20
        ? args.content.substring(0, 20) + "..."
        : args.content;

      const createdAt = Date.now();

      // Insert the note
      const noteId: Id<"notes"> = await ctx.runMutation(
        internal.miniBrain.insertNote,
        {
          userId,
          title,
          content: args.content,
          embedding: normalizedEmbedding,
          createdAt,
        },
      );

      return { id: noteId, title };
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw new Error("Failed to generate embedding for note");
    }
  },
});

/**
 * Ask a question and get an AI-powered answer based on stored notes.
 */
export const askQuestion = action({
  args: {
    question: v.string(),
  },
  returns: v.object({
    answer: v.string(),
    refs: v.array(v.object({
      id: v.id("notes"),
      title: v.string(),
    })),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    // Validate question length
    if (args.question.length === 0 || args.question.length > MAX_QUESTION_LENGTH) {
      throw new Error(`Question must be between 1 and ${MAX_QUESTION_LENGTH} characters`);
    }

    const openai = new OpenAI();

    try {
      // Generate embedding for the question
      const embeddingResponse = await openai.embeddings.create({
        input: args.question,
        model: "text-embedding-3-small",
      });

      const questionEmbedding = normalizeVector(embeddingResponse.data[0].embedding);

      // Get user's notes for similarity search
      const notes: NoteForSimilarity[] = await ctx.runQuery(
        internal.miniBrain.getNotesForSimilarity,
        {
          userId,
          limit: MAX_NOTES_FOR_SIMILARITY,
        },
      );

      if (notes.length === 0) {
        return {
          answer: "You don't have any notes yet. Add some notes first to ask questions about them.",
          refs: [],
        };
      }

      // Calculate similarity scores
      const scoredNotes: ScoredNote[] = notes.map((note) => ({
        ...note,
        score: cosineSimilarity(questionEmbedding, note.embedding),
      }));

      // Sort by score descending and filter by threshold
      const relevantNotes = scoredNotes
        .filter((note: ScoredNote) => note.score >= SIMILARITY_THRESHOLD)
        .sort((a: ScoredNote, b: ScoredNote) => b.score - a.score)
        .slice(0, TOP_K_NOTES);

      if (relevantNotes.length === 0) {
        return {
          answer: "I couldn't find any relevant notes to answer your question. Try adding more notes or rephrasing your question.",
          refs: [],
        };
      }

      // Get full content of relevant notes
      const noteIds: Id<"notes">[] = relevantNotes.map((note) => note._id);

      const fullNotes: Array<{ _id: Id<"notes">; content: string }> =
        await ctx.runQuery(internal.miniBrain.getNotesContent, {
          noteIds,
        });

      // Create context for the AI
      const context = fullNotes
        .map((note) => `Note: ${note.content}`)
        .join("\n\n");

      // Generate answer using OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant answering questions based on the user's notes. Answer the question using only information from the provided notes. If the question cannot be answered from the notes, say so clearly. Keep your answer concise and include specific references to the notes when relevant.`,
          },
          {
            role: "user",
            content: `Context from your notes:\n${context}\n\nQuestion: ${args.question}`,
          },
        ],
        max_tokens: 512,
        temperature: 0.3,
      });

      const answer = completion.choices[0].message.content || "I couldn't generate an answer. Please try again.";

      // add the question and answer to the questions table
      await ctx.runMutation(api.questions.addQuestion, {
        question: args.question,
        answer,
      });

      return {
        answer,
        refs: relevantNotes.map((note) => ({
          id: note._id,
          title: note.title,
        })),
      };
    } catch (error) {
      console.error("Error processing question:", error);
      throw new Error("Failed to process your question. Please try again.");
    }
  },
});

/**
 * Update a note with re-embedding if content changed.
 */
export const updateNoteWithEmbedding = action({
  args: {
    id: v.id("notes"),
    title: v.string(),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Validate content length
    if (args.content.length === 0 || args.content.length > MAX_NOTE_CONTENT_LENGTH) {
      throw new Error(`Content must be between 1 and ${MAX_NOTE_CONTENT_LENGTH} characters`);
    }

    const openai = new OpenAI();

    try {
      // Get existing note to check if content changed
      const existingNote = await ctx.runQuery(api.miniBrain.getNoteById, {
        id: args.id,
      });

      // Only regenerate embedding if content actually changed
      let embedding = existingNote.embedding;
      if (args.content !== existingNote.content) {
        // Generate new embedding for the updated content
        const embeddingResponse = await openai.embeddings.create({
          input: args.content,
          model: "text-embedding-3-small",
        });

        // Normalize the embedding for cosine similarity
        embedding = normalizeVector(embeddingResponse.data[0].embedding);
      }

      // Update the note with new data and potentially new embedding
      await ctx.runMutation(api.notes.updateNoteWithEmbedding, {
        id: args.id,
        title: args.title,
        content: args.content,
        embedding,
      });
    } catch (error) {
      console.error("Error updating note with embedding:", error);
      throw new Error("Failed to update note");
    }
  },
});

/**
 * Get a single note by ID for editing purposes.
 */
export const getNoteById = query({
  args: {
    id: v.id("notes"),
  },
  returns: v.object({
    _id: v.id("notes"),
    title: v.string(),
    content: v.string(),
    embedding: v.array(v.number()),
    userId: v.string(),
  }),
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
      throw new Error("User does not have permission to access this note");
    }

    return {
      _id: note._id,
      title: note.title,
      content: note.content,
      embedding: note.embedding,
      userId: note.userId,
    };
  },
});

/**
 * List notes for a user (for display purposes).
 */
export const listNotes = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("notes"),
      title: v.string(),
      content: v.string(),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, _args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user_createdAt_desc", (q) =>
        q.eq("userId", userId),
      )
      .order("desc")
      .take(100); // Limit for display

    return notes.map((note) => ({
      _id: note._id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
    }));
  },
});

/**
 * Helper function to normalize a vector for cosine similarity.
 */
function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return vector;
  return vector.map((val) => val / magnitude);
}

/**
 * Calculate cosine similarity between two normalized vectors.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }

  // Since vectors are normalized, cosine similarity is just the dot product
  return dotProduct;
}
