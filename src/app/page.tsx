"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Contekan {
  id: string;
  judul: string;
  isi: string;
  created_at: string;
}

export default function Home() {
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [contekans, setContekans] = useState<Contekan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false); // State untuk kontrol visibilitas form

  useEffect(() => {
    const fetchContekans = async () => {
      const { data, error } = await supabase
        .from('contekans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.log("Error fetching contekans:", error);
      else setContekans(data as Contekan[]);
    };

    fetchContekans();
  }, []);

  const tambahContekan = async () => {
    if (judul && isi) {
      const { data, error } = await supabase
        .from('contekans')
        .insert([{ judul, isi }])
        .select();

      if (error) console.log("Error adding contekan:", error);
      else setContekans([data[0], ...contekans]);

      setJudul('');
      setIsi('');
      setIsVisible(false); // Sembunyikan form setelah tambah data berhasil
    }
  };

  const hapusContekan = async (id: string) => {
    const { error } = await supabase
      .from('contekans')
      .delete()
      .eq('id', id);

    if (error) console.log("Error deleting contekan:", error);
    else setContekans(contekans.filter(contekan => contekan.id !== id));
  };

  const filteredContekans = contekans.filter(contekan =>
    contekan.judul.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center mb-8 text-blue-900">Artikel</h1>

        {/* Tombol Tampilkan Form */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition duration-200 ease-in-out"
          >
            {isVisible ? "Tutup Form" : "Tambah Artikel"}
          </button>
        </div>

        {/* Form Tambah Artikel, hanya tampil jika isVisible === true */}
        {isVisible && (
          <div className="bg-white shadow-2xl rounded-lg p-8 mb-6 border border-gray-300 transition-transform transform hover:scale-105">
            <div className="mb-5">
              <label className="block text-gray-800 text-lg font-semibold mb-2">
                Judul Artikel
              </label>
              <input 
                className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200 ease-in-out" 
                type="text" 
                placeholder="Judul..."
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
              />
            </div>
            <div className="mb-5">
              <label className="block text-gray-800 text-lg font-semibold mb-2">
                Isi Artikel
              </label>
              <textarea 
                className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200 ease-in-out" 
                rows={4} 
                placeholder="Masukkan kodingan..."
                value={isi}
                onChange={(e) => setIsi(e.target.value)}
              ></textarea>
            </div>
            <button 
              onClick={tambahContekan}
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out">
              Upload Artikel
            </button>
          </div>
        )}

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari artikel berdasarkan judul..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-3xl font-semibold mb-4 text-gray-800">Daftar Artikel:</h2>
        <ul className="space-y-4">
          {filteredContekans.map((contekan) => (
            <li key={contekan.id} className="bg-white shadow-lg rounded-lg p-5 border border-gray-300 transition duration-200 ease-in-out hover:shadow-2xl hover:bg-gray-50">
              <h3 className="text-xl font-bold mb-2 text-gray-800">{contekan.judul}</h3>
              <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto">{contekan.isi}</pre>
              <button 
                onClick={() => hapusContekan(contekan.id)}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200 ease-in-out">
                Hapus
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
