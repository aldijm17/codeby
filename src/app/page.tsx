"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Search,
  Copy,
  Check,
  User,
  Code2,
  Terminal,
  Calendar,
  ChevronRight,
  X,
  Filter,
  FileText,
  Plus,
  Loader2,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import "./globals.css";

interface Contekan {
  id: string;
  judul: string;
  isi: string;
  created_at: string;
  deskripsi: string;
  user_display_name: string;
  file_content?: string;
}

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"
    />
  </div>
);

export default function Home() {
  const [contekans, setContekans] = useState<Contekan[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"terbaru" | "terlama">(
    "terbaru",
  );
  const [selectedContekan, setSelectedContekan] = useState<Contekan | null>(
    null,
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // User Session State
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Add Snippet State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSnippet, setNewSnippet] = useState({
    judul: "",
    deskripsi: "",
    isi: "",
    user_display_name: "Guest", // Default value for now
  });

  useEffect(() => {
    const fetchContekans = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from("contekans").select("*");
        if (error) throw error;
        setContekans(data as Contekan[]);
      } catch (err) {
        console.error("Error fetching: ", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContekans();

    // Fetch Current User
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const sortedAndFilteredContekans = useMemo(() => {
    return contekans
      .filter(
        (c) =>
          c.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.deskripsi &&
            c.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return activeFilter === "terbaru" ? dateB - dateA : dateA - dateB;
      });
  }, [contekans, searchQuery, activeFilter]);

  const handleItemClick = (contekan: Contekan) => {
    setSelectedContekan(contekan);
    setCopied(false);
  };

  const handleClosePanel = () => {
    setSelectedContekan(null);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Kode berhasil disalin!", {
      description: "Kodingan siap di-paste ke project kamu.",
      style: {
        background: "rgba(30, 41, 59, 0.9)",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        color: "#f8fafc",
        backdropFilter: "blur(12px)",
      },
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddSnippet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("contekans")
        .insert([
          {
            judul: newSnippet.judul,
            deskripsi: newSnippet.deskripsi,
            isi: newSnippet.isi,
            user_display_name: newSnippet.user_display_name,
          },
        ])
        .select();

      if (error) throw error;

      setContekans((prev) => [data[0] as Contekan, ...prev]);
      setIsAddModalOpen(false);
      setNewSnippet({
        judul: "",
        deskripsi: "",
        isi: "",
        user_display_name: "Guest",
      });
      toast.success("Contekan berhasil ditambahkan!", {
        style: {
          background: "rgba(30, 41, 59, 0.9)",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          color: "#f8fafc",
        },
      });
    } catch (err) {
      console.error("Error adding snippet: ", err);
      toast.error("Gagal menambahkan contekan.", {
        style: {
          background: "rgba(30, 41, 59, 0.9)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "#f8fafc",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen text-slate-200 p-4 sm:p-6 lg:p-8 font-sans">
      <Toaster position="bottom-right" />
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center relative pointer-events-none">
          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none -z-10 animate-pulse" />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="pointer-events-auto"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20 animate-float">
                <Terminal className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 animate-gradient-xy">
                CodeBy
              </span>
              <span className="absolute -inset-1 blur-2xl bg-gradient-to-r from-cyan-400 to-purple-600 opacity-20 animate-gradient-xy"></span>
            </h1>
            <p className="mt-4 text-slate-400 text-base sm:text-xl max-w-lg mx-auto leading-relaxed">
              Koleksi contekan kodingan{" "}
              <span className="text-cyan-400 font-semibold text-glow">
                premium
              </span>{" "}
              untuk developer modern.
            </p>
          </motion.div>
        </header>

        <div className="glass rounded-2xl p-4 mb-8 sticky top-4 z-20 shadow-2xl shadow-black/20 hover:border-cyan-500/30 transition-colors">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="text"
                placeholder="Cari snippet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-slate-100 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:outline-none transition-all placeholder:text-slate-500 focus:bg-slate-900/80"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-3 md:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all border border-cyan-400/20"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Tambah Snippet</span>
              </motion.button>

              <div className="flex p-1 bg-slate-900/50 rounded-xl border border-slate-700/50 w-full md:w-auto justify-between md:justify-start">
                <button
                  onClick={() => setActiveFilter("terbaru")}
                  className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeFilter === "terbaru" ? "bg-slate-700 text-white shadow-lg shadow-cyan-900/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                >
                  Terbaru
                </button>
                <button
                  onClick={() => setActiveFilter("terlama")}
                  className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeFilter === "terlama" ? "bg-slate-700 text-white shadow-lg shadow-cyan-900/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                >
                  Terlama
                </button>
              </div>

              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="p-1 rounded-full bg-slate-900/50 border border-slate-700/50 hover:bg-slate-800 hover:border-cyan-500/30 transition-all text-slate-300 hover:shadow-lg hover:shadow-cyan-900/20 flex-shrink-0 relative overflow-hidden flex items-center justify-center w-12 h-12"
                >
                  {currentUser?.user_metadata?.avatar_url ? (
                    <img
                      src={currentUser.user_metadata.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5 group-hover:text-cyan-400 text-slate-400" />
                  )}
                </motion.button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 ring-1 ring-white/10"
                    >
                      {currentUser ? (
                        <>
                          <div className="px-4 py-3 border-b border-slate-800">
                            <p className="text-sm font-semibold text-slate-200 truncate">
                              {currentUser.user_metadata?.display_name ||
                                "User"}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              @
                              {currentUser.user_metadata?.username ||
                                "username"}
                            </p>
                          </div>
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
                          >
                            Dashboard
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/login"
                            className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
                          >
                            Login
                          </Link>
                          <Link
                            href="/register/admin"
                            className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
                          >
                            Register
                          </Link>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <main>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-4"
            >
              {sortedAndFilteredContekans.map((contekan) => (
                <motion.div
                  key={contekan.id}
                  variants={itemVariants}
                  layoutId={`card-${contekan.id}`}
                  onClick={() => handleItemClick(contekan)}
                  className="glass group p-6 rounded-2xl cursor-pointer hover:bg-slate-800/60 transition-all border border-slate-700/30 hover:border-cyan-500/50 relative overflow-hidden"
                >
                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-lg bg-slate-800/50 text-cyan-400 border border-slate-700/50 group-hover:border-cyan-500/30 group-hover:scale-110 transition-all duration-300">
                          <Code2 className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-100 truncate group-hover:text-cyan-300 transition-colors group-hover:text-glow">
                          {contekan.judul}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed pl-1">
                        {contekan.deskripsi || "Tidak ada deskripsi."}
                      </p>
                    </div>
                    <div className="p-2 rounded-full bg-slate-800/30 text-slate-600 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-all duration-300 group-hover:translate-x-1">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Shimmer overlay */}
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer z-0 pointer-events-none" />
                </motion.div>
              ))}
            </motion.div>
          )}
          {!isLoading && sortedAndFilteredContekans.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="inline-flex p-4 rounded-full bg-slate-800/50 mb-4">
                <Search className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-500">
                Tidak ada hasil ditemukan
              </h3>
              <p className="text-slate-600 mt-2">Coba kata kunci lain</p>
            </motion.div>
          )}
        </main>

        <AnimatePresence>
          {selectedContekan && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClosePanel}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 h-full w-full md:w-2/3 lg:w-1/2 glass-panel shadow-2xl z-50 flex flex-col"
              >
                <div className="p-4 sm:p-6 border-b border-slate-700/50 flex justify-between items-start bg-slate-900/40">
                  <div>
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400"
                    >
                      {selectedContekan.judul}
                    </motion.h2>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-xs text-slate-500"
                    >
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{" "}
                        {new Date(
                          selectedContekan.created_at,
                        ).toLocaleDateString("id-ID", { dateStyle: "long" })}
                      </span>
                      {selectedContekan.user_display_name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />{" "}
                          {selectedContekan.user_display_name}
                        </span>
                      )}
                    </motion.div>
                  </div>
                  <button
                    onClick={handleClosePanel}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {selectedContekan.deskripsi && (
                    <div className="prose prose-invert max-w-none">
                      <p className="text-slate-300 leading-relaxed text-sm md:text-base border-l-2 border-cyan-500/30 pl-4">
                        {selectedContekan.deskripsi}
                      </p>
                    </div>
                  )}

                  {selectedContekan.file_content && (
                    <div className="mb-6">
                      {selectedContekan.file_content.match(
                        /^data:image\/(png|jpg|jpeg|gif|webp);base64,/,
                      ) ? (
                        <div className="rounded-xl overflow-hidden border border-slate-700/50 shadow-lg">
                          <img
                            src={selectedContekan.file_content}
                            alt="Attachment"
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      ) : (
                        <a
                          href={selectedContekan.file_content}
                          download="attachment"
                          className="flex items-center gap-2 p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl transition-all group"
                        >
                          <div className="p-2 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 text-cyan-400">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-200">
                              Attached File
                            </p>
                            <p className="text-xs text-slate-400">
                              Click to download
                            </p>
                          </div>
                        </a>
                      )}
                    </div>
                  )}
                  <div className="glass rounded-xl overflow-hidden shadow-2xl border border-slate-700/50 relative group">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-slate-700/50">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 box-border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 box-border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 box-border border-green-500/50" />
                      </div>
                      <button
                        onClick={() => handleCopy(selectedContekan.isi)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md transition-all duration-200 border ${
                          copied
                            ? "bg-green-500/20 border-green-500/50 text-green-400"
                            : "bg-slate-800/60 border-slate-700 hover:bg-slate-700 text-slate-300"
                        }`}
                      >
                        {copied ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        {copied ? "Copied!" : "Copy Code"}
                      </button>
                    </div>
                    <SyntaxHighlighter
                      language="javascript"
                      style={atomDark}
                      customStyle={{
                        margin: 0,
                        padding: "1.5rem",
                        background: "transparent",
                        fontSize: "0.95rem",
                        lineHeight: 1.6,
                      }}
                      showLineNumbers={true}
                    >
                      {selectedContekan.isi}
                    </SyntaxHighlighter>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Add Snippet Modal */}
        <AnimatePresence>
          {isAddModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isSubmitting && setIsAddModalOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl z-[70] overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                  <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                    Tambah Snippet Baru
                  </h2>
                  <button
                    onClick={() => !isSubmitting && setIsAddModalOpen(false)}
                    disabled={isSubmitting}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto">
                  <form
                    id="add-snippet-form"
                    onSubmit={handleAddSnippet}
                    className="space-y-4"
                  >
                    <div>
                      <label
                        htmlFor="judul"
                        className="block text-sm font-medium text-slate-300 mb-1.5"
                      >
                        Judul <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="judul"
                        required
                        type="text"
                        placeholder="Contoh: Fetch Data API Next.js"
                        value={newSnippet.judul}
                        onChange={(e) =>
                          setNewSnippet((prev) => ({
                            ...prev,
                            judul: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-700/50 text-slate-100 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="deskripsi"
                        className="block text-sm font-medium text-slate-300 mb-1.5"
                      >
                        Deskripsi
                      </label>
                      <textarea
                        id="deskripsi"
                        rows={2}
                        placeholder="Penjelasan singkat mengenai snippet ini..."
                        value={newSnippet.deskripsi}
                        onChange={(e) =>
                          setNewSnippet((prev) => ({
                            ...prev,
                            deskripsi: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-700/50 text-slate-100 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-600 resize-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="isi"
                        className="block text-sm font-medium text-slate-300 mb-1.5"
                      >
                        Kodingan <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        id="isi"
                        required
                        rows={8}
                        placeholder="Paste kodingan kamu di sini..."
                        value={newSnippet.isi}
                        onChange={(e) =>
                          setNewSnippet((prev) => ({
                            ...prev,
                            isi: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/50 text-slate-300 font-mono text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </form>
                </div>
                <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    form="add-snippet-form"
                    type="submit"
                    disabled={
                      isSubmitting || !newSnippet.judul || !newSnippet.isi
                    }
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />{" "}
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Simpan Snippet
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
