"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { courseService } from "@/services/courseService";
import { quizService } from "@/services/quizService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Loader2, Plus, Trash2, Edit } from "lucide-react";
import type { Quiz, Course } from "@/types";

interface QuizQuestion {
    _id?: string;
    question: string;
    options: string[];
    correctOptionIndex: number;
}

export default function AdminQuizzesPage() {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.auth.user);
    const [courses, setCourses] = useState<Course[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [showDialog, setShowDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        passingScore: 70,
        questions: [] as QuizQuestion[],
    });

    const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
        question: "",
        options: ["", "", "", ""],
        correctOptionIndex: 0,
    });

    useEffect(() => {
        if (user?.role !== "admin") {
            router.push("/dashboard");
            return;
        }

        const loadCourses = async () => {
            try {
                setLoading(true);
                const data = await courseService.getCourses({ limit: 1000, page: 1 });
                setCourses(data.data);
            } catch (err) {
                const error = err as any;
                setError(error?.response?.data?.message || "Failed to load courses");
            } finally {
                setLoading(false);
            }
        };

        loadCourses();
    }, [user, router]);

    const loadQuizzes = async (courseId: string) => {
        try {
            setLoading(true);
            const data = await quizService.getQuizzesByCourse(courseId);
            setQuizzes(data);
            setError(null);
        } catch (err) {
            const error = err as any;
            setError(error?.response?.data?.message || "Failed to load quizzes");
        } finally {
            setLoading(false);
        }
    };

    const handleCourseChange = (courseId: string) => {
        setSelectedCourse(courseId);
        if (courseId) {
            loadQuizzes(courseId);
        } else {
            setQuizzes([]);
        }
    };

    const handleAddQuestion = () => {
        if (!currentQuestion.question.trim()) {
            setError("Please enter a question");
            return;
        }
        if (currentQuestion.options.some((opt) => !opt.trim())) {
            setError("Please fill in all options");
            return;
        }

        setFormData((prev) => ({
            ...prev,
            questions: [...prev.questions, currentQuestion],
        }));
        setCurrentQuestion({
            question: "",
            options: ["", "", "", ""],
            correctOptionIndex: 0,
        });
        setError(null);
    };

    const handleRemoveQuestion = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async () => {
        if (!selectedCourse) {
            setError("Please select a course");
            return;
        }
        if (!formData.title.trim()) {
            setError("Please enter quiz title");
            return;
        }
        if (formData.questions.length === 0) {
            setError("Please add at least one question");
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            // Transform questions to match API format
            const questions = formData.questions.map((q) => ({
                question: q.question,
                options: q.options.map((text, index) => ({
                    text,
                    isCorrect: index === q.correctOptionIndex,
                })),
            }));

            // Create the quiz using the quizService
            await quizService.createQuiz({
                courseId: selectedCourse,
                title: formData.title,
                description: formData.description,
                passingScore: formData.passingScore,
                questions,
            });

            // Show success and reset form
            setShowDialog(false);
            setFormData({
                title: "",
                description: "",
                passingScore: 70,
                questions: [],
            });

            // Reload quizzes
            await loadQuizzes(selectedCourse);
        } catch (err) {
            const error = err as any;
            console.error('Error creating quiz:', error);
            setError(error?.response?.data?.message || "Failed to create quiz. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteQuiz = async (quizId: string) => {
        if (!window.confirm("Are you sure you want to delete this quiz?")) {
            return;
        }

        try {
            // API call would go here
            console.log("Deleting quiz:", quizId);
            setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
        } catch (err) {
            const error = err as any;
            setError(error?.response?.data?.message || "Failed to delete quiz");
        }
    };

    if (!user || user.role !== "admin") {
        return (
            <div className="min-h-screen bg-neutral-50 py-8">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                        <p className="text-red-800">Access denied</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Quiz Management</h1>
                        <p className="text-neutral-600">Create and manage quizzes for your courses</p>
                    </div>
                    <Dialog open={showDialog} onOpenChange={setShowDialog}>
                        <Button onClick={() => setShowDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Quiz
                        </Button>
                    </Dialog>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Course Selection */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Select Course</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <select
                            value={selectedCourse}
                            onChange={(e) => handleCourseChange(e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Choose a course...</option>
                            {courses.map((course) => (
                                <option key={course._id} value={course._id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                    </CardContent>
                </Card>

                {/* Quizzes List */}
                {selectedCourse && (
                    <div>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </div>
                        ) : quizzes.length === 0 ? (
                            <Card>
                                <CardContent className="pt-6">
                                    <p className="text-center text-neutral-600">
                                        No quizzes created for this course yet.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-6">
                                {quizzes.map((quiz) => (
                                    <Card key={quiz._id}>
                                        <CardHeader>
                                            <CardTitle>{quiz.title}</CardTitle>
                                            <CardDescription>
                                                {quiz.questions?.length || 0} questions • Passing Score:{" "}
                                                {quiz.passingScore}%
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-neutral-700 mb-4">{quiz.description}</p>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm">
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteQuiz(quiz._id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Create Quiz Dialog */}
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? "Edit Quiz" : "Create New Quiz"}</DialogTitle>
                            <DialogDescription>
                                Create a new quiz with multiple choice questions
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            <div>
                                <Label htmlFor="title">Quiz Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, title: e.target.value }))
                                    }
                                    placeholder="Enter quiz title"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    placeholder="Enter quiz description"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="passingScore">Passing Score (%)</Label>
                                <Input
                                    id="passingScore"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.passingScore}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            passingScore: parseInt(e.target.value),
                                        }))
                                    }
                                />
                            </div>

                            {/* Questions Section */}
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-semibold mb-4">Questions</h3>

                                {/* Existing Questions */}
                                {formData.questions.map((q, index) => (
                                    <Card key={index} className="mb-4 bg-neutral-50">
                                        <CardContent className="pt-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-medium">{index + 1}. {q.question}</p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveQuestion(index)}
                                                >
                                                    ✕
                                                </Button>
                                            </div>
                                            <div className="space-y-1 ml-4">
                                                {q.options.map((opt, optIndex) => (
                                                    <div key={optIndex}>
                                                        <span
                                                            className={
                                                                optIndex === q.correctOptionIndex
                                                                    ? "text-green-600 font-medium"
                                                                    : "text-neutral-600"
                                                            }
                                                        >
                                                            {String.fromCharCode(65 + optIndex)}) {opt}
                                                            {optIndex === q.correctOptionIndex && " ✓"}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {/* Add Question Form */}
                                <Card className="border-dashed">
                                    <CardContent className="pt-4">
                                        <h4 className="font-medium mb-4">Add New Question</h4>

                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="question">Question</Label>
                                                <Textarea
                                                    id="question"
                                                    value={currentQuestion.question}
                                                    onChange={(e) =>
                                                        setCurrentQuestion((prev) => ({
                                                            ...prev,
                                                            question: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="Enter question text"
                                                    rows={2}
                                                />
                                            </div>

                                            {currentQuestion.options.map((opt, index) => (
                                                <div key={index}>
                                                    <Label>
                                                        Option {String.fromCharCode(65 + index)}
                                                        {index === currentQuestion.correctOptionIndex && (
                                                            <span className="text-green-600 ml-2">
                                                                (Correct)
                                                            </span>
                                                        )}
                                                    </Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={opt}
                                                            onChange={(e) => {
                                                                const newOptions = [
                                                                    ...currentQuestion.options,
                                                                ];
                                                                newOptions[index] = e.target.value;
                                                                setCurrentQuestion((prev) => ({
                                                                    ...prev,
                                                                    options: newOptions,
                                                                }));
                                                            }}
                                                            placeholder="Enter option text"
                                                        />
                                                        <Button
                                                            variant={
                                                                index === currentQuestion.correctOptionIndex
                                                                    ? "default"
                                                                    : "outline"
                                                            }
                                                            size="sm"
                                                            onClick={() =>
                                                                setCurrentQuestion((prev) => ({
                                                                    ...prev,
                                                                    correctOptionIndex: index,
                                                                }))
                                                            }
                                                        >
                                                            {index === currentQuestion.correctOptionIndex
                                                                ? "✓ Correct"
                                                                : "Mark Correct"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}

                                            <Button
                                                onClick={handleAddQuestion}
                                                className="w-full"
                                                variant="outline"
                                            >
                                                Add Question
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowDialog(false);
                                    setFormData({
                                        title: "",
                                        description: "",
                                        passingScore: 70,
                                        questions: [],
                                    });
                                    setCurrentQuestion({
                                        question: "",
                                        options: ["", "", "", ""],
                                        correctOptionIndex: 0,
                                    });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    isEditing ? "Update Quiz" : "Create Quiz"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
