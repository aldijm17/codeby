"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// Komponen Ikon
const EmailIcon = () => (
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
    </svg>
);

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Link reset password telah dikirim ke email Anda. Silakan periksa kotak masuk.");
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Reset Password</h1>
            <p className="text-gray-400 mt-2">Masukkan email Anda untuk menerima link reset.</p>
        </div>

        {message && (
            <div className="bg-green-500/20 border border-green-500 text-green-300 text-sm rounded-lg p-3 mb-4 text-center">
                {message}
            </div>
        )}
        {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 text-sm rounded-lg p-3 mb-4 text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="relative">
            <input type="email" placeholder="Email terdaftar" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            <EmailIcon />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50">
            {loading ? 'Mengirim...' : 'Kirim Link Reset'}
          </button>
        </form>
         <p className="text-sm text-center mt-6 text-gray-400">
          Ingat password Anda?{" "}
          <Link href="/login" className="font-semibold text-blue-500 hover:underline">
            Kembali ke Login
          </Link>
        </p>
      </div>
    </div>
  );
}