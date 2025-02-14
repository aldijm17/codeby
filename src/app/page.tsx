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

  // Load data dari Supabase saat pertama kali render
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

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-blue-600">Contekan Kodingan</h1>
        <div className="bg-white shadow-lg rounded-lg p-8 mb-6">
          <div className="mb-5">
            <label className="block text-gray-800 text-lg font-semibold mb-2">
              Judul Contekan
            </label>
            <input 
              className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" 
              type="text" 
              placeholder="Judul..."
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <label className="block text-gray-800 text-lg font-semibold mb-2">
              Isi Contekan
            </label>
            <textarea 
              className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" 
              rows={4} 
              placeholder="Masukkan kodingan..."
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
            ></textarea>
          </div>
          <button 
            onClick={tambahContekan}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            Simpan Contekan
          </button>
        </div>
        <h2 className="text-2xl font-semibold mb-3">Daftar Contekan:</h2>
        <ul className="space-y-4">
          {contekans.map((contekan) => (
            <li key={contekan.id} className="bg-white shadow-lg rounded-lg p-5 transition-transform transform hover:scale-105">
              <h3 className="text-xl font-bold mb-2 text-gray-800">{contekan.judul}</h3>
              <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto">{contekan.isi}</pre>
              <button 
                onClick={() => hapusContekan(contekan.id)}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                Hapus
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
