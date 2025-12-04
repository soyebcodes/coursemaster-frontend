"use client";

export const dynamic = "force-dynamic";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
    const { user } = useAuth();

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

                {/* Tabs/Content */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">0</CardTitle>
                            <CardDescription>Courses Enrolled</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">0%</CardTitle>
                            <CardDescription>Average Progress</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">0</CardTitle>
                            <CardDescription>Completed Courses</CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                {/* My Courses Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-4">My Courses</h2>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center py-12">
                                <p className="text-neutral-600 mb-4">
                                    You haven&apos;t enrolled in any courses yet.
                                </p>
                                <Link href="/courses">
                                    <Button>Explore Courses</Button>
                                </Link>
                            </div>
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
