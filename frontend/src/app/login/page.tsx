"use client";

import { AuthForm } from "@/components/auth/auth-form";
import { Navbar } from "@/components/navbar";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <>
      <Navbar />
      <main className="container mx-auto py-10 px-4">
        <div className="max-w-md mx-auto">
          <AuthForm mode="signIn" />
        </div>
      </main>
    </>
  );
} 