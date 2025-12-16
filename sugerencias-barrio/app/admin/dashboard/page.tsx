"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { LogOut, MapPin, User, Mail, Calendar, Eye, Users, FileText, Layout, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { SuggestionModal } from "@/components/SuggestionModal";
import { UsersTab } from "@/components/UsersTab";
import { AreasTab } from "@/components/AreasTab";

interface Suggestion {
    id: string;
    created_at: string;
    nombre: string;
    apellido: string;
    email: string;
    zona: string;
    descripcion: string;
    image_url?: string;
    images?: string[];
    areas?: { name: string };
    status?: 'pendiente' | 'en_proceso' | 'finalizado' | string;
}

export default function AdminDashboard() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [userEmail, setUserEmail] = useState<string>("");
    const [userRole, setUserRole] = useState<string>("viewer"); // Default to viewer
    const [activeTab, setActiveTab] = useState<'sugerencias' | 'usuarios' | 'areas'>('sugerencias');
    const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);

    useEffect(() => {
        const initDashboard = async () => {
            try {
                // 1. Get User
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push("/admin/login");
                    return;
                }
                setUserEmail(user.email || "");

                // 2. Get Role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setUserRole(profile.role);
                }

                // 3. Fetch Data
                // Attempt to fetch with relation. If it fails (e.g., migration not run), fallback.
                const { data, error } = await supabase
                    .from('sugerencias')
                    .select('*, areas(name)')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.warn('Could not fetch with areas relation. Defaulting to basic fetch. (Did you run the migration?)', error);

                    // Fallback: Fetch basic data without relations
                    const { data: fallbackData, error: fallbackError } = await supabase
                        .from('sugerencias')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (fallbackError) {
                        console.error('Critical error fetching suggestions:', fallbackError);
                        setSuggestions([]); // Ensure UI recovers even if fallback fails
                    } else {
                        setSuggestions(fallbackData as any || []);
                    }
                } else {
                    setSuggestions(data as any || []);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
            } finally {
                setLoading(false);
            }
        };

        initDashboard();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
    };

    const canManageUsers = userRole === 'superadmin' || userRole === 'admin';
    const canManageAreas = userRole === 'superadmin';

    const handleDeleteSuggestion = async (id: string) => {
        try {
            const { error } = await supabase
                .from('sugerencias')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setSuggestions(suggestions.filter(s => s.id !== id));
            setSelectedSuggestion(null);
        } catch (error) {
            console.error("Error deleting suggestion:", error);
            alert("Error al eliminar la sugerencia.");
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('sugerencias')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            // Update local state
            setSuggestions(suggestions.map(s =>
                s.id === id ? { ...s, status: newStatus } : s
            ));

            // Allow update in modal too if open
            if (selectedSuggestion && selectedSuggestion.id === id) {
                setSelectedSuggestion({ ...selectedSuggestion, status: newStatus });
            }

        } catch (error) {
            console.error("Error updating status:", error);
            alert("Error al actualizar el estado.");
        }
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'finalizado':
                return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"><CheckCircle size={10} /> Finalizado</span>;
            case 'en_proceso':
                return <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"><Clock size={10} /> En Proceso</span>;
            default: // pendiente
                return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700"><AlertCircle size={10} /> Pendiente</span>;
        }
    };

    const getCardBorderClass = (status?: string) => {
        switch (status) {
            case 'finalizado': return 'border-green-200 bg-green-50/20'; // Hint of green
            case 'en_proceso': return 'border-blue-200 bg-blue-50/20';
            default: return 'border-yellow-200 bg-yellow-50/20'; // Hint of yellow for pending
        }
    };

    return (
        <main className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                {/* Header */}
                <header className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between md:px-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                        <p className="text-sm text-gray-500">
                            Hola, <span className="font-medium text-gray-900">{userEmail}</span>
                            <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                {userRole.toUpperCase()}
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Tabs Navigation (only if allowed) */}
                        {canManageUsers && (
                            <div className="flex rounded-xl bg-gray-100 p-1">
                                <button
                                    onClick={() => setActiveTab('sugerencias')}
                                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === 'sugerencias'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    <FileText size={16} /> Sugerencias
                                </button>
                                <button
                                    onClick={() => setActiveTab('usuarios')}
                                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === 'usuarios'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    <Users size={16} /> Usuarios
                                </button>
                                {canManageAreas && (
                                    <button
                                        onClick={() => setActiveTab('areas')}
                                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === 'areas'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                    >
                                        <Layout size={16} /> Áreas
                                    </button>
                                )}
                            </div>
                        )}

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-100"
                        >
                            <LogOut size={16} />
                            Salir
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Tab Content: Sugerencias */}
                        {activeTab === 'sugerencias' && (
                            suggestions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white/50 p-12 text-center text-gray-500">
                                    <p className="text-lg">No hay sugerencias registradas aún.</p>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {suggestions.map((s) => (
                                        <div
                                            key={s.id}
                                            onClick={() => setSelectedSuggestion(s)}
                                            className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border ${getCardBorderClass(s.status)}`}
                                        >
                                            {/* Status Badge Top Right */}
                                            <div className="absolute top-4 right-4 z-10">
                                                {getStatusBadge(s.status)}
                                            </div>

                                            {/* Image Preview Banner if exists (first image) */}
                                            {(s.images && s.images[0]) || s.image_url ? (
                                                <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-blue-400 to-blue-600" />
                                            ) : null}

                                            <div className="mb-4 space-y-4">
                                                <div className="mr-4">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 w-fit">
                                                            <MapPin size={12} />
                                                            {s.zona}
                                                        </div>
                                                        {s.areas?.name && (
                                                            <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 w-fit">
                                                                <Layout size={12} />
                                                                {s.areas.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-400 mt-2 block">
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

                                                <div className="rounded-xl bg-white/60 p-4 border border-gray-100">
                                                    <p className="text-sm leading-relaxed text-gray-700 line-clamp-3">
                                                        {s.descripcion}
                                                    </p>
                                                </div>

                                                {(s.images && s.images.length > 0) || s.image_url ? (
                                                    <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                                                        <Eye size={12} />
                                                        {(s.images?.length || 0) > 1 ? `${s.images?.length} imágenes adjuntas` : 'Imagen adjunta'}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {/* Tab Content: Usuarios (Admin Only) */}
                        {activeTab === 'usuarios' && canManageUsers && (
                            <UsersTab />
                        )}

                        {/* Tab Content: Areas (Superadmin Only) */}
                        {activeTab === 'areas' && canManageAreas && (
                            <AreasTab />
                        )}
                    </>
                )}
            </div>

            {/* Modal */}
            {selectedSuggestion && (
                <SuggestionModal
                    suggestion={selectedSuggestion}
                    onClose={() => setSelectedSuggestion(null)}
                    onDelete={canManageUsers ? handleDeleteSuggestion : undefined}
                    onStatusChange={canManageUsers ? handleStatusChange : undefined}
                />
            )}
        </main>
    );
}
