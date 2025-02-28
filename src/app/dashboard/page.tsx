'use client'

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Environment variables validation
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

interface Contekan {
  id: string;
  judul: string;
  isi: string;
  created_at: string;
  deskripsi: string;
  user_display_name: string;
}

export default function Home() {
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [contekans, setContekans] = useState<Contekan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [deletionTimer, setDeletionTimer] = useState<NodeJS.Timeout | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          router.push("/login");
        } else {
          setUser(data.session.user);
        }
      } catch (error) {
        console.error("Auth error:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Fetch contekans on mount
  useEffect(() => {
    if (!user) return; // Don't fetch data until user is authenticated
    
    const fetchContekans = async () => {
      try {
        const { data, error } = await supabase
          .from('contekans')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;
        setContekans(data as Contekan[]);
      } catch (error) {
        console.error("Error fetching contekans:", error);
      }
    };

    fetchContekans();
  }, [user]);

  // Deletion countdown effect
  useEffect(() => {
    if (deletingId && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      
      setDeletionTimer(timer);
      
      return () => clearTimeout(timer);
    } else if (deletingId && countdown === 0) {
      confirmDelete(deletingId);
    }
  }, [deletingId, countdown]);

  const tambahContekan = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!judul || !isi || !user) return;

    try {
      const { data, error } = await supabase
        .from('contekans')
        .insert([{ 
          judul, 
          isi,
          deskripsi: deskripsi || null,
          user_display_name: user.user_metadata?.display_name || user.email // Simpan display_name
        }])
        .select();

      if (error) throw error;
      
      setContekans(prev => [...(data as Contekan[]), ...prev]);
      setJudul('');
      setIsi('');
      setDeskripsi('');
      setShowForm(false);
    } catch (error) {
      console.error("Error adding contekan:", error);
    }
  }, [judul, isi, deskripsi, user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const mulaiHapusContekan = (id: string) => {
    setDeletingId(id);
    setCountdown(3);
  };

  const batalkanHapus = () => {
    if (deletionTimer) {
      clearTimeout(deletionTimer);
    }
    setDeletingId(null);
    setCountdown(3);
  };

  const confirmDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contekans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setContekans(prev => prev.filter(contekan => contekan.id !== id));
    } catch (error) {
      console.error("Error deleting contekan:", error);
    } finally {
      setDeletingId(null);
      setCountdown(3);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  const filteredContekans = contekans.filter(contekan =>
    contekan.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contekan.isi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Its not "Loading", its just "waiting", because Next.TS does'n have delay.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      
      <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center">
        <h1 className="text-4xl font-bold text-white">Admin</h1>
      </div>
      <p className="text-gray-400 text-2xl">Welcome, {user?.user_metadata?.display_name || user?.email}</p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Cari contekan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
            disabled={deletingId !== null}
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Contekan
          </button>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
          >
            Log Out
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredContekans.map((contekan) => (
            <div 
              key={contekan.id} 
              className="bg-gray-800 rounded-lg border border-gray-700 p-4 relative group h-64 flex flex-col"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold text-white">{contekan.judul}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCopy(contekan.isi, contekan.id)}
                    className={`p-1 rounded-md transition-colors duration-200 ${
                      copiedId === contekan.id 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    disabled={deletingId !== null}
                  >
                    {copiedId === contekan.id ? (
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </button>

                  {deletingId === contekan.id ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-red-500 text-sm">Hapus dalam {countdown}s</span>
                      <button
                        onClick={batalkanHapus}
                        className="bg-gray-600 hover:bg-gray-700 text-white p-1 rounded-md"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => mulaiHapusContekan(contekan.id)}
                      className="text-gray-500 hover:text-red-500 transition-colors duration-200"
                      disabled={deletingId !== null}
                    >
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-400 text-sm">{contekan.deskripsi}</p>
              <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                <pre className="text-gray-300 bg-gray-800 p-4 rounded-lg whitespace-pre-wrap">
                  {contekan.isi}
                </pre>
              </div>
              <p className="text-gray-400 text-md mt-2">Ditambahkan oleh: {contekan.user_display_name}</p>
            </div>
          ))}
        </div>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Tambah Contekan Baru</h2>
              <button 
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={tambahContekan} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Judul Contekan"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <textarea
                  placeholder="Isi Contekan"
                  value={isi}
                  onChange={(e) => setIsi(e.target.value)}
                  className="w-full h-32 p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div className="">
              
              <textarea
                  placeholder="Tambahkan deskripsi..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full h-32 p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
              ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
              >
                Tambah Contekan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}