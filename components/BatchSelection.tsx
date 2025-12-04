'use client';

import { useState, useEffect } from 'react';
import { batchService, type Batch } from '@/services/batchService';
import { format } from 'date-fns';

interface BatchSelectionProps {
    courseId: string;
    onSelectBatch: (batchId: string) => void;
    selectedBatchId?: string;
}

export function BatchSelection({ courseId, onSelectBatch, selectedBatchId }: BatchSelectionProps) {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const data = await batchService.getCourseBatches(courseId);
                setBatches(data);
                if (data.length > 0 && !selectedBatchId) {
                    onSelectBatch(data[0].id);
                }
            } catch (err) {
                setError('Failed to load batches. Please try again later.');
                console.error('Error fetching batches:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBatches();
    }, [courseId, onSelectBatch, selectedBatchId]);

    if (isLoading) {
        return <div>Loading batches...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (batches.length === 0) {
        return <div>No batches available for this course.</div>;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Select a Batch</h3>
            <div className="space-y-2">
                {batches.map((batch) => (
                    <div
                        key={batch.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedBatchId === batch.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                            }`}
                        onClick={() => onSelectBatch(batch.id)}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-medium">{batch.name}</h4>
                                <p className="text-sm text-gray-600">
                                    {format(new Date(batch.startDate), 'MMM d, yyyy')} - {format(new Date(batch.endDate), 'MMM d, yyyy')}
                                </p>
                                <p className="text-sm text-gray-600">{batch.schedule}</p>
                            </div>
                            <div className="text-sm text-gray-600">
                                {batch.currentStudents}/{batch.maxStudents} students
                            </div>
                        </div>
                        {batch.currentStudents >= batch.maxStudents && (
                            <div className="mt-2 text-sm text-red-600">Batch is full</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
