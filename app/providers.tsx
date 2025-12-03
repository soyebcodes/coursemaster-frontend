"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, useAppDispatch } from "@/hooks/useAuth";
import { restoreAuth } from "@/store/authSlice";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/register", "/"];

export function Providers({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, loading } = useAuth();
    const dispatch = useAppDispatch();
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        // Restore auth from localStorage on mount
        dispatch(restoreAuth()).then(() => {
            setHydrated(true);
        });
    }, [dispatch]);

    useEffect(() => {
        if (!hydrated || loading) return;

        const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

        // Redirect to login if not authenticated and trying to access protected route
        if (!isAuthenticated && !isPublicRoute) {
            router.push("/login");
        }

        // Redirect to dashboard if authenticated and trying to access auth pages
        if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, pathname, hydrated, loading, router]);

    if (!hydrated || (loading && !isAuthenticated)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
