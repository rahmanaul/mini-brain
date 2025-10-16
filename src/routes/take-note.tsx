import { BlockNoteMarkdownEditor } from '@/components/BlockNoteMarkdownEditor'
import { Button } from '@/components/ui/button';
import { createFileRoute, useSearch, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { api } from '../../convex/_generated/api';
import { useQuery, useAction } from 'convex/react';

const TakeNoteSearchSchema = z.object({
  id: z.string().optional(),
})


export const Route = createFileRoute('/take-note')({
  validateSearch: (search) => TakeNoteSearchSchema.parse(search),
  errorComponent: ({
    error,
  }: {
    error: Error;
  }) => {
    return (
      <div>
        Error: {error.message}
      </div>
    )
  },
  component: RouteComponent,
})


// minimal note taking page using blocknote, save the progress to local storage
function RouteComponent() {
  const [initialMarkdown, setInitialMarkdown] = useState<string | undefined>(undefined);
  const [markdown, setMarkdown] = useState<string | undefined>(undefined);

  const { id } = useSearch({ from: '/take-note' });
  const navigate = useNavigate();

  const notes = useQuery(api.notes.getNotes);
  const note = notes?.find((note) => note._id === id);

  const updateNote = useAction(api.miniBrain.updateNoteWithEmbedding);
  const addNote = useAction(api.miniBrain.addNoteWithEmbedding);

  useEffect(() => {
    if (note) {
      setInitialMarkdown(note.content);
    }
  }, [note]);

  // Show loading state while query is fetching
  if (notes === undefined) {
    return <div>Loading...</div>;
  }

  const handleSave = async () => {
    if (markdown === undefined || markdown.trim() === '') {
      return; // Don't save empty content
    }

    try {
      if (note) {
        // Update existing note
        await updateNote({
          id: note._id,
          title: note.title,
          content: markdown,
        });
      } else {
        // Create new note
        const result = await addNote({
          content: markdown,
        });

        // Navigate to the newly created note
        navigate({
          to: '/take-note',
          search: { id: result.id },
        });
      }
    } catch (error) {
      console.error('Failed to save note:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center gap-2 justify-end">
        <Button
          onClick={handleSave}
          disabled={!markdown || markdown.trim() === ''}
        >
          Save
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            localStorage.removeItem('take-note-markdown');
            setMarkdown(undefined);
            setInitialMarkdown(undefined);
          }}
        >
          Clear
        </Button>
      </div>
      <BlockNoteMarkdownEditor
        initialMarkdown={initialMarkdown}
        onChangeMarkdown={setMarkdown}
        disabled={false}
        maxLength={8000}
        className="flex-1"
      />
    </div>
  );
}
