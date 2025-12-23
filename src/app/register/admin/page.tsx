"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Mail, Lock, Loader2, ArrowRight } from "lucide-react";

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

      alert("Registration successful! Please verify your email.");
      router.push("/login");

    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

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
            className="text-3xl font-extrabold tracking-tight mb-2"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              Create Account
            </span>
          </motion.h1>
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-400"
          >
            Start your journey with CodeBy
          </motion.p>
        </div>

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-xl p-4 mb-6 text-center"
          >
            {errorMessage}
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="text"
              {...register("displayName", { required: "Display Name is required" })}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:outline-none transition-all"
              placeholder="Display Name"
            />
            {errors.displayName && <p className="text-red-400 text-xs mt-1 ml-1">{String(errors.displayName.message)}</p>}
          </div>

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:outline-none transition-all"
              placeholder="Email address"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{String(errors.email.message)}</p>}
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="password"
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 chars" } })}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:outline-none transition-all"
              placeholder="Password"
            />
            {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{String(errors.password.message)}</p>}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}