"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch } from "@/hooks/useAuth";
import { login } from "@/store/authSlice";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: LoginFormValues) {
        setIsLoading(true);
        try {
            const result = await dispatch(login(values));
            if (result.payload) {
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Login failed:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="you@example.com"
                                                type="email"
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your password"
                                                type="password"
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Signing in..." : "Sign in"}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-4 text-center text-sm">
                        <span className="text-neutral-600">Don&apos;t have an account? </span>
                        <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                            Register
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
