import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Id } from "../../convex/_generated/dataModel";
import { BlockNoteMarkdownEditor } from "@/components/BlockNoteMarkdownEditor";

// Type matching the listNotes query return
type SimplifiedNote = {
  _id: Id<"notes">;
  title: string;
  content: string;
  createdAt: number;
};

interface NoteInputProps {
  onNoteCreated?: (note: SimplifiedNote) => void;
}

export function NoteInput({ onNoteCreated }: NoteInputProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addNote = useAction(api.miniBrain.addNoteWithEmbedding);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Please enter some content for your note");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create optimistic note for immediate UI update
      const optimisticNote: SimplifiedNote = {
        _id: `temp-${Date.now()}` as any, // Temporary ID
        title: content.trim().length > 20
          ? content.trim().substring(0, 20) + "..."
          : content.trim(),
        content: content.trim(),
        createdAt: Date.now(),
      };

      // Show the note immediately
      onNoteCreated?.(optimisticNote);

      const result = await addNote({ content: content.trim() });
      setSuccess(`Note added successfully: "${result.title}"`);
      setContent("");
    } catch (err) {
      console.error("Error adding note:", err);
      setError(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add a Note</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <BlockNoteMarkdownEditor
            initialMarkdown={content}
            onChangeMarkdown={(md) => setContent(md)}
            disabled={isLoading}
            maxLength={8000}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {content.length}/8000 characters
            </span>
          <Button
            type="submit"
            disabled={isLoading || !content.trim()}
            className="px-6"
          >
            {isLoading ? "Adding Note..." : "Add Note"}
          </Button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
            <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
