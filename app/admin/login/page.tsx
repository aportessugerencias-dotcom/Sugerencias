"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, Mail, AlertTriangle, KeyRound, Edit2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";



export default function AdminLogin() {
    // Mode: 'password' (default) or 'otp'
    const [mode, setMode] = useState<'password' | 'otp'>('password');

    // OTP State
    const [step, setStep] = useState<'email' | 'otp_code'>('email');

    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handlePasswordLogin = async (e: React.FormEvent) => {
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

            router.push("/admin/dashboard");
        } catch (err: any) {
            setError(err.message || "Ocurrió un error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: false,
                    emailRedirectTo: `${window.location.origin}/admin/dashboard`
                }
            });

            if (error) throw error;

            setStep('otp_code');
        } catch (err: any) {
            setError(err.message || "Error al enviar el código");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'email'
            });

            if (error) {
                if (error.message.includes("Token has expired") || error.message.includes("Invalid token")) {
                    throw new Error("Código inválido o expirado.");
                }
                throw error;
            }

            router.push("/admin/dashboard");
        } catch (err: any) {
            setError(err.message || "Error al verificar el código");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
            {/* Background elements */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)] opacity-20"></div>

            <div className="w-full max-w-sm animate-in fade-in zoom-in duration-500">
                <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                    <div className="mb-8 text-center">
                        <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                            {mode === 'password' ? 'Acceso Administrativo' : (step === 'email' ? 'Ingreso con Código' : 'Verificación')}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {mode === 'password'
                                ? 'Ingresá tus credenciales para continuar'
                                : (step === 'email'
                                    ? 'Ingresá tu email registrado para recibir un código'
                                    : `Ingresá el código enviado a ${email}`)
                            }
                        </p>
                    </div>

                    {mode === 'password' ? (
                        <form onSubmit={handlePasswordLogin} className="space-y-4">
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
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
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
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
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

                            <div className="text-center pt-2">
                                <button
                                    type="button"
                                    onClick={() => setMode('otp')}
                                    className="text-sm text-gray-500 hover:text-gray-900 hover:underline transition-colors"
                                >
                                    ¿Olvidaste tu contraseña? Ingresar con código
                                </button>
                            </div>
                        </form>
                    ) : (
                        // OTP MODE
                        step === 'email' ? (
                            <form onSubmit={handleSendCode} className="space-y-4">
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
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                        placeholder="tu@email.com"
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
                                    {loading ? "Enviando..." : "Enviar Código"}
                                    {!loading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
                                </button>

                                <div className="text-center pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setMode('password')}
                                        className="text-sm text-gray-500 hover:text-gray-900 hover:underline transition-colors"
                                    >
                                        Volver a ingreso con contraseña
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyCode} className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="otp" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <KeyRound size={16} /> Código de verificación
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setStep('email')}
                                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            <Edit2 size={10} /> Cambiar email
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        id="otp"
                                        required
                                        autoFocus
                                        maxLength={20}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Numeric only usually
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-2xl tracking-widest font-bold text-gray-900 outline-none transition-all placeholder:text-gray-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                        placeholder="123456..."
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
                                    {loading ? "Verificando..." : "Verificar"}
                                    {!loading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
                                </button>
                            </form>
                        )
                    )}
                </div>
            </div>
        </main>
    );
}

