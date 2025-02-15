'use client'

import { useState, useEffect, useCallback } from 'react';
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
const [showForm, setShowForm] = useState(false);
const [copiedId, setCopiedId] = useState<string | null>(null); // State untuk tracking copy

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

const tambahContekan = useCallback(async (e: React.FormEvent) => {
e.preventDefault();
if (judul && isi) {
const { data, error } = await supabase
.from('contekans')
.insert([{ judul, isi }])
.select();

if (error) console.log("Error adding contekan:", error);  
else setContekans([...(data ?? []), ...contekans]);  

setJudul('');  
setIsi('');  
setShowForm(false);

}
}, [judul, isi, contekans]);

const hapusContekan = async (id: string) => {
const { error } = await supabase
.from('contekans')
.delete()
.eq('id', id);

if (error) console.log("Error deleting contekan:", error);  
else setContekans(contekans.filter(contekan => contekan.id !== id));

};

const handleCopy = (text: string, id: string) => {
navigator.clipboard.writeText(text);
setCopiedId(id);
setTimeout(() => setCopiedId(null), 2000); // Reset setelah 2 detik
};

const filteredContekans = contekans.filter(contekan =>
contekan.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
contekan.isi.toLowerCase().includes(searchQuery.toLowerCase())
);

return (
<div className="min-h-screen bg-gray-900 p-4">
<div className="max-w-7xl mx-auto space-y-6">
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
    </div>  

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

              {/* Tombol Hapus */}  
              <button  
                onClick={() => hapusContekan(contekan.id)}  
                className="text-gray-500 hover:text-red-500 transition-colors duration-200"  
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
            </div>  
          </div>  
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">  
            <pre className="text-gray-800 bg-gray-800 p-4 rounded-lg whitespace-pre-wrap">  
              {contekan.isi}  
            </pre>  
          </div>  
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
            />  
          </div>  
          <div>  
            <textarea  
              placeholder="Isi Contekan"  
              value={isi}  
              onChange={(e) => setIsi(e.target.value)}  
              className="w-full h-32 p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"  
            />  
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
