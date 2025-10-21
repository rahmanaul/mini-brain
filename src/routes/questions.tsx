import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
// import card component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/questions')({
  component: RouteComponent,
})

function RouteComponent() {
  const questions = useQuery(api.questions.getQuestionsAndAnswers);
  return (
    <main className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Questions History</h2>
      {questions?.map((question) => (
        <Card key={question._id} className="mb-4">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>{question.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{question.answer}</p>
          </CardContent>
        </Card>
      ))}
      {questions?.length === 0 && (
        <h3 className="text-gray-500 text-center">No questions found Let's ask a question</h3>
      )}
    </main>
  )
}
