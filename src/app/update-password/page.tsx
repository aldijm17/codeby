"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password berhasil diperbarui.");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <form onSubmit={handleUpdatePassword} className="bg-gray-800 p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Update Password</h2>
        <input type="password" placeholder="Password Baru" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border text-black rounded mb-3" required />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">Simpan Password</button>
        {message && <p className="text-sm mt-3 text-green-500">{message}</p>}
      </form>
    </div>
  );
}
