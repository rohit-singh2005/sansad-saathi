import React from 'react';
import LangSwitcher from './LangSwitcher';
import AshokaChakra from './AshokaChakra';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-40 p-6 flex items-center justify-between pointer-events-none">
      <div className="flex items-center gap-3 pointer-events-auto bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-sm">
        <AshokaChakra className="w-6 h-6" />
        <span className="font-tiro font-bold text-chakra-blue text-lg">SansadSaathi</span>
      </div>
      <div className="pointer-events-auto">
        <LangSwitcher />
      </div>
    </nav>
  );
};

export default Navbar;
