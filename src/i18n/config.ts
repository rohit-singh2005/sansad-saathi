import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome to SansadSaathi",
      "tagline": "Empowering citizens with real-time insights from the Indian Parliament.",
      "explore": "Explore Now",
      "scroll": "Scroll to explore",
      "chat_greeting": "Namaste!",
      "chat_placeholder": "Ask a question...",
      "suggested_questions": "Suggested Questions",
      "info_title": "How SansadSaathi Empowers You",
      "info_tagline": "Our AI chatbot is powered by a comprehensive database of Indian Parliament records, making complex legislative data accessible to every citizen.",
      "feat_db_title": "Comprehensive Database",
      "feat_db_desc": "Access Lok Sabha proceedings from the year 2000 to the present.",
      "feat_docs_title": "Minutes & Summaries",
      "feat_docs_desc": "Retrieve session-wise minutes and summaries of parliamentary debates.",
      "feat_qa_title": "Legislative Q&A",
      "feat_qa_desc": "Answer queries related to bills, discussions, and parliamentary decisions.",
      "feat_trends_title": "Legislative Trends",
      "feat_trends_desc": "Offer insights into legislative trends and activities over time.",
    }
  },
  hi: {
    translation: {
      "welcome": "संसदसाथी में आपका स्वागत है",
      "tagline": "भारतीय संसद से वास्तविक समय की जानकारी के साथ नागरिकों को सशक्त बनाना।",
      "explore": "अभी अन्वेषण करें",
      "scroll": "अन्वेषण के लिए स्क्रॉल करें",
      "chat_greeting": "नमस्ते!",
      "chat_placeholder": "एक प्रश्न पूछें...",
      "suggested_questions": "सुझाए गए प्रश्न",
    }
  },
  ta: {
    translation: {
      "welcome": "சன்சாத் சாதிக்கு வரவேற்கிறோம்",
      "tagline": "இந்திய நாடாளுமன்றத்தின் நிகழ்நேர தகவல்களுடன் குடிமக்களை மேம்படுத்துதல்.",
      "explore": "இப்போது ஆராயுங்கள்",
      "scroll": "ஆராய கீழே உருட்டவும்",
      "chat_greeting": "வணக்கம்!",
      "chat_placeholder": "கேள்வி கேட்க...",
      "suggested_questions": "பரிந்துரைக்கப்பட்ட கேள்விகள்",
    }
  },
  bn: {
    translation: {
      "welcome": "সংসদসাথী-তে স্বাগতম",
      "tagline": "ভারতীয় সংসদের রিয়েল-টাইম তথ্যের মাধ্যমে নাগরিকদের ক্ষমতায়ন।",
      "explore": "এখনই অন্বেষণ করুন",
      "scroll": "অন্বেষণ করতে স্ক্রল করুন",
      "chat_greeting": "নমস্কার!",
      "chat_placeholder": "একটি প্রশ্ন জিজ্ঞাসা করুন...",
      "suggested_questions": "প্রস্তাবিত প্রশ্ন",
    }
  },
  te: {
    translation: {
      "welcome": "సంసద్‌సాథీకి స్వాగతం",
      "tagline": "భారత పార్లమెంటు నుండి నిజ-సమయ అంతర్దృష్టులతో పౌరులను శక్తివంతం చేయడం.",
      "explore": "ఇప్పుడే అన్వేషించండి",
      "scroll": "అన్వేషించడానికి స్క్రోల్ చేయండి",
      "chat_greeting": "నమస్తే!",
      "chat_placeholder": "ఒక ప్రశ్న అడగండి...",
      "suggested_questions": "సూచించబడిన ప్రశ్నలు",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
