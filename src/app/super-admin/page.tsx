"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Menu,
  ShieldPlus,
  Lock,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface DashboardStats {
  totalUsers: number;
  totalSnippets: number;
  totalFollows: number;
  pendingApprovals: number;
}

export default function SuperAdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "users" | "snippets" | "dashboard" | "requests"
  >("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalSnippets: 0,
    totalFollows: 0,
    pendingApprovals: 0,
  });

  const [users, setUsers] = useState<any[]>([]);
  const [snippets, setSnippets] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
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
        { count: pCount, error: pErr },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("contekans").select("*", { count: "exact", head: true }),
        supabase.from("follows").select("*", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("is_approved", false),
      ]);

      if (uErr || sErr || fErr || pErr) {
        console.error("Stats fetch error:", { uErr, sErr, fErr, pErr });
      }

      setStats({
        totalUsers: uCount || 0,
        totalSnippets: sCount || 0,
        totalFollows: fCount || 0,
        pendingApprovals: pCount || 0,
      });
    } catch (err) {
      console.error("Stats exception:", err);
    }
  };

  const fetchUsers = async () => {
    setIsDataLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_approved", true);

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

  const fetchRequests = async () => {
    setIsDataLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_approved", false)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching requests:", error);
        alert("Gagal mengambil data request.");
      } else {
        setRequests(data || []);
      }
    } catch (err) {
      console.error("Requests exception:", err);
    } finally {
      setIsDataLoading(false);
    }
  };

  const fetchSnippets = async () => {
    setIsDataLoading(true);
    try {
      const { data, error } = await supabase
        .from("contekans")
        .select("*, profiles(username, display_name)");

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
    if (activeTab === "requests") fetchRequests();
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

  const handlePromoteSuperAdmin = async (userId: string, username: string) => {
    if (
      !confirm(
        `Jadikan user @${username} sebagai Super Admin? Mereka akan memiliki akses penuh ke sistem ini.`,
      )
    )
      return;

    setActionLoading(`promote-${userId}`);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: "super_admin" })
        .eq("id", userId);

      if (error) throw error;
      
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, role: "super_admin" } : u
        )
      );
      alert(`Berhasil! @${username} sekarang adalah Super Admin.`);
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

  const handleApproveUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_approved: true })
        .eq("id", userId);

      if (error) throw error;

      const approvedUser = requests.find((r) => r.id === userId);
      if (approvedUser?.email) {
        await supabase.auth.resetPasswordForEmail(approvedUser.email, {
          redirectTo: `${window.location.origin}/dashboard/profile`,
        });
      }

      setRequests(requests.filter((r) => r.id !== userId));
      setStats((prev) => ({
        ...prev,
        totalUsers: prev.totalUsers + 1,
        pendingApprovals: prev.pendingApprovals - 1,
      }));
      alert(
        "User approved! A welcome email with a password setup link has been sent.",
      );
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
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900/60 backdrop-blur-2xl border-r border-slate-800/60 flex flex-col pt-8 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Decorative Sidebar Glow */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/10 blur-[40px] rounded-full pointer-events-none -z-10" />
        <div className="px-6 mb-10 flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-red-500" />
              Super Admin
            </h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">
              Control Panel
            </p>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
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
          <button
            onClick={() => setActiveTab("requests")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "requests" ? "bg-slate-800 text-white shadow-lg border border-slate-700" : "text-slate-400 hover:bg-slate-800/50"}`}
          >
            <div className="relative">
              <Clock className="w-5 h-5" />
              {stats.pendingApprovals > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-slate-900" />
              )}
            </div>
            <span className="font-semibold text-left flex-1">Requests</span>
            {stats.pendingApprovals > 0 && (
              <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-bold">
                {stats.pendingApprovals}
              </span>
            )}
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

      <main className="flex-1 overflow-y-auto bg-slate-950/20">
        <header className="h-20 border-b border-slate-800 flex items-center px-6 md:px-10 bg-slate-900/30 backdrop-blur-md sticky top-0 z-10 gap-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-xl md:text-2xl font-bold text-white capitalize flex-1">
            {activeTab}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400">Authenticated as</p>
              <p className="text-sm font-bold text-cyan-400">
                Super Admin Mode
              </p>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-10">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <div className="rounded-3xl border border-slate-700/50 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)] bg-slate-900/50 backdrop-blur-xl p-8 relative flex flex-col items-start justify-between group transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)]">
                  <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-cyan-500/20 group-hover:scale-110 transition-transform">
                    <Users className="w-7 h-7 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-slate-400 font-bold tracking-wide uppercase text-xs mb-2">Total Users</h3>
                    <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                      {stats.totalUsers}
                    </p>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-700/50 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)] bg-slate-900/50 backdrop-blur-xl p-8 relative flex flex-col items-start justify-between group transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(168,85,247,0.15)]">
                  <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-purple-500/20 group-hover:scale-110 transition-transform">
                    <Code2 className="w-7 h-7 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-slate-400 font-bold tracking-wide uppercase text-xs mb-2">Total Snippets</h3>
                    <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                      {stats.totalSnippets}
                    </p>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-700/50 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)] bg-slate-900/50 backdrop-blur-xl p-8 relative flex flex-col items-start justify-between group transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(249,115,22,0.15)]">
                  <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-orange-500/20 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-7 h-7 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-slate-400 font-bold tracking-wide uppercase text-xs mb-2">Social Follows</h3>
                    <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                      {stats.totalFollows}
                    </p>
                  </div>
                </div>

                <div className="md:col-span-3 rounded-3xl border border-blue-500/30 overflow-hidden shadow-[0_8px_30px_rgba(59,130,246,0.15)] bg-gradient-to-br from-indigo-900/40 to-blue-900/20 backdrop-blur-xl p-8 lg:p-10 relative mt-4">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none -z-10" />
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
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition-all text-slate-200 shadow-inner"
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

                <div className="rounded-3xl border border-slate-700/50 overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] bg-slate-900/60 backdrop-blur-3xl overflow-x-auto relative">
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
                                      <Image
                                        src={u.avatar_url}
                                        alt={u.display_name}
                                        width={40}
                                        height={40}
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
                                  {u.role !== "super_admin" && (
                                    <button
                                      onClick={() =>
                                        handlePromoteSuperAdmin(u.id, u.username)
                                      }
                                      disabled={actionLoading === `promote-${u.id}`}
                                      className="p-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-all"
                                      title="Promote to Super Admin"
                                    >
                                      {actionLoading === `promote-${u.id}` ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <ShieldPlus className="w-4 h-4" />
                                      )}
                                    </button>
                                  )}
                                
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

                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden overflow-x-auto">
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
                                    <p className="font-bold text-white truncate max-w-xs flex items-center gap-1.5">
                                      {s.judul}
                                      {s.is_private ? (
                                        <Lock className="w-3 h-3 text-red-400" />
                                      ) : (
                                        <Globe className="w-3 h-3 text-slate-500" />
                                      )}
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
            {activeTab === "requests" && (
              <motion.div
                key="requests"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-800/30">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                          Pending User
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                          Email / ID
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                          Joined
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
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                            Loading requests...
                          </td>
                        </tr>
                      ) : requests.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-20 text-center text-slate-500 italic"
                          >
                            No pending approval requests.
                          </td>
                        </tr>
                      ) : (
                        requests.map((r) => (
                          <tr
                            key={r.id}
                            className="hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                                  <Users className="w-5 h-5 text-slate-500" />
                                </div>
                                <div>
                                  <p className="font-bold text-white">
                                    {r.display_name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    @{r.username}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-slate-300">
                                {r.email || "N/A"}
                              </p>
                              <p className="text-[10px] font-mono text-slate-600 mt-1">
                                {r.id}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-xs text-slate-400">
                                {new Date(r.created_at).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleApproveUser(r.id)}
                                  disabled={actionLoading === r.id}
                                  className="p-2 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white rounded-lg transition-all"
                                  title="Approve User"
                                >
                                  {actionLoading === r.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteUser(r.id, r.username)
                                  }
                                  disabled={actionLoading === r.id}
                                  className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all"
                                  title="Reject & Delete"
                                >
                                  {actionLoading === r.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <XCircle className="w-4 h-4" />
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
