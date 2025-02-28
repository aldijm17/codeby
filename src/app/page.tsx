'use client'

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import LoginPage from './login/page';
import { useRouter } from 'next/navigation';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Navbar from '../components/Navbar';
import './globals.css';


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
}


export default function Home() {
  const [contekans, setContekans] = useState<Contekan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedContekan, setSelectedContekan] = useState<Contekan | null>(null);
  const router = useRouter();

  const LoginPage = () => {
    router.push('/login');
  };

  useEffect(() => {
    const fetchContekans = async () => {
      const { data, error } = await supabase
        .from('contekans')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) console.log("Error fetching contekans:", error);
      else setContekans(data as Contekan[]);
    };

    fetchContekans();
  }, []);


  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenPopup = (contekan: Contekan) => {
    setSelectedContekan(contekan);
  };

  const handleClosePopup = () => {
    setSelectedContekan(null);
  };

  const filteredContekans = contekans.filter(contekan =>
    contekan.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contekan.isi.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contekan.user_display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 p-4">

<Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="max-w-7xl mx-auto space-y-6 mt-5">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
          {filteredContekans.map((contekan) => (
            <div 
              key={contekan.id} 
              className="bg-gray-800 rounded-lg border border-gray-700 p-4 relative group h-64 flex flex-col"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold text-white">{contekan.judul}</h3>
                <div className="flex space-x-2">
                  {/* Tombol Copy */}
                  <button
                    onClick={() => handleCopy(contekan.isi, contekan.id)}
                    className={`p-1 rounded-md transition-colors duration-200 ${
                      copiedId === contekan.id 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {copiedId === contekan.id ? (
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
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
                        xmlns="http://www.w3.org/2000/svg"
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
                </div>
              </div>
              <p className="text-white text-md">{contekan.deskripsi}</p>

              <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                <SyntaxHighlighter language="javascript" style={atomDark} className="p-4 rounded-lg">
                  {contekan.isi}
                </SyntaxHighlighter>
              </div>
              <button
                onClick={() => handleOpenPopup(contekan)}
                className="mt-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1 px-2 rounded-md transition duration-200"
              >
                Lihat Full
              </button>
              <p className="text-gray-400 text-md mt-2">Created With ❤ by: {contekan.user_display_name}</p>
            </div>
            
          ))}
        </div>

        {selectedContekan && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg max-w-full w-full h-full overflow-hidden">
              <h2 className="text-xl font-semibold mb-2">{selectedContekan.judul}</h2>
              <p className="text-white text-md">{selectedContekan.deskripsi}</p>
              <div className="max-h-[80vh] overflow-y-auto">
                <SyntaxHighlighter language="javascript" style={atomDark} className="p-4 rounded-lg">
                  {selectedContekan.isi}
                </SyntaxHighlighter>
              </div>
              <button
                onClick={handleClosePopup}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-2 rounded-md transition duration-200"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}