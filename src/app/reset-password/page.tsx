"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Loader2, ArrowLeft } from "lucide-react";

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
      setMessage("Reset link sent to your email. Please check your inbox.");
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md glass p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-slate-100"
          >
            Reset Password
          </motion.h1>
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-400 mt-2"
          >
            Enter your email to receive instructions
          </motion.p>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/50 text-green-400 text-sm rounded-xl p-4 mb-6 text-center"
          >
            {message}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-xl p-4 mb-6 text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="email"
              placeholder="Registered Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:outline-none transition-all"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}