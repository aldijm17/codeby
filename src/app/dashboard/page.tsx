"use client";

import { useState, useEffect, useMemo, useRef, FormEvent, ReactNode, memo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const SyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter").then((mod) => mod.Prism),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-48 bg-slate-900/50 animate-pulse rounded-xl border border-slate-800 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-slate-700 animate-spin" />
      </div>
    ),
  },
);
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  LogOut,
  FileText,
  Edit,
  Trash2,
  Save,
  X,
  Menu,
  User as UserIcon,
  Code2,
  LayoutDashboard,
  ChevronRight,
  Loader2,
  Copy,
  Check,
  Tag,
  Users,
  UserPlus,
  ShieldAlert,
  Clock,
  Lock,
  Globe,
  Download,
  Sparkles,
  MessageSquare,
  Send,
  MessageCircle,
  GitFork,
  Settings,
} from "lucide-react";
import Link from "next/link";
import "../globals.css";

interface Contekan {
  id: string;
  judul: string;
  isi: string;
  created_at: string;
  deskripsi: string;
  user_display_name: string;
  user_id: string;
  language?: string;
  tags?: string[];
  file_content?: string;
  is_private?: boolean;
}

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

const Modal = ({
  isOpen,
  title,
  children,
  footer,
  onClose,
}: {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  footer: ReactNode;
  onClose: () => void;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 w-full max-w-md z-50"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              {title}
            </h3>
            <div className="text-slate-300">{children}</div>
            <div className="mt-8 flex justify-end gap-3">{footer}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const SnippetCard = memo(({ c, onClick }: { 
  c: Contekan, 
  onClick: () => void 
}) => (
  <motion.div
    layoutId={`card-${c.id}`}
    onClick={onClick}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4, scale: 1.01 }}
    transition={{ duration: 0.2 }}
    className="group bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-500/40 hover:bg-slate-800/60 rounded-[2rem] p-6 cursor-pointer flex flex-col h-[260px] shadow-lg shadow-black/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className="flex items-center gap-3 w-full">
        <div className="p-3 rounded-2xl bg-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-colors border border-slate-700/50 shrink-0">
          <Code2 className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="font-extrabold text-lg text-slate-100 group-hover:text-cyan-300 transition-colors truncate">{c.judul}</h4>
          <p className="text-xs text-cyan-500/80 font-mono mt-0.5">{c.language || "javascript"}</p>
        </div>
        {c.is_private && (
            <div className="p-1.5 bg-red-500/10 rounded-lg shrink-0">
              <Lock className="w-4 h-4 text-red-400" />
            </div>
        )}
      </div>
    </div>

    <p className="text-sm text-slate-400 line-clamp-3 mb-auto group-hover:text-slate-300 transition-colors relative z-10 font-medium leading-relaxed">
      {c.deskripsi || "No description provided. Click to view snippet contents."}
    </p>

    <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-col gap-3 relative z-10">
      {c.tags && c.tags.length > 0 && (
        <div className="flex gap-1.5 overflow-hidden">
          {c.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[10px] px-2 py-1 rounded-md bg-slate-800 text-slate-400 border border-slate-700 whitespace-nowrap">
              #{tag}
            </span>
          ))}
          {c.tags.length > 3 && (
             <span className="text-[10px] px-1.5 py-1 text-slate-500">+{c.tags.length - 3}</span>
          )}
        </div>
      )}
      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-800/50 px-2.5 py-1.5 rounded-lg w-fit">
        <UserIcon className="w-3.5 h-3.5" />
        <span className="truncate max-w-[120px] font-semibold">{c.user_display_name}</span>
      </div>
    </div>
  </motion.div>
));
SnippetCard.displayName = "SnippetCard";

