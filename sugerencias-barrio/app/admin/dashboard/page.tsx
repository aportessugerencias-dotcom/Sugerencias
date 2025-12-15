"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { LogOut, MapPin, User, Mail, Calendar } from "lucide-react";

interface Suggestion {
    id: string;
    created_at: string;
    nombre: string;
    apellido: string;
    email: string;
    zona: string;
    descripcion: string;
}

export default function AdminDashboard() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [userEmail, setUserEmail] = useState<string>("");

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                // Get current user for display
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setUserEmail(user.email || "");
                }

                const { data, error } = await supabase
                    .from('sugerencias')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching suggestions:', error);
                } else {
                    setSuggestions(data || []);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // Layout will handle redirect, but we force it just in case
        router.push("/admin/login");
    };

    return (
        <main className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <header className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between md:px-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Panel de Sugerencias</h1>
                        <p className="text-sm text-gray-500">
                            Hola, <span className="font-medium text-gray-900">{userEmail}</span>
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                    >
                        <LogOut size={16} />
                        Cerrar Sesión
                    </button>
                </header>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                    </div>
                ) : suggestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white/50 p-12 text-center text-gray-500">
                        <p className="text-lg">No hay sugerencias registradas aún.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {suggestions.map((s) => (
                            <div
                                key={s.id}
                                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white p-6 shadow-sm transition-all hover:shadow-md"
                            >
                                <div className="mb-4 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                            <MapPin size={12} />
                                            {s.zona}
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(s.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                                            <User size={16} className="text-gray-400" />
                                            {s.nombre} {s.apellido}
                                        </h3>
                                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                            <Mail size={14} />
                                            {s.email}
                                        </div>
                                    </div>

                                    <div className="rounded-xl bg-gray-50 p-4">
                                        <p className="text-sm leading-relaxed text-gray-700">
                                            {s.descripcion}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
