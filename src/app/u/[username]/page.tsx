"use client";

import { useState, useEffect, use } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  Code2,
  Calendar,
  ChevronRight,
  ArrowLeft,
  Users,
  UserPlus,
  UserCheck,
  Loader2,
  FileText,
  Copy,
  Check,
  X,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "../../globals.css";

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

interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
}

interface Contekan {
  id: string;
  judul: string;
  isi: string;
  created_at: string;
  deskripsi: string;
  language?: string;
  is_private?: boolean;
}

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [contekans, setContekans] = useState<Contekan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const [selectedSnippet, setSelectedSnippet] = useState<Contekan | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const [showListModal, setShowListModal] = useState(false);
  const [listType, setListType] = useState<"followers" | "following">(
    "followers",
  );
  const [listUsers, setListUsers] = useState<Profile[]>([]);
  const [isListLoading, setIsListLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const {
        data: { user: authedUser },
      } = await supabase.auth.getUser();
      setCurrentUser(authedUser);

      if (authedUser) {
        const { data: roleData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authedUser.id)
          .single();
        if (roleData) setCurrentUserRole(roleData.role);
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (profileError || !profileData) {
        setIsLoading(false);
        return;
      }

      setProfile(profileData);

      const { data: contekansData } = await supabase
        .from("contekans")
        .select("*")
        .eq("user_id", profileData.id)
        .order("created_at", { ascending: false });

      setContekans((contekansData as Contekan[]) || []);

      const { count: followers } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", profileData.id);

      const { count: following } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profileData.id);

      setFollowersCount(followers || 0);
      setFollowingCount(following || 0);

      if (authedUser && authedUser.id !== profileData.id) {
        const { data: followData } = await supabase
          .from("follows")
          .select("*")
          .eq("follower_id", authedUser.id)
          .eq("following_id", profileData.id)
          .single();

        setIsFollowing(!!followData);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [username]);

  const fetchFollowList = async (type: "followers" | "following") => {
    if (!profile) return;
    setListType(type);
    setShowListModal(true);
    setIsListLoading(true);

    try {
      let query;
      if (type === "followers") {
        query = supabase
          .from("follows")
          .select("profiles:follower_id(*)")
          .eq("following_id", profile.id);
      } else {
        query = supabase
          .from("follows")
          .select("profiles:following_id(*)")
          .eq("follower_id", profile.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      const users = data?.map((item: any) => item.profiles) || [];
      setListUsers(users.filter(Boolean));
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setIsListLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (!profile || isFollowLoading) return;

    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", profile.id);

        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);
      } else {
        await supabase.from("follows").insert({
          follower_id: currentUser.id,
          following_id: profile.id,
        });

        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error following:", error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col items-center justify-center p-4">
        <UserIcon className="w-20 h-20 text-slate-700 mb-4" />
        <h1 className="text-2xl font-bold">User Not Found</h1>
        <p className="text-slate-400 mt-2">
          The user @{username} doesn't exist.
        </p>
        <Link
          href="/"
          className="mt-8 text-cyan-400 flex items-center gap-2 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <div className="rounded-3xl border border-slate-700/50 overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.6)] bg-slate-900/60 backdrop-blur-3xl mb-10 relative">
          {/* Banner */}
          <div className="h-32 sm:h-48 w-full bg-gradient-to-r from-cyan-900/40 via-blue-900/40 to-purple-900/40 border-b border-slate-800/60 relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
             <div className="absolute top-1/2 left-1/4 w-[200px] h-[200px] bg-cyan-500/20 blur-[60px] rounded-full pointer-events-none -translate-y-1/2" />
          </div>

          <div className="px-6 pb-8 sm:px-10 sm:pb-10 relative">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8 -mt-16 sm:-mt-20 mb-6 sm:mb-8">
              <div className="relative group shrink-0">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-slate-900 bg-slate-800 flex items-center justify-center relative shadow-2xl">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.display_name}
                      width={160}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-16 h-16 sm:w-20 sm:h-20 text-slate-500" />
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-end gap-4 flex-1 w-full justify-between">
                <div className="text-center md:text-left">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-1 tracking-tight">
                    {profile.display_name}
                  </h1>
                  <p className="text-cyan-400 font-semibold text-lg flex items-center justify-center md:justify-start gap-1">
                    @{profile.username}
                  </p>
                </div>

                {currentUser?.id !== profile.id && (
                  <button
                    onClick={handleFollow}
                    disabled={isFollowLoading}
                    className={`shrink-0 w-full md:w-auto px-8 py-3 rounded-2xl font-bold transition-all flex items-center justify-center md:justify-start gap-2 ${
                      isFollowing
                        ? "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 shadow-md"
                        : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all"
                    }`}
                  >
                    {isFollowLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isFollowing ? (
                      <>
                        <UserCheck className="w-5 h-5" /> Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" /> Follow
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {profile.bio && (
              <p className="text-slate-300 max-w-2xl mb-8 text-center md:text-left leading-relaxed text-sm sm:text-base border-l-2 border-cyan-500/30 pl-4">
                {profile.bio}
              </p>
            )}

            <div className="flex justify-center md:justify-start gap-6 sm:gap-12 border-t border-slate-700/50 pt-8 mt-2">
              <button
                onClick={() => fetchFollowList("followers")}
                className="text-center hover:bg-slate-800/40 p-3 rounded-2xl transition-all group/stat min-w-[100px]"
              >
                <p className="text-3xl font-black text-white group-hover/stat:text-cyan-400 transition-colors">
                  {followersCount}
                </p>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Followers
                </p>
              </button>
              <button
                onClick={() => fetchFollowList("following")}
                className="text-center hover:bg-slate-800/40 p-3 rounded-2xl transition-all group/stat min-w-[100px]"
              >
                <p className="text-3xl font-black text-white group-hover/stat:text-cyan-400 transition-colors">
                  {followingCount}
                </p>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Following
                </p>
              </button>
              <div className="text-center p-3 min-w-[100px]">
                <p className="text-3xl font-black text-white">
                  {contekans.filter(c => 
                    !c.is_private || 
                    (currentUser && currentUser.id === profile?.id) || 
                    currentUserRole === 'super_admin'
                  ).length}
                </p>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Snippets
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Code2 className="w-6 h-6 text-cyan-400" />
            Public Snippets
          </h2>

          <AnimatePresence mode="popLayout">
            {contekans.filter(c => 
                !c.is_private || 
                (currentUser && currentUser.id === profile?.id) || 
                currentUserRole === 'super_admin'
              ).length > 0 ? (
              <div className="grid gap-4">
                {contekans
                  .filter(c => 
                    !c.is_private || 
                    (currentUser && currentUser.id === profile?.id) || 
                    currentUserRole === 'super_admin'
                  )
                  .map((c) => (
                <motion.div
                  key={c.id}
                  layoutId={c.id}
                  onClick={() => setSelectedSnippet(c)}
                  className="group p-6 rounded-3xl cursor-pointer bg-slate-900/40 hover:bg-slate-800/60 backdrop-blur-xl border border-slate-800 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-300 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-slate-800/50 text-cyan-400 border border-slate-700/50 group-hover:scale-110 transition-transform">
                          <FileText className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-100 truncate group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                          {c.judul}
                          {c.is_private && (
                            <Lock className="w-3.5 h-3.5 text-red-500/70" />
                          )}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-1">
                        {c.deskripsi || "No description provided."}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 uppercase font-mono">
                          {c.language || "javascript"}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors group-hover:translate-x-1" />
                  </div>
                </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800 w-full">
                <Code2 className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500">
                  This user hasn't posted any public snippets yet.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {selectedSnippet && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSnippet(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedSnippet.judul}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 uppercase font-mono tracking-wider">
                    {selectedSnippet.language || "javascript"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSnippet(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar">
                {selectedSnippet.deskripsi && (
                  <p className="text-slate-400 mb-6 text-sm leading-relaxed border-l-2 border-cyan-500/30 pl-4 bg-cyan-500/5 py-2 rounded-r-lg">
                    {selectedSnippet.deskripsi}
                  </p>
                )}

                <div className="glass rounded-xl overflow-hidden border border-slate-700/50 relative">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-950/50 border-b border-white/5">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
                    </div>
                    <button
                      onClick={() => handleCopy(selectedSnippet.isi)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                        isCopied
                          ? "bg-green-500/20 border-green-500/50 text-green-400"
                          : "bg-slate-800/80 border-white/5 hover:bg-slate-700 text-slate-300"
                      }`}
                    >
                      {isCopied ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {isCopied ? "Copied!" : "Copy Code"}
                    </button>
                  </div>
                  <SyntaxHighlighter
                    language={selectedSnippet.language || "javascript"}
                    style={atomDark}
                    customStyle={{
                      margin: 0,
                      padding: "1.5rem",
                      background: "transparent",
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                    }}
                    showLineNumbers={true}
                  >
                    {selectedSnippet.isi}
                  </SyntaxHighlighter>
                </div>
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <div className="text-xs text-slate-500">
                  Shared by @{profile.username}
                </div>
                <button
                  onClick={() => setSelectedSnippet(null)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showListModal && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowListModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-bold text-white capitalize">
                    {listType}
                  </h2>
                </div>
                <button
                  onClick={() => setShowListModal(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-2 overflow-y-auto custom-scrollbar flex-1 min-h-[300px]">
                {isListLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                    <p className="text-xs text-slate-500">Loading users...</p>
                  </div>
                ) : listUsers.length > 0 ? (
                  <div className="space-y-1">
                    {listUsers.map((u) => (
                      <Link
                        key={u.id}
                        href={`/u/${u.username}`}
                        onClick={() => setShowListModal(false)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700/50 group"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
                          {u.avatar_url ? (
                            <Image
                              src={u.avatar_url}
                              alt={u.display_name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                              <UserIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-200 truncate group-hover:text-cyan-400 transition-colors">
                            {u.display_name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            @{u.username}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-cyan-400 transition-all" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-slate-600" />
                    </div>
                    <p className="text-slate-400 font-medium">
                      No {listType} yet
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      This list is currently empty.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <button
                  onClick={() => setShowListModal(false)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
