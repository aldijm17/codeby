"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import {
  Camera,
  ArrowLeft,
  Save,
  Loader2,
  Lock,
  User as UserIcon,
  Mail,
  Type,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface ProfileData {
  display_name: string;
  username: string;
  avatar_url: string | null;
  role: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [profile, setProfile] = useState<ProfileData>({
    display_name: "",
    username: "",
    avatar_url: null,
    role: "user"
  });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/login");
      return;
    }
    
    setUser(user);
    
    // Fetch profile data
    const { data, error } = await supabase
      .from("profiles")
      .select("display_name, username, avatar_url, role")
      .eq("id", user.id)
      .single();
      
    if (data && !error) {
      setProfile({
        display_name: data.display_name || user.user_metadata?.display_name || "",
        username: data.username || user.user_metadata?.username || "",
        avatar_url: data.avatar_url || user.user_metadata?.avatar_url || null,
        role: data.role || "user"
      });
      if (data.avatar_url || user.user_metadata?.avatar_url) {
        setAvatarPreview(data.avatar_url || user.user_metadata?.avatar_url);
      }
    }
    
    setIsLoading(false);
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg("Image size must be less than 2MB");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setErrorMsg("");
    }
  };

  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return profile.avatar_url;

    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    try {
      // First ensure the avatars bucket exists or just try uploading
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err: any) {
      console.error("Error uploading avatar:", err);
      if (err.message.includes("does not exist") || err.message.includes("Bucket not found")) {
         throw new Error("Storage bucket 'avatars' not found. Please ask admin to create it and make it public.");
      }
      throw new Error(`Avatar upload failed: ${err.message}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setErrorMsg("");
    setSuccessMsg("");
    setIsSaving(true);
    
    // Validate passwords
    if (password && password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      setIsSaving(false);
      return;
    }
    if (password && password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      setIsSaving(false);
      return;
    }

    try {
      // 1. Check if username is already taken by another user
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", profile.username)
        .neq("id", user.id)
        .single();
        
      if (existingUser) {
        throw new Error("Username is already taken by another user.");
      }

      // 2. Upload new avatar if selected
      let finalAvatarUrl = profile.avatar_url;
      if (avatarFile) {
        finalAvatarUrl = await uploadAvatar(user.id);
      }

      // 3. Update Supabase Auth metadata & password
      const authUpdates: any = {
        data: {
          display_name: profile.display_name,
          username: profile.username,
          avatar_url: finalAvatarUrl,
        }
      };
      
      if (password) {
        authUpdates.password = password;
      }

      const { error: authError } = await supabase.auth.updateUser(authUpdates);
      if (authError) throw authError;

      // 4. Update Profile table
      const { error: dbError } = await supabase
        .from("profiles")
        .update({
          display_name: profile.display_name,
          username: profile.username,
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (dbError) throw dbError;

      setProfile({ ...profile, avatar_url: finalAvatarUrl });
      setPassword("");
      setConfirmPassword("");
      setAvatarFile(null);
      
      setSuccessMsg("Profile updated successfully!");
      
      // Auto-hide success message
      setTimeout(() => {
        setSuccessMsg("");
      }, 3000);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#0f172a] items-center justify-center">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );
  }

  // Determine back link based on role
  const backLink = profile.role === "super_admin" ? "/super-admin" : "/dashboard";

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 py-10 px-4 sm:px-6 lg:px-8 relative z-0 overflow-y-auto">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-700/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-700/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] -z-20 pointer-events-none"></div>

      <div className="max-w-3xl mx-auto">
        <Link href={backLink} className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 font-semibold mb-8 group bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 backdrop-blur-md transition-all">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to {profile.role === "super_admin" ? "Control Panel" : "Dashboard"}
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden relative"
        >
          <div className="px-6 sm:px-8 py-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                <UserIcon className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white">Profile Settings</h1>
                <p className="text-sm text-slate-400">Manage your account details and security</p>
              </div>
            </div>
            {profile.role === "super_admin" && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 text-xs font-bold uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4" /> Super Admin
              </div>
            )}
          </div>

          <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-8">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                {errorMsg}
              </div>
            )}
            
            {successMsg && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                {successMsg}
              </div>
            )}

            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-800">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-800 border-4 border-slate-700 shadow-xl group-hover:border-cyan-500/50 transition-colors">
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt="Avatar Preview" width={112} height={112} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-12 h-12 text-slate-500 m-auto mt-7" />
                  )}
                </div>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-full shadow-lg border-2 border-slate-900 transition-transform hover:scale-105"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarSelect} 
                  accept="image/png, image/jpeg, image/webp" 
                  className="hidden" 
                />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold text-slate-200">Profile Photo</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-sm">
                  We recommend a square image at least 400x400px. JPG, PNG or WEBP formats. Less than 2MB.
                </p>
                <button 
                   type="button"
                   onClick={() => fileInputRef.current?.click()}
                   className="mt-3 text-sm font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  Change Photo
                </button>
              </div>
            </div>

            {/* Basic Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Type className="w-3 h-3" /> Display Name
                </label>
                <input
                  type="text"
                  value={profile.display_name}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  className="w-full bg-slate-950/50 border border-slate-700/60 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all font-medium"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <UserIcon className="w-3 h-3" /> Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">@</span>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                    className="w-full bg-slate-950/50 border border-slate-700/60 rounded-xl pl-9 pr-4 py-3 text-slate-200 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all font-mono"
                    placeholder="johndoe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <input
                  type="text"
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-500 font-medium cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 ml-1 mt-1">Email cannot be changed from this panel.</p>
              </div>
            </div>

            {/* Password Verification */}
            <div className="pt-6 border-t border-slate-800">
              <h3 className="text-lg font-bold text-slate-200 mb-1">Change Password</h3>
              <p className="text-sm text-slate-400 mb-6">Leave blank if you don't want to change your password.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Lock className="w-3 h-3" /> New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700/60 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Lock className="w-3 h-3" /> Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700/60 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 flex justify-end gap-4">
              <Link
                href={backLink}
                className="px-6 py-3 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-cyan-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
