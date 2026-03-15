"use client";

import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  Camera,
  Save,
  Loader2,
  Lock,
  Mail,
  ArrowLeft,
  Users,
  UserPlus,
  Code2,
} from "lucide-react";
import Link from "next/link";
import "../../globals.css";

const Modal = ({
  isOpen,
  title,
  message,
  onClose,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}) => (
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
          className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 w-full max-w-sm z-50 text-center"
        >
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-slate-300 mb-6">{message}</p>
          <button
            onClick={() => {
              if (title === "Sukses" || title === "Selesai") {
                window.location.href = "/dashboard";
              } else {
                onClose();
              }
            }}
            className="w-full px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-900/20 transition-all font-semibold"
          >
            OK
          </button>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    snippets: 0,
  });

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/login");
        return;
      }

      setUser(user);
      setDisplayName(user.user_metadata?.display_name || "");
      setUsername(user.user_metadata?.username || "");
      setAvatarUrl(user.user_metadata?.avatar_url || "");

      const { count: followers } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", user.id);

      const { count: following } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", user.id);

      const { count: snippetCount } = await supabase
        .from("contekans")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setStats({
        followers: followers || 0,
        following: following || 0,
        snippets: snippetCount || 0,
      });

      setIsLoading(false);
    };

    fetchUser();
  }, [router]);

  const showNotification = (title: string, message: string) => {
    setModalState({ isOpen: true, title, message });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error("Pilih foto dahulu.");
      }

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      showNotification("Sukses", "Foto profil berhasil diperbarui!");
    } catch (error: any) {
      showNotification("Gagalku", error.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error("Password baru dan konfirmasi password tidak sama!");
        }
        if (newPassword.length < 6) {
          throw new Error("Password minimal 6 karakter.");
        }
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (passwordError) throw passwordError;
      }

      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          username: username,
        },
      });

      if (metadataError) throw metadataError;

      const { error: syncError } = await supabase.from("profiles").upsert({
        id: user?.id,
        username: username,
        display_name: displayName,
        avatar_url: avatarUrl,
      });

      if (syncError) throw syncError;

      setNewPassword("");
      setConfirmPassword("");
      showNotification("Selesai", "Profil berhasil diperbarui!");
    } catch (error: any) {
      showNotification("Gagal Menyimpan", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10 relative">
          <div className="absolute top-1/2 left-0 w-[300px] h-[100px] bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none -z-10 -translate-y-1/2" />
          
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-2xl border border-slate-700/50 transition-all text-slate-400 hover:text-white shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 tracking-tight">
                Profile Settings
              </h1>
              <p className="text-sm sm:text-base text-slate-400 mt-1.5">
                Manage your personal information and security.
              </p>
            </div>
          </div>
          
          <div className="md:ml-auto flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-8 px-6 py-3.5 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
              <Link href={`/u/${username}`} className="text-center group/stat">
                <p className="text-xl font-bold text-white leading-none group-hover/stat:text-cyan-400 transition-colors">
                  {stats.followers}
                </p>
                <p className="text-[10px] text-slate-500 uppercase mt-1 tracking-widest font-bold">
                  Followers
                </p>
              </Link>
              <div className="w-px h-10 bg-slate-700/50" />
              <Link href={`/u/${username}`} className="text-center group/stat">
                <p className="text-xl font-bold text-white leading-none group-hover/stat:text-cyan-400 transition-colors">
                  {stats.following}
                </p>
                <p className="text-[10px] text-slate-500 uppercase mt-1 tracking-widest font-bold">
                  Following
                </p>
              </Link>
              <div className="w-px h-10 bg-slate-700/50" />
              <div className="text-center">
                <p className="text-xl font-bold text-white leading-none">
                  {stats.snippets}
                </p>
                <p className="text-[10px] text-slate-500 uppercase mt-1 tracking-widest font-bold">
                  Snippets
                </p>
              </div>
            </div>
            <Link
              href={`/u/${username}`}
              className="px-6 py-3.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30 transition-all font-bold text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
            >
              <UserIcon className="w-4 h-4" />
              <span>View Profile</span>
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-700/50 overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] bg-slate-900/60 backdrop-blur-3xl relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none -z-10" />
          <div className="p-8">
            <form onSubmit={handleProfileUpdate} className="space-y-8">
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-800/60">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-800 bg-slate-800 flex items-center justify-center relative">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Avatar"
                        width={112}
                        height={112}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-12 h-12 text-slate-500" />
                    )}

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {uploadingAvatar ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <Camera className="w-6 h-6 text-white" />
                      )}
                    </div>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-white">
                    Profile Picture
                  </h3>
                  <p className="text-sm text-slate-400 mt-1 max-w-sm">
                    Upload a new avatar larger than 256x256px. Click the image
                    to change.
                  </p>
                </div>
              </div>

              <div className="space-y-5 pb-8 border-b border-slate-800/60">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-cyan-400" />
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 ml-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Asit"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/80 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:outline-none transition-all text-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 ml-1">
                      Username / Handle
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                        @
                      </span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="asit_dev"
                        className="w-full pl-9 pr-4 py-3 bg-slate-900/50 border border-slate-700/80 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:outline-none transition-all text-slate-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={user?.email || ""}
                      readOnly
                      disabled
                      className="w-full pl-11 pr-4 py-3 bg-slate-800/30 border border-slate-800 rounded-xl text-slate-500 cursor-not-allowed font-medium"
                    />
                  </div>
                  <p className="text-xs text-slate-500 ml-1">
                    Email cannot be changed directly.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-cyan-400" />
                  Security
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 ml-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Leave blank to keep current"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/80 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:outline-none transition-all text-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 ml-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/80 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:outline-none transition-all text-slate-200"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 flex justify-end gap-3 border-t border-slate-800/60 mt-4">
                <Link
                  href="/dashboard"
                  className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all border border-transparent hover:border-slate-600"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
      />
    </div>
  );
}
