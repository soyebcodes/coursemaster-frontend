"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { courseService } from "@/services/courseService";
import { enrollmentService } from "@/services/enrollmentService";
import { Course, Enrollment, Lesson } from "@/types";
import { LessonPlayer } from "@/components/LessonPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Check, BookOpen, AlertCircle } from "lucide-react";

export default function CourseLearnPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const courseId = params.id as string;
    const lessonId = searchParams.get("lesson");

    const [course, setCourse] = useState<Course | null>(null);
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Load course and enrollment data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const courseData = await courseService.getCourseById(courseId);
                setCourse(courseData);

                // Try to get enrollment (in production, you'd get the enrollment ID from URL or elsewhere)
                // For now, we'll just load the course
            } catch (err) {
                setError("Failed to load course");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            loadData();
        }
    }, [courseId]);

    // Set current lesson
    useEffect(() => {
        if (course?.lessons && course.lessons.length > 0) {
            let lesson: Lesson | undefined;

            if (lessonId) {
                lesson = course.lessons.find((l) => l._id === lessonId);
            }

            if (!lesson) {
                lesson = course.lessons[0];
            }

            setCurrentLesson(lesson);
        }
    }, [course, lessonId]);

    const handleMarkComplete = async () => {
        if (!enrollment || !currentLesson) return;

        try {
            setSubmitting(true);
            await enrollmentService.markLessonComplete(enrollment._id, currentLesson._id);
            // Update local state
            setEnrollment((prev) =>
                prev
                    ? {
                        ...prev,
                        completedLessons: [
                            ...prev.completedLessons,
                            currentLesson._id,
                        ],
                    }
                    : null
            );
        } catch (err) {
            console.error("Failed to mark lesson complete:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handlePreviousLesson = () => {
        if (!course?.lessons || !currentLesson) return;
        const currentIndex = course.lessons.findIndex((l) => l._id === currentLesson._id);
        if (currentIndex > 0) {
            setCurrentLesson(course.lessons[currentIndex - 1]);
        }
    };

    const handleNextLesson = () => {
        if (!course?.lessons || !currentLesson) return;
        const currentIndex = course.lessons.findIndex((l) => l._id === currentLesson._id);
        if (currentIndex < course.lessons.length - 1) {
            setCurrentLesson(course.lessons[currentIndex + 1]);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-neutral-600">Loading course...</p>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{error || "Course not found"}</p>
                </div>
            </div>
        );
    }

    const currentLessonIndex = course.lessons?.findIndex(
        (l) => l._id === currentLesson?._id
    ) ?? 0;
    const completedCount = enrollment?.completedLessons?.length ?? 0;
    const progress = course.lessons
        ? (completedCount / course.lessons.length) * 100
        : 0;

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                        {course.title}
                    </h1>
                    <p className="text-neutral-600 mb-4">Learning Path</p>
                    {course.lessons && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-600">
                                    {completedCount} of {course.lessons.length} lessons completed
                                </span>
                                <span className="font-semibold text-neutral-900">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Lesson Player */}
                    <div className="lg:col-span-3">
                        {currentLesson && (
                            <LessonPlayer
                                lesson={currentLesson}
                                isCompleted={enrollment?.completedLessons?.includes(
                                    currentLesson._id
                                ) ?? false}
                                onMarkComplete={handleMarkComplete}
                                onPrevious={handlePreviousLesson}
                                onNext={handleNextLesson}
                                hasPrevious={currentLessonIndex > 0}
                                hasNext={
                                    course.lessons
                                        ? currentLessonIndex < course.lessons.length - 1
                                        : false
                                }
                            />
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Lessons List */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Lessons</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {course.lessons?.map((lesson, index) => {
                                        const isCompleted = enrollment?.completedLessons?.includes(
                                            lesson._id
                                        ) ?? false;
                                        const isCurrent = lesson._id === currentLesson?._id;

                                        return (
                                            <button
                                                key={lesson._id}
                                                onClick={() => setCurrentLesson(lesson)}
                                                className={`w-full text-left p-3 rounded-lg transition-colors ${isCurrent
                                                        ? "bg-blue-100 border border-blue-500"
                                                        : "bg-neutral-100 hover:bg-neutral-200"
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {isCompleted ? (
                                                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                    ) : (
                                                        <BookOpen className="w-5 h-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-sm text-xs text-neutral-500">
                                                            Lesson {index + 1}
                                                        </p>
                                                        <p
                                                            className={`text-sm font-medium line-clamp-2 ${isCurrent
                                                                    ? "text-blue-900"
                                                                    : "text-neutral-900"
                                                                }`}
                                                        >
                                                            {lesson.title}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Course Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Course Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <p className="text-neutral-600">Instructor</p>
                                    <p className="font-semibold text-neutral-900">
                                        {course.instructor}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-neutral-600">Total Lessons</p>
                                    <p className="font-semibold text-neutral-900">
                                        {course.lessons?.length || 0}
                                    </p>
                                </div>
                                {course.category && (
                                    <div>
                                        <p className="text-neutral-600">Category</p>
                                        <p className="font-semibold text-neutral-900 capitalize">
                                            {course.category}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
