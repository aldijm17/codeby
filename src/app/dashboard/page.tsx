'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Contekan {
  id: string;
  judul: string;
  isi: string;
  created_at: string;
}

export default function Dashboard() {
  const [contekans, setContekans] = useState<Contekan[]>([]);
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchContekans = async () => {
      const { data, error } = await supabase.from('contekans').select('*');
      if (error) console.error(error);
      setContekans(data || []);
    };

    fetchContekans();
  }, []);

  const tambahContekan = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('contekans').insert([{ judul, isi }]).select();

if (error) {
  console.error(error);
  return;
}

if (data && data.length > 0) {
  setContekans([...contekans, data[0]]);
} else {
  console.error("Insert berhasil tetapi tidak ada data yang dikembalikan.");
}

  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <button onClick={logout} className="absolute top-4 right-4 bg-red-600 px-4 py-2 rounded">
        Logout
      </button>

      <h1 className="text-3xl mb-4">Dashboard</h1>

      <form onSubmit={tambahContekan} className="space-y-2">
        <input
          type="text"
          placeholder="Judul"
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          className="p-2 w-full bg-gray-800 rounded"
        />
        <textarea
          placeholder="Isi"
          value={isi}
          onChange={(e) => setIsi(e.target.value)}
          className="p-2 w-full bg-gray-800 rounded"
        />
        <button type="submit" className="p-2 w-full bg-blue-600 rounded">
          Tambah Contekan
        </button>
      </form>

      <ul className="mt-4 space-y-2">
        {contekans.map((contekan) => (
          <li key={contekan.id} className="p-4 bg-gray-800 rounded">
            <h2 className="text-xl">{contekan.judul}</h2>
            <p>{contekan.isi}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
