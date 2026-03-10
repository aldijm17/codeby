"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Users,
  Code2,
  Trash2,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Search,
  Loader2,
  UserX,
  RefreshCcw,
  LayoutDashboard,
  ChevronRight,
  ExternalLink,
  Hash,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface DashboardStats {
  totalUsers: number;
  totalSnippets: number;
  totalFollows: number;
}

export default function SuperAdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "users" | "snippets" | "dashboard"
  >("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalSnippets: 0,
    totalFollows: 0,
  });

  const [users, setUsers] = useState<any[]>([]);
  const [snippets, setSnippets] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    setIsLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "super_admin") {
      router.push("/dashboard");
      return;
    }

    setIsAdmin(true);
    fetchStats();
    setIsLoading(false);
  };

  const fetchStats = async () => {
    try {
      const [
        { count: uCount, error: uErr },
        { count: sCount, error: sErr },
        { count: fCount, error: fErr },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("contekans").select("*", { count: "exact", head: true }),
        supabase.from("follows").select("*", { count: "exact", head: true }),
      ]);

      if (uErr || sErr || fErr) {
        console.error("Stats fetch error:", { uErr, sErr, fErr });
      }

      setStats({
        totalUsers: uCount || 0,
        totalSnippets: sCount || 0,
        totalFollows: fCount || 0,
      });
    } catch (err) {
      console.error("Stats exception:", err);
    }
  };

  const fetchUsers = async () => {
    setIsDataLoading(true);
    try {
      const { data, error } = await supabase.from("profiles").select("*");

      if (error) {
        console.error("Error fetching users:", error);
        alert("Gagal mengambil data user. Pastikan SQL sudah di-run.");
      } else {
        setUsers(data || []);
      }
    } catch (err) {
      console.error("Users exception:", err);
    } finally {
      setIsDataLoading(false);
    }
  };

  const fetchSnippets = async () => {
    setIsDataLoading(true);
    try {
      const { data, error } = await supabase
        .from("contekans")
        .select("*, profiles(username, display_name)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching snippets:", error);
        alert("Gagal mengambil data snippet.");
      } else {
        setSnippets(data || []);
      }
    } catch (err) {
      console.error("Snippets exception:", err);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "snippets") fetchSnippets();
    if (activeTab === "dashboard") fetchStats();
  }, [activeTab]);

  const handleDeleteUser = async (userId: string, username: string) => {
    if (
      !confirm(
        `Hapus user @${username} secara permanen? Tindakan ini tidak bisa dibatalkan!`,
      )
    )
      return;

    setActionLoading(userId);
    try {
      const { error } = await supabase.rpc("admin_delete_user", {
        target_user_id: userId,
      });
      if (error) throw error;
      setUsers(users.filter((u) => u.id !== userId));
      alert("User berhasil dihapus.");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSnippet = async (id: string) => {
    if (!confirm("Hapus snippet ini?")) return;

    setActionLoading(id);
    try {
      const { error } = await supabase.from("contekans").delete().eq("id", id);
      if (error) throw error;
      setSnippets(snippets.filter((s) => s.id !== id));
      alert("Snippet dihapus.");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (email: string) => {
    setActionLoading(email);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard/profile`,
      });
      if (error) throw error;
      alert(`Link reset password telah dikirim ke ${email}`);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col pt-8">
        <div className="px-6 mb-10">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            Super Admin
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">
            Control Panel
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "dashboard" ? "bg-slate-800 text-white shadow-lg border border-slate-700" : "text-slate-400 hover:bg-slate-800/50"}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-semibold">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "users" ? "bg-slate-800 text-white shadow-lg border border-slate-700" : "text-slate-400 hover:bg-slate-800/50"}`}
          >
            <Users className="w-5 h-5" />
            <span className="font-semibold">Users</span>
          </button>
          <button
            onClick={() => setActiveTab("snippets")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "snippets" ? "bg-slate-800 text-white shadow-lg border border-slate-700" : "text-slate-400 hover:bg-slate-800/50"}`}
          >
            <Code2 className="w-5 h-5" />
            <span className="font-semibold">Snippets</span>
          </button>
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-cyan-400 transition-colors p-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-950/20">
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-10 bg-slate-900/30 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-white capitalize">
            {activeTab}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-400">Authenticated as</p>
              <p className="text-sm font-bold text-cyan-400">
                Super Admin Mode
              </p>
            </div>
          </div>
        </header>

        <div className="p-10">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-slate-400 font-medium">Total Users</h3>
                  <p className="text-4xl font-bold text-white mt-1">
                    {stats.totalUsers}
                  </p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <Code2 className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-slate-400 font-medium">Total Snippets</h3>
                  <p className="text-4xl font-bold text-white mt-1">
                    {stats.totalSnippets}
                  </p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <ShieldCheck className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="text-slate-400 font-medium">Social Follows</h3>
                  <p className="text-4xl font-bold text-white mt-1">
                    {stats.totalFollows}
                  </p>
                </div>

                <div className="md:col-span-3 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-blue-500/20 p-8 rounded-3xl mt-4">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Welcome, Super Admin
                  </h3>
                  <p className="text-slate-400 max-w-2xl">
                    Use this panel to monitor user activity and maintain
                    community standards. You have the power to delete users,
                    clear abusive content, and assist with account recovery.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="relative w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Cari user (id, username, email)..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={fetchUsers}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <RefreshCcw className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-800/30">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-center">
                          User
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                          ID / Info
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                          Role
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {isDataLoading ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-20 text-center text-slate-500"
                          >
                            Loading users...
                          </td>
                        </tr>
                      ) : (
                        users
                          .filter(
                            (u) =>
                              u.username
                                ?.toLowerCase()
                                .includes(searchQuery.toLowerCase()) ||
                              u.id.includes(searchQuery),
                          )
                          .map((u) => (
                            <tr
                              key={u.id}
                              className="hover:bg-slate-800/30 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center overflow-hidden">
                                    {u.avatar_url ? (
                                      <img
                                        src={u.avatar_url}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Users className="w-5 h-5 text-slate-500" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-bold text-white">
                                      {u.display_name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      @{u.username}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-xs font-mono text-slate-400">
                                  {u.id}
                                </p>
                                <p className="text-xs text-slate-500 mt-1 italic">
                                  Joined:{" "}
                                  {new Date(u.created_at).toLocaleDateString()}
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${u.role === "super_admin" ? "bg-red-500/10 text-red-400 border border-red-500/30" : "bg-slate-800 text-slate-400"}`}
                                >
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() =>
                                      handleResetPassword(u.email || "")
                                    }
                                    disabled={
                                      actionLoading === (u.email || u.id)
                                    }
                                    className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-all"
                                    title="Send Password Reset"
                                  >
                                    {actionLoading === (u.email || u.id) ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Mail className="w-4 h-4" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteUser(u.id, u.username)
                                    }
                                    disabled={
                                      actionLoading === u.id ||
                                      u.role === "super_admin"
                                    }
                                    className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all disabled:opacity-30"
                                    title="Delete User"
                                  >
                                    {actionLoading === u.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <UserX className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "snippets" && activeTab === "snippets" && (
              <motion.div
                key="snippets"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="relative w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search snippets (judul, id)..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={fetchSnippets}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <RefreshCcw className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-800/30">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                          Snippet
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                          Author
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                          Language
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {isDataLoading ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-20 text-center text-slate-500"
                          >
                            Loading snippets...
                          </td>
                        </tr>
                      ) : (
                        snippets
                          .filter(
                            (s) =>
                              s.judul
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()) ||
                              s.id.includes(searchQuery),
                          )
                          .map((s) => (
                            <tr
                              key={s.id}
                              className="hover:bg-slate-800/30 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                    <Hash className="w-5 h-5 text-cyan-400" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-white truncate max-w-xs">
                                      {s.judul}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                      {s.id}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                                    <Users className="w-3 h-3 text-slate-500" />
                                  </div>
                                  <span className="text-sm text-slate-300">
                                    @{s.profiles?.username || "unknown"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] font-bold uppercase rounded border border-slate-700">
                                  {s.language || "text"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <Link
                                    href={`/u/${s.profiles?.username}`}
                                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
                                    title="View Author"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Link>
                                  <button
                                    onClick={() => handleDeleteSnippet(s.id)}
                                    disabled={actionLoading === s.id}
                                    className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all"
                                    title="Delete Snippet"
                                  >
                                    {actionLoading === s.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
