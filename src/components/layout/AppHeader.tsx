import { useNavigate } from 'react-router-dom';
import { Settings, FileText } from 'lucide-react';

export default function AppHeader() {
  const navigate = useNavigate();

  return (
    <header className="w-full h-16 md:h-20 flex items-center justify-between px-4 md:px-6 lg:px-8 border-b border-brand-olive/20 bg-white">
      <div className="flex items-center gap-3">
        {/* לוגו - שים את הקובץ ב-public/logo.png או public/assets/logo.svg */}
        <img 
          src="/logo.png" 
          alt="Discover Africa"
          className="h-10 w-auto"
          onError={(e) => {
            // אם אין לוגו, הסתר את התמונה
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="font-bold text-lg text-brand-dark">
          Discover Africa
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/proposals')}
          className="p-2 rounded hover:bg-brand-olive/10 text-brand-dark transition-colors"
          aria-label="Saved Proposals"
          title="Saved Proposals"
        >
          <FileText size={20} strokeWidth={1.5} className="text-brand-dark" />
        </button>

        <button
          onClick={() => navigate('/admin/pricing-catalog')}
          className="p-2 rounded hover:bg-brand-olive/10 text-brand-dark transition-colors"
          aria-label="Settings"
          title="Pricing Catalog"
        >
          <Settings size={20} strokeWidth={1.5} className="text-brand-dark" />
        </button>
      </div>
    </header>
  );
}



