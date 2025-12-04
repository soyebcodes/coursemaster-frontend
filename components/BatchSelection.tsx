'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Batch {
    name: string;
    schedule: string;
    startDate: Date | string;
    seats: number;
    currentStudents?: number;
    maxStudents?: number;
    id?: string;
    _id?: string;
}

interface BatchSelectionProps {
    courseId: string;
    onSelectBatch: (batchId: string) => void;
    selectedBatchId?: string;
    // Add course prop to receive the course data directly
    course?: {
        batches?: Array<Batch & { _id?: string }>;
    };
}

export function BatchSelection({ courseId, onSelectBatch, selectedBatchId, course }: BatchSelectionProps) {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadBatches = () => {
            try {
                setIsLoading(true);

                // Use batches from course prop if available
                if (course?.batches) {
                    // Transform the course.batches to match the expected Batch type
                    const formattedBatches = course.batches.map((batch, index) => ({
                        ...batch,
                        id: batch._id || `batch-${index}`, // Use _id or create a fallback ID
                        currentStudents: 0, // Default value
                        maxStudents: batch.seats || 25, // Use seats from the data
                        startDate: typeof batch.startDate === 'string' ? batch.startDate : batch.startDate.toISOString(),
                        endDate: new Date(
                            new Date(batch.startDate).getTime() + (30 * 24 * 60 * 60 * 1000) // Add 30 days as end date
                        ).toISOString()
                    }));

                    setBatches(formattedBatches);

                    // Auto-select first batch if none selected
                    if (formattedBatches.length > 0 && !selectedBatchId) {
                        onSelectBatch(formattedBatches[0].id || '');
                    }
                } else {
                    setBatches([]);
                }
            } catch (err) {
                console.error('Error processing batches:', err);
                setError('Failed to load batches. Please try again later.');
                setBatches([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadBatches();
    }, [course, courseId, onSelectBatch, selectedBatchId]);

    if (isLoading) {
        return <div className="py-2 text-gray-600">Loading batches...</div>;
    }

    if (error) {
        return <div className="py-2 text-red-500">{error}</div>;
    }

    if (!batches || batches.length === 0) {
        return <div className="py-2 text-gray-600">No batches available for this course.</div>;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Select a Batch</h3>
            <div className="space-y-2">
                {batches.map((batch) => {
                    const batchId = batch.id || '';
                    return (
                        <div
                            key={batchId}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedBatchId === batchId
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:bg-gray-50'
                                }`}
                            onClick={() => onSelectBatch(batchId)}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium">{batch.name}</h4>
                                    <p className="text-sm text-gray-600">
                                        {format(new Date(batch.startDate), 'MMM d, yyyy')} -{' '}
                                        {format(new Date(batch.endDate), 'MMM d, yyyy')}
                                    </p>
                                    <p className="text-sm text-gray-600">{batch.schedule}</p>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {batch.currentStudents || 0}/{batch.maxStudents || 25} students
                                </div>
                            </div>
                            {(batch.currentStudents || 0) >= (batch.maxStudents || 25) && (
                                <div className="mt-2 text-sm text-red-600">Batch is full</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}