export default function DashboardPage() {
  const [contekans, setContekans] = useState<Contekan[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "mine">("all");

  const [viewMode, setViewMode] = useState<"list" | "view" | "add" | "edit">("list");
  const [currentItem, setCurrentItem] = useState<Contekan | null>(null);
  interface FormState {
    id: string;
    judul: string;
    isi: string;
    deskripsi: string;
    file_content?: string;
    file?: File | null;
    language: string;
    tags: string;
    is_private: boolean;
  }

  const [formState, setFormState] = useState<FormState>({
    id: "",
    judul: "",
    isi: "",
    deskripsi: "",
    language: "javascript",
    tags: "",
    is_private: false,
  });
  const [socialStats, setSocialStats] = useState({
    followers: 0,
    following: 0,
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [foundUsers, setFoundUsers] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isConfirmation: false,
  });
  const [userRole, setUserRole] = useState<string | null>(null);

  const router = useRouter();


  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // Sinkronisasi/Pastikan Profil ada di tabel public.profiles
      const username =
        user.user_metadata?.username ||
        user.email?.split("@")[0] ||
        `user_${user.id.slice(0, 5)}`;
      const displayName =
        user.user_metadata?.display_name || user.email?.split("@")[0] || "User";

      try {
        let { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError || !profile) {
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              username: username,
              display_name: displayName,
              avatar_url: user.user_metadata?.avatar_url || "",
              email: user.email,
              is_approved: true,
            })
            .select("role")
            .single();

          if (!insertError) profile = newProfile;
        }

        if (profile) {
          setUserRole(profile.role);
        }
      } catch (err) {
        console.error("Critical Profile Error:", err);
      }

      if (!user.user_metadata?.username) {
        await supabase.auth.updateUser({
          data: { username, display_name: displayName },
        });
      }

      const { count: followers } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", user.id);

      const { count: following } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", user.id);

      setSocialStats({
        followers: followers || 0,
        following: following || 0,
      });

      const { data, error } = await supabase
        .from("contekans")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching contekans:", error);
      } else {
        setContekans(data as Contekan[]);
        if (data.length > 0) {
          setCurrentItem(data[0]);
        }
      }
      setIsLoading(false);
    };
    initialize();
  }, [router]);

  useEffect(() => {
    const searchUsers = async () => {
      const trimmedQuery = searchQuery.trim();
      const cleanQuery = trimmedQuery.startsWith("@")
        ? trimmedQuery.slice(1)
        : trimmedQuery;
      if (cleanQuery.length < 2) {
        setFoundUsers([]);
        return;
      }
      setIsSearchingUsers(true);
      try {
        console.log("Dashboard Searching for user:", cleanQuery);
        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
            *,
            contekans:contekans(count),
            followers:follows!follows_following_id_fkey(count),
            following:follows!follows_follower_id_fkey(count)
          `,
          )
          .or(
            `username.ilike.%${cleanQuery}%,display_name.ilike.%${cleanQuery}%`,
          )
          .limit(5);

        if (error) throw error;
        console.log("Dashboard Search results:", data);
        setFoundUsers(data || []);
      } catch (err) {
        console.warn("Dashboard Retrying basic search due to error:", err);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .or(
            `username.ilike.%${cleanQuery}%,display_name.ilike.%${cleanQuery}%`,
          )
          .limit(5);
        console.log("Dashboard Basic search results:", data, error);
        setFoundUsers(data || []);
      } finally {
        setIsSearchingUsers(false);
      }
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const closeModal = () => setModalState({ ...modalState, isOpen: false });
  
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentPrompt.trim() || isAILoading) return;

    const userMessage = currentPrompt.trim();
    setCurrentPrompt("");
    
    const newMessages: ChatMessage[] = [
      ...chatMessages,
      { role: "user", parts: [{ text: userMessage }] }
    ];
    setChatMessages(newMessages);
    setIsAILoading(true);

    try {
      // Filter history to ensure it's in the format Gemini expects:
      // 1. Starts with a 'user' message
      // 2. Alternates between 'user' and 'model' (or is at least valid)
      const validHistory = chatMessages.filter((msg, index) => {
        if (index === 0 && msg.role === "model") return false;
        return true;
      });

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: validHistory,
          code: formState.isi,
          language: formState.language,
        }),
      });

      const data = await response.json();
      if (data.text) {
        setChatMessages([
          ...newMessages,
          { role: "model", parts: [{ text: data.text }] }
        ]);
      } else {
        throw new Error(data.error || "Failed to get AI response");
      }
    } catch (err: any) {
      showNotification("Chat Error", err.message || "Failed to communicate with AI.");
    } finally {
      setIsAILoading(false);
    }
  };

  const showNotification = (title: string, message: string) => {
    setModalState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {},
      isConfirmation: false,
    });
  };

  const showConfirmation = (
    title: string,
    message: string,
    onConfirmAction: () => void,
  ) => {
    setModalState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirmAction();
        closeModal();
      },
      isConfirmation: true,
    });
  };

  const filteredContekans = useMemo(() => {
    let filtered = contekans.filter(
      (c) =>
        c.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.tags &&
          c.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          )),
    );
    if (filter === "mine" && user) {
      filtered = filtered.filter((c) => c.user_id === user.id);
    } else {
      // In "all" view, filter out private snippets that don't belong to the current user
      // and if the current user is not a super admin
      filtered = filtered.filter((c) => 
        !c.is_private || 
        (user && c.user_id === user.id) || 
        userRole === "super_admin"
      );
    }
    return filtered;
  }, [contekans, searchQuery, filter, user, userRole]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error, forcing clear session", error);
    } finally {
      localStorage.removeItem("supabase.auth.token");
      localStorage.clear();
      router.push("/");
    }
  };

  const handleAddNew = () => {
    setFormState({
      id: "",
      judul: "",
      isi: "",
      deskripsi: "",
      file: null,
      file_content: "",
      language: "javascript",
      tags: "",
      is_private: false,
    });
    setViewMode("add");
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleEdit = (contekan: Contekan) => {
    setFormState({
      ...contekan,
      file: null,
      language: contekan.language || "javascript",
      tags: contekan.tags ? contekan.tags.join(", ") : "",
      is_private: !!contekan.is_private,
    });
    setViewMode("edit");
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setIsUploading(true);

    try {
      let fileData = formState.file_content;

      if (formState.file) {
        if (formState.file.size > 5 * 1024 * 1024) {
          throw new Error(
            "File terlalu besar! Maksimal 5MB untuk bucket penyimpanan.",
          );
        }

        const fileExt = formState.file.name.split(".").pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("contekans-files")
          .upload(filePath, formState.file);

        if (uploadError) {
          throw new Error(`Gagal mengunggah file: ${uploadError.message}`);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("contekans-files").getPublicUrl(filePath);

        fileData = publicUrl;
      }

      if (viewMode === "add") {
        const { data, error } = await supabase
          .from("contekans")
          .insert([
            {
              judul: formState.judul,
              isi: formState.isi,
              deskripsi: formState.deskripsi,
              user_display_name: user.user_metadata?.display_name || user.email,
              user_id: user.id,
              file_content: fileData,
              language: formState.language,
              tags: formState.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
              is_private: formState.is_private,
            },
          ])
          .select();

        if (error) throw error;

        if (data) {
          setContekans((prev) => [data[0], ...prev]);
          setCurrentItem(data[0]);
          setViewMode("list");
          showNotification(
            "Berhasil",
            "Contekan baru (dengan file database) berhasil disimpan.",
          );
        }
      } else if (viewMode === "edit") {
        const { data, error } = await supabase
          .from("contekans")
          .update({
            judul: formState.judul,
            isi: formState.isi,
            deskripsi: formState.deskripsi,
            file_content: fileData,
            language: formState.language,
            tags: formState.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
            is_private: formState.is_private,
          })
          .eq("id", formState.id)
          .select();

        if (error) throw error;

        if (data) {
          setContekans((prev) =>
            prev.map((c) => (c.id === formState.id ? data[0] : c)),
          );
          setCurrentItem(data[0]);
          setViewMode("list");
          showNotification("Berhasil", "Contekan berhasil diperbarui.");
        }
      }
    } catch (error: any) {
      showNotification("Gagal Menyimpan", error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFork = async (snippetOptions: Contekan) => {
    if (!user) return;
    setIsUploading(true);

    try {
      const { data, error } = await supabase
        .from("contekans")
        .insert([
          {
            judul: `Fork of ${snippetOptions.judul}`,
            isi: snippetOptions.isi,
            deskripsi: snippetOptions.deskripsi,
            user_display_name: user.user_metadata?.display_name || user.email,
            user_id: user.id,
            file_content: snippetOptions.file_content,
            language: snippetOptions.language,
            tags: snippetOptions.tags,
            is_private: false, // Forks are public by default
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        setContekans((prev) => [data[0], ...prev]);
        setCurrentItem(data[0]);
        setViewMode("list");
        
        // Let the user know the fork was successful and we're editing the new one (optional, but view is fine)
        showNotification(
          "Berhasil di-Fork",
          "Karya ini telah di-copy ke koleksi Anda. Anda dapat mengeditnya kapan saja."
        );
      }
    } catch (error: any) {
      showNotification("Gagal Fork", error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    showConfirmation(
      "Konfirmasi Hapus",
      "Apakah Anda yakin ingin menghapus contekan ini? Tindakan ini tidak dapat diurungkan.",
      async () => {
        const { error } = await supabase
          .from("contekans")
          .delete()
          .eq("id", id);
        if (error) {
          showNotification("Gagal Menghapus", error.message);
        } else {
          const newContekans = contekans.filter((c) => c.id !== id);
          setContekans(newContekans);
          setCurrentItem(newContekans.length > 0 ? newContekans[0] : null);
          setViewMode("list");
          showNotification("Berhasil", "Contekan telah berhasil dihapus.");
        }
      },
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-cyan-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-screen overflow-hidden bg-[#0B1120] relative z-0">
        {/* Dynamic Backgrounds & Grid */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-700/10 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-700/10 blur-[150px] rounded-full pointer-events-none -z-10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] -z-20 pointer-events-none"></div>

        {/* TOP NAVIGATION BAR */}
        <header className="w-full bg-slate-900/60 backdrop-blur-2xl border-b border-slate-800/60 flex justify-between items-center py-4 px-4 md:px-12 z-40 relative">
          <div className="flex items-center gap-2 sm:gap-4">
             <Link href="/dashboard" onClick={() => setViewMode("list")} className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
               <div className="p-2 sm:p-2.5 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
                 <Code2 className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:rotate-12 transition-transform" />
               </div>
               <span className="hidden sm:inline-block text-xl sm:text-2xl font-extrabold tracking-tight text-white group-hover:text-cyan-400 transition-colors">CodeBy</span>
             </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {userRole === "super_admin" && (
              <Link href="/super-admin" className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all text-sm font-bold">
                <ShieldAlert className="w-4 h-4 md:mr-1" />
                <span className="hidden md:block">Admin</span>
              </Link>
            )}

            <button onClick={handleAddNew} className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2 px-5 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/30 hover:scale-105 duration-200 text-sm">
              <Plus className="w-4 h-4" /> Create
            </button>

            <div className="h-8 w-px bg-slate-700/50 mx-1 sm:mx-2 hidden sm:block"></div>

            <Link href={`/u/${user?.user_metadata?.username}`} className="flex items-center gap-2 sm:gap-3 hover:bg-slate-800/50 p-1.5 md:pr-4 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-700/50">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
                {user?.user_metadata?.avatar_url ? (
                  <Image src={user.user_metadata.avatar_url} alt="Profile" width={36} height={36} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 m-auto mt-2 sm:mt-2" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <h1 className="font-bold text-sm text-slate-100">{user?.user_metadata?.display_name || "User"}</h1>
                <p className="text-[10px] text-cyan-400 font-mono">@{user?.user_metadata?.username}</p>
              </div>
            </Link>

            <Link href="/settings" className="p-2 sm:p-2.5 bg-slate-800/80 hover:bg-cyan-500/10 hover:text-cyan-400 text-slate-400 rounded-xl transition-all border border-slate-700 hover:border-cyan-500/30">
               <Settings className="w-5 h-5 sm:w-5 sm:h-5" />
            </Link>

            <button onClick={handleLogout} className="p-2 sm:p-2.5 bg-slate-800/80 hover:bg-red-500/10 hover:text-red-400 text-slate-400 rounded-xl transition-all border border-slate-700 hover:border-red-500/30">
               <LogOut className="w-5 h-5 sm:w-5 sm:h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full custom-scrollbar relative">
          <div className="max-w-7xl mx-auto w-full p-4 sm:p-8">
            <AnimatePresence mode="wait">
              {viewMode === "list" && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Hero / Header of Dashboard */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-slate-800/50">
                     <div className="max-w-2xl">
                       <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Your Workspace</h2>
                       <p className="text-slate-400 text-lg">Manage, discover, and organize your premium code snippets in one place.</p>
                     </div>

                     <div className="flex gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-700/50 w-full md:w-auto h-fit">
                       <button
                         onClick={() => setFilter("all")}
                         className={`py-3 px-6 text-sm font-semibold rounded-xl transition-all flex-1 md:flex-none ${filter === "all" ? "bg-cyan-500/20 text-cyan-400 shadow-inner border border-cyan-500/30" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                       >
                         Public Library
                       </button>
                       <button
                         onClick={() => setFilter("mine")}
                         className={`py-3 px-6 text-sm font-semibold rounded-xl transition-all flex-1 md:flex-none ${filter === "mine" ? "bg-cyan-500/20 text-cyan-400 shadow-inner border border-cyan-500/30" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
                       >
                         My Snippets
                       </button>
                     </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="relative group mb-8">
                    <input
                      type="text"
                      placeholder="Search snippets by title or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 md:py-5 bg-slate-900/60 backdrop-blur-md border border-slate-700/80 rounded-2xl text-slate-100 placeholder:text-slate-500 focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500/50 focus:outline-none transition-all text-lg shadow-inner group-hover:border-slate-600"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  </div>

                  {filteredContekans.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                      {filteredContekans.map((c) => (
                        <SnippetCard
                          key={c.id}
                          c={c}
                          onClick={() => {
                            setCurrentItem(c);
                            setViewMode("view");
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                      <div className="p-6 bg-slate-800/30 rounded-full mb-6">
                        <FileText className="w-12 h-12 text-slate-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-300 mb-2">No snippets found</h3>
                      <p className="text-slate-500 max-w-sm">
                        {filter === "mine" 
                           ? "You haven't created any snippets yet, or your search didn't match anything." 
                           : "No snippets match your search criteria."}
                      </p>
                      <button onClick={handleAddNew} className="mt-8 px-8 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold rounded-xl transition-all">
                        Create Your First Snippet
                      </button>
                    </div>
                  )}
                  {/* Floating Action Button (FAB) for Mobile */}
                  <button
                    onClick={handleAddNew}
                    className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-[0_4px_20px_rgba(6,182,212,0.6)] flex items-center justify-center z-50 text-white hover:scale-105 transition-transform"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </motion.div>
              )}

              {viewMode === "view" && currentItem && (
                <motion.div
                  key="view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <button onClick={() => setViewMode("list")} className="mb-8 flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors font-semibold group bg-slate-900/50 px-4 py-2 w-fit rounded-xl border border-slate-700/50 hover:border-cyan-500/30 backdrop-blur-md">
                    <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" /> Back to Snippets
                  </button>

                  <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8 relative">
                    <div className="absolute top-0 left-0 w-[400px] h-[150px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none -z-10 animate-pulse" />
                    <div>
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-blue-200 tracking-tight leading-tight pt-12 sm:pt-0">
                        {currentItem.judul}
                      </h2>
                      <p className="text-slate-300 mt-4 leading-relaxed text-base sm:text-lg max-w-3xl border-l-4 border-cyan-500/40 pl-4 sm:pl-5 bg-gradient-to-r from-cyan-500/5 to-transparent py-2 rounded-r-2xl">
                        {currentItem.deskripsi}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-6">
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 bg-slate-800 border border-slate-700/50 px-3 sm:px-4 py-1.5 rounded-full">
                          <UserIcon className="w-4 h-4 text-cyan-400" />
                          <span>Created by {currentItem.user_display_name}</span>
                        </div>
                        {currentItem.tags && currentItem.tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            {currentItem.tags.map((tag, i) => (
                              <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-cyan-900/30 text-cyan-400 border border-cyan-800/50 font-medium">#{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {currentItem.file_content && currentItem.file_content.startsWith("http") && (
                        <div className="mt-8 flex">
                          <a
                            href={currentItem.file_content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 rounded-xl border border-cyan-500/30 transition-all font-bold shadow-lg hover:shadow-cyan-500/20"
                          >
                            <FileText className="w-5 h-5" /> View / Download Attachment
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0">
                      {user && currentItem.user_id === user.id ? (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button onClick={() => handleEdit(currentItem)} className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-md text-slate-200 rounded-xl border border-slate-700 transition-all font-bold shadow-lg shadow-black/20 hover:shadow-cyan-500/10 hover:scale-105">
                            <Edit className="w-4 h-4" /> Edit
                          </button>
                          <button onClick={() => handleDelete(currentItem.id)} className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 backdrop-blur-md text-red-400 border border-red-500/20 rounded-xl transition-all font-bold shadow-lg shadow-black/20 hover:shadow-red-500/10 hover:scale-105">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      ) : (
                        user && (
                          <button onClick={() => handleFork(currentItem)} disabled={isUploading} className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-500/40 hover:to-blue-500/40 backdrop-blur-md text-cyan-300 rounded-xl border border-cyan-500/30 transition-all font-bold shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/20 group hover:scale-105">
                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GitFork className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                            Fork Snippet
                          </button>
                        )
                      )}
                    </div>
                  </header>

                  <div className="rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-slate-700/60 mt-12 bg-slate-900/80 backdrop-blur-3xl relative group mb-20">
                    <div className="flex items-center justify-between px-6 py-5 bg-slate-950/80 border-b border-white/5 relative z-10 shadow-inner">
                      <div className="flex gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500/80 border border-red-400/50 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                        <div className="w-4 h-4 rounded-full bg-yellow-500/80 border border-yellow-400/50 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                        <div className="w-4 h-4 rounded-full bg-green-500/80 border border-green-400/50 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-mono font-bold text-slate-400 uppercase bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 drop-shadow-sm">{currentItem.language || "javascript"}</span>
                        <div className="w-px h-6 bg-slate-800 hidden sm:block"></div>
                        <button onClick={() => handleCopy(currentItem.isi)} className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-lg transition-all border border-slate-700 hover:border-slate-500">
                          {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          {isCopied ? <span className="text-green-400">Copied!</span> : "Copy"}
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-[#1d1f21] p-2 relative overflow-x-auto min-h-[300px]">
                      <SyntaxHighlighter
                        language={currentItem.language || "javascript"}
                        style={atomDark}
                        customStyle={{ margin: 0, padding: "2rem", background: "transparent", fontSize: "1rem", lineHeight: 1.6 }}
                        showLineNumbers={true}
                      >
                        {currentItem.isi}
                      </SyntaxHighlighter>
                    </div>

                    <div className="bg-slate-950/60 border-t border-slate-800/50 px-8 py-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] animate-pulse" />
                        <span className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">CodeBy Premium Snippet</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {(viewMode === "add" || viewMode === "edit") && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 10 }}
                  className="bg-slate-900/60 backdrop-blur-2xl p-5 sm:p-8 md:p-12 mb-20 rounded-[2rem] sm:rounded-[3rem] border border-slate-700/50 shadow-[0_30px_80px_rgba(0,0,0,0.5)] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
                  <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 pb-8 border-b border-slate-700/50 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white flex items-center gap-5 drop-shadow-sm tracking-tight">
                      {viewMode === "add" ? (
                        <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl shadow-lg shadow-cyan-500/20">
                          <Plus className="w-8 h-8 text-white" />
                        </div>
                      ) : (
                        <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl shadow-lg shadow-cyan-500/20">
                          <Edit className="w-8 h-8 text-white" />
                        </div>
                      )}
                      {viewMode === "add" ? "Create New Snippet" : "Edit Snippet"}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className="p-3 hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-white border border-transparent hover:border-slate-700 transition-all bg-slate-900/50 shadow-sm"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                       <div className="space-y-3">
                         <label className="text-sm font-bold tracking-wide text-slate-300 ml-1 uppercase">Snippet Title <span className="text-red-400">*</span></label>
                         <input
                           type="text"
                           placeholder="E.g., Custom React Hook for LocalStorage..."
                           value={formState.judul}
                           onChange={(e) => setFormState({ ...formState, judul: e.target.value })}
                           className="w-full px-6 py-5 bg-slate-950/70 border border-slate-700/80 rounded-2xl focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-500/60 focus:outline-none transition-all text-slate-100 placeholder:text-slate-600 text-xl font-bold shadow-inner"
                           required
                         />
                       </div>

                       <div className="space-y-3">
                         <label className="text-sm font-bold tracking-wide text-slate-300 ml-1 uppercase">Description</label>
                         <textarea
                           placeholder="Explain what this snippet does, requirements, or how to use it..."
                           value={formState.deskripsi}
                           onChange={(e) => setFormState({ ...formState, deskripsi: e.target.value })}
                           className="w-full h-40 px-6 py-5 bg-slate-950/70 border border-slate-700/80 rounded-2xl focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-500/60 focus:outline-none transition-all text-slate-200 placeholder:text-slate-600 resize-none shadow-inner text-lg"
                         />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/40 p-6 md:p-8 rounded-3xl border border-slate-700/50">
                      <div className="space-y-3">
                        <label className="text-sm font-bold tracking-wide text-slate-300 ml-1 uppercase">Language</label>
                        <div className="relative">
                          <select
                            value={formState.language}
                            onChange={(e) => setFormState({ ...formState, language: e.target.value })}
                            className="w-full appearance-none px-6 py-4 bg-slate-950/80 border border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-500/50 focus:outline-none transition-all text-cyan-300 font-bold tracking-wide font-mono text-base shadow-inner"
                          >
                            <option value="javascript">JavaScript / TypeScript</option>
                            <option value="python">Python</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="php">PHP</option>
                            <option value="java">Java</option>
                            <option value="csharp">C#</option>
                            <option value="cpp">C++</option>
                            <option value="sql">SQL</option>
                            <option value="bash">Bash / Shell</option>
                            <option value="json">JSON</option>
                            <option value="markdown">Markdown</option>
                            <option value="dart">Dart</option>
                            <option value="go">Go</option>
                            <option value="ruby">Ruby</option>
                            <option value="rust">Rust</option>
                          </select>
                          <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none rotate-90" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold tracking-wide text-slate-300 ml-1 uppercase">Tags</label>
                        <input
                          type="text"
                          placeholder="react, tailwind, ui..."
                          value={formState.tags}
                          onChange={(e) => setFormState({ ...formState, tags: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-950/80 border border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-500/50 focus:outline-none transition-all text-slate-200 placeholder:text-slate-600 shadow-inner font-mono text-base"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-sm font-bold tracking-wide text-slate-300 ml-1 uppercase">Code Implementation <span className="text-red-400">*</span></label>
                       <div className="relative group rounded-3xl overflow-hidden border border-slate-700/80 shadow-inner">
                         <div className="absolute top-4 right-4 z-20">
                            <button
                               type="button"
                               onClick={() => {
                                 setIsChatOpen(true);
                                 if (chatMessages.length === 0) {
                                   setChatMessages([{ role: "model", parts: [{ text: "Hello! I am your AI Assistant. How can I help you with your code today?" }] }]);
                                 }
                               }}
                               className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-cyan-500/20 text-cyan-400 rounded-xl border border-slate-700/80 hover:border-cyan-500/40 transition-all font-bold group shadow-lg"
                             >
                               <MessageSquare className="w-4 h-4 transition-transform group-hover:scale-110" />
                               AI Code Helper
                             </button>
                         </div>
                         <textarea
                           placeholder="// Paste your masterpiece here..."
                           value={formState.isi}
                           onChange={(e) => setFormState({ ...formState, isi: e.target.value })}
                           className="w-full h-[600px] p-8 pt-20 bg-[#1d1f21] focus:ring-4 focus:ring-cyan-500/30 focus:outline-none transition-all text-[#c5c8c6] font-mono text-base leading-relaxed resize-y"
                           required
                           spellCheck="false"
                         />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4 bg-slate-950/50 p-6 md:p-8 rounded-3xl border border-slate-700/40 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                           <div className={`p-4 rounded-2xl ${formState.is_private ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"}`}>
                             {formState.is_private ? <Lock className="w-8 h-8" /> : <Globe className="w-8 h-8" />}
                           </div>
                           <div>
                             <p className="font-extrabold text-lg text-slate-200">{formState.is_private ? "Private Snippet" : "Public Snippet"}</p>
                             <p className="text-sm text-slate-500 mt-1">{formState.is_private ? "Only you can see this code." : "Visible to the entire community."}</p>
                           </div>
                         </div>
                         <button
                           type="button"
                           onClick={() => setFormState({ ...formState, is_private: !formState.is_private })}
                           className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ring-4 ring-offset-4 ring-offset-slate-900 ${formState.is_private ? "bg-red-500 ring-red-500/20" : "bg-slate-700 ring-slate-700/20"}`}
                         >
                           <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${formState.is_private ? "translate-x-7" : "translate-x-1"}`} />
                         </button>
                       </div>

                       <div className="space-y-3 bg-slate-950/50 p-6 md:p-8 rounded-3xl border border-slate-700/40">
                         <label className="text-sm font-bold tracking-wide text-slate-300 ml-1 uppercase">Source / Attachment</label>
                         <div className="relative group">
                           <input
                             type="file"
                             onChange={async (e) => {
                               const file = e.target.files?.[0];
                               if (file) setFormState({ ...formState, file: file });
                             }}
                             className="block w-full text-sm text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-700/60 file:mr-4 file:py-4 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-cyan-400 hover:file:bg-slate-700 cursor-pointer p-1"
                           />
                         </div>
                       </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-10 border-t border-slate-700/50">
                      <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all shadow-md text-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUploading}
                        className="flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-lg rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-1"
                      >
                        {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        {isUploading ? "Saving Snippet..." : (viewMode === "add" ? "Publish Snippet" : "Save Changes")}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Floating Action Button */}
      {viewMode === "list" && (
        <button
          onClick={handleAddNew}
          className="sm:hidden fixed bottom-6 right-6 p-4 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-2xl shadow-[0_10px_40px_rgba(6,182,212,0.6)] z-50 hover:scale-105 active:scale-95 transition-all outline outline-1 outline-white/20"
          aria-label="Create New Snippet"
        >
          <Plus className="w-7 h-7 drop-shadow-md" />
        </button>
      )}

      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl z-[70] flex flex-col"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-xl">
                    <MessageCircle className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100">AI Assistant</h3>
                    <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-wider">Online & Ready</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                        msg.role === "user"
                          ? "bg-cyan-600 text-white rounded-tr-none shadow-lg shadow-cyan-900/20"
                          : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50"
                      }`}
                    >
                      <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                        {msg.parts[0].text}
                      </div>
                    </div>
                  </div>
                ))}
                {isAILoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700/50 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                      <span className="text-sm text-slate-400">AI is thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              <form
                onSubmit={handleSendChatMessage}
                className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-xl"
              >
                <div className="relative">
                  <input
                    type="text"
                    value={currentPrompt}
                    onChange={(e) => setCurrentPrompt(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendChatMessage();
                      }
                    }}
                    placeholder="Ask anything about your code..."
                    className="w-full pl-4 pr-12 py-3.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none text-slate-200 text-sm placeholder:text-slate-600 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!currentPrompt.trim() || isAILoading}
                    className="absolute right-2 top-2 p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:bg-slate-800"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Modal
        isOpen={modalState.isOpen}
        title={modalState.title}
        onClose={closeModal}
        footer={
          <>
            <button
              onClick={closeModal}
              className="px-5 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors font-medium"
            >
              {modalState.isConfirmation ? "Cancel" : "Close"}
            </button>
            {modalState.isConfirmation && (
              <button
                onClick={modalState.onConfirm}
                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg shadow-red-900/20 transition-all font-medium"
              >
                Yes, Delete
              </button>
            )}
          </>
        }
      >
        <p className="text-slate-400">{modalState.message}</p>
      </Modal>
    </>
  );
}
