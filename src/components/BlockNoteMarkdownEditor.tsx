import "@blocknote/core/fonts/inter.css";
import { useEffect, useMemo, useRef } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

type BlockNoteMarkdownEditorProps = {
  initialMarkdown?: string;
  onChangeMarkdown: (markdown: string) => void;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
};

async function blocksToMarkdownSafe(editor: any): Promise<string> {
  try {
    if (typeof editor.blocksToMarkdownLossy === "function") {
      return await editor.blocksToMarkdownLossy(editor.document);
    }
    if (typeof editor.blocksToMarkdown === "function") {
      return await editor.blocksToMarkdown(editor.document);
    }
  } catch {
    // fall through to plain text fallback
  }
  // Fallback: join plain text from blocks
  try {
    const blocks = editor.document || [];
    const texts: Array<string> = [];
    for (const b of blocks) {
      if (b.content && Array.isArray(b.content)) {
        for (const c of b.content) {
          if (typeof c.text === "string") texts.push(c.text);
        }
      }
    }
    return texts.join("\n\n");
  } catch {
    return "";
  }
}

export function BlockNoteMarkdownEditor({
  initialMarkdown,
  onChangeMarkdown,
  disabled,
  maxLength = 8000,
  className,
}: BlockNoteMarkdownEditorProps) {
  const initialMarkdownRef = useRef<string | undefined>(initialMarkdown);

  const editor = useCreateBlockNote({});

  // Update ref when initialMarkdown prop changes
  useEffect(() => {
    initialMarkdownRef.current = initialMarkdown;
  }, [initialMarkdown]);

  // Load Markdown into the editor when it changes
  useEffect(() => {
    const load = async () => {
      const md = initialMarkdownRef.current;
      if (!md) return;
      try {
        if (typeof (editor as any).tryParseMarkdownToBlocks === "function") {
          const blocks = await (editor as any).tryParseMarkdownToBlocks(md);
          if (blocks && Array.isArray(blocks) && blocks.length > 0) {
            editor.replaceBlocks(editor.document, blocks);
          }
        }
      } catch {
        // ignore; keep default empty content
      }
    };
    load();
  }, [editor, initialMarkdown]);

  // Debounced onChange to emit Markdown content
  const debouncedOnChange = useMemo(() => {
    let t: any;
    return async () => {
      clearTimeout(t);
      t = setTimeout(async () => {
        const md = await blocksToMarkdownSafe(editor as any);
        const trimmed = md.slice(0, maxLength);
        onChangeMarkdown(trimmed);
      }, 200);
    };
  }, [editor, onChangeMarkdown, maxLength]);

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <BlockNoteView
        editor={editor}
        editable={!disabled}
        onChange={() => {
          void debouncedOnChange();
        }}
        shadCNComponents={{}}
        theme={
          useTheme().theme === "dark" ? "dark" : "light"
        }
        className={cn(
          "min-h-[200px] h-full w-full flex-1 overflow-y-auto rounded-md",
          className,
        )}
      />
      {/* simple counter */}
      <div className="text-xs text-muted-foreground">
        Markdown will be saved. Max {maxLength} characters.
      </div>
    </div>
  );
}

export default BlockNoteMarkdownEditor;


