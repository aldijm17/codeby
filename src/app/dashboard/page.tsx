"use client";

import { useState, useEffect, useMemo, FormEvent, ReactNode } from "react";
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

export default function DashboardPage() {
  const [contekans, setContekans] = useState<Contekan[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "mine">("all");

  const [viewMode, setViewMode] = useState<"view" | "add" | "edit">("view");
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
          setViewMode("view");
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
          setViewMode("view");
          showNotification("Berhasil", "Contekan berhasil diperbarui.");
        }
      }
    } catch (error: any) {
      showNotification("Gagal Menyimpan", error.message);
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
          setViewMode("view");
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
      <div className="flex h-screen overflow-hidden bg-[#0B1120] relative z-0">
        {/* Dynamic Backgrounds & Grid */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-700/10 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-700/10 blur-[150px] rounded-full pointer-events-none -z-10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] -z-20 pointer-events-none"></div>

        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-30 md:hidden glass-panel"
            />
          )}
        </AnimatePresence>

        <motion.aside
          className={`fixed md:relative w-72 h-full bg-slate-900/60 backdrop-blur-2xl border-r border-slate-800/60 flex flex-col z-40 md:translate-x-0 transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <header className="p-6 border-b border-slate-700/40 flex justify-between items-center bg-slate-900/40 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[40px] rounded-full pointer-events-none -z-10" />
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 w-full hover:bg-slate-800/50 p-2 -m-2 rounded-xl transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center shrink-0">
                {user?.user_metadata?.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-sm text-slate-100 truncate group-hover:text-cyan-400 transition-colors">
                  {user?.user_metadata?.display_name ||
                    user?.email?.split("@")[0] ||
                    "User"}
                </h1>
                <p className="text-xs text-slate-500 truncate group-hover:text-slate-400 transition-colors">
                  @{user?.user_metadata?.username || "username"}
                </p>
                <div className="flex items-center gap-3 mt-1.5 pointer-events-none">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <span className="font-bold text-slate-300">
                      {socialStats.followers}
                    </span>{" "}
                    Followers
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <span className="font-bold text-slate-300">
                      {socialStats.following}
                    </span>{" "}
                  </div>
                </div>
              </div>
            </Link>
            <Link
              href={`/u/${user?.user_metadata?.username}`}
              className="mt-4 p-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/20 text-[10px] font-bold uppercase tracking-wider text-center transition-all block"
            >
              View Public Profile
            </Link>
          </header>
          <div className="p-4 space-y-4">
            <button
              onClick={handleAddNew}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-cyan-900/30 hover:shadow-cyan-500/40 transition-all group scale-100 hover:scale-[1.02]"
            >
              <div className="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform duration-300">
                <Plus className="w-4 h-4" />
              </div>
              <span className="tracking-wide">Create Snippet</span>
            </button>

            <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/50">
              <button
                onClick={() => setFilter("all")}
                className={`py-2 px-3 text-sm font-semibold rounded-lg transition-all ${filter === "all" ? "bg-slate-700 text-white shadow-lg shadow-black/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("mine")}
                className={`py-2 px-3 text-sm font-semibold rounded-lg transition-all ${filter === "mine" ? "bg-slate-700 text-white shadow-lg shadow-black/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
              >
                My Snippets
              </button>
            </div>

            <div className="relative group">
              <input
                type="text"
                placeholder="Search snippets or profiles"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-300 placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:outline-none transition-all group-hover:border-slate-600"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            </div>

            {searchQuery.length >= 2 && (
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2 px-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <Users className="w-3 h-3" />
                  <span>Developers</span>
                </div>
                <div className="space-y-1">
                  {foundUsers.length > 0 ? (
                    foundUsers.map((u) => (
                      <Link
                        key={u.id}
                        href={`/u/${u.username}`}
                        className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-cyan-500/30 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                          {u.avatar_url ? (
                            <Image
                              src={u.avatar_url}
                              alt={u.display_name}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                              <UserIcon className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-200 truncate group-hover:text-cyan-400 transition-colors">
                              {u.display_name}
                            </p>
                            <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 transition-all" />
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-[9px] text-slate-500">
                              <Code2 className="w-2.5 h-2.5" />
                              <span>{u.contekans?.[0]?.count || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[9px] text-slate-500">
                              <Users className="w-2.5 h-2.5" />
                              <span>{u.followers?.[0]?.count || 0}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : !isSearchingUsers ? (
                    <div className="p-2 text-center bg-slate-800/20 rounded-lg border border-dashed border-slate-700/50">
                      <p className="text-[10px] text-slate-500 italic">
                        No developers found
                      </p>
                    </div>
                  ) : (
                    <div className="p-2 text-center">
                      <Loader2 className="w-4 h-4 text-cyan-500 animate-spin mx-auto" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {filteredContekans.map((c) => (
              <motion.div
                layoutId={c.id}
                key={c.id}
                onClick={() => {
                  setCurrentItem(c);
                  setViewMode("view");
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`group p-3.5 rounded-2xl cursor-pointer transition-all border relative overflow-hidden ${currentItem?.id === c.id && viewMode !== "add" ? "bg-slate-800/80 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]" : "bg-transparent border-transparent hover:bg-slate-800/40 hover:border-slate-700/50"}`}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <div
                    className={`p-2.5 rounded-lg transition-colors ${currentItem?.id === c.id ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200"}`}
                  >
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4
                      className={`font-bold text-sm truncate transition-colors ${currentItem?.id === c.id ? "text-cyan-100" : "text-slate-400 group-hover:text-slate-200"}`}
                    >
                      {c.judul}
                      {c.is_private && (
                        <Lock className="w-3 h-3 text-red-500/70 inline-block ml-1.5 mb-0.5" />
                      )}
                    </h4>
                    <p className="text-xs text-slate-500 truncate group-hover:text-slate-400 transition-colors">
                      {c.deskripsi || "No description"}
                    </p>
                    {c.tags && c.tags.length > 0 && (
                      <div className="flex gap-1 mt-1.5 overflow-hidden">
                        {c.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 whitespace-nowrap"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {currentItem?.id === c.id && (
                    <ChevronRight className="w-4 h-4 text-cyan-500/50" />
                  )}
                </div>
                {currentItem?.id === c.id && (
                  <motion.div
                    layoutId="active-glow"
                    className="absolute inset-0 bg-cyan-500/5 z-0"
                  />
                )}
              </motion.div>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800 space-y-2">
            {userRole === "super_admin" && (
              <Link
                href="/super-admin"
                className="flex items-center gap-3 p-3 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 transition-all group/admin mb-2"
              >
                <div className="p-2 bg-red-500/10 rounded-lg group-hover/admin:bg-red-500/20 transition-colors">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-xs font-bold uppercase tracking-widest">
                    Admin Panel
                  </p>
                  <p className="text-[10px] text-red-500/60 font-medium">
                    Manage Users
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover/admin:opacity-100 group-hover/admin:translate-x-1 transition-all" />
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all group"
            >
              <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-red-500/10 transition-colors">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm">Sign Out</span>
            </button>
          </div>
        </motion.aside>

        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          <div className="md:hidden p-4 border-b border-slate-800 flex items-center justify-between glass sticky top-0 z-20">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-bold text-slate-100">Dashboard</h1>
            <div className="w-10" />
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
            <div className="max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                {viewMode === "view" && currentItem && (
                  <motion.div
                    key="view"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 relative">
                      {/* Glow effect behind header */}
                      <div className="absolute top-0 left-0 w-[300px] h-[100px] bg-cyan-500/20 blur-[80px] rounded-full pointer-events-none -z-10 animate-pulse" />
                      <div>
                        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-blue-200 tracking-tight">
                          {currentItem.judul}
                        </h2>
                        <p className="text-slate-300 mt-3 leading-relaxed text-lg max-w-2xl border-l-2 border-cyan-500/30 pl-4">
                          {currentItem.deskripsi}
                        </p>
                        <div className="flex items-center gap-2 mt-4 text-xs font-medium text-slate-500 bg-slate-800/50 inline-flex px-3 py-1 rounded-full">
                          <UserIcon className="w-3 h-3" />
                          <span>
                            Created by {currentItem.user_display_name}
                          </span>
                        </div>
                        {currentItem.tags && currentItem.tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-3">
                            <Tag className="w-3.5 h-3.5 text-slate-500" />
                            {currentItem.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 rounded-md bg-cyan-900/30 text-cyan-400 border border-cyan-800/50"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {currentItem.file_content &&
                          currentItem.file_content.startsWith("http") && (
                            <div className="mt-6 flex">
                              <a
                                href={currentItem.file_content}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all font-medium text-sm shadow-sm"
                              >
                                <FileText className="w-4 h-4" />
                                View / Download Attachment
                              </a>
                            </div>
                          )}
                      </div>

                      {user &&
                        currentItem &&
                        user.id === currentItem.user_id && (
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => handleEdit(currentItem)}
                              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-md text-slate-200 rounded-xl border border-slate-700 transition-all font-semibold shadow-lg shadow-black/20 hover:shadow-cyan-500/10"
                            >
                              <Edit className="w-4 h-4" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(currentItem.id)}
                              className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 backdrop-blur-md text-red-400 border border-red-500/20 rounded-xl transition-all font-semibold shadow-lg shadow-black/20 hover:shadow-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                    </header>

                    <div className="rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-slate-700/60 mt-10 bg-slate-900/60 backdrop-blur-3xl relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                      <div className="flex items-center justify-between px-5 py-4 bg-slate-950/80 border-b border-white/5 relative z-10 shadow-inner">
                        <div className="flex gap-2">
                          <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 box-border border border-red-400/50 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                          <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 box-border border border-yellow-400/50 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                          <div className="w-3.5 h-3.5 rounded-full bg-green-500/80 box-border border border-green-400/50 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-slate-500 uppercase">
                            {currentItem.language || "javascript"}
                          </span>
                          <button
                            onClick={() => handleCopy(currentItem.isi)}
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-md transition-all border border-slate-700 hover:border-slate-600"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-green-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            {isCopied ? (
                              <span className="text-green-400">Copied!</span>
                            ) : (
                              "Copy"
                            )}
                          </button>
                        </div>
                      </div>
                      <SyntaxHighlighter
                        language={currentItem.language || "javascript"}
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
                        {currentItem.isi}
                      </SyntaxHighlighter>
                    </div>
                  </motion.div>
                )}

                {(viewMode === "add" || viewMode === "edit") && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 10 }}
                    className="max-w-4xl mx-auto bg-slate-900/40 backdrop-blur-2xl p-6 sm:p-10 rounded-[2.5rem] border border-slate-700/50 shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative"
                  >
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
                    <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-700/50">
                      <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200 flex items-center gap-4 drop-shadow-sm">
                        {viewMode === "add" ? (
                          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20"><Plus className="w-7 h-7 text-cyan-400" /></div>
                        ) : (
                          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20"><Edit className="w-7 h-7 text-cyan-400" /></div>
                        )}
                        {viewMode === "add"
                          ? "Create New Snippet"
                          : "Edit Snippet"}
                      </h2>
                      <button
                        type="button"
                        onClick={() => setViewMode("view")}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 ml-1">
                          Title
                        </label>
                        <input
                          type="text"
                          placeholder="Snippet Title..."
                          value={formState.judul}
                          onChange={(e) =>
                            setFormState({
                              ...formState,
                              judul: e.target.value,
                            })
                          }
                          className="w-full px-5 py-4 bg-slate-950/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 focus:outline-none transition-all text-slate-100 placeholder:text-slate-600 text-lg font-semibold shadow-inner"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 ml-1">
                          Description
                        </label>
                        <textarea
                          placeholder="What does this snippet do?"
                          value={formState.deskripsi}
                          onChange={(e) =>
                            setFormState({
                              ...formState,
                              deskripsi: e.target.value,
                            })
                          }
                          className="w-full h-32 px-5 py-4 bg-slate-950/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 focus:outline-none transition-all text-slate-200 placeholder:text-slate-600 resize-none shadow-inner text-base"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-400 ml-1">
                            Language
                          </label>
                          <select
                            value={formState.language}
                            onChange={(e) =>
                              setFormState({
                                ...formState,
                                language: e.target.value,
                              })
                            }
                            className="w-full px-5 py-4 bg-slate-950/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 focus:outline-none transition-all text-slate-200 shadow-inner font-mono text-sm"
                          >
                            <option value="javascript">
                              JavaScript / TypeScript
                            </option>
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
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-400 ml-1">
                            Tags (comma separated)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. react, hooks, ui"
                            value={formState.tags}
                            onChange={(e) =>
                              setFormState({
                                ...formState,
                                tags: e.target.value,
                              })
                            }
                            className="w-full px-5 py-4 bg-slate-950/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 focus:outline-none transition-all text-slate-200 placeholder:text-slate-600 shadow-inner"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 bg-slate-950/30 p-4 rounded-2xl border border-slate-700/40">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${formState.is_private ? "bg-red-500/10 text-red-400" : "bg-cyan-500/10 text-cyan-400"}`}>
                              {formState.is_private ? <Lock className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-200">
                                {formState.is_private ? "Private Snippet" : "Public Snippet"}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {formState.is_private ? "Only you and super admins can see this." : "Everyone can browse and see this snippet."}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormState({ ...formState, is_private: !formState.is_private })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-offset-slate-900 ${formState.is_private ? "bg-red-500 ring-red-500/50" : "bg-slate-700 ring-slate-700/50"}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formState.is_private ? "translate-x-6" : "translate-x-1"}`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 ml-1">
                          Attachment (Optional)
                        </label>
                        <div className="relative group">
                          <input
                            type="file"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setFormState({ ...formState, file: file });
                              }
                            }}
                            className="block w-full text-sm text-slate-400
                                  file:mr-4 file:py-2.5 file:px-4
                                  file:rounded-xl file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-slate-700 file:text-cyan-400
                                  hover:file:bg-slate-600
                                  cursor-pointer
                                "
                          />
                          {formState.file_content && !formState.file && (
                            <div className="mt-2 text-xs text-cyan-400 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {formState.file_content.startsWith("http")
                                ? "Existing file attached"
                                : "Current file stored in DB"}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 ml-1">
                          Code
                        </label>
                        <div className="relative group">
                          <textarea
                            placeholder="// Paste your code here..."
                            value={formState.isi}
                            onChange={(e) =>
                              setFormState({
                                ...formState,
                                isi: e.target.value,
                              })
                            }
                            className="w-full h-[500px] p-6 bg-slate-950/80 backdrop-blur-3xl border border-slate-700/60 rounded-2xl focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 focus:outline-none transition-all text-cyan-50 font-mono text-sm leading-relaxed shadow-inner"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/50">
                        <button
                          type="button"
                          onClick={() => setViewMode("view")}
                          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isUploading}
                          className="flex items-center justify-center gap-2 px-8 py-4 w-full md:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:scale-105"
                        >
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          {isUploading ? "Uploading..." : "Save"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {!currentItem && viewMode === "view" && !isLoading && (
                  <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center text-slate-500">
                    <div className="p-6 bg-slate-800/30 rounded-full mb-4">
                      <LayoutDashboard className="w-16 h-16 text-slate-700" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-400">
                      Welcome to Dashboard
                    </h2>
                    <p className="max-w-xs mx-auto mt-2 text-slate-600">
                      Select a snippet from the sidebar or create a new one to
                      get started.
                    </p>
                    <button
                      onClick={handleAddNew}
                      className="mt-8 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm font-medium border border-slate-700"
                    >
                      Create Snippet
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

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
