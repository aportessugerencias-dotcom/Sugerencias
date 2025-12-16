"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Lock, ArrowRight, AlertTriangle } from "lucide-react";

export default function UpdatePassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) {
                throw updateError;
            }

            setMessage("Contraseña actualizada correctamente. Redirigiendo...");
            setTimeout(() => {
                router.push("/admin/dashboard");
            }, 2000);

        } catch (err: any) {
            setError(err.message || "Error al actualizar la contraseña");
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
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                            <Lock size={24} />
                        </div>
                        <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                            Actualizar Contraseña
                        </h1>
                        <p className="text-sm text-gray-500">
                            Por seguridad, debes establecer una nueva contraseña para tu cuenta.
                        </p>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="pass" className="text-sm font-medium text-gray-700">
                                Nueva Contraseña
                            </label>
                            <input
                                type="password"
                                id="pass"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                placeholder="••••••"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPass" className="text-sm font-medium text-gray-700">
                                Confirmar Contraseña
                            </label>
                            <input
                                type="password"
                                id="confirmPass"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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

                        {message && (
                            <div className="rounded-lg bg-green-50 p-3 text-center text-sm text-green-600">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-white transition-all hover:bg-black disabled:opacity-50"
                        >
                            {loading ? "Actualizando..." : "Actualizar Contraseña"}
                            {!loading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
