"use client";

import { X, Download, MapPin, User, Mail, Calendar, Trash2, Layout, Clock, CheckCircle, AlertCircle } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

interface SuggestionModalProps {
    suggestion: Suggestion;
    onClose: () => void;
    onDelete?: (id: string) => Promise<void> | void;
    onStatusChange?: (id: string, newStatus: string) => Promise<void> | void;
}

export function SuggestionModal({ suggestion, onClose, onDelete, onStatusChange }: SuggestionModalProps) {

    const handleDownloadPDF = async () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text("Reporte de Sugerencia", 14, 22);

        // Meta Info
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 30);

        // Concept of "Header"
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 35, 196, 35);

        // Data Table
        const tableData = [
            ["Estado", suggestion.status ? suggestion.status.toUpperCase() : "PENDIENTE"],
            ["Fecha", new Date(suggestion.created_at).toLocaleString()],
            ["Zona", suggestion.zona],
            ["Área", suggestion.areas?.name || "-"],
            ["Usuario", `${suggestion.nombre} ${suggestion.apellido}`],
            ["Email", suggestion.email],
            ["Descripción", suggestion.descripcion]
        ];

        autoTable(doc, {
            startY: 40,
            head: [['Campo', 'Detalle']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 40 },
                1: { cellWidth: 'auto' }
            }
        });

        // Images
        // Combine all images
        const allImages = suggestion.images?.length
            ? suggestion.images
            : suggestion.image_url
                ? [suggestion.image_url]
                : [];

        if (allImages.length > 0) {
            try {
                // @ts-ignore
                let finalY = doc.lastAutoTable.finalY || 150;

                if (finalY < 250) {
                    doc.text("Evidencias adjuntas:", 14, finalY + 10);
                    finalY += 15;

                    for (const imgUrl of allImages) {
                        // Check page overflow
                        if (finalY > 270) {
                            doc.addPage();
                            finalY = 20;
                        }

                        // Load image
                        const img = new Image();
                        img.src = imgUrl; // caching might be an issue but try direct
                        await new Promise((resolve) => {
                            img.onload = resolve;
                            img.onerror = resolve;
                        });

                        const imgWidth = 80;
                        doc.addImage(imgUrl, "JPEG", 14, finalY, imgWidth, 60); // Fixed height for simplicity
                        finalY += 65;

                        // Limit to first 3 for PDF to avoid massive files/loop issues in this simple implementation
                        if (finalY > 250) break;
                    }
                }
            } catch (err) {
                console.error("Error loading images for PDF", err);
            }
        }

        doc.save(`sugerencia_${suggestion.id.slice(0, 8)}.pdf`);
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'finalizado': return 'bg-green-100 text-green-700 border-green-200';
            case 'en_proceso': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200'; // Pendiente default
        }
    };

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'finalizado': return <CheckCircle size={18} />;
            case 'en_proceso': return <Clock size={18} />;
            default: return <AlertCircle size={18} />;
        }
    };

    const allImages = suggestion.images?.length
        ? suggestion.images
        : suggestion.image_url
            ? [suggestion.image_url]
            : [];

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col md:flex-row overflow-hidden"
            >

                {/* Close Button - Moved further to corner */}
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 z-20 rounded-full bg-white/90 p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-sm"
                >
                    <X size={24} />
                </button>

                {/* Gallery Section */}
                <div className="bg-gray-100 min-h-[300px] md:w-5/12 relative flex flex-col p-4 gap-4 overflow-y-auto custom-scrollbar">
                    {allImages.length > 0 ? (
                        allImages.map((imgUrl, index) => (
                            <div key={index} className="rounded-xl overflow-hidden shadow-sm bg-white shrink-0">
                                <img
                                    src={imgUrl}
                                    alt={`Evidencia ${index + 1}`}
                                    className="w-full h-auto object-contain"
                                />
                            </div>
                        ))
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <MapPin size={48} className="mb-2 opacity-20" />
                            <p>Sin imagen adjunta</p>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="md:w-7/12 p-8 md:p-10 flex flex-col h-full bg-white">
                    <div className="flex-1 space-y-8">
                        <div>
                            <div className="flex items-start justify-between mb-2">
                                <h2 className="text-3xl font-bold text-gray-900">Detalle del Reporte</h2>

                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(suggestion.status)} transition-all`}>
                                    {getStatusIcon(suggestion.status)}
                                    {onStatusChange ? (
                                        <select
                                            value={suggestion.status || 'pendiente'}
                                            onChange={(e) => onStatusChange(suggestion.id, e.target.value)}
                                            className="bg-transparent border-none outline-none text-sm font-bold uppercase cursor-pointer"
                                        >
                                            <option value="pendiente">Pendiente</option>
                                            <option value="en_proceso">En Proceso</option>
                                            <option value="finalizado">Finalizado</option>
                                        </select>
                                    ) : (
                                        <span className="text-sm font-bold uppercase">
                                            {suggestion.status || 'PENDIENTE'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 border border-blue-100">
                                    <MapPin size={14} /> {suggestion.zona}
                                </span>
                                {suggestion.areas?.name && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 border border-indigo-100">
                                        <Layout size={14} /> {suggestion.areas.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        {(!suggestion.status || suggestion.status === 'pendiente') && (
                            <div className="p-4 rounded-xl bg-yellow-50/50 border border-yellow-100 text-yellow-800 text-sm flex items-start gap-3">
                                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold">Atención requerida</p>
                                    <p>Este reporte aún no ha sido revisado. Cambiá el estado a <strong>En Proceso</strong> cuando comiences a gestionarlo.</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 rounded-full bg-gray-100 p-2 text-gray-500">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{suggestion.nombre} {suggestion.apellido}</p>
                                    <p className="text-sm text-gray-500">Reportado por</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="mt-1 rounded-full bg-gray-100 p-2 text-gray-500">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{suggestion.email}</p>
                                    <p className="text-sm text-gray-500">Contacto</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="mt-1 rounded-full bg-gray-100 p-2 text-gray-500">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{new Date(suggestion.created_at).toLocaleDateString()} {new Date(suggestion.created_at).toLocaleTimeString()}</p>
                                    <p className="text-sm text-gray-500">Fecha de creación</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-gray-50 p-6 border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {suggestion.descripcion}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
                        <button
                            onClick={handleDownloadPDF}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-white transition-all hover:bg-black font-medium hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <Download size={18} />
                            Descargar PDF
                        </button>

                        {onDelete && (
                            <button
                                onClick={() => {
                                    if (confirm('¿Estás seguro de que querés eliminar este reporte?')) {
                                        onDelete(suggestion.id);
                                    }
                                }}
                                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 transition-colors hover:bg-red-100 hover:border-red-300"
                                title="Eliminar Reporte"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
