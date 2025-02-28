import { useRouter } from 'next/navigation';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Navbar({ searchQuery, onSearchChange }: NavbarProps) {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <nav className="bg-gray-800 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
        {/* Logo atau Nama Aplikasi */}
        <div className="text-white text-xl font-bold mb-4 sm:mb-0">
         ShareKode
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 w-full sm:w-auto sm:mx-4 m-1">
          <input
            type="text"
            placeholder="Cari contekan..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
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

        {/* Tombol Login */}
        <button
          onClick={handleLogin}
          className="w-full m-1 sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
        >
          Login
        </button>
      </div>
    </nav>
  );
}