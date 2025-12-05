"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, useAppDispatch } from "@/hooks/useAuth";
import { logout } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
    const { user, isAuthenticated } = useAuth();
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        router.push("/login");
        setMobileMenuOpen(false);
    };

    const navLinks = isAuthenticated
        ? user?.role === "admin"
            ? [
                { href: "/admin/dashboard", label: "Dashboard" },
                { href: "/admin/courses", label: "Courses" },
                { href: "/admin/enrollments", label: "Enrollments" },
                { href: "/admin/assignments", label: "Assignments" },
                { href: "/admin/quizzes", label: "Quizzes" },
            ]
            : [
                { href: "/", label: "Home" },
                { href: "/courses", label: "Explore" },
                { href: "/dashboard", label: "My Courses" },
            ]
        : [
            { href: "/", label: "Home" },
            { href: "/courses", label: "Courses" },
        ];

    return (
        <nav className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            CM
                        </div>
                        <span className="hidden sm:inline text-neutral-900">CourseMaster</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href}>
                                <Button
                                    variant={pathname === link.href ? "default" : "ghost"}
                                    className="rounded-md"
                                >
                                    {link.label}
                                </Button>
                            </Link>
                        ))}
                    </div>

                    {/* User Menu / Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="rounded-full w-10 h-10 p-0">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <div className="px-2 py-1.5">
                                        <p className="text-sm font-semibold text-neutral-900">
                                            {user?.name}
                                        </p>
                                        <p className="text-xs text-neutral-500">{user?.email}</p>
                                        <p className="text-xs text-neutral-500 capitalize mt-1">
                                            {user?.role}
                                        </p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile">Profile</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="text-red-600 cursor-pointer"
                                    >
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost">Login</Button>
                                </Link>
                                <Link href="/register">
                                    <Button>Register</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden pb-4 pt-2 border-t border-neutral-200">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href}>
                                <Button
                                    variant={pathname === link.href ? "default" : "ghost"}
                                    className="w-full justify-start rounded-md mb-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Button>
                            </Link>
                        ))}
                        {isAuthenticated ? (
                            <>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start rounded-md mb-2"
                                    asChild
                                >
                                    <Link href="/profile">Profile</Link>
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="w-full justify-start rounded-md"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="w-full block mb-2">
                                    <Button variant="outline" className="w-full rounded-md">
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/register" className="w-full block">
                                    <Button className="w-full rounded-md">Register</Button>
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
