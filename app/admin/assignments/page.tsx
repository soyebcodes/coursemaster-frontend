"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { courseService } from "@/services/courseService";
import { adminService } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";
import type { Assignment, AssignmentSubmission, Course } from "@/types";

interface AssignmentWithSubmissions extends Assignment {
    submissions?: AssignmentSubmission[];
}

export default function AdminAssignmentsPage() {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.auth.user);
    const [courses, setCourses] = useState<Course[]>([]);
    const [assignments, setAssignments] = useState<AssignmentWithSubmissions[]>([]);
    const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [grading, setGrading] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
    const [showGradeDialog, setShowGradeDialog] = useState(false);
    const [gradeForm, setGradeForm] = useState({ grade: "", feedback: "" });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user?.role !== "admin") {
            router.push("/dashboard");
            return;
        }

        const loadData = async () => {
            try {
                setLoading(true);
                const coursesData = await courseService.getCourses({ limit: 1000, page: 1 });
                setCourses(coursesData.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user, router]);

    const handleCourseSelect = async (courseId: string) => {
        setSelectedCourse(courseId);
        try {
            // In a real app, you'd fetch assignments for this course
            // For now, just clear the submissions
            setSubmissions([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load assignments");
        }
    };

    const handleGradeSubmission = async () => {
        if (!selectedSubmission || !gradeForm.grade) {
            alert("Please enter a grade");
            return;
        }

        try {
            setGrading(true);
            const grade = parseInt(gradeForm.grade);
            await adminService.gradeAssignment(
                selectedSubmission._id,
                grade,
                gradeForm.feedback
            );

            // Update the submission in the list
            setSubmissions((prev) =>
                prev.map((s) =>
                    s._id === selectedSubmission._id
                        ? { ...s, grade, feedback: gradeForm.feedback }
                        : s
                )
            );

            setShowGradeDialog(false);
            setSelectedSubmission(null);
            setGradeForm({ grade: "", feedback: "" });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to grade assignment");
        } finally {
            setGrading(false);
        }
    };

    const handleOpenGradeDialog = (submission: AssignmentSubmission) => {
        setSelectedSubmission(submission);
        setGradeForm({
            grade: submission.grade?.toString() || "",
            feedback: submission.feedback || "",
        });
        setShowGradeDialog(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-neutral-600">Loading assignments...</p>
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
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">Assignment Grading</h1>
                    <p className="text-neutral-600">Review and grade student submissions</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Course Selection */}
                <div className="mb-6">
                    <Label htmlFor="course-select" className="mb-2 block">
                        Select Course
                    </Label>
                    <select
                        id="course-select"
                        value={selectedCourse}
                        onChange={(e) => handleCourseSelect(e.target.value)}
                        className="w-full max-w-md px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Choose a course...</option>
                        {courses.map((course) => (
                            <option key={course._id} value={course._id}>
                                {course.title}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedCourse && submissions.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-neutral-600">No submissions to grade for this course</p>
                        </CardContent>
                    </Card>
                ) : selectedCourse ? (
                    <div className="overflow-x-auto rounded-lg border border-neutral-200">
                        <table className="w-full">
                            <thead className="bg-neutral-100 border-b border-neutral-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Student</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Assignment</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Submission</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Grade</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((submission) => (
                                    <tr key={submission._id} className="border-b border-neutral-200 hover:bg-neutral-50">
                                        <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                                            {submission.studentId}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-600">
                                            {submission.assignmentId}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-600">
                                            <p className="line-clamp-2">{submission.answer}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-neutral-900">
                                            {submission.grade ? `${submission.grade}/100` : "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${submission.grade
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                            >
                                                {submission.grade ? "Graded" : "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button
                                                size="sm"
                                                onClick={() => handleOpenGradeDialog(submission)}
                                            >
                                                Grade
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-neutral-600">Select a course to view submissions</p>
                        </CardContent>
                    </Card>
                )}

                {/* Grade Dialog */}
                <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Grade Assignment</DialogTitle>
                            <DialogDescription>
                                Provide a grade and feedback for this submission
                            </DialogDescription>
                        </DialogHeader>

                        {selectedSubmission && (
                            <div className="space-y-4">
                                <div className="p-3 bg-neutral-50 rounded-md">
                                    <p className="text-sm text-neutral-600 mb-1">Student Answer:</p>
                                    <p className="text-sm text-neutral-900">{selectedSubmission.answer}</p>
                                </div>

                                <div>
                                    <Label htmlFor="grade">Grade (0-100)</Label>
                                    <Input
                                        id="grade"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={gradeForm.grade}
                                        onChange={(e) =>
                                            setGradeForm((prev) => ({ ...prev, grade: e.target.value }))
                                        }
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="feedback">Feedback</Label>
                                    <Textarea
                                        id="feedback"
                                        placeholder="Provide feedback for the student..."
                                        value={gradeForm.feedback}
                                        onChange={(e) =>
                                            setGradeForm((prev) => ({ ...prev, feedback: e.target.value }))
                                        }
                                        className="mt-2"
                                    />
                                </div>

                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowGradeDialog(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={handleGradeSubmission} disabled={grading}>
                                        {grading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                        {grading ? "Saving..." : "Save Grade"}
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
