"use client";

import { useState } from "react";
import { Send, MapPin, User, Mail, FileText, CheckCircle2 } from "lucide-react";

export default function Home() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    zona: "",
    descripcion: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    // Simulate network request
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Form Data Submitted:", formData);
    setStatus("success");
    setFormData({
      nombre: "",
      apellido: "",
      email: "",
      zona: "",
      descripcion: "",
    });

    setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)] opacity-20"></div>

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
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 placeholder:opacity-50"
                  placeholder="juan@ejemplo.com"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="zona"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <MapPin size={16} /> Zona / Área
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
                    <option value="" disabled>
                      Seleccioná una zona
                    </option>
                    <option value="Parque Central">Parque Central</option>
                    <option value="Acceso Norte">Acceso Norte</option>
                    <option value="Salón de Usos Múltiples">
                      Salón de Usos Múltiples
                    </option>
                    <option value="Gimnasio">Gimnasio</option>
                    <option value="Veredas y Calles">Veredas y Calles</option>
                    <option value="Otro">Otro</option>
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.5 4.5L6 8L9.5 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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
    </main>
  );
}
