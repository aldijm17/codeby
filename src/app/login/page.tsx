"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
  
    if (error) {
      alert(error.message);
    } else {
      // Ambil display_name dari user_metadata
      const user = data.user;
      const displayName = user.user_metadata?.display_name || user.email;
      console.log("Display Name:", displayName); // Untuk debugging
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <form onSubmit={handleLogin} className="bg-gray-800 p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-white">Login</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded mb-3" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded mb-3" required />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">Login</button>
        <p className="text-sm text-blue-500 mt-3 cursor-pointer" onClick={() => router.push("/reset-password")}>Lupa password?</p>
      </form>
    </div>
  );
}
