"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { enrollmentService } from "@/services/enrollmentService";
import { courseService } from "@/services/courseService";
import type { Course, Enrollment } from "@/types";

export default function DashboardPage() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [coursesById, setCoursesById] = useState<Record<string, Course>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            if (!user) return;
            try {
                setLoading(true);
                setError(null);
                const userEnrollments = await enrollmentService.getUserEnrollments();
                setEnrollments(userEnrollments);

                // Fetch course details for enrolled courses (simple client-side fan-out)
                const uniqueCourseIds = Array.from(new Set(userEnrollments.map((e) => e.courseId)));
                const courseEntries = await Promise.all(
                    uniqueCourseIds.map(async (id) => {
                        try {
                            const course = await courseService.getCourseById(id);
                            return [id, course] as const;
                        } catch {
                            return null;
                        }
                    })
                );

                const nextCourses: Record<string, Course> = {};
                for (const entry of courseEntries) {
                    if (entry) {
                        const [id, course] = entry;
                        nextCourses[id] = course;
                    }
                }
                setCoursesById(nextCourses);
            } catch (err: any) {
                setError(err?.response?.data?.message || "Failed to load your courses");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [user]);

    const stats = useMemo(() => {
        if (!enrollments.length) {
            return {
                total: 0,
                completed: 0,
                avgProgress: 0,
            };
        }

        const total = enrollments.length;
        const completed = enrollments.filter((e) => e.status === "completed").length;
        const avgProgress =
            Math.round(
                enrollments.reduce((sum, e) => sum + (e.progress ?? 0), 0) /
                Math.max(total, 1)
            );

        return { total, completed, avgProgress };
    }, [enrollments]);

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                        Welcome back, {user?.name}! 👋
                    </h1>
                    <p className="text-neutral-600">
                        Continue your learning journey or explore new courses
                    </p>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{stats.total}</CardTitle>
                            <CardDescription>Courses Enrolled</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{stats.avgProgress}%</CardTitle>
                            <CardDescription>Average Progress</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{stats.completed}</CardTitle>
                            <CardDescription>Completed Courses</CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                {/* My Courses Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-4">My Courses</h2>
                    <Card>
                        <CardContent className="pt-6">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <p className="text-neutral-600">Loading your courses...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <p className="text-red-600 mb-4">{error}</p>
                                    <Link href="/courses">
                                        <Button>Explore Courses</Button>
                                    </Link>
                                </div>
                            ) : enrollments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <p className="text-neutral-600 mb-4">
                                        You haven&apos;t enrolled in any courses yet.
                                    </p>
                                    <Link href="/courses">
                                        <Button>Explore Courses</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {enrollments.map((enrollment) => {
                                        const course = coursesById[enrollment.courseId];
                                        if (!course) return null;

                                        return (
                                            <Link
                                                key={enrollment._id}
                                                href={`/courses/${course._id}/learn`}
                                            >
                                                <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow bg-white">
                                                    <h3 className="font-semibold text-neutral-900 mb-1">
                                                        {course.title}
                                                    </h3>
                                                    <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
                                                        {course.description}
                                                    </p>
                                                    <p className="text-xs text-neutral-500">
                                                        Progress: {enrollment.progress ?? 0}%
                                                    </p>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recommended Courses */}
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-4">Recommended Courses</h2>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center py-12">
                                <p className="text-neutral-600 mb-4">
                                    No recommendations available at this time.
                                </p>
                                <Link href="/courses">
                                    <Button variant="outline">Browse All Courses</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
