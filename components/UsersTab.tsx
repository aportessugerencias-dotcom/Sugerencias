"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { UserPlus, RefreshCw, Trash2, Mail, Shield, User, ChevronDown } from "lucide-react";
import { inviteUser, resetUserPassword, deleteUser, updateUserRole } from "@/app/admin/actions";

interface Profile {
    id: string;
    role: 'viewer' | 'admin' | 'superadmin';
    email?: string;
    created_at: string;
}

export function UsersTab() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState("");
    const [isInviting, setIsInviting] = useState(false);
    const [updatingParams, setUpdatingParams] = useState<string | null>(null);
    const [userToDelete, setUserToDelete] = useState<Profile | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setUsers(data as Profile[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInviting(true);
        try {
            // Invite always as viewer first
            const result = await inviteUser(inviteEmail);
            if (result.success) {
                alert("Invitación enviada correctamente.");
                setInviteEmail("");
                fetchUsers();
            } else {
                alert("Error al enviar invitación: " + result.error);
            }
        } finally {
            setIsInviting(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: 'viewer' | 'admin' | 'superadmin') => {
        setUpdatingParams(userId);
        try {
            const result = await updateUserRole(userId, newRole);
            if (result.success) {
                // Optimistic update
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            } else {
                alert("Error al actualizar rol: " + result.error);
                fetchUsers(); // Revert on error
            }
        } finally {
            setUpdatingParams(null);
        }
    };

    const handleResetPassword = async (email: string) => {
        if (!confirm(`¿Enviar correo de restablecimiento de contraseña a ${email}?`)) return;
        const result = await resetUserPassword(email);
        if (result.success) {
            alert("Correo enviado.");
        } else {
            alert("Error: " + result.error);
        }
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        const result = await deleteUser(userToDelete.id);
        if (result.success) {
            setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
        } else {
            alert("Error al eliminar usuario: " + result.error);
        }
        setUserToDelete(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Invite Section */}
            <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-xl font-bold text-gray-900 flex items-center gap-2">
                    <UserPlus className="text-blue-600" /> Invitar Nuevo Usuario
                </h2>
                <form onSubmit={handleInvite} className="grid md:grid-cols-[1fr,auto] gap-4 items-start">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email del Usuario</label>
                        <input
                            type="email"
                            required
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                            placeholder="usuario@ejemplo.com"
                        />
                        <p className="text-xs text-gray-500">Se invitará como <strong>Visor</strong> por defecto.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isInviting}
                        className="w-full md:w-auto mt-2 md:mt-7 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isInviting ? "Enviando..." : "Enviar Invitación"}
                    </button>
                </form>
            </div>

            {/* Users List */}
            <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-xl font-bold text-gray-900 flex items-center gap-2">
                    <User className="text-gray-600" /> Usuarios Registrados
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 text-sm font-medium text-gray-500">
                                <th className="pb-4 pl-4">Usuario / Email</th>
                                <th className="pb-4">Rol</th>
                                <th className="pb-4">Fecha Registro</th>
                                <th className="pb-4 text-right pr-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map((user) => (
                                <tr key={user.id} className="group transition-colors hover:bg-gray-50">
                                    <td className="py-4 pl-4 md:w-1/3">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-gray-100 p-2 text-gray-500">
                                                <Mail size={16} />
                                            </div>
                                            <span className="font-medium text-gray-900 truncate max-w-[200px] md:max-w-xs">
                                                {user.email || "Email no visible"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="relative">
                                            {updatingParams === user.id ? (
                                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"></div>
                                            ) : (
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                                                    className={`appearance-none rounded-lg border-none py-1.5 pl-3 pr-8 text-sm font-medium shadow-sm transition-all focus:ring-2 focus:ring-blue-100 cursor-pointer ${user.role === 'superadmin' ? 'bg-purple-100 text-purple-700' :
                                                        user.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    <option value="viewer">Visor</option>
                                                    <option value="admin">Administrador</option>
                                                    <option value="superadmin">Super Admin</option>
                                                </select>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 text-right pr-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => user.email && handleResetPassword(user.email)}
                                                className="group relative rounded-lg p-2 text-gray-400 hover:bg-yellow-50 hover:text-yellow-600"
                                                title="Enviar reset contraseña"
                                            >
                                                <RefreshCw size={18} />
                                            </button>
                                            <button
                                                onClick={() => setUserToDelete(user)}
                                                className="group relative rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                                title="Eliminar usuario"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Delete Confirmation Modal */}
            {userToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="rounded-full bg-red-100 p-3 text-red-600">
                                <Trash2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">¿Eliminar usuario?</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Estás a punto de eliminar a <strong>{userToDelete.email || 'este usuario'}</strong>. <br />
                                    Esta acción es permanente.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <button
                                    onClick={() => setUserToDelete(null)}
                                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors shadow-sm"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
