"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { adminService } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, BookOpen, Loader2, Users, BarChart3, Plus } from "lucide-react";
import Link from "next/link";

interface AdminStats {
    totalCourses: number;
    totalEnrollments: number;
    totalStudents: number;
    totalInstructors: number;
}

export default function AdminDashboard() {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.auth.user);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if user is admin
        if (user?.role !== "admin") {
            router.push("/dashboard");
            return;
        }

        const loadStats = async () => {
            try {
                setLoading(true);
                const data = await adminService.getStats();
                setStats(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load admin stats");
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [user, router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-neutral-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    if (user?.role !== "admin") {
        return (
            <div className="container mx-auto py-8">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-semibold text-red-900">Access Denied</p>
                        <p className="text-red-700 text-sm">You don&apos;t have permission to access this page.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">Admin Dashboard</h1>
                    <p className="text-neutral-600">Overview and management of all courses and enrollments</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-neutral-600 mb-1">Total Courses</p>
                                        <p className="text-3xl font-bold text-neutral-900">{stats.totalCourses}</p>
                                    </div>
                                    <BookOpen className="h-12 w-12 text-blue-100 rounded-lg p-2" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-neutral-600 mb-1">Total Enrollments</p>
                                        <p className="text-3xl font-bold text-neutral-900">{stats.totalEnrollments}</p>
                                    </div>
                                    <BarChart3 className="h-12 w-12 text-green-100 rounded-lg p-2" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-neutral-600 mb-1">Total Students</p>
                                        <p className="text-3xl font-bold text-neutral-900">{stats.totalStudents}</p>
                                    </div>
                                    <Users className="h-12 w-12 text-purple-100 rounded-lg p-2" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-neutral-600 mb-1">Total Instructors</p>
                                        <p className="text-3xl font-bold text-neutral-900">{stats.totalInstructors}</p>
                                    </div>
                                    <Users className="h-12 w-12 text-orange-100 rounded-lg p-2" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Management Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Course Management */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Course Management</CardTitle>
                                    <CardDescription>Create, edit, and delete courses</CardDescription>
                                </div>
                                <BookOpen className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-neutral-600">
                                Manage all course content including lessons, batches, and pricing. Create new courses or update existing ones.
                            </p>
                            <div className="flex gap-2">
                                <Link href="/admin/courses" className="flex-1">
                                    <Button className="w-full" variant="outline">
                                        View Courses
                                    </Button>
                                </Link>
                                <Link href="/admin/courses/create" className="flex-1">
                                    <Button className="w-full">
                                        <Plus className="h-4 w-4 mr-2" />
                                        New Course
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Enrollment Management */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Enrollment Management</CardTitle>
                                    <CardDescription>View and manage student enrollments</CardDescription>
                                </div>
                                <Users className="h-8 w-8 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-neutral-600">
                                Track student enrollments, view enrollment details, and manage access to courses.
                            </p>
                            <Link href="/admin/enrollments" className="block">
                                <Button className="w-full" variant="outline">
                                    View Enrollments
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Assignment Grading */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Assignment Grading</CardTitle>
                                    <CardDescription>Grade and provide feedback on submissions</CardDescription>
                                </div>
                                <BarChart3 className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-neutral-600">
                                Review student assignment submissions and provide grades and feedback.
                            </p>
                            <Link href="/admin/assignments" className="block">
                                <Button className="w-full" variant="outline">
                                    View Submissions
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Analytics */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Analytics</CardTitle>
                                    <CardDescription>View platform statistics and insights</CardDescription>
                                </div>
                                <BarChart3 className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-neutral-600">
                                View detailed analytics about course performance, student engagement, and completion rates.
                            </p>
                            <Button className="w-full" variant="outline" disabled>
                                Coming Soon
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
