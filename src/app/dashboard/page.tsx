'use client';

import { useState, useEffect, useMemo, FormEvent, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
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
  Loader2
} from 'lucide-react';
import '../globals.css';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Contekan {
  id: string;
  judul: string;
  isi: string;
  created_at: string;
  deskripsi: string;
  user_display_name: string;
  user_id: string;
}

const Modal = ({ isOpen, title, children, footer, onClose }: { isOpen: boolean; title: string; children: ReactNode; footer: ReactNode; onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 w-full max-w-md z-50"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              {title}
            </h3>
            <div className="text-slate-300">{children}</div>
            <div className="mt-8 flex justify-end gap-3">
              {footer}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function DashboardPage() {
  const [contekans, setContekans] = useState<Contekan[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'mine'>('all');

  const [viewMode, setViewMode] = useState<'view' | 'add' | 'edit'>('view');
  const [currentItem, setCurrentItem] = useState<Contekan | null>(null);
  interface FormState {
    id: string;
    judul: string;
    isi: string;
    deskripsi: string;
    file_content?: string;
    file?: File | null;
  }

  const [formState, setFormState] = useState<FormState>({ id: '', judul: '', isi: '', deskripsi: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    isConfirmation: false,
  });

  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      const { data, error } = await supabase.from('contekans').select('*').order('created_at', { ascending: false });
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

  const closeModal = () => setModalState({ ...modalState, isOpen: false });

  const showNotification = (title: string, message: string) => {
    setModalState({
      isOpen: true,
      title,
      message,
      onConfirm: () => { },
      isConfirmation: false,
    });
  };

  const showConfirmation = (title: string, message: string, onConfirmAction: () => void) => {
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
    let filtered = contekans.filter(c => c.judul.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filter === 'mine' && user) {
      filtered = filtered.filter(c => c.user_id === user.id);
    }
    return filtered;
  }, [contekans, searchQuery, filter, user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleAddNew = () => {
    setFormState({ id: '', judul: '', isi: '', deskripsi: '', file: null, file_content: '' });
    setViewMode('add');
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleEdit = (contekan: Contekan) => {
    setFormState({ ...contekan, file: null }); // Don't carry over file object, but keep url
    setViewMode('edit');
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setIsUploading(true);

    try {
      let fileData = formState.file_content;

      if (formState.file) {
        if (formState.file.size > 1024 * 1024) { // 1MB limit
          throw new Error("File terlalu besar! Maksimal 1MB jika disimpan di database.");
        }
        fileData = await convertToBase64(formState.file);
      }

      if (viewMode === 'add') {
        const { data, error } = await supabase
          .from('contekans')
          .insert([{
            judul: formState.judul,
            isi: formState.isi,
            deskripsi: formState.deskripsi,
            user_display_name: user.user_metadata?.display_name || user.email,
            user_id: user.id,
            file_content: fileData
          }])
          .select();

        if (error) throw error;

        if (data) {
          setContekans(prev => [data[0], ...prev]);
          setCurrentItem(data[0]);
          setViewMode('view');
          showNotification("Berhasil", "Contekan baru (dengan file database) berhasil disimpan.");
        }
      } else if (viewMode === 'edit') {
        const { data, error } = await supabase
          .from('contekans')
          .update({
            judul: formState.judul,
            isi: formState.isi,
            deskripsi: formState.deskripsi,
            file_content: fileData
          })
          .eq('id', formState.id)
          .select();

        if (error) throw error;

        if (data) {
          setContekans(prev => prev.map(c => c.id === formState.id ? data[0] : c));
          setCurrentItem(data[0]);
          setViewMode('view');
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
        const { error } = await supabase.from('contekans').delete().eq('id', id);
        if (error) {
          showNotification("Gagal Menghapus", error.message);
        } else {
          const newContekans = contekans.filter(c => c.id !== id);
          setContekans(newContekans);
          setCurrentItem(newContekans.length > 0 ? newContekans[0] : null);
          setViewMode('view');
          showNotification("Berhasil", "Contekan telah berhasil dihapus.");
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Loader2 className="w-12 h-12 text-cyan-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-[#0f172a]">

        {/* Sidebar Overlay for Mobile */}
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

        {/* Sidebar */}
        <motion.aside
          className={`fixed md:relative w-72 h-full bg-slate-900 border-r border-slate-800 flex flex-col z-40 md:translate-x-0 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-slate-100">Dashboard</h1>
                <p className="text-xs text-slate-500 truncate max-w-[150px]">{user?.user_metadata?.display_name || user?.email}</p>
              </div>
            </div>
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
              <button onClick={() => setFilter('all')} className={`py-2 px-3 text-sm font-semibold rounded-lg transition-all ${filter === 'all' ? 'bg-slate-700 text-white shadow-lg shadow-black/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>All</button>
              <button onClick={() => setFilter('mine')} className={`py-2 px-3 text-sm font-semibold rounded-lg transition-all ${filter === 'mine' ? 'bg-slate-700 text-white shadow-lg shadow-black/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>My Snippets</button>
            </div>

            <div className="relative group">
              <input
                type="text"
                placeholder="Search snippets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-300 placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:outline-none transition-all group-hover:border-slate-600"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {filteredContekans.map(c => (
              <motion.div
                layoutId={c.id}
                key={c.id}
                onClick={() => { setCurrentItem(c); setViewMode('view'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                className={`group p-3 rounded-xl cursor-pointer transition-all border relative overflow-hidden ${currentItem?.id === c.id && viewMode !== 'add' ? 'bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-500/30 shadow-lg shadow-cyan-900/10' : 'border-transparent hover:bg-slate-800/50 hover:border-slate-700'}`}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <div className={`p-2.5 rounded-lg transition-colors ${currentItem?.id === c.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className={`font-bold text-sm truncate transition-colors ${currentItem?.id === c.id ? 'text-cyan-100' : 'text-slate-400 group-hover:text-slate-200'}`}>{c.judul}</h4>
                    <p className="text-xs text-slate-500 truncate group-hover:text-slate-400 transition-colors">{c.deskripsi || "No description"}</p>
                  </div>
                  {currentItem?.id === c.id && <ChevronRight className="w-4 h-4 text-cyan-500/50" />}
                </div>
                {currentItem?.id === c.id && <motion.div layoutId="active-glow" className="absolute inset-0 bg-cyan-500/5 z-0" />}
              </motion.div>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button onClick={handleLogout} className="flex items-center gap-2 w-full p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </motion.aside >

        {/* Main Content */}
        < main className="flex-1 flex flex-col h-full overflow-hidden relative" >
          {/* Mobile Header */}
          < div className="md:hidden p-4 border-b border-slate-800 flex items-center justify-between glass sticky top-0 z-20" >
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-bold text-slate-100">Dashboard</h1>
            <div className="w-10" /> {/* Spacer */}
          </div >

          <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
            <div className="max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                {viewMode === 'view' && currentItem && (
                  <motion.div
                    key="view"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                      <div>
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">{currentItem.judul}</h2>
                        <p className="text-slate-400 mt-2 leading-relaxed">{currentItem.deskripsi}</p>
                        <div className="flex items-center gap-2 mt-4 text-xs font-medium text-slate-500 bg-slate-800/50 inline-flex px-3 py-1 rounded-full">
                          <UserIcon className="w-3 h-3" />
                          <span>Created by {currentItem.user_display_name}</span>
                        </div>
                      </div>

                      {user && currentItem && user.id === currentItem.user_id && (
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => handleEdit(currentItem)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all font-medium">
                            <Edit className="w-4 h-4" /> Edit
                          </button>
                          <button onClick={() => handleDelete(currentItem.id)} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all font-medium">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      )}
                    </header>

                    <div className="glass rounded-xl overflow-hidden shadow-2xl border border-slate-700/50">
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border-b border-slate-700/50">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500/20 box-border border-red-500/50" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500/20 box-border border-yellow-500/50" />
                          <div className="w-3 h-3 rounded-full bg-green-500/20 box-border border-green-500/50" />
                        </div>
                      </div>
                      <SyntaxHighlighter
                        language="javascript"
                        style={atomDark}
                        customStyle={{
                          margin: 0,
                          padding: '1.5rem',
                          background: 'transparent',
                          fontSize: '0.95rem',
                          lineHeight: 1.6
                        }}
                        showLineNumbers={true}
                      >
                        {currentItem.isi}
                      </SyntaxHighlighter>
                    </div>
                  </motion.div>
                )}

                {(viewMode === 'add' || viewMode === 'edit') && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="max-w-3xl mx-auto"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                        {viewMode === 'add' ? <Plus className="w-6 h-6 text-cyan-400" /> : <Edit className="w-6 h-6 text-cyan-400" />}
                        {viewMode === 'add' ? 'Create New Snippet' : 'Edit Snippet'}
                      </h2>
                      <button type="button" onClick={() => setViewMode('view')} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 ml-1">Title</label>
                        <input
                          type="text"
                          placeholder="Snippet Title..."
                          value={formState.judul}
                          onChange={(e) => setFormState({ ...formState, judul: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:outline-none transition-all text-slate-200 placeholder:text-slate-600 text-lg font-semibold"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 ml-1">Description</label>
                        <textarea
                          placeholder="What does this snippet do?"
                          value={formState.deskripsi}
                          onChange={(e) => setFormState({ ...formState, deskripsi: e.target.value })}
                          className="w-full h-24 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:outline-none transition-all text-slate-200 placeholder:text-slate-600 resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 ml-1">Attachment (Optional)</label>
                        <div className="relative group">
                          <input
                            type="file"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Upload logic here could be separate, but handling in state for submit is easier
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
                            <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Current file stored in DB
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 ml-1">Code</label>
                        <div className="relative group">
                          <textarea
                            placeholder="// Paste your code here..."
                            value={formState.isi}
                            onChange={(e) => setFormState({ ...formState, isi: e.target.value })}
                            className="w-full h-96 p-4 bg-[#0B1120] border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:outline-none transition-all text-cyan-50 font-mono text-sm leading-relaxed"
                            required
                          />
                          <div className="absolute top-3 right-3 p-1.5 bg-slate-800 rounded opacity-50 text-xs font-mono text-slate-400 pointer-events-none">
                            JS/TS
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/50">
                        <button type="button" onClick={() => setViewMode('view')} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-all">
                          Cancel
                        </button>
                        <button type="submit" disabled={isUploading} className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-900/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          {isUploading ? 'Uploading...' : 'Save'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {!currentItem && viewMode === 'view' && !isLoading && (
                  <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center text-slate-500">
                    <div className="p-6 bg-slate-800/30 rounded-full mb-4">
                      <LayoutDashboard className="w-16 h-16 text-slate-700" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-400">Welcome to Dashboard</h2>
                    <p className="max-w-xs mx-auto mt-2 text-slate-600">Select a snippet from the sidebar or create a new one to get started.</p>
                    <button onClick={handleAddNew} className="mt-8 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm font-medium border border-slate-700">
                      Create Snippet
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main >
      </div >

      <Modal
        isOpen={modalState.isOpen}
        title={modalState.title}
        onClose={closeModal}
        footer={
          <>
            <button onClick={closeModal} className="px-5 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors font-medium">
              {modalState.isConfirmation ? "Cancel" : "Close"}
            </button>
            {modalState.isConfirmation && (
              <button onClick={modalState.onConfirm} className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg shadow-red-900/20 transition-all font-medium">
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