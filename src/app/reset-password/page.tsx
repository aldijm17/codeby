"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://contekan.vercel.app//update-password", // ubah contekan.vercel/app menjadi localhost:3000 jika dalam mode local
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Link reset password telah dikirim ke email Anda.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <form onSubmit={handleResetPassword} className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border text-gray-900 rounded mb-3" required />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">Kirim Link Reset</button>
        {message && <p className="text-sm mt-3 text-green-500">{message}</p>}
      </form>
    </div>
  );
}
