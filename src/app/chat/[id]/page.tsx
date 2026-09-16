'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, Send, Bot, Sparkles, Phone, MapPin, 
  CheckCircle2, Clock, ShieldCheck, ArrowRight, RefreshCw, UserCheck
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { diagnoseUserQuery } from '@/lib/aiDiagnosticEngine';

interface Message {
  id: string;
  sender: 'user' | 'other';
  senderName: string;
  text: string;
  time: string;
  actionText?: string;
  actionHref?: string;
}

// Initial worker-customer conversation state
const initialWorkerCustomerMessages: Message[] = [
  {
    id: 'wc-1',
    sender: 'other',
    senderName: 'Ramesh Sharma (Customer)',
    text: 'Hello, are you on your way? The ceiling fan in bedroom 1 is sparking and making a loud buzzing sound.',
    time: '10:15 AM'
  },
  {
    id: 'wc-2',
    sender: 'user',
    senderName: 'You (Vikram Singh)',
    text: 'Namaste Ramesh ji! Yes, I have gathered the tester and capacitor spares. I am on my way to your location in Sector 22, arriving in about 10 minutes.',
    time: '10:17 AM'
  },
  {
    id: 'wc-3',
    sender: 'other',
    senderName: 'Ramesh Sharma (Customer)',
    text: 'Great. Please note our apartment is on the 4th floor, Flat 402. The elevator is working.',
    time: '10:18 AM'
  }
];

// Initial AI Assistant messages
const initialAIMessages: Message[] = [
  {
    id: 'ai-1',
    sender: 'other',
    senderName: 'SahYog AI Assistant',
    text: 'Namaste! 🙏 I am your SahYog AI Assistant (सहयोग मित्र).\n\nAsk me **ANY question** about home repair issues (e.g. *"my sink is leaking"*, *"fan is sparking"*, *"what type of worker should I book?"*), pricing estimates, or 4-digit arrival OTP protection. How can I help you today?',
    time: 'Just now',
    actionText: 'What type of worker should I book? →',
    actionHref: '/customer/services'
  }
];

const defaultAIPrompts = [
  '💧 What worker to book for water leakage?',
  '⚡ AC trips MCB repeatedly',
  '💰 3BHK Deep Cleaning estimate',
  '🛡️ How does arrival OTP protect me?',
  '🪚 Door lock jammed repair cost'
];

