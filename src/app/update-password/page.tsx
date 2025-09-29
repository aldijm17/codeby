"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Komponen Ikon
const PasswordIcon = () => (
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);


export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (password.length < 6) {
        setError("Password minimal harus 6 karakter.");
        setLoading(false);
        return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password berhasil diperbarui! Anda akan diarahkan ke halaman login.");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Update Password</h1>
            <p className="text-gray-400 mt-2">Masukkan password baru Anda di bawah ini.</p>
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

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="relative">
            <input type="password" placeholder="Password Baru" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            <PasswordIcon />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50">
            {loading ? 'Menyimpan...' : 'Simpan Password'}
          </button>
        </form>
         <p className="text-sm text-center mt-6 text-gray-400">
          Butuh bantuan?{" "}
          <Link href="/login" className="font-semibold text-blue-500 hover:underline">
            Kembali ke Login
          </Link>
        </p>
      </div>
    </div>
  );
}