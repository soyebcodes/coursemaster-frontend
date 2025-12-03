"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Course } from "@/types";
import { Star, Users } from "lucide-react";

interface CourseCardProps {
    course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
            {/* Course Image/Header */}
            <div className="h-40 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <div className="text-white text-4xl">📚</div>
            </div>

            <CardContent className="p-4 flex flex-col flex-grow">
                {/* Title */}
                <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-neutral-900">
                    {course.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                    {course.description}
                </p>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-neutral-500 mb-4">
                    <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Instructor</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        <span>{course.lessons?.length || 0} lessons</span>
                    </div>
                </div>

                {/* Tags */}
                {course.tags && course.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        {course.tags.slice(0, 2).map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                        {course.tags.length > 2 && (
                            <span className="px-2 py-1 text-xs text-neutral-600">
                                +{course.tags.length - 2} more
                            </span>
                        )}
                    </div>
                )}

                {/* Price and Button */}
                <div className="mt-auto pt-4 border-t border-neutral-200 flex items-center justify-between">
                    <span className="text-lg font-bold text-neutral-900">
                        ${course.price}
                    </span>
                    <Link href={`/courses/${course._id}`}>
                        <Button size="sm" variant="default">
                            View Course
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
