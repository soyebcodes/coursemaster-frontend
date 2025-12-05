'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { batchService } from '@/services/batchService';
import { paymentService } from '@/services/paymentService';
import { BatchSelection } from './BatchSelection';
import type { Course } from '@/types';

interface EnrollmentProps {
    courseId: string;
    courseName: string;
    price: number;
    className?: string;
    onEnrollmentSuccess?: () => Promise<void>;
    course?: Course;
}

export function Enrollment({ courseId, courseName, price, className, onEnrollmentSuccess, course }: EnrollmentProps) {
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleEnroll = async () => {
        if (!selectedBatchId) {
            setError('Please select a batch');
            return;
        }

        try {
            setIsEnrolling(true);
            setError(null);

            // First enroll in the batch
            await batchService.enrollInBatch(courseId, selectedBatchId);

            // Call the success handler if provided
            if (onEnrollmentSuccess) {
                await onEnrollmentSuccess();
            }

            // Then create payment session
            const { url } = await paymentService.createPaymentSession(courseId);

            // Redirect to payment gateway
            window.location.href = url;
        } catch (error: any) {
            console.error('Enrollment error:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to process enrollment. Please try again.';
            setError(errorMessage);
        } finally {
            setIsEnrolling(false);
        }
    };

    // Check if course has batches
    const hasBatches = course?.batches && course.batches.length > 0;

    return (
        <div className={`space-y-6 ${className}`}>
            {hasBatches ? (
                <>
                    <BatchSelection
                        courseId={courseId}
                        course={course}
                        onSelectBatch={setSelectedBatchId}
                        selectedBatchId={selectedBatchId ?? undefined}
                    />

                    {error && <div className="text-red-500 text-sm">{error}</div>}

                    <Button
                        onClick={handleEnroll}
                        disabled={isEnrolling || !selectedBatchId}
                        className="w-full"
                    >
                        {isEnrolling ? 'Processing...' : `Enroll Now - $${price}`}
                    </Button>
                </>
            ) : (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                No batches are currently available for this course. Please check back later or contact support for more information.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="text-sm text-gray-600">
                <p>30-day money-back guarantee</p>
                <p>Full lifetime access</p>
            </div>
        </div>
    );
}
