"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { 
  Search, 
  Terminal, 
  Code2, 
  ExternalLink, 
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function ExplorePage() {
  const [snippets, setSnippets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPublicSnippets = async () => {
      // Mengambil data snippet yang diset publik
      const { data, error } = await supabase
        .from("contekans")
        .select("*")
        .eq("is_private", false) // Pastikan hanya yang publik
        .order("created_at", { ascending: false });

      if (!error) {
        setSnippets(data || []);
      }
      setLoading(false);
    };

    fetchPublicSnippets();
  }, []);

  const filteredSnippets = snippets.filter(s => 
    s.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.language?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#070e1a] text-slate-200 font-sans pb-20">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-cyan-700/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-purple-700/10 blur-[120px] rounded-full" />
      </div>

      <nav className="relative z-10 p-4 sm:p-6 max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-2">
          <Terminal className="w-6 h-6 text-cyan-400" />
          <span className="text-xl font-bold text-white">Explore.</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-white mb-4">Public Snippets</h1>
          <p className="text-slate-400 max-w-2xl">
            Jelajahi berbagai kode kodingan (contekan) yang dibagikan oleh komunitas. 
            Cari solusi teknis dengan cepat tanpa hambatan.
          </p>
        </header>

        {/* Search Bar */}
        <div className="relative mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search by title or language (e.g. React, Java, Python)..."
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all backdrop-blur-xl"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Snippet Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-900/40 animate-pulse rounded-3xl border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSnippets.map((snippet) => (
            <motion.div
                key={snippet.id}
                whileHover={{ y: -5 }}
                className="group p-6 bg-slate-900/40 border border-slate-800 rounded-3xl hover:border-cyan-500/30 transition-all backdrop-blur-sm"
            >
                <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Code2 className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">
                    {snippet.language || "Plain Text"}
                </span>
                </div>
                
                {/* Ganti title menjadi judul */}
                <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-cyan-400 transition-colors">
                {snippet.judul} 
                </h3>
                
                {/* Ganti description menjadi deskripsi */}
                <p className="text-sm text-slate-400 line-clamp-2 mb-6">
                {snippet.deskripsi || "Tidak ada deskripsi."}
                </p>
                
                <Link 
                href={`/explore/${snippet.id}`} // Arahkan langsung ke folder explore/[id]
                className="flex items-center gap-2 text-sm font-bold text-white group-hover:gap-3 transition-all"
                >
                View Code <ChevronRight className="w-4 h-4 text-cyan-400" />
                </Link>
            </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredSnippets.length === 0 && (
          <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
            <p className="text-slate-500">Belum ada contekan yang tersedia.</p>
          </div>
        )}
      </main>
    </div>
  );
}