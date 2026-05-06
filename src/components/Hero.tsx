import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AshokaChakra from './AshokaChakra';
import { ChevronDown } from 'lucide-react';

const Hero: React.FC = () => {
  const { t } = useTranslation();
  const title = "SansadSaathi";
  
  const containerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      }
    }
  };

  const letterVars = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring" as const, damping: 12, stiffness: 100 }
    }
  };

  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-white pt-16">
      {/* Background Decorative Chakra */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] w-[150vh] h-[150vh] pointer-events-none">
        <AshokaChakra />
      </div>

      <motion.div
        variants={containerVars}
        initial="hidden"
        animate="visible"
        className="text-center z-10 px-4"
      >
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 md:w-32 md:h-32 shadow-2xl rounded-full p-1 bg-white border border-slate-100">
            <AshokaChakra />
          </div>
        </div>

        <motion.h1 
          className="text-6xl md:text-8xl font-bold mb-4 tracking-tight flex justify-center text-chakra-blue"
        >
          {title.split("").map((char, index) => (
            <motion.span key={index} variants={letterVars}>
              {char}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto font-noto mb-10 leading-relaxed"
        >
          {t('tagline')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <button 
            onClick={() => document.getElementById('explore-info')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-10 py-4 bg-chakra-blue text-white rounded-full font-bold text-lg hover:shadow-[0_10px_40px_-10px_rgba(0,0,128,0.4)] transition-all transform hover:-translate-y-1 active:scale-95"
          >
            {t('explore')}
          </button>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-slate-400"
      >
        <span className="text-sm font-medium mb-2 uppercase tracking-widest">{t('scroll')}</span>
        <ChevronDown size={24} />
      </motion.div>
      
      {/* Decorative Tricolour Bars */}
      <div className="absolute top-0 left-0 w-full h-2 bg-saffron" />
      <div className="absolute bottom-0 left-0 w-full h-8 bg-green/10" />
    </section>
  );
};

export default Hero;
