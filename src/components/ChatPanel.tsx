import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, X, Bot, User, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useChat } from '../hooks/useChat';
import type { Source } from '../hooks/useChat';

const ChatPanel: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, sendMessage, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input, i18n.language);
    setInput('');
  };

  const suggestions = [
    'What happened in the Budget Session 2024?',
    'Tell me about bills introduced in Monsoon Session',
    'What are the key debates in Lok Sabha recently?',
    'Explain the role of Speaker in Parliament',
  ];

  const renderSources = (sources: Source[]) => {
    if (!sources || sources.length === 0) return null;
    
    // Deduplicate by filename
    const unique = sources.reduce((acc: Source[], s) => {
      if (!acc.find(x => x.filename === s.filename && x.page === s.page)) {
        acc.push(s);
      }
      return acc;
    }, []);

    return (
      <div className="mt-3 pt-3 border-t border-slate-200/60">
        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          <FileText size={10} />
          Sources
        </div>
        <div className="flex flex-wrap gap-1.5">
          {unique.slice(0, 4).map((s, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-[11px] bg-chakra-blue/5 text-chakra-blue/70 px-2.5 py-1 rounded-full border border-chakra-blue/10"
              title={`${s.filename} - Page ${s.page}`}
            >
              <FileText size={9} />
              {s.date} · {s.session} · p.{s.page}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[51]"
            />
            
            {/* Centered Modal Container */}
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[52] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-panel w-full max-w-5xl h-[85vh] rounded-3xl flex flex-col overflow-hidden border-slate-200 pointer-events-auto shadow-2xl"
              >
                {/* Header */}
                <div className="bg-chakra-blue text-white p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
                      <Bot size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg tracking-tight">SansadSaathi AI Assistant</h3>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="hover:bg-white/10 p-2 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 no-scrollbar">
                  {messages.length === 0 && (
                    <div className="text-center py-20 px-6">
                      <div className="w-20 h-20 bg-chakra-blue/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-chakra-blue/10">
                        <Bot size={40} className="text-chakra-blue opacity-40" />
                      </div>
                      <h4 className="font-tiro text-3xl mb-4 text-slate-800">{t('chat_greeting')}</h4>
                      <p className="text-lg text-slate-500 font-noto max-w-lg mx-auto leading-relaxed">
                        I am your AI assistant powered by a comprehensive database of Indian Parliament records. Ask me anything about Lok Sabha sessions, bills, or debates.
                      </p>
                    </div>
                  )}
                  
                  {messages.map((msg, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] p-5 rounded-2xl text-base ${
                        msg.role === 'user' 
                          ? 'bg-chakra-blue text-white rounded-tr-none shadow-lg shadow-chakra-blue/10' 
                          : 'bg-white border border-slate-100 shadow-sm text-slate-800 rounded-tl-none'
                      }`}>
                        <div className="mb-2 opacity-50 text-[10px] flex items-center gap-1 font-bold uppercase tracking-wider">
                          {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                          {msg.role === 'user' ? 'You' : 'SansadSaathi'}
                        </div>
                        <div className="whitespace-pre-wrap font-noto leading-relaxed">
                          {msg.content}
                        </div>
                        {msg.role === 'assistant' && msg.sources && renderSources(msg.sources)}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-100 p-5 rounded-2xl rounded-tl-none shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Searching Parliament Records...</span>
                        </div>
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 bg-chakra-blue/40 rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-chakra-blue/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-2 h-2 bg-chakra-blue/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggestions */}
                {messages.length === 0 && (
                  <div className="p-6 border-t border-slate-100 bg-white">
                    <p className="text-xs uppercase tracking-widest text-slate-400 mb-4 font-bold">{t('suggested_questions')}</p>
                    <div className="flex flex-wrap gap-3">
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(s, i18n.language)}
                          className="text-sm bg-slate-50 hover:bg-chakra-blue/5 hover:text-chakra-blue border border-slate-200 py-2.5 px-5 rounded-full transition-all text-slate-600 shadow-sm"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input form */}
                <form onSubmit={handleSubmit} className="p-6 bg-white border-t border-slate-100">
                  <div className="relative flex items-center max-w-5xl mx-auto">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t('chat_placeholder')}
                      className="w-full pl-6 pr-16 py-4 bg-slate-100 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-chakra-blue/20 transition-all font-noto"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="absolute right-3 p-3 bg-chakra-blue text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-900 transition-colors shadow-lg shadow-chakra-blue/20"
                    >
                      <Send size={22} />
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-chakra-blue text-white rounded-full flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(0,0,128,0.4)] hover:shadow-[0_15px_50px_-10px_rgba(0,0,128,0.5)] transition-all relative z-50"
      >
        {isOpen ? <X /> : <MessageSquare size={28} />}
        {!isOpen && (
           <span className="absolute -top-1 -right-1 w-5 h-5 bg-saffron border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold">
            AI
           </span>
        )}
      </motion.button>
    </div>
  );
};

export default ChatPanel;
