'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Minimize2 } from 'lucide-react';
import { WELCOME_MESSAGE } from '@/lib/claude/prompts';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBotProps {
  language?: string;
  unit?: string;
  lessonTitle?: string;
  lessonType?: string;
  userCode?: string;
}

export default function ChatBot({ language, unit, lessonTitle, lessonType, userCode }: ChatBotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || streaming) return;

    setInput('');
    const userMsg: Message = { role: 'user', content: text };
    setMessages((m) => [...m, userMsg]);
    setStreaming(true);

    // Add empty assistant message to stream into
    setMessages((m) => [...m, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          context: {
            language: language ?? 'Python',
            unit: unit ?? 'Getting Started',
            lessonTitle: lessonTitle ?? 'Introduction',
            lessonType: lessonType ?? 'lesson',
            userCode,
            hintLevel,
          },
        }),
      });

      if (!res.body) throw new Error('No response body');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setMessages((m) => {
          const updated = [...m];
          updated[updated.length - 1] = { role: 'assistant', content: full };
          return updated;
        });
      }

      setHintLevel((h) => Math.min(h + 1, 3));
    } catch (err) {
      setMessages((m) => {
        const updated = [...m];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: `Sorry, I had trouble connecting. Please try again! 🤖`,
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-900/50 hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-blue-400 transition-colors"
            aria-label="Open CodeBot"
          >
            <Bot size={24} className="text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 left-0 right-0 z-50 mx-auto max-w-[430px] px-3"
          >
            <div className="flex flex-col rounded-2xl border border-gray-700 bg-gray-950 shadow-2xl overflow-hidden"
              style={{ maxHeight: '70vh' }}>
              {/* Header */}
              <div className="flex items-center justify-between bg-gray-900 px-4 py-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Bot size={18} className="text-blue-400" />
                  <span className="text-sm font-bold text-white">CodeBot</span>
                  <span className="rounded-full bg-green-500 h-2 w-2" />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-300">
                    <Minimize2 size={16} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 200 }}>
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-gray-800 text-gray-200 rounded-bl-sm'
                      }`}
                    >
                      {m.content}
                      {streaming && i === messages.length - 1 && m.role === 'assistant' && (
                        <span className="ml-1 inline-block h-3.5 w-0.5 bg-blue-400 animate-pulse" />
                      )}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 border-t border-gray-800 bg-gray-900 px-3 py-3">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Ask CodeBot anything..."
                  disabled={streaming}
                  className="flex-1 rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || streaming}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 transition-colors"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
