import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {answer}
          </p>
        </div>

        {refs.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">
              References ({refs.length})
            </h4>
            <div className="space-y-2">
              {refs.map((ref, index) => (
                <div
                  key={ref.id}
                  className="flex items-start space-x-2 p-2 bg-blue-50 rounded-md"
                >
                  <span className="text-xs font-mono text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700 flex-1">
                    {ref.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
