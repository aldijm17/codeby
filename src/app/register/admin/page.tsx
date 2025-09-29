"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// Komponen Ikon
const UserIcon = () => (
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
const EmailIcon = () => (
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
);
const PasswordIcon = () => (
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
);

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (formData: any) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const { email, password, displayName } = formData;
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { display_name: displayName } },
      });

      if (error) { throw error; }
      
      // Redirect ke halaman login setelah registrasi berhasil
      alert("Registrasi berhasil! Silakan cek email Anda untuk verifikasi.");
      router.push("/login");

    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">Buat Akun Baru</h1>
            <p className="text-gray-400 mt-2">Mulai kontribusi di CodeBy</p>
        </div>

        {errorMessage && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 text-sm rounded-lg p-3 mb-4 text-center">
                {errorMessage}
            </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <input type="text" {...register("displayName", { required: "Nama Tampilan wajib diisi" })} className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Nama Tampilan" />
            <UserIcon />
            {errors.displayName && <p className="text-red-400 text-xs mt-1 ml-1">{String(errors.displayName.message)}</p>}
          </div>

          <div className="relative">
            <input type="email" {...register("email", { required: "Email wajib diisi" })} className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Email"/>
            <EmailIcon />
            {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{String(errors.email.message)}</p>}
          </div>

          <div className="relative">
            <input type="password" {...register("password", { required: "Password wajib diisi", minLength: { value: 6, message: "Password minimal 6 karakter" } })} className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Password"/>
            <PasswordIcon />
            {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{String(errors.password.message)}</p>}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 mt-4 disabled:opacity-50">
            {loading ? "Mendaftarkan..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-400">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-blue-500 hover:underline">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}