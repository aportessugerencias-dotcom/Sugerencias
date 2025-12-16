"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get("code");

            if (code) {
                try {
                    const { error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) throw error;

                    // Successful exchange
                    // The AdminLayout or normal flow will take over
                    router.push("/admin/dashboard");
                } catch (error) {
                    console.error("Error exchanging code for session:", error);
                    router.push("/admin/login?error=auth_callback_error");
                }
            } else {
                // If no code, maybe it was a hash login (Implicit) handling
                // createClient handles hash automatically usually, or we just redirect
                router.push("/admin/dashboard");
            }
        };

        handleCallback();
    }, [router, searchParams]);

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mb-4"></div>
                <p className="text-gray-500">Autenticando...</p>
            </div>
        </div>
    );
}

export default function AuthCallback() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthCallbackContent />
        </Suspense>
    );
}
