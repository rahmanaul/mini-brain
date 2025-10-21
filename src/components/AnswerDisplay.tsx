import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";

interface AnswerDisplayProps {
  answer: string;
  refs: Array<{ id: string; title: string }>;
}

export function AnswerDisplay({ answer, refs }: AnswerDisplayProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>AI Answer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-sm max-w-none">
          <p className="leading-relaxed whitespace-pre-wrap">
            {answer}
          </p>
        </div>

        {refs.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-2">
              References ({refs.length})
            </h4>
            <div className="space-y-2">
              {refs.map((ref, index) => (
                <Link
                  key={ref.id}
                  to="/take-note"
                  search={{ id: ref.id }}
                  className="flex items-start space-x-2 p-2 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                  aria-label={`Open note: ${ref.title}`}
                >
                  <span className="text-xs font-mono text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {index + 1}
                  </span>
                  <span className="text-sm text-blue-700 underline">
                    {ref.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
