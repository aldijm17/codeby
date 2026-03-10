"use client";

import { useState, useEffect, use } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "../../globals.css";

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

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const [selectedSnippet, setSelectedSnippet] = useState<Contekan | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Social List States
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

      // 1. Get current user
      const {
        data: { user: authedUser },
      } = await supabase.auth.getUser();
      setCurrentUser(authedUser);

      // 2. Get profile by username
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

      // 3. Get contekans for this user
      const { data: contekansData } = await supabase
        .from("contekans")
        .select("*")
        .eq("user_id", profileData.id)
        .order("created_at", { ascending: false });

      setContekans((contekansData as Contekan[]) || []);

      // 4. Get social stats
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

      // 5. Check if current user follows this profile
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
        // Get users who follow this profile
        query = supabase
          .from("follows")
          .select("profiles:follower_id(*)")
          .eq("following_id", profile.id);
      } else {
        // Get users this profile follows
        query = supabase
          .from("follows")
          .select("profiles:following_id(*)")
          .eq("follower_id", profile.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Extract profiles from the relationship
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
        // Unfollow
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", profile.id);

        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);
      } else {
        // Follow
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
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Profile Header */}
        <div className="glass rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl bg-slate-900/40 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group shrink-0">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 bg-slate-800 flex items-center justify-center relative">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-16 h-16 text-slate-500" />
                )}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {profile.display_name}
                  </h1>
                  <p className="text-cyan-400 font-medium text-lg">
                    @{profile.username}
                  </p>
                </div>

                {currentUser?.id !== profile.id && (
                  <button
                    onClick={handleFollow}
                    disabled={isFollowLoading}
                    className={`ml-auto px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
                      isFollowing
                        ? "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                        : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/40 border border-cyan-400/20"
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

              {profile.bio && (
                <p className="text-slate-400 max-w-2xl mb-6">{profile.bio}</p>
              )}

              <div className="flex items-center justify-center md:justify-start gap-8 border-t border-slate-800/60 pt-6">
                <button
                  onClick={() => fetchFollowList("followers")}
                  className="text-center md:text-left hover:bg-slate-800/40 p-2 rounded-xl transition-colors group/stat"
                >
                  <p className="text-2xl font-bold text-white group-hover/stat:text-cyan-400 transition-colors">
                    {followersCount}
                  </p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                    Followers
                  </p>
                </button>
                <button
                  onClick={() => fetchFollowList("following")}
                  className="text-center md:text-left hover:bg-slate-800/40 p-2 rounded-xl transition-colors group/stat"
                >
                  <p className="text-2xl font-bold text-white group-hover/stat:text-cyan-400 transition-colors">
                    {followingCount}
                  </p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                    Following
                  </p>
                </button>
                <div className="text-center md:text-left p-2">
                  <p className="text-2xl font-bold text-white">
                    {contekans.length}
                  </p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                    Snippets
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Snippets List */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Code2 className="w-6 h-6 text-cyan-400" />
            Public Snippets
          </h2>

          {contekans.length > 0 ? (
            <div className="grid gap-4">
              {contekans.map((c) => (
                <motion.div
                  key={c.id}
                  layoutId={c.id}
                  onClick={() => setSelectedSnippet(c)}
                  className="glass group p-6 rounded-2xl cursor-pointer hover:bg-slate-800/60 transition-all border border-slate-700/30 hover:border-cyan-500/50 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-slate-800/50 text-cyan-400 border border-slate-700/50 group-hover:scale-110 transition-transform">
                          <FileText className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-100 truncate group-hover:text-cyan-300 transition-colors">
                          {c.judul}
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
            <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
              <Code2 className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500">
                This user hasn't posted any snippets yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Snippet View Modal */}
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

      {/* Follower/Following List Modal */}
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
                            <img
                              src={u.avatar_url}
                              alt={u.display_name}
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
