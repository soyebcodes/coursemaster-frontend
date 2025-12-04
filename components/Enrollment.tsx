'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { batchService } from '@/services/batchService';
import { paymentService } from '@/services/paymentService';
import { BatchSelection } from './BatchSelection';

interface EnrollmentProps {
    courseId: string;
    courseName: string;
    price: number;
    className?: string;
    onEnrollmentSuccess?: () => Promise<void>;
}

export function Enrollment({ courseId, courseName, price, className, onEnrollmentSuccess }: EnrollmentProps) {
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
        } catch (error) {
            console.error('Enrollment error:', error);
            setError('Failed to process enrollment. Please try again.');
        } finally {
            setIsEnrolling(false);
        }
    };

    return (
        <div className={`space-y-6 ${className}`}>
            <BatchSelection
                courseId={courseId}
                onSelectBatch={setSelectedBatchId}
                selectedBatchId={selectedBatchId}
            />

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <Button
                onClick={handleEnroll}
                disabled={isEnrolling || !selectedBatchId}
                className="w-full"
            >
                {isEnrolling ? 'Processing...' : `Enroll Now - $${price}`}
            </Button>

            <div className="text-sm text-gray-600">
                <p>30-day money-back guarantee</p>
                <p>Full lifetime access</p>
            </div>
        </div>
    );
}