const workerQuickChips = [
  '🚗 I am on the way, arriving in ~10 mins',
  '📍 I have reached your doorstep',
  '🔢 Please share the 4-digit arrival OTP',
  '🛠️ Started inspection and repair',
  '✅ Work completed! Please inspect and confirm'
];

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const id = (params?.id as string) || '1';
  const roleQuery = searchParams.get('role');

  // Determine mode: is this a worker chatting with a customer?
  const [isWorkerMode, setIsWorkerMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('sahyog-role');
      const isWorker = roleQuery === 'worker' || storedRole === 'WORKER' || window.location.search.includes('role=worker');
      const isExplicitAI = id === 'ai' || roleQuery === 'ai';
      setIsWorkerMode(isWorker && !isExplicitAI);
    }
  }, [id, roleQuery]);

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activePrompts, setActivePrompts] = useState<string[]>(defaultAIPrompts);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load appropriate messages based on mode
  useEffect(() => {
    if (isWorkerMode) {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('sahyog-worker-chat-' + id);
          if (stored) {
            setMessages(JSON.parse(stored));
            return;
          }
        } catch {}
      }
      setMessages(initialWorkerCustomerMessages);
    } else {
      setMessages(initialAIMessages);
      setActivePrompts(defaultAIPrompts);
    }
  }, [isWorkerMode, id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle send message
  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      senderName: isWorkerMode ? 'You (Partner)' : 'You',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    if (!textToSend) setInputValue('');

    if (isWorkerMode) {
      // Worker mode: save to local storage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('sahyog-worker-chat-' + id, JSON.stringify(updated));
        } catch {}
      }

      // Simulate customer quick acknowledgement if it's an arrival message
      if (text.includes('reached') || text.includes('arrived') || text.includes('doorstep')) {
        setIsTyping(true);
        setTimeout(() => {
          const custReply: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'other',
            senderName: 'Ramesh Sharma (Customer)',
            text: 'Opening the main door now! My 4-digit arrival OTP is 5821.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => {
            const next = [...prev, custReply];
            if (typeof window !== 'undefined') {
              localStorage.setItem('sahyog-worker-chat-' + id, JSON.stringify(next));
            }
            return next;
          });
          setIsTyping(false);
        }, 1200);
      }
    } else {
      // AI Assistant mode: run free-form diagnosis engine
      setIsTyping(true);
      setTimeout(() => {
        const diagnosis = diagnoseUserQuery(text);

        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'other',
          senderName: 'SahYog AI Assistant',
          text: diagnosis.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionText: diagnosis.actionText,
          actionHref: diagnosis.actionHref ? (diagnosis.actionHref === '/services' ? '/customer/services' : diagnosis.actionHref) : undefined
        };

        setMessages(prev => [...prev, aiMsg]);
        if (diagnosis.quickFollowUps && diagnosis.quickFollowUps.length > 0) {
          setActivePrompts(diagnosis.quickFollowUps);
        }
        setIsTyping(false);
      }, 650);
    }
  };

  // Helper to render formatted text with bold tags
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={idx} className="block min-h-[1.1rem]">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return <em key={pIdx} className="italic text-slate-600">{part.slice(1, -1)}</em>;
            }
            return part;
          })}
        </span>
      );
    });
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col pb-20">
      {/* Top App Bar */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-xs">
        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button 
              type="button"
              onClick={() => {
                if (isWorkerMode) {
                  const isCommunity = typeof window !== 'undefined' && localStorage.getItem('sahyog_worker_mode') === 'COMMUNITY';
                  router.push(isCommunity ? '/worker/community' : '/worker/dashboard');
                } else {
                  router.push('/customer/dashboard');
                }
              }} 
              className="p-1 hover:bg-slate-100 rounded-full transition cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>

            {isWorkerMode ? (
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                    Ramesh Sharma
                  </h1>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <span className="font-bold text-teal-700">#BK-7821</span>
                  <span>• Ceiling Fan & Wiring Repair</span>
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                    SahYog AI Assistant
                  </h1>
                  <span className="bg-amber-400 text-emerald-950 text-[9px] font-black px-1.5 py-0.5 rounded">
                    24/7 Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Free-Form Diagnostics & Service Match</span>
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isWorkerMode ? (
              <>
                <a
                  href="tel:+919876543210"
                  className="p-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl transition flex items-center gap-1 text-xs font-bold"
                  title="Call Customer"
                >
                  <Phone className="w-4 h-4 text-teal-700" />
                  <span className="hidden sm:inline">Call</span>
                </a>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMessages(initialAIMessages);
                  setActivePrompts(defaultAIPrompts);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition"
                title="Restart Chat"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sub-banner */}
        {isWorkerMode ? (
          <div className="bg-emerald-50 border-t border-emerald-100 px-4 py-2 flex items-center justify-between text-xs text-emerald-950 font-medium">
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Direct Customer Chat • Flat 402, Sector 22</span>
            </span>
            <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> OTP 5821
            </span>
          </div>
        ) : (
          <div className="bg-emerald-50 border-t border-emerald-100 px-4 py-2 flex items-center justify-between text-xs text-emerald-950 font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Ask anything: issue, pricing, or OTP safety
            </span>
            <span className="text-[10px] font-bold text-teal-800">
              English • हिन्दी • ગુજરાતી
            </span>
          </div>
        )}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
        <div className="text-center my-1">
          <span className="text-[10.5px] bg-slate-200/80 text-slate-600 px-3 py-1 rounded-full font-medium">
            {isWorkerMode 
              ? '🔒 Direct End-to-End Chat with Verified Customer' 
              : '🤖 SahYog Intelligent Repair Diagnostics • Active 24/7'}
          </span>
        </div>

        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                {msg.senderName}
              </span>
              <div
                className={`max-w-[86%] rounded-2xl p-3.5 shadow-xs text-xs sm:text-sm ${
                  isUser
                    ? 'bg-teal-700 text-white rounded-br-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                }`}
              >
                {!isUser && !isWorkerMode && (
                  <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-slate-100 text-teal-800 text-xs font-bold">
                    <Bot className="w-3.5 h-3.5 text-amber-500" />
                    <span>SahYog AI Guidance</span>
                  </div>
                )}

                <div className="leading-relaxed">
                  {renderFormattedText(msg.text)}
                </div>

                {/* Optional Action Button inside Message */}
                {msg.actionText && msg.actionHref && (
                  <div className="mt-3 pt-2 border-t border-slate-100">
                    <Link
                      href={msg.actionHref}
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition transform hover:scale-[1.02] active:scale-95"
                    >
                      <span>{msg.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}

                <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isUser ? 'text-teal-200' : 'text-slate-400'}`}>
                  <span>{msg.time}</span>
                  {isUser && <span>✓✓</span>}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-500 p-2.5 bg-white rounded-2xl w-fit border border-slate-200 shadow-xs">
            {isWorkerMode ? (
              <span className="italic">Customer is typing...</span>
            ) : (
              <>
                <Bot className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                <span>SahYog AI is analyzing solutions...</span>
              </>
            )}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Reply Action Chips */}
      <div className="px-3 py-1.5 bg-white border-t border-slate-100 sticky bottom-[53px] z-10">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
          {isWorkerMode ? (
            workerQuickChips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                className="text-[11px] bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 px-3 py-1.5 rounded-full whitespace-nowrap transition font-medium border border-slate-200/70 shadow-2xs cursor-pointer"
              >
                {chip}
              </button>
            ))
          ) : (
            activePrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 px-3 py-1.5 rounded-full whitespace-nowrap transition font-medium border border-slate-200/70 shadow-2xs cursor-pointer"
              >
                {prompt}
              </button>
            ))
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-2 pb-1 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                isWorkerMode
                  ? "Message customer (e.g. 'I am at your gate', 'Flat 402')..."
                  : "Ask any repair problem (e.g. 'water leaking', 'what worker to book?')..."
              }
              className="flex-1 bg-slate-100 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:bg-white focus:ring-1 focus:ring-teal-600 transition"
            />

            <button
              type="submit"
              className="w-10 h-10 bg-teal-700 hover:bg-teal-800 text-white rounded-xl flex items-center justify-center transition shadow-xs flex-shrink-0 cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      <BottomNav role={isWorkerMode ? 'worker' : 'customer'} />
    </div>
  );
}
