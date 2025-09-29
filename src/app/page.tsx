'use client'

import { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Link from 'next/link';
import './globals.css';

// ... (Inisialisasi Supabase dan tipe data tetap sama)
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

// ... (Komponen Ikon tetap sama)
const SearchIcon = () => ( <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg> );
const CopyIcon = () => ( <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> );
const CheckIcon = () => ( <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> );
const UserIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> );
const LoadingSpinner = () => ( <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div> );


export default function Home() {
    const [contekans, setContekans] = useState<Contekan[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'terbaru' | 'terlama'>('terbaru');
    const [selectedContekan, setSelectedContekan] = useState<Contekan | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchContekans = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase.from('contekans').select('*');
                if (error) throw error;
                setContekans(data as Contekan[]);
            } catch (err) {
                console.error("Error fetching: ", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchContekans();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);


    const sortedAndFilteredContekans = useMemo(() => {
        return contekans
            .filter(c => c.judul.toLowerCase().includes(searchQuery.toLowerCase()) || (c.deskripsi && c.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())))
            .sort((a, b) => {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return activeFilter === 'terbaru' ? dateB - dateA : dateA - dateB;
            });
    }, [contekans, searchQuery, activeFilter]);

    const handleItemClick = (contekan: Contekan) => {
        setSelectedContekan(contekan);
        setIsPanelOpen(true);
        setCopied(false);
    };
    const handleClosePanel = () => {
        setIsPanelOpen(false);
    };
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    {/* MODIFIKASI: Ukuran teks header dibuat responsif */}
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">CodeBy</h1>
                    <p className="mt-2 text-base sm:text-lg text-gray-400">Daftar Contekan Koding</p>
                </header>
                
                {/* MODIFIKASI: Bar pencarian & filter dibuat tidak sticky di mobile (hanya sticky di layar sm ke atas) dan tata letaknya dioptimalkan */}
                <div className="space-y-4 mb-8 sm:sticky top-4 z-20 sm:bg-gray-900/80 sm:backdrop-blur-sm sm:py-3 sm:px-4 sm:rounded-xl sm:border sm:border-gray-800">
                    <div className="relative flex-1 w-full">
                        <input type="text" placeholder="Cari..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        <SearchIcon />
                    </div>
                    {/* MODIFIKASI: Wrapper baru untuk filter dan dropdown agar sejajar di mobile */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-2">
                            <button onClick={() => setActiveFilter('terbaru')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeFilter === 'terbaru' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}>Terbaru</button>
                            <button onClick={() => setActiveFilter('terlama')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeFilter === 'terlama' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}>Terlama</button>
                        </div>
                        
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                                aria-label="Account menu"
                            >
                                <UserIcon />
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-50">
                                    <Link href="/login" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Login</Link>
                                    <Link href="/register/admin" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Register</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <main className="space-y-3">
                    {isLoading ? <LoadingSpinner /> : (
                        sortedAndFilteredContekans.map(contekan => (
                            <div key={contekan.id} onClick={() => handleItemClick(contekan)} className="bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:border-blue-500 hover:bg-gray-700/50">
                                <h3 className="font-semibold text-white truncate">{contekan.judul}</h3>
                                <p className="text-sm text-gray-400 truncate">{contekan.deskripsi || "Tidak ada deskripsi"}</p>
                            </div>
                        ))
                    )}
                    {!isLoading && sortedAndFilteredContekans.length === 0 && <div className="text-center py-16"><h3 className="text-2xl font-semibold text-gray-500">Tidak Ada Hasil</h3></div>}
                </main>
                
                {/* Panel Off-Canvas tidak perlu diubah, sudah responsif */}
                <div className={`fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-2/5 bg-gray-900/50 backdrop-blur-sm z-40 transition-transform duration-300 ease-in-out ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="bg-gray-800 h-full w-full shadow-2xl flex flex-col border-l border-gray-700">
                        {selectedContekan && (
                            <>
                                <header className="p-4 border-b border-gray-700 flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{selectedContekan.judul}</h2>
                                        <p className="text-sm text-gray-400 mt-1">{selectedContekan.deskripsi}</p>
                                    </div>
                                    <button onClick={handleClosePanel} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                                </header>
                                <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                                    <SyntaxHighlighter language="javascript" style={atomDark} className="rounded-lg !text-base">{selectedContekan.isi}</SyntaxHighlighter>
                                </div>
                                <footer className="p-4 border-t border-gray-700">
                                     <button onClick={() => handleCopy(selectedContekan.isi)} className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors duration-200 ${copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                        {copied ? <CheckIcon /> : <CopyIcon />}
                                        <span className="text-sm font-semibold">{copied ? 'Tersalin!' : 'Salin Kode'}</span>
                                    </button>
                                </footer>
                            </>
                        )}
                    </div>
                </div>
                {isPanelOpen && <div onClick={handleClosePanel} className="fixed inset-0 bg-black/30 z-30"></div>}
            </div>
        </div>
    );
}