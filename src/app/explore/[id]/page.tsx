"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Download, 
  Terminal,
  Code2,
  Calendar,
  User
} from "lucide-react";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function SnippetDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [snippet, setSnippet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      const { data, error } = await supabase
        .from("contekans")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data || data.is_private) {
        router.push("/explore"); // Redirect jika private atau tidak ada
      } else {
        setSnippet(data);
      }
      setLoading(false);
    };

    if (id) fetchDetail();
  }, [id, router]);

  const handleCopy = () => {
    // Sesuaikan kolom 'isi' atau 'file_content' sesuai database Anda
    const codeToCopy = snippet.isi || snippet.file_content || "";
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#070e1a] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
    </div>
  );

  if (!snippet) return null;

  return (
    <div className="min-h-screen bg-[#070e1a] text-slate-200 pb-20">
      <nav className="p-4 sm:p-6 max-w-5xl mx-auto flex justify-between items-center border-b border-white/5">
        <Link href="/explore" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Explore</span>
        </Link>
        <div className="flex items-center gap-2">
          <Terminal className="w-6 h-6 text-cyan-400" />
          <span className="font-bold text-white text-lg">CodeBy.</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/40 border border-slate-800 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 md:p-12 backdrop-blur-xl"
        >
          {/* Header Info */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-mono rounded-full border border-cyan-500/20">
                  {snippet.language}
                </span>
                <span className="flex items-center gap-1 text-slate-500 text-xs">
                  <Calendar className="w-3 h-3" />
                  {new Date(snippet.created_at).toLocaleDateString('id-ID')}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                {snippet.judul}
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed">
                {snippet.deskripsi || "Tidak ada deskripsi tersedia."}
              </p>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-slate-950/50 rounded-2xl border border-white/5">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {snippet.user_display_name?.charAt(0) || <User className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Author</p>
                <p className="text-white font-medium">{snippet.user_display_name || "Anonymous"}</p>
              </div>
            </div>
          </div>

          {/* Code Section */}
          <div className="relative group">
            <div className="absolute right-4 top-4 z-20 flex gap-2">
              <button 
                onClick={handleCopy}
                className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl border border-white/10 transition-all flex items-center gap-2 text-sm font-medium backdrop-blur-md"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Code"}
              </button>
            </div>

            <div className="rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
              <SyntaxHighlighter 
                language={snippet.language?.toLowerCase()} 
                style={atomDark}
                customStyle={{
                  padding: '1.25rem',
                  fontSize: '0.95rem',
                  lineHeight: '1.7',
                  background: '#020617',
                  margin: 0
                }}
                showLineNumbers={true}
              >
                {snippet.isi || snippet.file_content || "// No code content available"}
              </SyntaxHighlighter>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}