"use client";

import {
  Authenticated,
  Unauthenticated,
  useConvexAuth,
} from "convex/react";
import { useAuthActions} from "@convex-dev/auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NoteInput } from "@/components/NoteInput";
import { QuestionInput } from "@/components/QuestionInput";
import { AnswerDisplay } from "@/components/AnswerDisplay";
import { api } from "../convex/_generated/api";
import { useQuery } from "convex/react";

export default function App() {
  const userEmail = useQuery(api.user.getUserEmailById);
  const isAuthenticated = useConvexAuth().isAuthenticated;
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Your Personal Knowledge Assistant
          </h2>
          {/* greet user with their email */}
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome,
            {/*  empty space for margin between welcome and email*/}
            <span className="ml-2"></span>
            {isAuthenticated ? userEmail : "Guest"}
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Capture notes and ask questions to get AI-powered answers based on your stored knowledge.
          </p>
        </div>

        <Authenticated>
          <MiniBrainContent />
        </Authenticated>
        <Unauthenticated>
          <SignInForm />
        </Unauthenticated>
      </div>
    </main>
  );
}

function  SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  return (
    <Card className="w-96 mx-auto">
      <CardHeader>
        <CardTitle>Log in to see the numbers</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            formData.set("flow", flow);
            void signIn("password", formData).catch((error) => {
              setError(error.message);
            });
          }}
        >
          <input
            className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-2 border-2 border-slate-200 dark:border-slate-800"
            type="email"
            name="email"
            placeholder="Email"
          />
          <input
            className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-2 border-2 border-slate-200 dark:border-slate-800"
            type="password"
            name="password"
            placeholder="Password"
          />
          <Button
            variant="outline"
            type="submit"
          >
            {flow === "signIn" ? "Sign in" : "Sign up"}
          </Button>
          <div className="flex flex-row gap-2">
            <span>
              {flow === "signIn"
                ? "Don't have an account?"
                : "Already have an account?"}
            </span>
            <span
              className="text-dark dark:text-light underline hover:no-underline cursor-pointer"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            >
              {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
            </span>
          </div>
          {error && (
            <div className="bg-red-500/20 border-2 border-red-500/50 rounded-md p-2">
              <p className="text-dark dark:text-light font-mono text-xs">
                Error signing in: {error}
              </p>
            </div>
          )}
        </form>

      </CardContent>
    </Card>
  );
}

function MiniBrainContent() {
  const [currentAnswer, setCurrentAnswer] = useState<{
    answer: string;
    refs: Array<{ id: string; title: string }>;
  } | null>(null);

  const handleAnswer = (answer: string, refs: Array<{ id: string; title: string }>) => {
    setCurrentAnswer({ answer, refs });
  };

  return (
    <div className="space-y-8">
      <NoteInput />
      <QuestionInput onAnswer={handleAnswer} />
      {currentAnswer && (
        <AnswerDisplay answer={currentAnswer.answer} refs={currentAnswer.refs} />
      )}
    </div>
  );
}
