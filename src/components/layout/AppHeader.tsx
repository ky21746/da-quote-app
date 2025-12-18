import { useNavigate } from 'react-router-dom';

export default function AppHeader() {
  const navigate = useNavigate();

  return (
    <header className="w-full h-14 flex items-center justify-between px-4 border-b bg-white">
      <div className="font-bold text-lg">
        Discover Africa
      </div>

      <button
        onClick={() => navigate('/admin/pricing-catalog')}
        className="p-2 rounded hover:bg-gray-100"
        aria-label="Settings"
        title="Pricing Catalog"
      >
        ⚙️
      </button>
    </header>
  );
}


