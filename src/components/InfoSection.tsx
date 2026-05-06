import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Database, FileText, MessageSquare, TrendingUp } from 'lucide-react';

const InfoSection: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Database className="text-saffron" size={24} />,
      title: t('feat_db_title'),
      description: t('feat_db_desc')
    },
    {
      icon: <FileText className="text-chakra-blue" size={24} />,
      title: t('feat_docs_title'),
      description: t('feat_docs_desc')
    },
    {
      icon: <MessageSquare className="text-green-600" size={24} />,
      title: t('feat_qa_title'),
      description: t('feat_qa_desc')
    },
    {
      icon: <TrendingUp className="text-purple-600" size={24} />,
      title: t('feat_trends_title'),
      description: t('feat_trends_desc')
    }
  ];

  return (
    <section id="explore-info" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-tiro"
          >
            {t('info_title')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 max-w-3xl mx-auto font-noto"
          >
            {t('info_tagline')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-noto">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-saffron/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-chakra-blue/5 rounded-full blur-3xl" />
    </section>
  );
};

export default InfoSection;
