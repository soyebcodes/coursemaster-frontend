"use client";

import { useEffect, useCallback } from "react";
import { useAppDispatch } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/useCourses";
import {
    fetchCourses,
    setSearch,
    setCategory,
    setPriceRange,
    setSort,
    setPage,
} from "@/store/courseSlice";
import { CourseCard } from "@/components/CourseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function CoursesPage() {
    const dispatch = useAppDispatch();
    const { courses, loading, pagination, filters } = useCourses();

    // Load courses on mount and when filters change
    useEffect(() => {
        const loadCourses = async () => {
            try {
                await dispatch(
                    fetchCourses({
                        page: pagination?.page || 1,
                        limit: pagination?.limit || 12,
                        search: filters?.search || '',
                        category: filters?.category || '',
                        minPrice: filters?.minPrice || undefined,
                        maxPrice: filters?.maxPrice || undefined,
                        sort: filters?.sort || 'newest',
                    })
                );
            } catch (error) {
                console.error('Error loading courses:', error);
            }
        };

        loadCourses();
    }, [dispatch, pagination?.page, JSON.stringify(filters)]);

    const handleSearch = useCallback(
        (value: string) => {
            dispatch(setSearch(value));
        },
        [dispatch]
    );

    const handleCategoryChange = useCallback(
        (value: string) => {
            dispatch(setCategory(value));
        },
        [dispatch]
    );

    const handleSortChange = useCallback(
        (value: "price_asc" | "price_desc" | "newest") => {
            dispatch(setSort(value));
        },
        [dispatch]
    );

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                        Explore Courses
                    </h1>
                    <p className="text-neutral-600">
                        Find the perfect course to advance your skills
                    </p>
                </div>

                {/* Filters Section */}
                <Card className="p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div>
                            <label className="text-sm font-medium text-neutral-700 block mb-2">
                                Search Courses
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                <Input
                                    placeholder="Search by title or description..."
                                    className="pl-10"
                                    value={filters?.search || ""}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="text-sm font-medium text-neutral-700 block mb-2">
                                Category
                            </label>
                            <Select
                                value={filters?.category || "all"}
                                onValueChange={(value) =>
                                    handleCategoryChange(value === "all" ? "" : value)
                                }
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="programming">Programming</SelectItem>
                                    <SelectItem value="design">Design</SelectItem>
                                    <SelectItem value="business">Business</SelectItem>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="text-sm font-medium text-neutral-700 block mb-2">
                                Sort By
                            </label>
                            <Select
                                value={filters?.sort || "newest"}
                                onValueChange={(value) =>
                                    handleSortChange(value as "price_asc" | "price_desc" | "newest")
                                }
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest</SelectItem>
                                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Clear Filters */}
                        <div className="flex items-end">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    dispatch(setSearch(""));
                                    dispatch(setCategory(""));
                                    dispatch(
                                        setPriceRange({ minPrice: null, maxPrice: null })
                                    );
                                    dispatch(setSort("newest"));
                                }}
                                disabled={loading}
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-neutral-600">Loading courses...</p>
                        </div>
                    </div>
                )}

                {/* Courses Grid */}
                {!loading && courses.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {courses.map((course) => (
                                <CourseCard key={course._id} course={course} />
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-center gap-4 mt-8">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page === 1 || loading}
                                onClick={() => dispatch(setPage(Math.max(1, pagination.page - 1)))}
                            >
                                Previous
                            </Button>
                            <div className="text-sm text-neutral-600">
                                Page {pagination.page} of {Math.max(1, pagination.pages)}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page >= pagination.pages || loading}
                                onClick={() => dispatch(setPage(Math.min(pagination.pages, pagination.page + 1)))}
                            >
                                Next
                            </Button>
                        </div>
                    </>
                )}

                {/* Empty State */}
                {!loading && courses.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-neutral-600 mb-4">
                            No courses found matching your filters.
                        </p>
                        <Button
                            onClick={() => {
                                dispatch(setSearch(""));
                                dispatch(setCategory(""));
                                dispatch(
                                    setPriceRange({ minPrice: null, maxPrice: null })
                                );
                                dispatch(setSort("newest"));
                            }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
