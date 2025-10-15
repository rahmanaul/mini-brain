import { NoteInput } from '@/components/NoteInput'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { Id } from '../../convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { EditIcon, Trash2Icon } from 'lucide-react'
import { useForm } from '@tanstack/react-form'
import * as z from 'zod'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Generic delete confirmation dialog boilerplate
interface DeleteConfirmationDialogProps {
  itemName: string;
  itemId: string;
  onConfirm: () => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

export function DeleteConfirmationDialog({
  itemName,
  itemId: _itemId,
  onConfirm,
  trigger,
  title = "Delete Item",
  description,
  confirmText = "Delete",
  cancelText = "Cancel"
}: DeleteConfirmationDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  const defaultDescription = `Are you sure you want to delete "${itemName}"? This action cannot be undone.`;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon" className="hover:cursor-pointer">
            <Trash2Icon className="w-4 h-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description || defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>{confirmText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Type matching the listNotes query return
type SimplifiedNote = {
  _id: Id<"notes">;
  title: string;
  content: string;
  createdAt: number;
};


export const Route = createFileRoute('/notes')({
  component: RouteComponent,
})

function RouteComponent() {
  // get notes from convex
  const notes = useQuery(api.miniBrain.listNotes);
  const [optimisticNote, setOptimisticNote] = useState<SimplifiedNote | null>(null);

  // Clear optimistic note when real notes load
  useEffect(() => {
    if (notes !== undefined) {
      setOptimisticNote(null);
    }
  }, [notes]);

  // Combine real notes with optimistic note for immediate display
  const displayNotes = notes !== undefined && optimisticNote
    ? [optimisticNote, ...notes]
    : notes || [];

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <NoteInput onNoteCreated={setOptimisticNote} />
        {/* map notes to NoteCard */}
        <div className="space-y-4">
          {notes === undefined && !optimisticNote ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-600">Loading notes...</p>
            </div>
          ) : displayNotes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No notes yet. Add your first note above!</p>
            </div>
          ) : (
            displayNotes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))
          )}
        </div>
      </div>
    </main>
  )
}

// alert dialog for deleting a note asking user are they sure
function DeleteNoteDialog({ note }: { note: SimplifiedNote }) {
  const deleteNote = useMutation(api.notes.deleteNote);
  const handleDelete = () => {
    // TODO: Implement delete functionality
    void deleteNote({ id: note._id });
  };

  return (
    <DeleteConfirmationDialog
      itemName={note.title}
      itemId={note._id}
      onConfirm={handleDelete}
      title="Delete Note"
    />
  )
}

// Edit note form component
function EditNoteForm({
  note,
  onSubmit,
}: {
  note: SimplifiedNote;
  onSubmit: (values: { title: string; content: string }) => Promise<void>;
}) {
  const formSchema = z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(100, "Title must be at most 100 characters"),
    content: z
      .string()
      .min(1, "Content is required")
      .max(8000, "Content must be at most 8000 characters"),
  });

  const form = useForm({
    defaultValues: {
      title: note.title,
      content: note.content,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      void onSubmit(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field
        name="title"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={`title-${note._id}`}>Title</FieldLabel>
              <Input
                id={`title-${note._id}`}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                placeholder="Note title"
                autoComplete="off"
              />
              <FieldDescription>
                A concise title for your note.
              </FieldDescription>
              {isInvalid && field.state.meta.errors && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors.map((error: any) => String(error)).join(", ")}
                </p>
              )}
            </Field>
          );
        }}
      />

      <form.Field
        name="content"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={`content-${note._id}`}>Content</FieldLabel>
              <Textarea
                id={`content-${note._id}`}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                placeholder="Write your note content here..."
                className="min-h-[120px] resize-vertical"
              />
              <FieldDescription>
                The main content of your note (max 8000 characters).
                {field.state.value && (
                  <span className="ml-2 text-xs">
                    {field.state.value.length}/8000
                  </span>
                )}
              </FieldDescription>
              {isInvalid && field.state.meta.errors && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors.map((error: any) => String(error)).join(", ")}
                </p>
              )}
            </Field>
          );
        }}
      />

      <div className="flex justify-end space-x-2">
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          )}
        />
      </div>
    </form>
  );
}

// edit note dialog
function EditNoteDialog({ note }: { note: SimplifiedNote }) {
  const updateNoteWithEmbedding = useAction(api.miniBrain.updateNoteWithEmbedding);
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="hover:cursor-pointer">
          <EditIcon className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
          <DialogDescription>
            Edit the note title and content below.
          </DialogDescription>
        </DialogHeader>
        <EditNoteForm
          note={note}
          onSubmit={async (values) => {
            await updateNoteWithEmbedding({
              id: note._id,
              title: values.title,
              content: values.content,
            });
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

// notecard using simplified note type
function NoteCard({ note }: { note: SimplifiedNote }) {
  // create a card with the note title and content
  // use type from schema notes
  return (

    <Card className="mb-4">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>{note.title}</CardTitle>
        <div className="flex gap-2">
          <EditNoteDialog note={note} />
          <DeleteNoteDialog note={note} />
        </div>
      </CardHeader>
      <CardContent>
        <p>{note.content}</p>
      </CardContent>
    </Card>
  )
}
