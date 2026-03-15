"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  Mail, 
  Lock, 
  Loader2, 
  ArrowRight,
  Terminal,
  Code2,
  Sparkles,
  Command,
  LayoutTemplate
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
    } else if (authData.user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_approved, role")
        .eq("id", authData.user.id)
        .single();

      if (profileError || (!profile?.is_approved && profile?.role !== "super_admin")) {
        await supabase.auth.signOut();
        setErrorMessage(
          "Akun Anda sedang menunggu persetujuan dari Super Admin. Silakan cek kembali nanti.",
        );
      } else {
        router.push("/dashboard");
      }
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
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
              Welcome back,
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                Developer.
              </span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-lg text-slate-400 leading-relaxed max-w-md">
              Log in to your account to access your snippets, connect with others, and continue building amazing things.
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
            <h2 className="text-3xl font-bold text-white mb-2">Sign in to your account</h2>
            <p className="text-slate-400">Welcome back! Please enter your details.</p>
          </div>

          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-4 mb-6 shadow-sm overflow-hidden"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
               <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900/60 border border-slate-700/80 focus:border-cyan-500/50 focus:ring-cyan-500/20 rounded-xl text-slate-100 placeholder:text-slate-500 focus:ring-4 focus:outline-none transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-1.5">
               <div className="flex items-center justify-between ml-1">
                 <label className="text-sm font-medium text-slate-300">Password</label>
                 <Link
                    href="/reset-password"
                    className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
               </div>
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
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8">
            <div className="relative flex items-center gap-4 mb-8">
              <div className="flex-grow h-px bg-slate-800"></div>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-widest">
                Or continue with
              </span>
              <div className="flex-grow h-px bg-slate-800"></div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-slate-800/40 border border-slate-700/80 hover:bg-slate-700/50 hover:border-slate-600 text-slate-200 font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              <div className="p-1 bg-white rounded-md flex items-center justify-center group-hover:shadow-md transition-shadow">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
              </div>
              <span>Sign in with Google</span>
            </motion.button>
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                href="/register/admin"
                className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Register here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
