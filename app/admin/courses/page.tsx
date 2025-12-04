"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { courseService } from "@/services/courseService";
import { adminService } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2, Trash2, Edit, Plus } from "lucide-react";
import Link from "next/link";
import type { Course } from "@/types";

export default function AdminCoursesPage() {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.auth.user);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user?.role !== "admin") {
            router.push("/dashboard");
            return;
        }

        const loadCourses = async () => {
            try {
                setLoading(true);
                // Get courses with pagination to fetch all
                const data = await courseService.getCourses({ limit: 1000, page: 1 });
                setCourses(data.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load courses");
            } finally {
                setLoading(false);
            }
        };

        loadCourses();
    }, [user, router]);

    const handleDeleteCourse = async (courseId: string) => {
        if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
            return;
        }

        try {
            setDeleting(courseId);
            await adminService.deleteCourse(courseId);
            setCourses((prev) => prev.filter((c) => c._id !== courseId));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete course");
        } finally {
            setDeleting(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-neutral-600">Loading courses...</p>
                </div>
            </div>
        );
    }

    if (user?.role !== "admin") {
        return (
            <div className="container mx-auto py-8">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <p className="text-red-800">Access denied</p>
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
                        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Course Management</h1>
                        <p className="text-neutral-600">Create and manage all courses</p>
                    </div>
                    <Link href="/admin/courses/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Course
                        </Button>
                    </Link>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {courses.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-neutral-600 mb-4">No courses created yet</p>
                            <Link href="/admin/courses/create">
                                <Button>Create First Course</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-neutral-200">
                        <table className="w-full">
                            <thead className="bg-neutral-100 border-b border-neutral-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Title</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Category</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Price</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Lessons</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Instructor</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course) => (
                                    <tr key={course._id} className="border-b border-neutral-200 hover:bg-neutral-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-neutral-900 line-clamp-2">{course.title}</p>
                                                <p className="text-xs text-neutral-500 mt-1 line-clamp-1">{course.description}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700">
                                                {course.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-600">
                                            ${course.price.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-600">
                                            {course.lessons?.length || 0}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-600">
                                            {course.instructor}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link href={`/admin/courses/${course._id}/edit`}>
                                                    <Button size="sm" variant="outline">
                                                        <Edit className="h-4 w-4" />
                                                        <span className="sr-only">Edit</span>
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDeleteCourse(course._id)}
                                                    disabled={deleting === course._id}
                                                >
                                                    {deleting === course._id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
