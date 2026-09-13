'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  X, Send, MapPin, Phone, Video, ShieldCheck, CheckCheck, 
  SwitchCamera, MessageSquare, AlertCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'customer' | 'worker';
  senderName: string;
  text: string;
  time: string;
  isLocation?: boolean;
  locationLabel?: string;
}

interface WorkerChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  workerName?: string;
  workerRole?: string;
  workerPhone?: string;
  bookingCode?: string;
}

export default function WorkerChatDrawer({
  isOpen,
  onClose,
  workerName = 'Sunita Mehra',
  workerRole = 'Home & Kitchen Cleaning Expert',
  workerPhone = '+91 98765 43210',
  bookingCode = 'SY-9842',
}: WorkerChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '1', 
      sender: 'worker', 
      senderName: `${workerName} (Partner)`, 
      text: `नमस्ते! I am heading towards your location for the scheduled service.`, 
      time: '10:00 AM' 
    },
    { 
      id: '2', 
      sender: 'customer', 
      senderName: 'You (Customer)', 
      text: 'Thank you! Are you carrying the cleaning solutions and vacuum accessories?', 
      time: '10:02 AM' 
    },
    { 
      id: '3', 
      sender: 'worker', 
      senderName: `${workerName} (Partner)`, 
      text: 'Yes, full toolkit, sanitized microfiber cloths, and equipment are with me. Reaching in ~8 mins.', 
      time: '10:05 AM' 
    },
    { 
      id: '4', 
      sender: 'customer', 
      senderName: 'You (Customer)', 
      text: 'Great, sharing the building gate location.', 
      time: '10:06 AM',
      isLocation: true,
      locationLabel: 'Tower B, Shanti Heights, Gate #2'
    }
  ]);

  const [activeSender, setActiveSender] = useState<'customer' | 'worker'>('customer');
  const [inputValue, setInputValue] = useState('');
  const [callingModal, setCallingModal] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSend = (overrideText?: string, isLoc?: boolean) => {
    const textToSend = overrideText || inputValue;
    if (!textToSend.trim() && !isLoc) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: activeSender,
      senderName: activeSender === 'customer' ? 'You (Customer)' : `${workerName} (Partner)`,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLocation: isLoc,
      locationLabel: isLoc ? 'Gate #2, Shanti Heights, Sector 12' : undefined
    };

    setMessages(prev => [...prev, newMsg]);
    if (!overrideText) setInputValue('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[100] transition-opacity"
      />

      {/* Side drawer: slides out smoothly from right edge */}
      <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white z-[100] shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-[#042f2e] text-white p-4 flex items-center justify-between border-b border-emerald-900 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
              {getInitials(workerName)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">{workerName}</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80">
                {workerRole} • #{bookingCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCallingModal('Voice')}
              className="p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition"
              title="Voice Call"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCallingModal('Video')}
              className="p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition"
              title="Video Call"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition ml-1"
              title="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Role toggle bar to test conversation as either customer or worker */}
        <div className="bg-teal-50 border-b border-teal-100 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-teal-900">
            <SwitchCamera className="w-3.5 h-3.5 text-teal-700" />
            <span>Typing as: <b>{activeSender === 'customer' ? 'Customer' : workerName}</b></span>
          </div>
          <button
            onClick={() => setActiveSender(activeSender === 'customer' ? 'worker' : 'customer')}
            className="bg-white border border-teal-300 text-teal-800 font-bold px-2.5 py-0.5 rounded-full hover:bg-teal-100 transition text-[11px] shadow-2xs"
          >
            Switch Role
          </button>
        </div>

        {/* Security / OTP advisory pill */}
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> End-to-end encrypted channel
          </span>
          <span className="font-mono font-bold text-teal-800">OTP Guard Active</span>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 space-y-3.5 overflow-y-auto bg-slate-50/60">
          {messages.map((msg) => {
            const isMe = msg.sender === activeSender;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                  {msg.senderName}
                </span>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-xs text-xs sm:text-sm ${
                    isMe
                      ? 'bg-teal-700 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  {msg.isLocation && (
                    <div className="bg-teal-800/80 text-white rounded-xl p-2 mb-1.5 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-300 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold">Shared Location</p>
                        <p className="text-[10px] text-teal-100">{msg.locationLabel}</p>
                      </div>
                    </div>
                  )}
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-teal-200' : 'text-slate-400'}`}>
                    <span>{msg.time}</span>
                    {isMe && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Response Chips */}
        <div className="px-4 py-2 bg-white border-t border-slate-100">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              'Where have you reached?',
              'I am at the building gate',
              'Please take elevator to 4th floor',
              'Equipment is ready'
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                className="text-[11px] bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 px-3 py-1 rounded-full whitespace-nowrap transition font-medium border border-slate-200/70"
              >
                {chip}
              </button>
            ))}
            <button
              onClick={() => handleSend('Sharing gate pin for easy parking', true)}
              className="text-[11px] bg-teal-50 border border-teal-300 text-teal-800 px-3 py-1 rounded-full whitespace-nowrap transition font-bold flex items-center gap-1"
            >
              <MapPin className="w-3 h-3 text-teal-600" /> Share Gate Location
            </button>
          </div>
        </div>

        {/* Bottom Input */}
        <div className="p-3 pb-6 sm:pb-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => handleSend('Sharing exact doorway location card', true)}
              className="p-2 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition"
              title="Share Location"
            >
              <MapPin className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Message ${activeSender === 'customer' ? workerName : 'Customer'}...`}
              className="flex-1 bg-slate-100 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:bg-white focus:ring-1 focus:ring-teal-600 transition"
            />

            <button
              type="submit"
              className="w-10 h-10 bg-teal-700 hover:bg-teal-800 text-white rounded-xl flex items-center justify-center transition shadow-sm flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Simulated Call Modal */}
      {callingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 text-center max-w-xs w-full shadow-2xl animate-fade-in">
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {callingModal === 'Voice' ? <Phone className="w-7 h-7 text-teal-700 animate-pulse" /> : <Video className="w-7 h-7 text-teal-700 animate-pulse" />}
            </div>
            <h3 className="font-bold text-base text-slate-900">Connecting {callingModal} Call...</h3>
            <p className="text-xs text-slate-500 mt-1">Dialing {workerName} ({workerPhone}) via SahYog Encrypted Bridge.</p>
            <div className="mt-5">
              <button
                onClick={() => setCallingModal(null)}
                className="w-full py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
