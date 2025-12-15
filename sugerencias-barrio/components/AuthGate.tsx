"use client";

import { useState } from "react";
import { Mail, KeyRound, ArrowRight, CheckCircle2 } from "lucide-react";

interface AuthGateProps {
    onVerified: (email: string) => void;
}

export function AuthGate({ onVerified }: AuthGateProps) {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"email" | "otp">("email");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // For demo purposes, we accept any email
        if (!email.includes("@")) {
            setError("Por favor ingresá un email válido");
            setLoading(false);
            return;
        }

        setLoading(false);
        setStep("otp");
        // In a real app, we would send the email here
        console.log(`Code sent to ${email}`);
        alert(`Simulación: Tu código de verificación es 123456`);
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (otp === "123456") {
            onVerified(email);
        } else {
            setError("Código incorrecto. Intentalo de nuevo.");
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
            <div className="glass-panel rounded-3xl p-8 shadow-2xl md:p-10">
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
                        Bienvenido
                    </h1>
                    <p className="text-gray-600">
                        {step === "email"
                            ? "Ingresá tu email para continuar"
                            : `Ingresá el código enviado a ${email}`}
                    </p>
                </div>

                <form onSubmit={step === "email" ? handleSendCode : handleVerifyCode} className="space-y-6">
                    {step === "email" ? (
                        <div className="space-y-2">
                            <label htmlFor="auth-email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Mail size={16} /> Email
                            </label>
                            <input
                                type="email"
                                id="auth-email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 placeholder:opacity-50"
                                placeholder="tu@email.com"
                            />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label htmlFor="otp" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <KeyRound size={16} /> Código de verificación
                            </label>
                            <input
                                type="text"
                                id="otp"
                                required
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-center text-2xl font-bold tracking-widest text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 placeholder:opacity-50"
                                placeholder="000000"
                            />
                            <button
                                type="button"
                                onClick={() => setStep("email")}
                                className="text-xs text-blue-600 hover:underline"
                            >
                                Cambiar email
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-4 text-white transition-all hover:bg-black hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? (
                            "Procesando..."
                        ) : (
                            <>
                                {step === "email" ? "Enviar Código" : "Verificar"}
                                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
