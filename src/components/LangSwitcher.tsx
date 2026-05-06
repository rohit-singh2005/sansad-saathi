import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LangSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'te', name: 'తెలుగు' },
  ];

  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm p-1 rounded-full border border-white/20">
      <div className="px-2 text-white/60">
        <Languages size={16} />
      </div>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
            i18n.language === lang.code
              ? 'bg-saffron text-white shadow-lg'
              : 'text-white/80 hover:bg-white/10'
          }`}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
};

export default LangSwitcher;
