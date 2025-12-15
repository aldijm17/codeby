'use client'

import { useState, useEffect, useMemo, FormEvent, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// ... (Inisialisasi Supabase)
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

// -- Komponen Ikon --
const PlusIcon = () => (<svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>);
const SearchIcon = () => (<svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const LogoutIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>);
const LoadingSpinner = () => (<div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>);

// -- BARU: Komponen Modal Profesional --
const Modal = ({ isOpen, title, children, footer }: { isOpen: boolean; title: string; children: ReactNode; footer: ReactNode }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6 w-full max-w-md animate-fade-in-up">
                <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
                <div className="text-gray-300">{children}</div>
                <div className="mt-6 flex justify-end space-x-3">
                    {footer}
                </div>
            </div>
        </div>
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
  const [formState, setFormState] = useState({ id: '', judul: '', isi: '', deskripsi: '' });
  
  // -- BARU: State untuk mengelola modal --
  const [modalState, setModalState] = useState({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: () => {},
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

  // -- BARU: Fungsi untuk menampilkan & menutup modal --
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
    setFormState({ id: '', judul: '', isi: '', deskripsi: '' });
    setViewMode('add');
  };

  const handleEdit = (contekan: Contekan) => {
    setFormState(contekan);
    setViewMode('edit');
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!user) return;

      if (viewMode === 'add') {
        const { data, error } = await supabase
            .from('contekans')
            .insert([{
                judul: formState.judul,
                isi: formState.isi,
                deskripsi: formState.deskripsi,
                user_display_name: user.user_metadata?.display_name || user.email,
                user_id: user.id
            }])
            .select(); 

        if (error) {
            showNotification("Gagal Menambahkan", error.message);
        } else if (data) {
            setContekans(prev => [data[0], ...prev]);
            setCurrentItem(data[0]);
            setViewMode('view');
            showNotification("Berhasil", "Contekan baru telah berhasil disimpan.");
        }
      } else if (viewMode === 'edit') {
        const { data, error } = await supabase
          .from('contekans')
          .update({
            judul: formState.judul,
            isi: formState.isi,
            deskripsi: formState.deskripsi
          })
          .eq('id', formState.id)
          .select();

        if (error) {
            showNotification("Gagal Memperbarui", error.message);
        } else if (data) {
            setContekans(prev => prev.map(c => c.id === formState.id ? data[0] : c));
            setCurrentItem(data[0]);
            setViewMode('view');
            showNotification("Berhasil", "Contekan telah berhasil diperbarui.");
        }
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
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><LoadingSpinner /></div>;
  }

  return (
    <>
      <div className="h-screen w-screen bg-gray-900 text-white flex flex-col md:flex-row overflow-hidden">
        <aside className="w-full md:w-1/3 lg:w-1/4 bg-gray-900 border-r border-gray-800 flex flex-col">
          <header className="p-4 border-b border-gray-800 flex justify-between items-center">
            <div>
              <h1 className="font-bold text-lg">Admin Dashboard</h1>
              <p className="text-sm text-gray-400">Welcome, {user?.user_metadata?.display_name || user?.email}</p>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-full hover:bg-gray-700 transition-colors" title="Logout"><LogoutIcon /></button>
          </header>
          <div className="p-4 space-y-4">
            <button onClick={handleAddNew} className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"><PlusIcon /> Tambah Baru</button>
            <div className="flex space-x-2">
                <button onClick={() => setFilter('all')} className={`w-full py-2 px-4 rounded-lg transition-colors ${filter === 'all' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Semua</button>
                <button onClick={() => setFilter('mine')} className={`w-full py-2 px-4 rounded-lg transition-colors ${filter === 'mine' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Contekan Saya</button>
            </div>
            <div className="relative"><input type="text" placeholder="Cari contekan..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"/><SearchIcon /></div>
          </div>
          <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800 p-2">
            {filteredContekans.map(c => (
              <a key={c.id} onClick={() => { setCurrentItem(c); setViewMode('view'); }} className={`block p-3 rounded-lg cursor-pointer mb-1 transition-colors ${currentItem?.id === c.id && viewMode !== 'add' ? 'bg-blue-600/20 text-blue-300' : 'hover:bg-gray-800'}`}>
                <h4 className="font-semibold text-white truncate">{c.judul}</h4>
                <p className="text-xs text-gray-400 truncate">{c.deskripsi}</p>
              </a>
            ))}
          </nav>
        </aside>

        <main className="flex-1 bg-gray-800/50 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800 p-6 sm:p-8">
          {viewMode === 'view' && currentItem && (
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{currentItem.judul}</h2>
                  <p className="text-gray-400 mt-1">{currentItem.deskripsi}</p>
                  <p className="text-xs text-gray-500 mt-2">Dibuat oleh: {currentItem.user_display_name}</p>
                </div>
                <div className="flex space-x-2">
                   {user && currentItem && user.id === currentItem.user_id && (
                      <>
                          <button onClick={() => handleEdit(currentItem)} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg">Edit</button>
                          <button onClick={() => handleDelete(currentItem.id)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg">Hapus</button>
                      </>
                   )}
                </div>
              </div>
              <SyntaxHighlighter language="javascript" style={atomDark} className="rounded-lg !p-4 !text-base">{currentItem.isi}</SyntaxHighlighter>
            </div>
          )}

          {(viewMode === 'add' || viewMode === 'edit') && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">{viewMode === 'add' ? 'Tambah Contekan Baru' : 'Edit Contekan'}</h2>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <input type="text" placeholder="Judul Contekan" value={formState.judul} onChange={(e) => setFormState({...formState, judul: e.target.value})} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg" required/>
                <textarea placeholder="Deskripsi singkat..." value={formState.deskripsi} onChange={(e) => setFormState({...formState, deskripsi: e.target.value})} className="w-full h-24 p-2 bg-gray-700 border border-gray-600 rounded-lg"/>
                <textarea placeholder="// Masukkan kode di sini" value={formState.isi} onChange={(e) => setFormState({...formState, isi: e.target.value})} className="w-full h-48 p-2 bg-gray-700 border border-gray-600 rounded-lg font-mono" required/>
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setViewMode('view')} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg">Batal</button>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">Simpan</button>
                </div>
              </form>
            </div>
          )}

          {!currentItem && viewMode === 'view' && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <h2 className="text-xl font-semibold">Selamat Datang di Dashboard</h2>
                  <p>Pilih item dari daftar di kiri atau tambah contekan baru.</p>
              </div>
          )}
        </main>
      </div>
      
      {/* Elemen Modal yang akan dipanggil */}
      <Modal
          isOpen={modalState.isOpen}
          title={modalState.title}
          footer={
              <>
                  <button onClick={closeModal} className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                      {modalState.isConfirmation ? "Batal" : "Tutup"}
                  </button>
                  {modalState.isConfirmation && (
                      <button onClick={modalState.onConfirm} className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                          Ya, Hapus
                      </button>
                  )}
              </>
          }
      >
          <p>{modalState.message}</p>
      </Modal>
    </>
  );
}