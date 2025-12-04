"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { courseService } from "@/services/courseService";
import { enrollmentService } from "@/services/enrollmentService";
import { Course, Enrollment } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, BookOpen, Play, FileText, HelpCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const user = useSelector((state: RootState) => state.auth.user);
    const courseId = params.id as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load course and enrollment data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const courseData = await courseService.getCourseById(courseId);
                setCourse(courseData);

                // Try to get enrollment for this user if logged in
                if (user?.id) {
                    try {
                        const enrollments = await enrollmentService.getUserEnrollments();
                        const userEnrollment = enrollments.find(e => e.courseId === courseId);
                        setEnrollment(userEnrollment || null);
                    } catch (err) {
                        // User might not be enrolled yet
                        setEnrollment(null);
                    }
                }
                setError(null);
            } catch (err: any) {
                setError(err?.response?.data?.message || "Failed to load course");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            loadData();
        }
    }, [courseId, user?.id]);

    const handleEnroll = async () => {
        try {
            setEnrolling(true);
            await enrollmentService.enrollCourse(courseId);
            // Reload enrollment data
            const enrollments = await enrollmentService.getUserEnrollments();
            const userEnrollment = enrollments.find(e => e.courseId === courseId);
            setEnrollment(userEnrollment || null);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to enroll in course");
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-neutral-600">Loading course...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="container mx-auto py-8">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-semibold text-red-900">Course Not Found</p>
                        <p className="text-red-700 text-sm">{error || "This course does not exist."}</p>
                        <Link href="/courses">
                            <Button className="mt-4" variant="outline">
                                Back to Courses
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="mb-6"
                >
                    ← Back
                </Button>

                {/* Course Header */}
                <div className="mb-8">
                    {course.imageUrl && (
                        <img
                            src={course.imageUrl}
                            alt={course.title}
                            className="w-full h-80 object-cover rounded-lg mb-6"
                        />
                    )}
                    <h1 className="text-4xl font-bold text-neutral-900 mb-2">
                        {course.title}
                    </h1>
                    <p className="text-neutral-600 mb-4">{course.description}</p>

                    {/* Course Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-neutral-600">Category</p>
                            <p className="font-semibold text-neutral-900 capitalize">
                                {course.category || "General"}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-neutral-600">Price</p>
                            <p className="font-semibold text-neutral-900">
                                ${typeof course.price === "number" ? course.price.toFixed(2) : "0.00"}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-neutral-600">Lessons</p>
                            <p className="font-semibold text-neutral-900">
                                {course.lessons?.length || 0}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-neutral-600">Status</p>
                            <p className="font-semibold text-neutral-900 capitalize">
                                {enrollment ? "Enrolled" : "Not Enrolled"}
                            </p>
                        </div>
                    </div>

                    {/* Instructor and Batch Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-neutral-600">Instructor</p>
                            <p className="font-semibold text-neutral-900">
                                {course.instructor || "N/A"}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-neutral-600">Batch</p>
                            <p className="font-semibold text-neutral-900">
                                {course.batch || "N/A"}
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Action Button */}
                    <div className="flex gap-3">
                        {!user ? (
                            <Link href="/login" className="flex-1">
                                <Button className="w-full">
                                    Log In to Enroll
                                </Button>
                            </Link>
                        ) : enrollment ? (
                            <>
                                <Link href={`/courses/${courseId}/learn`} className="flex-1">
                                    <Button className="w-full">
                                        <Play className="w-4 h-4 mr-2" />
                                        Start Learning
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <Button
                                onClick={handleEnroll}
                                disabled={enrolling}
                                className="flex-1"
                            >
                                {enrolling ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Enrolling...
                                    </>
                                ) : (
                                    "Enroll Now"
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Course Content Tabs */}
                {enrollment && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Learn */}
                        <Link href={`/courses/${courseId}/learn`}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">Lessons</CardTitle>
                                        <BookOpen className="w-8 h-8 text-blue-600" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-neutral-600">
                                        Watch lesson videos and read course materials
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Assignments */}
                        <Link href={`/courses/${courseId}/assignments`}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">Assignments</CardTitle>
                                        <FileText className="w-8 h-8 text-green-600" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-neutral-600">
                                        Complete assignments and get feedback
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Quizzes */}
                        <Link href={`/courses/${courseId}/quizzes`}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">Quizzes</CardTitle>
                                        <HelpCircle className="w-8 h-8 text-purple-600" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-neutral-600">
                                        Test your knowledge with quizzes
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                )}

                {/* Course Details */}
                {course.lessons && course.lessons.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Curriculum</CardTitle>
                            <CardDescription>
                                {course.lessons.length} lessons in this course
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {course.lessons.map((lesson, index) => (
                                    <div
                                        key={lesson._id}
                                        className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg"
                                    >
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                                            {index + 1}
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-medium text-neutral-900">
                                                {lesson.title}
                                            </h4>
                                            <p className="text-sm text-neutral-600">
                                                {lesson.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
