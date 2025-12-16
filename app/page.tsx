"use client";

import { useState } from "react";
import { UserCog } from "lucide-react";
import Link from "next/link";
import { AuthGate } from "@/components/AuthGate";
import { SuggestionForm } from "@/components/SuggestionForm";

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)] opacity-20"></div>

      {/* Admin Icon */}
      <div className="absolute top-6 right-6 z-10">
        <Link
          href="/admin/login"
          className="flex items-center justify-center p-3 rounded-full bg-white/50 hover:bg-white text-gray-600 hover:text-gray-900 shadow-sm border border-gray-200 transition-all hover:scale-110"
          title="Acceso Admin"
        >
          <UserCog size={24} />
        </Link>
      </div>

      {!userEmail ? (
        <AuthGate onVerified={setUserEmail} />
      ) : (
        <SuggestionForm initialEmail={userEmail} />
      )}
    </main>
  );
}
