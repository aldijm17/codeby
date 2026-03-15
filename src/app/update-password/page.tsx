"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  Lock, 
  ArrowRight, 
  Loader2, 
  ArrowLeft,
  Terminal,
  Code2,
  Sparkles,
  Command,
  LayoutTemplate
} from "lucide-react";

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
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password successfully updated! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
    setLoading(false);
  };

  // Animation variants
  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  const floatAnimation: Variants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B1120] text-slate-200 selection:bg-cyan-500/30">
      {/* Left Panel - Branding & Hero (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden border-r border-slate-800/60 bg-slate-900/50">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
           {/* Dynamic Background Elements */}
           <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full mix-blend-screen" />
           <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen" />
           {/* Subtle Grid Pattern */}
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
        </div>

        {/* Logo/Header */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 relative z-10"
        >
          <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
            <Terminal className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">CodeBy</span>
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-xl">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <motion.h1 variants={fadeInUp} className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Secure your
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                Data.
              </span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-lg text-slate-400 leading-relaxed max-w-md">
              Create a strong new password to protect your snippets and personal information.
            </motion.p>
            
            {/* Feature Pills */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 pt-4 border-t border-slate-800/60 mt-8 max-w-md">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-sm text-slate-300">
                <Code2 className="w-4 h-4 text-cyan-400" /> Premium Snippets
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-sm text-slate-300">
                 <Command className="w-4 h-4 text-purple-400" /> Seamless UI
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-sm text-slate-300">
                 <Sparkles className="w-4 h-4 text-amber-400" /> Developer First
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-1/2 right-12 -translate-y-1/2 w-64 h-64 pointer-events-none perspective-[1000px]">
             <motion.div 
               variants={floatAnimation}
               initial="initial"
               animate="animate"
               className="absolute top-0 right-0 p-4 bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl rotate-[12deg]"
             >
                <div className="w-16 h-4 bg-slate-700/50 rounded mb-2"></div>
                <div className="w-24 h-4 bg-cyan-500/20 rounded mb-2"></div>
                <div className="w-20 h-4 bg-purple-500/20 rounded"></div>
             </motion.div>
             
              <motion.div 
               variants={floatAnimation}
               initial="initial"
               animate="animate"
               transition={{ delay: 1, duration: 7, repeat: Infinity, ease: "easeInOut" }}
               className="absolute bottom-10 left-[-40px] p-4 bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.15)] -rotate-[8deg]"
             >
                <LayoutTemplate className="w-8 h-8 text-cyan-400 mb-3" />
                <div className="w-20 h-3 bg-slate-700/50 rounded mb-2"></div>
             </motion.div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} CodeBy. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form (Centered on Mobile) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
          {/* Mobile Background Blob */}
         <div className="lg:hidden absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
           <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full mix-blend-screen" />
         </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="w-full max-w-[440px]"
        >
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="p-2.5 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">CodeBy</span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Set New Password</h2>
            <p className="text-slate-400">Please enter your new strong password.</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-4 mb-6 shadow-sm overflow-hidden"
              >
                {error}
              </motion.div>
            )}

            {message && (
              <motion.div
                 key="success"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl p-4 mb-6 shadow-sm overflow-hidden flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div className="space-y-1.5">
               <label className="text-sm font-medium text-slate-300 ml-1">New Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900/60 border border-slate-700/80 focus:border-cyan-500/50 focus:ring-cyan-500/20 rounded-xl text-slate-100 placeholder:text-slate-500 focus:ring-4 focus:outline-none transition-all duration-300"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2 mt-8 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-10 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Log in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}