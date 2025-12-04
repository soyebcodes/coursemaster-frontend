'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { paymentService } from '@/services/paymentService';
import { useRouter } from 'next/navigation';

interface PaymentButtonProps {
    courseId: string;
    courseName: string;
    amount: number;
    className?: string;
}

export function PaymentButton({ courseId, courseName, amount, className }: PaymentButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handlePayment = async () => {
        try {
            setIsLoading(true);
            const { url } = await paymentService.createPaymentSession(courseId);

            // Redirect to payment gateway
            window.location.href = url;
        } catch (error) {
            console.error('Payment error:', error);
            alert('Failed to process payment. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle payment callback after returning from payment gateway
    useEffect(() => {
        const checkPaymentStatus = async () => {
            const params = new URLSearchParams(window.location.search);
            const status = params.get('status');
            const tranId = params.get('tran_id');

            if (status && tranId) {
                try {
                    const { success } = await paymentService.validatePayment(tranId);

                    if (success) {
                        alert('Payment Successful! Your enrollment is now active.');
                        router.push('/dashboard');
                    }
                } catch (error) {
                    console.error('Payment validation error:', error);
                    alert('Payment verification failed. Please check your payment status in your account.');
                }
            }
        };

        checkPaymentStatus();
    }, [router]);

    return (
        <Button
            onClick={handlePayment}
            disabled={isLoading}
            className={className}
        >
            {isLoading ? 'Processing...' : `Enroll Now - $${amount}`}
        </Button>
    );
}
