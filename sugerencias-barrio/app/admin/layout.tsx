"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Escuchar cambios de autenticación
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "PASSWORD_RECOVERY") {
                router.push("/admin/update-password");
            }

            // Si el usuario cierra sesión, redirigir al login
            if (event === "SIGNED_OUT") {
                router.push("/admin/login");
            }
        });

        // Verificar sesión actual
        const checkSession = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                // Rutas públicas dentro de admin (solo login por ahora)
                const isPublicRoute = pathname === "/admin/login";

                if (!session && !isPublicRoute) {
                    router.push("/admin/login");
                } else if (session && isPublicRoute) {
                    router.push("/admin/dashboard");
                }
            } catch (error) {
                console.error("Error checking session:", error);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        return () => {
            subscription.unsubscribe();
        };
    }, [router, pathname]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            </div>
        );
    }

    return <>{children}</>;
}
