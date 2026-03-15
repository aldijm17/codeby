"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Terminal,
  Code2,
  Users,
  LayoutTemplate,
  ChevronRight,
  Sparkles,
  Zap,
  ShieldCheck,
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

        {/* Single "Get Started" Button replaces all others */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
          <button 
            onClick={handleGetStarted}
            className="relative flex items-center justify-center gap-3 px-12 py-5 text-xl font-bold text-white rounded-full bg-slate-950 border border-white/10 hover:border-cyan-400/50 transition-all duration-300 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative z-10 drop-shadow-lg">Get Started</span> 
            <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
        </motion.div>

        {/* Abstract 3D Floating UI Elements connected to "Code" */}
        {/* Left Floating Card */}
        <motion.div 
           animate={{ y: [-30, 30, -30], rotate: [-4, 4, -4] }}
           transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
           className="hidden xl:block absolute left-[5%] top-[25%] w-72 p-6 bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.7)] z-0"
        >
           <div className="flex gap-2.5 mb-6">
              <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
           </div>
           <div className="space-y-4">
             <div className="h-3 w-5/6 bg-slate-700/60 rounded-full"></div>
             <div className="h-3 w-2/3 bg-cyan-500/60 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
             <div className="h-3 w-full bg-slate-700/60 rounded-full"></div>
             <div className="h-3 w-4/5 bg-purple-500/60 rounded-full"></div>
           </div>
        </motion.div>

        {/* Right Floating Card */}
        <motion.div 
           animate={{ y: [30, -30, 30], rotate: [4, -4, 4] }}
           transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
           className="hidden xl:block absolute right-[5%] top-[35%] w-80 p-6 bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.7)] z-0"
        >
           <div className="flex items-center gap-4 mb-6">
             <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20"><LayoutTemplate className="w-8 h-8 text-purple-400" /></div>
             <div>
               <div className="h-2.5 w-24 bg-slate-300/80 rounded-full mb-2.5"></div>
               <div className="h-2.5 w-16 bg-slate-500/50 rounded-full"></div>
             </div>
           </div>
           <div className="p-5 bg-slate-950/60 rounded-2xl border border-white/5">
             <div className="h-2 w-full bg-slate-700/50 rounded-full mb-3"></div>
             <div className="h-2 w-full bg-slate-700/50 rounded-full mb-3"></div>
             <div className="h-2 w-4/5 bg-slate-700/50 rounded-full"></div>
           </div>
        </motion.div>

      </main>

      {/* Feature Highlights Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-32 mt-10">
         <div className="text-center mb-20 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[100px] bg-blue-500/10 blur-[60px] rounded-full pointer-events-none -z-10" />
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 drop-shadow-sm mb-6">
              Engineering Brilliance.
            </h2>
            <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              CodeBy strips away the noise and focuses entirely on a majestic experience for your technical workflow.
            </p>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
               whileHover={{ y: -12, scale: 1.02 }}
               transition={{ type: "spring", stiffness: 300, damping: 20 }}
               className="p-10 rounded-[2.5rem] bg-slate-900/40 border border-slate-700/50 backdrop-blur-2xl hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(6,182,212,0.15)] group relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-500"></div>
               <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner border border-cyan-500/20 relative z-10">
                  <Zap className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
               </div>
               <h3 className="text-2xl font-bold text-slate-100 mb-4 relative z-10">Hyper Optimized</h3>
               <p className="text-slate-400 leading-relaxed font-medium relative z-10">
                 Instantly save and retrieve your snippets. Our tailored architecture ensures your workflow never slows down, loading faster than your thoughts.
               </p>
            </motion.div>

            <motion.div 
               whileHover={{ y: -12, scale: 1.02 }}
               transition={{ type: "spring", stiffness: 300, damping: 20 }}
               className="p-10 rounded-[2.5rem] bg-slate-900/40 border border-slate-700/50 backdrop-blur-2xl hover:border-purple-500/40 hover:bg-slate-800/60 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(168,85,247,0.15)] group relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
               <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner border border-purple-500/20 relative z-10">
                  <LayoutTemplate className="w-8 h-8 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
               </div>
               <h3 className="text-2xl font-bold text-slate-100 mb-4 relative z-10">Glass UI Design</h3>
               <p className="text-slate-400 leading-relaxed font-medium relative z-10">
                 Experience an interface crafted with extreme attention to detail. Layered glassmorphism, fluid micro-animations, and masterful typography.
               </p>
            </motion.div>

            <motion.div 
               whileHover={{ y: -12, scale: 1.02 }}
               transition={{ type: "spring", stiffness: 300, damping: 20 }}
               className="p-10 rounded-[2.5rem] bg-slate-900/40 border border-slate-700/50 backdrop-blur-2xl hover:border-blue-500/40 hover:bg-slate-800/60 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)] group relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
               <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner border border-blue-500/20 relative z-10">
                  <ShieldCheck className="w-8 h-8 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
               </div>
               <h3 className="text-2xl font-bold text-slate-100 mb-4 relative z-10">Military Security</h3>
               <p className="text-slate-400 leading-relaxed font-medium relative z-10">
                 Your intellectual property is fortified. RLS security rules directly integrated with Supabase keep your code isolated and perfectly safe.
               </p>
            </motion.div>
         </div>
      </section>

      {/* Futuristic Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 py-10 mt-10 bg-slate-950/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-2">
             <Terminal className="w-5 h-5 text-cyan-400" />
             <span className="text-lg font-bold text-slate-200">CodeBy.</span>
           </div>
           <p className="text-slate-500 text-sm font-medium">© 2026 CodeBy. For developers, by developers.</p>
        </div>
      </footer>
    </div>
  );
}
