"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-neutral-900 mb-8">User Profile</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>
                            View your profile details and account settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <label className="text-sm font-medium text-neutral-700">Full Name</label>
                            <p className="mt-1 text-neutral-900">{user?.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-700">Email</label>
                            <p className="mt-1 text-neutral-900">{user?.email}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-700">Role</label>
                            <p className="mt-1 text-neutral-900 capitalize">{user?.role}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-700">Member Since</label>
                            <p className="mt-1 text-neutral-900">
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
