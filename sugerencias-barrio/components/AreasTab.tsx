"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Trash2, Layout } from "lucide-react";

interface Area {
    id: string;
    name: string;
    created_at: string;
}

export function AreasTab() {
    const [areas, setAreas] = useState<Area[]>([]);
    const [newAreaName, setNewAreaName] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchAreas = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('areas')
            .select('*')
            .order('name');

        if (data) setAreas(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchAreas();
    }, []);

    const handleAddArea = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAreaName.trim()) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('areas')
                .insert([{ name: newAreaName.trim() }]);

            if (error) {
                alert("Error al crear área: " + error.message);
            } else {
                setNewAreaName("");
                fetchAreas();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteArea = async (id: string) => {
        if (!confirm("¿Estás seguro de que querés eliminar esta área?")) return;

        try {
            const { error } = await supabase
                .from('areas')
                .delete()
                .eq('id', id);

            if (error) {
                alert("Error al eliminar área: " + error.message);
            } else {
                setAreas(areas.filter(a => a.id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Create Area Section */}
            <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Plus className="text-blue-600" /> Crear Nueva Área
                </h2>
                <form onSubmit={handleAddArea} className="flex gap-4">
                    <input
                        type="text"
                        required
                        value={newAreaName}
                        onChange={(e) => setNewAreaName(e.target.value)}
                        className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        placeholder="Nombre del área (ej. Canchas de Tenis)"
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitting ? "Creando..." : "Crear"}
                    </button>
                </form>
            </div>

            {/* Areas List */}
            <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Layout className="text-gray-600" /> Áreas Existentes
                </h2>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {areas.map((area) => (
                            <div key={area.id} className="group flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:bg-white hover:shadow-md">
                                <span className="font-medium text-gray-900">{area.name}</span>
                                <button
                                    onClick={() => handleDeleteArea(area.id)}
                                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Eliminar Área"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
