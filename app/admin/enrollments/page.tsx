"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { adminService } from "@/services/adminService";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2 } from "lucide-react";
import type { Enrollment } from "@/types";

export default function AdminEnrollmentsPage() {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.auth.user);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user?.role !== "admin") {
            router.push("/dashboard");
            return;
        }

        const loadEnrollments = async () => {
            try {
                setLoading(true);
                const data = await adminService.getAllEnrollments();
                console.log("Enrollments data received:", data);
                setEnrollments(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load enrollments");
            } finally {
                setLoading(false);
            }
        };

        loadEnrollments();
    }, [user, router]);

    const filteredEnrollments = enrollments.filter((e) =>
        e.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.courseId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-neutral-600">Loading enrollments...</p>
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">Enrollment Management</h1>
                    <p className="text-neutral-600">View and manage student enrollments</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Search */}
                <div className="mb-6">
                    <Input
                        placeholder="Search by student ID or course ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md"
                    />
                </div>

                {filteredEnrollments.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-neutral-600">
                                {enrollments.length === 0
                                    ? "No enrollments yet"
                                    : "No enrollments match your search"}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-neutral-200">
                        <table className="w-full">
                            <thead className="bg-neutral-100 border-b border-neutral-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Student ID</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Course ID</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Progress</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Enrolled Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEnrollments.map((enrollment) => (
                                    <tr key={enrollment._id} className="border-b border-neutral-200 hover:bg-neutral-50">
                                        <td className="px-6 py-4 text-sm font-medium text-neutral-900">{enrollment.studentId}</td>
                                        <td className="px-6 py-4 text-sm text-neutral-600">{enrollment.courseId}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${enrollment.status === "active"
                                                    ? "bg-green-100 text-green-700"
                                                    : enrollment.status === "completed"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-neutral-100 text-neutral-700"
                                                    }`}
                                            >
                                                {enrollment.status || "active"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-600">
                                            {enrollment.progress ? `${enrollment.progress}%` : "0%"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-600">
                                            {new Date(enrollment.enrollmentDate || "").toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-6 text-center text-sm text-neutral-600">
                    Showing {filteredEnrollments.length} of {enrollments.length} enrollments
                </div>
            </div>
        </div>
    );
}
