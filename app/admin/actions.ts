"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabase } from "@/lib/supabaseClient";

export async function inviteUser(email: string) {
    try {
        // Invite as 'viewer' by default (or let the trigger handle it, but inviteUserByEmail requires a password or sends a magic link)
        // actually inviteUserByEmail sends an invite email.
        // actually inviteUserByEmail sends an invite email.
        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/update-password`
        });

        if (error) throw error;

        // Ensure profile exists as viewer
        if (data.user) {
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: data.user.id,
                    role: 'viewer',
                    email: email
                });

            if (profileError) {
                console.error("Error setting user role:", profileError);
            }
        }

        return { success: true };
    } catch (error: any) {
        console.error("Invite Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateUserRole(userId: string, newRole: 'viewer' | 'admin' | 'superadmin') {
    try {
        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Update Role Error:", error);
        return { success: false, error: error.message };
    }
}

export async function resetUserPassword(email: string) {
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/update-password`,
    });

    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true };
}

export async function deleteUser(userId: string) {
    // Try to delete profile first to avoid "Database error" due to Foreign Key constraints
    // if ON DELETE CASCADE is missing.
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);

    if (profileError) {
        console.error("Error deleting profile:", profileError);
        // We continue trying to delete the User, but report this if needed
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) return { success: false, error: error.message };
    return { success: true };
}
