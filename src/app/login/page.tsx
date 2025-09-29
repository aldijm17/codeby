'use client';

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Komponen Ikon
const EmailIcon = () => (
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
    </svg>
);

const PasswordIcon = () => (
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // -- BARU: State untuk error message dan loading --
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
  
    if (error) {
      setErrorMessage(error.message);
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      {/* Container dengan efek glassmorphism */}
      <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">CodeBy</h1>
            <p className="text-gray-400 mt-2">Selamat datang kembali</p>
        </div>
        
        {/* Pesan Error */}
        {errorMessage && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 text-sm rounded-lg p-3 mb-4 text-center">
                {errorMessage}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            <EmailIcon />
          </div>
          <div className="relative">
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            <PasswordIcon />
          </div>
          <div className="text-right">
            <Link href="/reset-password" className="text-sm text-blue-500 hover:underline">Lupa password?</Link>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>
         <p className="text-sm text-center mt-6 text-gray-400">
          Belum punya akun?{" "}
          <Link href="/register/admin" className="font-semibold text-blue-500 hover:underline">
            Register di sini
          </Link>
        </p>
      </div>
    </div>
  );
}