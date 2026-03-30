"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Terminal,
  Users,
  Sparkles,
  ArrowRight
} from "lucide-react";
import "./globals.css";

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsChecking(false);
    };
    checkUser();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#070e1a] text-slate-200 font-sans overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Dynamic Background Grid & Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-700/20 blur-[150px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-700/20 blur-[150px] rounded-full mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-blue-700/20 blur-[150px] rounded-full mix-blend-screen animate-pulse" style={{ animationDelay: '4s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex justify-between items-center px-6 py-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3"
        >
          <div className="p-2.5 bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.3)] border border-cyan-500/30 hover:border-cyan-400 group transition-all">
            <Terminal className="w-7 h-7 text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white drop-shadow-md">CodeBy.</span>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
        {/* Tombol Akses Tamu */}
          <Link href="/explore" className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors mr-2">
            Browse Code
          </Link>
          {!isChecking && (
            user ? (
              <button onClick={handleGetStarted} className="px-6 py-2.5 rounded-full text-sm font-bold bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-md border border-slate-700 transition-all text-slate-200 hover:text-white hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                Dashboard
              </button>
            ) : (
              <button onClick={handleGetStarted} className="px-6 py-2.5 rounded-full text-sm font-bold bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-md border border-slate-700 transition-all text-slate-200 hover:text-white hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                Sign In
              </button>
            )
          )}
        </motion.div>
      </nav>

      {/* Extreme Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center mt-[-4rem]">
        
        {/* Subtle top pill */}
        <motion.div
           initial={{ opacity: 0, scale: 0.9, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
           className="p-1 px-4 rounded-full bg-slate-900/40 border border-cyan-500/20 backdrop-blur-xl mb-10 flex items-center gap-2 shadow-[0_0_30px_rgba(6,182,212,0.15)] group hover:border-cyan-500/50 transition-colors cursor-default mt-16"
        >
           <Sparkles className="w-4 h-4 text-cyan-400 group-hover:animate-pulse" />
           <span className="text-sm font-semibold text-slate-300 drop-shadow-sm tracking-wide">
             The Next Evolution of Developer Hubs
           </span>
        </motion.div>

        {/* Massive Animated Typography */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full scale-150 -z-10" />
          <h1 className="text-7xl sm:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[1.1] mb-6">
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 drop-shadow-2xl">
              Elevate Your
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 drop-shadow-[0_0_50px_rgba(6,182,212,0.4)] pb-4">
              Development.
            </span>
          </h1>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-2xl text-xl sm:text-2xl text-slate-400 font-light leading-relaxed mb-14 drop-shadow-md px-4"
        >
          A highly premium sanctuary for developers to store, share, and discover top-tier code snippets. Crafted for those who appreciate design.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-4"
        >
          {/* Main Get Started Button */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
            <button 
              onClick={handleGetStarted}
              className="relative flex items-center justify-center gap-3 px-10 py-4 text-lg font-bold text-white rounded-full bg-slate-950 border border-white/10 hover:border-cyan-400/50 transition-all duration-300 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 drop-shadow-lg">Get Started</span> 
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>

          {/* Guest Button (Explore) */}
          <Link 
            href="/explore" 
            className="group flex items-center gap-3 px-8 py-4 text-lg font-semibold text-slate-300 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-full border border-white/10 hover:border-white/20 backdrop-blur-sm"
          >
            <Users className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            Lihat Contekan (Guest)
          </Link>
        </motion.div>

      </main>

      {/* Futuristic Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 py-10 mt-10 bg-slate-950/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-2">
             <Terminal className="w-5 h-5 text-cyan-400" />
             <span className="text-lg font-bold text-slate-200">CodeBy.</span>
           </div>
           <p className="text-slate-500 text-sm font-medium">© 2026 CodeBy. @asit4u_ & @din_pincent</p>
        </div>
      </footer>
    </div>
  );
}
