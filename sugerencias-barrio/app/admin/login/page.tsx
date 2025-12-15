"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, Mail, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                if (authError.message === "Invalid login credentials") {
                    throw new Error("Credenciales inválidas. Verifica tu email y contraseña.");
                }
                throw authError;
            }

            // Redirect handled by Layout/Router but we push as well
            router.push("/admin/dashboard");
        } catch (err: any) {
            setError(err.message || "Ocurrió un error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)] opacity-20"></div>

            <div className="w-full max-w-sm animate-in fade-in zoom-in duration-500">
                <div className="glass-panel rounded-3xl p-8 shadow-2xl">
                    <div className="mb-8 text-center">
                        <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                            Admin Access
                        </h1>
                        <p className="text-sm text-gray-500">Inicia sesión para gestionar sugerencias</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Mail size={16} /> Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                placeholder="usuario@admin.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Lock size={16} /> Contraseña
                            </label>
                            <input
                                type="password"
                                id="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                placeholder="••••••"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                <AlertTriangle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-white transition-all hover:bg-black disabled:opacity-70"
                        >
                            {loading ? "Ingresando..." : "Ingresar"}
                            {!loading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
