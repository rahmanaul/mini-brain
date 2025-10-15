import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuestionInputProps {
  onAnswer: (answer: string, refs: Array<{ id: string; title: string }>) => void;
}

export function QuestionInput({ onAnswer }: QuestionInputProps) {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askQuestion = useAction(api.miniBrain.askQuestion);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      setError("Please enter a question");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await askQuestion({ question: question.trim() });
      onAnswer(result.answer, result.refs);
      setQuestion("");
    } catch (err) {
      console.error("Error asking question:", err);
      setError(err instanceof Error ? err.message : "Failed to get answer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Ask a Question</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your notes..."
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
            maxLength={2000}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {question.length}/2000 characters
            </span>
            <Button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="px-6"
            >
              {isLoading ? "Thinking..." : "Ask Question"}
            </Button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
