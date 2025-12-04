"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { quizService } from "@/services/quizService";
import { courseService } from "@/services/courseService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertCircle, CheckCircle, Loader2, RotateCcw } from "lucide-react";
import type { Quiz, QuizAttempt } from "@/types";

interface QuizWithAttempt extends Quiz {
    attempt?: QuizAttempt;
}

export default function QuizzesPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;

    const [quizzes, setQuizzes] = useState<QuizWithAttempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedQuiz, setSelectedQuiz] = useState<QuizWithAttempt | null>(null);
    const [showQuizDialog, setShowQuizDialog] = useState(false);
    const [showResultsDialog, setShowResultsDialog] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [quizResult, setQuizResult] = useState<any>(null);

    useEffect(() => {
        const loadQuizzes = async () => {
            try {
                setLoading(true);
                const enrollments = await courseService.getMyEnrollments();
                const enrollment = enrollments.find((e) => e.courseId === courseId);

                if (enrollment) {
                    const quizzesList = await quizService.getQuizzesByCourse(courseId);

                    // Load attempt status for each quiz
                    const quizzesWithAttempts: QuizWithAttempt[] = [];
                    for (const quiz of quizzesList) {
                        try {
                            const attempt = await quizService.getMyAttempt(quiz._id);
                            quizzesWithAttempts.push({ ...quiz, attempt: attempt || undefined });
                        } catch {
                            // No attempt yet
                            quizzesWithAttempts.push({ ...quiz, attempt: undefined });
                        }
                    }
                    setQuizzes(quizzesWithAttempts);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load quizzes");
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            loadQuizzes();
        }
    }, [courseId]);

    const handleStartQuiz = (quiz: QuizWithAttempt) => {
        setSelectedQuiz(quiz);
        setAnswers({});
        setCurrentQuestionIndex(0);
        setShowQuizDialog(true);
        setShowResultsDialog(false);
    };

    const handleAnswerChange = (questionId: string, answer: string) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: answer,
        }));
    };

    const handleNextQuestion = () => {
        if (selectedQuiz && currentQuestionIndex < selectedQuiz.questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const handleSubmitQuiz = async () => {
        if (!selectedQuiz) return;

        try {
            setSubmitting(true);
            const answerValues = selectedQuiz.questions.map((q) => answers[q._id] || "");
            const result = await quizService.submitQuiz({
                quizId: selectedQuiz._id,
                answers: answerValues,
            });

            setQuizResult(result);
            setShowQuizDialog(false);
            setShowResultsDialog(true);

            // Update quizzes list with new attempt
            setQuizzes((prev) =>
                prev.map((q) =>
                    q._id === selectedQuiz._id ? { ...q, attempt: result } : q
                )
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to submit quiz");
        } finally {
            setSubmitting(false);
        }
    }; const handleRetakeQuiz = () => {
        setShowResultsDialog(false);
        setShowQuizDialog(false);
        setQuizResult(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-neutral-600">Loading quizzes...</p>
                </div>
            </div>
        );
    }

    const currentQuestion =
        selectedQuiz && selectedQuiz.questions[currentQuestionIndex];
    const answeredQuestionsCount = Object.keys(answers).length;
    const canSubmit = answeredQuestionsCount === selectedQuiz?.questions.length;
    const isPassed = quizResult && quizResult.score >= (selectedQuiz?.passingScore || 50);

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">Quizzes</h1>
                    <p className="text-neutral-600">Test your knowledge with course quizzes</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-red-900">{error}</p>
                        </div>
                    </div>
                )}

                {quizzes.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-neutral-600 mb-4">No quizzes available for this course yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {quizzes.map((quiz) => {
                            const isAttempted = !!quiz.attempt;
                            const isPassed = quiz.attempt && quiz.attempt.score >= (quiz.passingScore || 50);

                            return (
                                <Card key={quiz._id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-neutral-900">{quiz.title}</h3>
                                                    {isAttempted && (
                                                        <div
                                                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${isPassed
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-red-100 text-red-700"
                                                                }`}
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            {isPassed ? "Passed" : "Failed"}
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-neutral-600 mb-3">{quiz.description}</p>

                                                <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-medium">{quiz.questions.length}</span>
                                                        <span>Questions</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span>Passing Score:</span>
                                                        <span className="font-medium">{quiz.passingScore || 50}%</span>
                                                    </div>
                                                </div>                                                {isAttempted && quiz.attempt && (
                                                    <div className="mt-3 p-3 bg-blue-50 rounded-md">
                                                        <p className="text-sm text-neutral-600">
                                                            Your Score: <span className="font-semibold text-lg">{quiz.attempt.score}%</span>
                                                        </p>
                                                        {quiz.attempt.attemptedAt && (
                                                            <p className="text-xs text-neutral-500 mt-1">
                                                                Attempted: {new Date(quiz.attempt.attemptedAt).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                onClick={() => handleStartQuiz(quiz)}
                                                variant={isAttempted ? "outline" : "default"}
                                            >
                                                {isAttempted ? "Retake" : "Start"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Quiz Dialog */}
                <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{selectedQuiz?.title}</DialogTitle>
                            <DialogDescription>
                                Question {currentQuestionIndex + 1} of {selectedQuiz?.questions.length}
                            </DialogDescription>
                        </DialogHeader>

                        {currentQuestion && (
                            <div className="space-y-6">
                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">Progress</span>
                                        <span className="text-neutral-600">
                                            {answeredQuestionsCount}/{selectedQuiz?.questions.length} answered
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 transition-all"
                                            style={{
                                                width: `${((currentQuestionIndex + 1) / (selectedQuiz?.questions.length || 1)) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Question */}
                                <div>
                                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                                        {currentQuestion.question}
                                    </h3>

                                    {/* Options */}
                                    <div className="space-y-3">
                                        {currentQuestion.options.map((option, index) => (
                                            <label
                                                key={index}
                                                className="flex items-center gap-3 p-4 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors"
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${currentQuestion._id}`}
                                                    value={option.text}
                                                    checked={answers[currentQuestion._id] === option.text}
                                                    onChange={(e) =>
                                                        handleAnswerChange(currentQuestion._id, e.target.value)
                                                    }
                                                    className="h-4 w-4"
                                                />
                                                <span className="text-neutral-900">{option.text}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>                                {/* Navigation */}
                                <div className="flex justify-between pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={handlePreviousQuestion}
                                        disabled={currentQuestionIndex === 0}
                                    >
                                        Previous
                                    </Button>

                                    {currentQuestionIndex < (selectedQuiz?.questions.length || 0) - 1 ? (
                                        <Button onClick={handleNextQuestion}>Next</Button>
                                    ) : (
                                        <Button
                                            onClick={handleSubmitQuiz}
                                            disabled={!canSubmit || submitting}
                                        >
                                            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                            {submitting ? "Submitting..." : "Submit Quiz"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Results Dialog */}
                <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Quiz Completed</DialogTitle>
                        </DialogHeader>

                        {quizResult && (
                            <div className="space-y-6 text-center">
                                <div
                                    className={`p-8 rounded-lg ${isPassed ? "bg-green-50" : "bg-red-50"
                                        }`}
                                >
                                    <div
                                        className={`text-5xl font-bold mb-2 ${isPassed ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        {quizResult.score}%
                                    </div>
                                    <p
                                        className={`text-lg font-semibold ${isPassed ? "text-green-900" : "text-red-900"
                                            }`}
                                    >
                                        {isPassed ? "🎉 You Passed!" : "Try Again"}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-neutral-600">
                                        <span>Correct Answers:</span>
                                        <span className="font-semibold">{quizResult.correctAnswers}/{selectedQuiz?.questions.length}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-600">
                                        <span>Passing Score:</span>
                                        <span className="font-semibold">{selectedQuiz?.passingScore || 50}%</span>
                                    </div>
                                </div>

                                <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowResultsDialog(false)}
                                    >
                                        Close
                                    </Button>
                                    <Button onClick={handleRetakeQuiz} variant="outline">
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Retake Quiz
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
