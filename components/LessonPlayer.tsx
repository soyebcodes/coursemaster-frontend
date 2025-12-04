"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lesson } from "@/types";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

interface LessonPlayerProps {
    lesson: Lesson;
    isCompleted: boolean;
    onMarkComplete?: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
    hasPrevious: boolean;
    hasNext: boolean;
}

export function LessonPlayer({
    lesson,
    isCompleted,
    onMarkComplete,
    onPrevious,
    onNext,
    hasPrevious,
    hasNext,
}: LessonPlayerProps) {
    const [videoError, setVideoError] = useState(false);

    return (
        <div className="space-y-6">
            {/* Video Player */}
            <Card>
                <CardContent className="p-0">
                    {lesson.videoUrl && !videoError ? (
                        <div className="bg-black aspect-video flex items-center justify-center rounded-t-lg overflow-hidden">
                            <iframe
                                width="100%"
                                height="100%"
                                src={lesson.videoUrl.replace(
                                    "watch?v=",
                                    "embed/"
                                )}
                                title={lesson.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                onError={() => setVideoError(true)}
                            />
                        </div>
                    ) : (
                        <div className="bg-neutral-200 aspect-video flex items-center justify-center rounded-t-lg">
                            <div className="text-center">
                                <p className="text-neutral-600 mb-2">No video available</p>
                                <p className="text-sm text-neutral-500">
                                    {videoError
                                        ? "Error loading video"
                                        : "This lesson has no video content"}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Lesson Content */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                        {lesson.title}
                    </h2>

                    {lesson.content && (
                        <div className="prose prose-sm max-w-none mb-6">
                            <div className="text-neutral-700 whitespace-pre-wrap">
                                {lesson.content}
                            </div>
                        </div>
                    )}

                    {/* Mark Complete Button */}
                    {onMarkComplete && (
                        <Button
                            onClick={onMarkComplete}
                            disabled={isCompleted}
                            className={`mb-4 ${isCompleted ? "opacity-50" : ""}`}
                        >
                            {isCompleted ? (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Lesson Completed
                                </>
                            ) : (
                                "Mark as Completed"
                            )}
                        </Button>
                    )}

                    {/* Completion Status */}
                    {isCompleted && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center gap-2">
                            <Check className="w-5 h-5 flex-shrink-0" />
                            <span>You have completed this lesson</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4 border-t border-neutral-200">
                <Button
                    variant="outline"
                    onClick={onPrevious}
                    disabled={!hasPrevious}
                    className="flex-1"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous Lesson
                </Button>
                <Button
                    variant="outline"
                    onClick={onNext}
                    disabled={!hasNext}
                    className="flex-1"
                >
                    Next Lesson
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
