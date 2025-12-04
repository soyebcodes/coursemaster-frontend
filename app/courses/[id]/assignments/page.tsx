"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { assignmentService } from "@/services/assignmentService";
import { Assignment, AssignmentSubmission } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, Clock, Send } from "lucide-react";

interface AssignmentWithSubmission extends Assignment {
    submission?: AssignmentSubmission;
}

export default function AssignmentsPage() {
    const params = useParams();
    const courseId = params.id as string;

    const [assignments, setAssignments] = useState<AssignmentWithSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAssignment, setSelectedAssignment] =
        useState<AssignmentWithSubmission | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        answer: "",
        fileLink: "",
    });

    useEffect(() => {
        const loadAssignments = async () => {
            try {
                setLoading(true);
                const data = await assignmentService.getAssignmentsByEnrollment(courseId);
                setAssignments(data);
            } catch (err) {
                setError("Failed to load assignments");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            loadAssignments();
        }
    }, [courseId]);

    const handleSubmit = async () => {
        if (!selectedAssignment || !formData.answer.trim()) {
            alert("Please provide an answer");
            return;
        }

        try {
            setSubmitting(true);
            const submission = await assignmentService.submitAssignment({
                assignmentId: selectedAssignment._id,
                answer: formData.answer,
                fileLink: formData.fileLink || undefined,
            });

            // Update local state
            setAssignments((prev) =>
                prev.map((a) =>
                    a._id === selectedAssignment._id ? { ...a, submission } : a
                )
            );

            // Reset form and close dialog
            setFormData({ answer: "", fileLink: "" });
            setSelectedAssignment(null);
        } catch (err) {
            console.error("Failed to submit assignment:", err);
            alert("Failed to submit assignment");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-neutral-600">Loading assignments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                        Course Assignments
                    </h1>
                    <p className="text-neutral-600">
                        Complete assignments to test your knowledge
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-red-900">{error}</p>
                        </div>
                    </div>
                )}

                {assignments.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-neutral-600 mb-4">
                                No assignments available yet.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {assignments.map((assignment) => {
                            const isSubmitted = !!assignment.submission;
                            const isGraded = assignment.submission?.grade !== undefined;

                            return (
                                <Card key={assignment._id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-neutral-900">
                                                        {assignment.title}
                                                    </h3>
                                                    {isSubmitted && (
                                                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Submitted
                                                        </div>
                                                    )}
                                                    {isGraded && (
                                                        <div className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                                            Grade: {assignment.submission?.grade}%
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-neutral-600 mb-3">
                                                    {assignment.description}
                                                </p>

                                                {assignment.dueDate && (
                                                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                                                        <Clock className="w-4 h-4" />
                                                        <span>
                                                            Due:{" "}
                                                            {new Date(
                                                                assignment.dueDate
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        onClick={() => setSelectedAssignment(assignment)}
                                                    >
                                                        {isSubmitted ? "View Submission" : "Submit"}
                                                    </Button>
                                                </DialogTrigger>
                                                {selectedAssignment?._id === assignment._id && (
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>{assignment.title}</DialogTitle>
                                                            <DialogDescription>
                                                                {assignment.description}
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        {isSubmitted && assignment.submission ? (
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <label className="text-sm font-medium text-neutral-700 block mb-2">
                                                                        Your Answer
                                                                    </label>
                                                                    <div className="p-3 bg-neutral-100 rounded text-neutral-700 whitespace-pre-wrap">
                                                                        {assignment.submission.answer}
                                                                    </div>
                                                                </div>

                                                                {assignment.submission.fileLink && (
                                                                    <div>
                                                                        <label className="text-sm font-medium text-neutral-700 block mb-2">
                                                                            Submitted Link
                                                                        </label>
                                                                        <a
                                                                            href={assignment.submission.fileLink}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-blue-600 hover:underline"
                                                                        >
                                                                            {assignment.submission.fileLink}
                                                                        </a>
                                                                    </div>
                                                                )}

                                                                {isGraded && (
                                                                    <>
                                                                        <div>
                                                                            <label className="text-sm font-medium text-neutral-700 block mb-2">
                                                                                Grade
                                                                            </label>
                                                                            <p className="text-2xl font-bold text-green-600">
                                                                                {assignment.submission.grade}%
                                                                            </p>
                                                                        </div>

                                                                        {assignment.submission.feedback && (
                                                                            <div>
                                                                                <label className="text-sm font-medium text-neutral-700 block mb-2">
                                                                                    Feedback
                                                                                </label>
                                                                                <p className="text-neutral-700">
                                                                                    {assignment.submission.feedback}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <label className="text-sm font-medium text-neutral-700 block mb-2">
                                                                        Your Answer
                                                                    </label>
                                                                    <Textarea
                                                                        placeholder="Write your answer here..."
                                                                        value={formData.answer}
                                                                        onChange={(e) =>
                                                                            setFormData({
                                                                                ...formData,
                                                                                answer: e.target.value,
                                                                            })
                                                                        }
                                                                        rows={6}
                                                                        disabled={submitting}
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="text-sm font-medium text-neutral-700 block mb-2">
                                                                        Google Drive Link (Optional)
                                                                    </label>
                                                                    <Input
                                                                        placeholder="https://drive.google.com/..."
                                                                        value={formData.fileLink}
                                                                        onChange={(e) =>
                                                                            setFormData({
                                                                                ...formData,
                                                                                fileLink: e.target.value,
                                                                            })
                                                                        }
                                                                        disabled={submitting}
                                                                    />
                                                                </div>

                                                                <DialogFooter>
                                                                    <Button
                                                                        onClick={handleSubmit}
                                                                        disabled={submitting}
                                                                    >
                                                                        <Send className="w-4 h-4 mr-2" />
                                                                        {submitting
                                                                            ? "Submitting..."
                                                                            : "Submit Assignment"}
                                                                    </Button>
                                                                </DialogFooter>
                                                            </div>
                                                        )}
                                                    </DialogContent>
                                                )}
                                            </Dialog>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
