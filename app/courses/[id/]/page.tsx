"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { courseService } from "@/services/courseService";
import { Course } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, Clock, Award } from "lucide-react";

export default function CourseDetailsPage() {
    const params = useParams();
    const courseId = params.id as string;
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCourse = async () => {
            try {
                setLoading(true);
                const data = await courseService.getCourseById(courseId);
                setCourse(data);
            } catch (err) {
                setError("Failed to load course details");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            loadCourse();
        }
    }, [courseId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-neutral-600">Loading course details...</p>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || "Course not found"}</p>
                    <Button variant="outline">Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8 mb-8">
                    <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                    <p className="text-lg text-blue-100 mb-4">{course.description}</p>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            <span>{course.instructor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            <span>{course.lessons?.length || 0} Lessons</span>
                        </div>
                        {course.batches && course.batches.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <span>{course.batches.length} Batches</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Course Info */}
                    <div className="md:col-span-2">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="lessons">Lessons</TabsTrigger>
                                <TabsTrigger value="batches">Batches</TabsTrigger>
                            </TabsList>

                            {/* Overview Tab */}
                            <TabsContent value="overview" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>About This Course</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-neutral-600 mb-4">{course.description}</p>
                                        {course.tags && course.tags.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Topics Covered:</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {course.tags.map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Lessons Tab */}
                            <TabsContent value="lessons" className="space-y-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Course Lessons</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {course.lessons && course.lessons.length > 0 ? (
                                            <div className="space-y-3">
                                                {course.lessons.map((lesson) => (
                                                    <div
                                                        key={lesson._id}
                                                        className="p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <BookOpen className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                                                            <div className="flex-grow">
                                                                <h4 className="font-semibold text-neutral-900">
                                                                    {lesson.title}
                                                                </h4>
                                                                <p className="text-sm text-neutral-600">
                                                                    {lesson.content?.substring(0, 100)}...
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-neutral-600">No lessons available yet.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Batches Tab */}
                            <TabsContent value="batches" className="space-y-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Available Batches</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {course.batches && course.batches.length > 0 ? (
                                            <div className="space-y-3">
                                                {course.batches.map((batch) => (
                                                    <div
                                                        key={batch._id}
                                                        className="p-3 border border-neutral-200 rounded-lg"
                                                    >
                                                        <h4 className="font-semibold text-neutral-900 mb-1">
                                                            {batch.name}
                                                        </h4>
                                                        <div className="text-sm text-neutral-600 space-y-1">
                                                            <p>
                                                                Start: {new Date(batch.startDate).toLocaleDateString()}
                                                            </p>
                                                            <p>
                                                                End: {new Date(batch.endDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-neutral-600">No batches available.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar - Enrollment Card */}
                    <div>
                        <Card className="sticky top-20">
                            <CardContent className="p-6 space-y-4">
                                <div>
                                    <p className="text-sm text-neutral-600 mb-1">Price</p>
                                    <p className="text-3xl font-bold text-neutral-900">
                                        ${course.price}
                                    </p>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2 text-blue-900 mb-2">
                                        <Award className="w-5 h-5" />
                                        <span className="font-semibold">Certificate Included</span>
                                    </div>
                                    <p className="text-sm text-blue-800">
                                        Get a certificate upon completion
                                    </p>
                                </div>

                                <Button className="w-full h-12 text-lg" size="lg">
                                    Enroll Now
                                </Button>

                                <Button variant="outline" className="w-full" disabled>
                                    Add to Wishlist
                                </Button>

                                <div className="text-sm text-neutral-600">
                                    <p className="font-semibold mb-2">What you&apos;ll learn:</p>
                                    <ul className="space-y-1 list-disc list-inside">
                                        <li>Professional skills in {course.category}</li>
                                        <li>Hands-on practical experience</li>
                                        <li>Industry-recognized certificate</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
