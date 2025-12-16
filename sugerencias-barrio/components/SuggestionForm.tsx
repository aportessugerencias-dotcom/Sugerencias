"use client";

import { useState, useEffect } from "react";
import { Send, MapPin, User, Mail, FileText, CheckCircle2, Upload, X, ImageIcon, Layout } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface SuggestionFormProps {
    initialEmail: string;
}

interface Area {
    id: string;
    name: string;
}

export function SuggestionForm({ initialEmail }: SuggestionFormProps) {
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: initialEmail,
        zona: "",
        area_id: "",
        descripcion: "",
    });

    const [areas, setAreas] = useState<Area[]>([]);
    const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    useEffect(() => {
        const fetchAreas = async () => {
            const { data } = await supabase
                .from('areas')
                .select('*')
                .order('name');
            if (data) setAreas(data);
        };
        fetchAreas();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const totalImages = selectedImages.length + newFiles.length;

            if (totalImages > 5) {
                alert("Máximo 5 imágenes permitidas.");
                return;
            }

            const validFiles: File[] = [];
            newFiles.forEach(file => {
                if (file.size > 5 * 1024 * 1024) {
                    alert(`La imagen ${file.name} es muy pesada. Máximo 5MB per imagen.`);
                } else {
                    validFiles.push(file);
                }
            });

            const newPreviews = validFiles.map(file => URL.createObjectURL(file));

            setSelectedImages(prev => [...prev, ...validFiles]);
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };

    const handleRemoveImage = (index: number) => {
        const urlToRevoke = previewUrls[index];
        URL.revokeObjectURL(urlToRevoke);

        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");

        const uploadedImageUrls: string[] = [];

        try {
            // Upload images
            if (selectedImages.length > 0) {
                for (const file of selectedImages) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                    const { error: uploadError } = await supabase.storage
                        .from('sugerencias-images')
                        .upload(fileName, file);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('sugerencias-images')
                        .getPublicUrl(fileName);

                    uploadedImageUrls.push(publicUrl);
                }
            }

            // Save to Supabase
            const { error: insertError } = await supabase
                .from('sugerencias')
                .insert([
                    {
                        nombre: formData.nombre,
                        apellido: formData.apellido,
                        email: formData.email,
                        zona: formData.zona,
                        area_id: formData.area_id,
                        descripcion: formData.descripcion,
                        // Compatibility: save first image for legacy 'image_url' if needed, or just null
                        image_url: uploadedImageUrls[0] || null,
                        images: uploadedImageUrls
                    }
                ]);

            if (insertError) throw insertError;

            setStatus("success");
            setFormData({
                nombre: "",
                apellido: "",
                email: initialEmail,
                zona: "",
                area_id: "",
                descripcion: "",
            });
            // Cleanup previews
            previewUrls.forEach(url => URL.revokeObjectURL(url));
            setSelectedImages([]);
            setPreviewUrls([]);

            setTimeout(() => setStatus("idle"), 3000);

        } catch (error) {
            console.error('Error saving:', error);
            alert('Hubo un error al guardar la sugerencia. Por favor intentalo de nuevo.');
            setStatus("idle");
        }
    };

    return (
        <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-700 slide-in-from-bottom-4">
            <div className="glass-panel rounded-3xl p-8 shadow-2xl md:p-12">
                <div className="mb-10 text-center">
                    <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
                        Mejorá tu Barrio
                    </h1>
                    <p className="text-lg text-gray-600">
                        Envianos tus sugerencias y reportes de mantenimiento.
                    </p>
                </div>

                {status === "success" ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in duration-500">
                        <div className="mb-6 rounded-full bg-green-100 p-4 text-green-600">
                            <CheckCircle2 size={64} />
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-gray-800">
                            ¡Gracias por tu aporte!
                        </h2>
                        <p className="text-gray-600">
                            Hemos recibido tu sugerencia correctamente.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label
                                    htmlFor="nombre"
                                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                                >
                                    <User size={16} /> Nombre
                                </label>
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    required
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 placeholder:opacity-50"
                                    placeholder="Juan"
                                />
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="apellido"
                                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                                >
                                    <User size={16} /> Apellido
                                </label>
                                <input
                                    type="text"
                                    id="apellido"
                                    name="apellido"
                                    required
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 placeholder:opacity-50"
                                    placeholder="Pérez"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="flex items-center gap-2 text-sm font-medium text-gray-700"
                            >
                                <Mail size={16} /> Correo Electrónico
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                readOnly
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full h-12 rounded-xl border border-gray-200 bg-gray-100/50 px-4 py-3 text-gray-500 outline-none cursor-not-allowed"
                            />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label
                                    htmlFor="zona"
                                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                                >
                                    <MapPin size={16} /> Zona
                                </label>
                                <div className="relative">
                                    <select
                                        id="zona"
                                        name="zona"
                                        required
                                        value={formData.zona}
                                        onChange={handleChange}
                                        className="w-full appearance-none rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="" disabled>Seleccioná una zona</option>
                                        <option value="Este">Este</option>
                                        <option value="Oeste">Oeste</option>
                                    </select>
                                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="area_id"
                                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                                >
                                    <Layout size={16} /> Área
                                </label>
                                <div className="relative">
                                    <select
                                        id="area_id"
                                        name="area_id"
                                        required
                                        value={formData.area_id}
                                        onChange={handleChange}
                                        className="w-full appearance-none rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="" disabled>Seleccioná un área</option>
                                        {areas.map(area => (
                                            <option key={area.id} value={area.id}>
                                                {area.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="descripcion"
                                className="flex items-center gap-2 text-sm font-medium text-gray-700"
                            >
                                <FileText size={16} /> Descripción
                            </label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                required
                                rows={4}
                                value={formData.descripcion}
                                onChange={handleChange}
                                className="w-full resize-none rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 placeholder:opacity-50"
                                placeholder="Describí el problema o sugerencia..."
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <ImageIcon size={16} /> Adjuntar Imágenes (Máx 5)
                            </label>

                            {previewUrls.length === 0 ? (
                                <div className="group relative">
                                    <input
                                        type="file"
                                        id="image-upload"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                                    />
                                    <div className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 px-6 py-8 transition-all group-hover:border-blue-500 group-hover:bg-blue-50">
                                        <div className="rounded-full bg-white p-3 shadow-sm ring-1 ring-gray-100 group-hover:ring-blue-200">
                                            <Upload className="h-6 w-6 text-gray-400 group-hover:text-blue-500" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-medium text-gray-600 group-hover:text-blue-600">
                                                Hacé click o arrastrá imágenes
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                JPG, PNG hasta 5MB cada una
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="group relative">
                                        <input
                                            type="file"
                                            id="image-upload-more"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageChange}
                                            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                                        />
                                        <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-4 transition-all group-hover:border-blue-500 group-hover:bg-blue-50">
                                            <Upload className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">Agregar más imágenes</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                        {previewUrls.map((url, index) => (
                                            <div key={url} className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                                                <img
                                                    src={url}
                                                    alt={`Vista previa ${index + 1}`}
                                                    className="h-full w-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 text-gray-500 backdrop-blur-sm transition-colors hover:bg-red-100 hover:text-red-500"
                                                >
                                                    <X size={14} />
                                                </button>
                                                <div className="absolute left-2 bottom-2 max-w-[calc(100%-1rem)] rounded-md bg-white/80 px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm truncate">
                                                    {selectedImages[index]?.name}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={status === "submitting"}
                            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-4 text-white transition-all hover:bg-black hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {status === "submitting" ? (
                                "Enviando..."
                            ) : (
                                <>
                                    <Send size={18} className="transition-transform group-hover:translate-x-1" />
                                    Enviar Sugerencia
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

