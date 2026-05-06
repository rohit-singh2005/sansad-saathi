import { useState, useCallback } from 'react';

export interface Source {
  date: string;
  session: string;
  filename: string;
  source: string;
  page: number | string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string, userLang: string = 'en') => {
    const userMessage: Message = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          userLang 
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let sources: Source[] = [];

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') break;

            try {
              const data = JSON.parse(dataStr);

              if (data.content) {
                assistantContent += data.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === 'assistant') {
                    updated[updated.length - 1] = { ...last, content: assistantContent };
                  }
                  return updated;
                });
              }

              if (data.sources) {
                sources = data.sources;
                // Update last message with sources
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === 'assistant') {
                    updated[updated.length - 1] = { ...last, sources };
                  }
                  return updated;
                });
              }

              if (data.error) {
                throw new Error(data.error);
              }
            } catch (e: any) {
              if (e.message && !e.message.includes('JSON')) {
                throw e; // Re-throw non-parse errors
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages((prev) => {
        // If the last message is an empty assistant message, replace it
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === 'assistant' && !last.content) {
          updated[updated.length - 1] = {
            role: 'assistant',
            content: `Sorry, I encountered an error: ${error.message || 'Please try again.'}`,
          };
        } else {
          updated.push({
            role: 'assistant',
            content: `Sorry, I encountered an error: ${error.message || 'Please try again.'}`,
          });
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return { messages, sendMessage, isLoading };
};
