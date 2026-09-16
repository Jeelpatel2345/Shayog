'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, Users, ShieldCheck, CheckCircle2, Star, Clock, 
  MapPin, Phone, Sparkles, Building2, KeyRound, Wrench, 
  AlertCircle, Check, Loader2, Calendar, ArrowRight,
  Truck, HardHat, FileText, CheckCheck, X, LogOut, RefreshCw, 
  Banknote, Shield, MessageSquare, Bot, Send, Bell
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { 
  defaultActiveCommunityBooking, 
  registeredSocieties, 
  CommunityBooking, 
  CrewMember 
} from '@/data/communityData';
import { 
  triggerSystemNotification, 
  requestNotificationPermission,
  playNotificationChime 
} from '@/utils/realtimeNotification';

// Pre-seeded society contracts list for community squad workers
const initialSocietyBookings: CommunityBooking[] = [
  defaultActiveCommunityBooking,
  {
    id: 'comm_bk_gk_02',
    societyId: 'soc_gokuldham',
    societyName: 'Gokuldham Cooperative Housing Society',
    packageId: 'comm_pkg_tank_01',
    packageTitle: 'Underground & Overhead Sump Tank Jet Cleaning & Sanitization',
    crewSize: 5,
    leadWorkerName: 'Jeel Patel',
    crewRoster: [
      { id: 'cr_1', name: 'Jeel Patel', role: 'LEAD', phone: '+91 91066 38851', trade: 'Supervisor & Safety Marshal', avatarInitials: 'JP' },
      { id: 'cr_2', name: 'Pravin Vaghela', role: 'SPECIALIST', phone: '+91 98251 10022', trade: 'High-Pressure Jet Gun Operator', avatarInitials: 'PV' },
      { id: 'cr_3', name: 'Dinesh Makwana', role: 'SPECIALIST', phone: '+91 98251 10023', trade: 'Submersible Sludge Pump Tech', avatarInitials: 'DM' },
      { id: 'cr_4', name: 'Ramesh Solanki', role: 'SPECIALIST', phone: '+91 98251 10024', trade: 'UV Sanitization & Chlorine Dosing', avatarInitials: 'RS' },
      { id: 'cr_5', name: 'Haresh Parmar', role: 'SPECIALIST', phone: '+91 98251 10025', trade: 'Confined Space Safety Scout', avatarInitials: 'HP' },
    ],
    scheduledDate: '17/09/2026',
    scheduledTime: '09:30 AM',
    totalAmount: 4500,
    poolSharePerWorker: 900,
    status: 'SCHEDULED',
    workerOtp: '7412',
    orderedBy: 'A. K. Bhide (Secretary)',
    ordererPhone: '+91 98250 11223',
    societyAddress: 'Powai / Thaltej Cross Roads, Ahmedabad',
    paymentStatus: 'PAID',
    createdAt: '2026-09-16T10:00:00Z'
  },
  {
    id: 'comm_bk_nk_03',
    societyId: 'soc_nilkanth',
    societyName: 'Nilkanth Greens Residency',
    packageId: 'comm_pkg_amc_01',
    packageTitle: 'High-Pressure Society Paved Walkway & Basement Jet Wash',
    crewSize: 3,
    leadWorkerName: 'Jeel Patel',
    crewRoster: [
      { id: 'cr_1', name: 'Jeel Patel', role: 'LEAD', phone: '+91 91066 38851', trade: 'Supervisor', avatarInitials: 'JP' },
      { id: 'cr_2', name: 'Kanti Bhai', role: 'SPECIALIST', phone: '+91 98251 10026', trade: 'Surface Washer Tech', avatarInitials: 'KB' },
      { id: 'cr_3', name: 'Vikram Joshi', role: 'SPECIALIST', phone: '+91 98251 10027', trade: 'Chemical Scrubber Tech', avatarInitials: 'VJ' },
    ],
    scheduledDate: '14/09/2026',
    scheduledTime: '11:00 AM',
    totalAmount: 2700,
    poolSharePerWorker: 900,
    status: 'COMPLETED',
    workerOtp: '1903',
    orderedBy: 'Dr. C. P. Joshi (President)',
    ordererPhone: '+91 98253 44556',
    societyAddress: 'Bopal - Ambli BRTS Corridor, Ahmedabad',
    paymentStatus: 'PAID',
    createdAt: '2026-09-14T11:00:00Z'
  }
];

interface ChatMessage {
  id: string;
  sender: 'worker' | 'secretary' | 'ai';
  senderName: string;
  text: string;
  time: string;
}

function WorkerCommunityDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // STRICT COMMUNITY DASHBOARD LOCK
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('sahyog-role');
      const mode = localStorage.getItem('sahyog_worker_mode');
      if (role === 'CUSTOMER') {
        window.location.replace('/customer/dashboard');
        return;
      }
      if (mode === 'INDIVIDUAL') {
        window.location.replace('/worker/dashboard');
        return;
      }
      localStorage.setItem('sahyog_worker_mode', 'COMMUNITY');
      localStorage.setItem('sahyog-role', 'WORKER');
      localStorage.setItem('sahyog-logged-in', 'true');

      // Request browser push notification permission gracefully
      requestNotificationPermission();
    }
  }, []);

  const [workerName, setWorkerName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sahyog-user-name') || 'Jeel';
    }
    return 'Jeel';
  });
  const [workerRoleInSquad, setWorkerRoleInSquad] = useState<'LEAD' | 'SPECIALIST'>('LEAD');
  const [activeBooking, setActiveBooking] = useState<CommunityBooking>(defaultActiveCommunityBooking);
  const [allSocietyBookings, setAllSocietyBookings] = useState<CommunityBooking[]>(initialSocietyBookings);
  const [jobStatus, setJobStatus] = useState<'CREW_EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED'>('CREW_EN_ROUTE');
  
  // Tabs: ACTIVE_JOB, BOOKINGS, CHAT, AI
  const initialTab = (searchParams.get('tab')?.toUpperCase() as any) || 'ACTIVE_JOB';
  const [currentTab, setCurrentTab] = useState<'ACTIVE_JOB' | 'BOOKINGS' | 'CHAT' | 'AI'>(initialTab);

  // Bookings Filter
  const [bookingFilter, setBookingFilter] = useState<'ALL' | 'ACTIVE' | 'UPCOMING' | 'COMPLETED'>('ALL');

  // OTP Verification Modal
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [toastNotice, setToastNotice] = useState('');

  // Society Secretary Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'cm_1',
      sender: 'secretary',
      senderName: 'DBEJBCD (Society Checkpoint)',
      text: 'Namaste Squad Leader! We have unlocked Gate 1 for your Jetting Van #GJ-01-SY-4920. Please report to Security Cabin for Gate OTP.',
      time: '01:50 PM'
    },
    {
      id: 'cm_2',
      sender: 'worker',
      senderName: 'You (Squad Leader)',
      text: 'Namaste Secretary Saab! Crew has arrived at Gate 1 with all high-pressure equipment. We are ready with the 4-digit verification.',
      time: '01:54 PM'
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Squad AI Copilot State
  const [aiChatMessages, setAiChatMessages] = useState<ChatMessage[]>([
    {
      id: 'ai_1',
      sender: 'ai',
      senderName: 'SahYog Squad AI Copilot',
      text: 'Namaste Squad Leader! 🛠️ I am your Society Project Assistant.\n\nAsk me about:\n• Jetting PSI and nozzle angle for storm drains\n• Sump tank degassing and chlorine dosage\n• Society gate entry clearance protocol\n• Electrical safety checklist for residential towers',
      time: 'Just now'
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiThinking, setAiThinking] = useState(false);

  // Sync tab with URL if user clicked bottom nav
  useEffect(() => {
    const tabParam = searchParams.get('tab')?.toUpperCase();
    if (tabParam === 'BOOKINGS') setCurrentTab('BOOKINGS');
    else if (tabParam === 'CHAT') setCurrentTab('CHAT');
    else if (tabParam === 'AI') setCurrentTab('AI');
  }, [searchParams]);

  // Real-time listener & 3-second database polling
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('sahyog-user-name') || 'Jeel';
      setWorkerName(savedName);

      // Check if user is lead or squad specialist
      if (savedName.toLowerCase().includes('mahesh') || savedName.toLowerCase().includes('sunita') || savedName.toLowerCase().includes('jeel') || savedName.toLowerCase().includes('rajesh')) {
        setWorkerRoleInSquad('LEAD');
      } else {
        setWorkerRoleInSquad('SPECIALIST');
      }

      // 3-second database polling for society community bookings
      const poll = async () => {
        try {
          const res = await fetch('/api/community/bookings');
          if (res.ok) {
            const data = await res.json();
            if (data?.bookings && data.bookings.length > 0) {
              setAllSocietyBookings((prev) => {
                const combined = [...data.bookings, ...prev.filter((p: any) => !data.bookings.some((d: any) => d.id === p.id))];
                return combined;
              });

              const active = data.bookings.find((b: any) => b.status !== 'COMPLETED') || data.bookings[0];
              if (active) {
                setActiveBooking(active);
                if (active.status === 'IN_PROGRESS') setJobStatus('IN_PROGRESS');
                if (active.status === 'COMPLETED') setJobStatus('COMPLETED');
              }
            }
          }
        } catch {}
      };

      poll();
      const interval = setInterval(poll, 3000);

      // Realtime listener for NEW_COMMUNITY_BOOKING & cross-tab sync
      const handleRealtime = (data: any) => {
        if (data?.type === 'NEW_COMMUNITY_BOOKING') {
          poll();
          const socName = data.societyName || 'Housing Society';
          const pkg = data.packageTitle || 'Community Squad Service';
          const payout = data.workerShare || activeBooking.poolSharePerWorker || 950;

          // 1. Play real Web Audio chime & trigger system OS notification!
          triggerSystemNotification(`🏢 New Society Squad Assignment!`, {
            body: `${socName} booked ${pkg}. Your squad payout: ₹${payout}. Tap to view task!`,
            url: '/worker/community',
            tag: 'community-' + (data.bookingId || Date.now())
          });

          // 2. In-app toast banner
          setToastNotice(`🔔 New Society Task assigned from ${socName}!`);
          setTimeout(() => setToastNotice(''), 7000);
        }
      };

      let channel: BroadcastChannel | null = null;
      try {
        channel = new BroadcastChannel('sahyog-realtime-sync');
        channel.onmessage = (e) => handleRealtime(e.data);
      } catch {}

      const handleStorage = (e: StorageEvent) => {
        if (e.key === 'sahyog-realtime-event' && e.newValue) {
          try {
            handleRealtime(JSON.parse(e.newValue));
          } catch {}
        }
      };
      window.addEventListener('storage', handleStorage);

      return () => {
        clearInterval(interval);
        if (channel) channel.close();
        window.removeEventListener('storage', handleStorage);
      };
    }
  }, []);

  const handleVerifyGateOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setVerifyingOtp(true);

    try {
      const res = await fetch(`/api/community/bookings/${activeBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'VERIFY_OTP', otp: enteredOtp })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Incorrect Gate OTP');
      }

      setJobStatus('IN_PROGRESS');
      setOtpModalOpen(false);
      setToastNotice('⚡ Gate OTP Verified! Society Squad work started.');
      setTimeout(() => setToastNotice(''), 5000);

      // Play audio confirmation
      playNotificationChime();

      // Broadcast to society customer
      try {
        const channel = new BroadcastChannel('sahyog-realtime-sync');
        channel.postMessage({
          type: 'COMMUNITY_JOB_STARTED',
          bookingId: activeBooking.id,
          timestamp: Date.now()
        });
        channel.close();
      } catch {}

      if (typeof window !== 'undefined') {
        localStorage.setItem('sahyog-realtime-event', JSON.stringify({
          type: 'COMMUNITY_JOB_STARTED',
          bookingId: activeBooking.id,
          timestamp: Date.now()
        }));
      }
    } catch (err: any) {
      setOtpError(err.message || 'Incorrect 4-digit Society Gate OTP.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleCompleteSocietyJob = async () => {
    try {
      await fetch(`/api/community/bookings/${activeBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'COMPLETE_JOB' })
      });
    } catch {}

    setJobStatus('COMPLETED');
    setToastNotice(`🎉 Society Squad Job Completed! ₹${activeBooking.poolSharePerWorker} credited to your SahYog Wallet.`);
    setTimeout(() => setToastNotice(''), 6000);

    // Audio chime
    playNotificationChime();

    // Broadcast to society customer
    try {
      const channel = new BroadcastChannel('sahyog-realtime-sync');
      channel.postMessage({
        type: 'COMMUNITY_JOB_COMPLETED',
        bookingId: activeBooking.id,
        timestamp: Date.now()
      });
      channel.close();
    } catch {}

    if (typeof window !== 'undefined') {
      localStorage.setItem('sahyog-realtime-event', JSON.stringify({
        type: 'COMMUNITY_JOB_COMPLETED',
        bookingId: activeBooking.id,
        timestamp: Date.now()
      }));
    }
  };

  const handleSendSecretaryMessage = (e?: React.FormEvent, predefinedText?: string) => {
    if (e) e.preventDefault();
    const text = predefinedText || chatInput.trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: 'cm_' + Date.now(),
      sender: 'worker',
      senderName: `You (${workerName})`,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, newMsg]);
    if (!predefinedText) setChatInput('');

    // Secretary automated reply simulation
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: 'cm_' + (Date.now() + 1),
          sender: 'secretary',
          senderName: 'DBEJBCD (Society Checkpoint)',
          text: 'Received loud and clear! Security has been notified. Please proceed with all safety gear.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      playNotificationChime();
    }, 1200);
  };

  const handleSendAiPrompt = (promptText?: string) => {
    const text = promptText || aiInput.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: 'aim_' + Date.now(),
      sender: 'worker',
      senderName: `You (${workerName})`,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiChatMessages((prev) => [...prev, userMsg]);
    if (!promptText) setAiInput('');
    setAiThinking(true);

    setTimeout(() => {
      let reply = '';
      const q = text.toLowerCase();
      if (q.includes('jetting') || q.includes('drain') || q.includes('sewer')) {
        reply = '💧 **Drain Jetting Protocol**: Set pump pressure to 120–150 BAR with backward-thrust rotating nozzles. Ensure upstream manhole is ventilated for 10 minutes before insertion. Always wear heavy rubber boots & eye protection.';
      } else if (q.includes('tank') || q.includes('sump') || q.includes('water')) {
        reply = '🚰 **Tank Cleaning Protocol**: Pump out residual sludge using 2HP submersible pump. Scrub walls with high-pressure rotary spray. Disinfect with approved chlorine tablet solution (50ppm) and rinse thoroughly. Conduct water clarity test before sign-off.';
      } else if (q.includes('gate') || q.includes('otp') || q.includes('security')) {
        reply = '🔑 **Gate Clearance SOP**: Present squad van registration to Security Guard. Ask Secretary for the 4-digit arrival OTP generated on their screen. Enter it on your dashboard to initiate verified live contract tracking.';
      } else {
        reply = `⚙️ **SahYog Squad Advisory**: For ${activeBooking.packageTitle}, maintain 100% adherence to Gujarat Housing Society bylaws. Keep van parked in designated service bay and verify manager sign-off prior to departure.`;
      }

      setAiChatMessages((prev) => [
        ...prev,
        {
          id: 'aim_' + (Date.now() + 1),
          sender: 'ai',
          senderName: 'SahYog Squad AI Copilot',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setAiThinking(false);
      playNotificationChime();
    }, 900);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sahyog-logged-in');
      localStorage.removeItem('sahyog-role');
      localStorage.removeItem('sahyog-user-name');
      localStorage.removeItem('sahyog-user-phone');
      localStorage.removeItem('sahyog-user-email');
      localStorage.removeItem('sahyog-user-city');
      localStorage.removeItem('sahyog-user-address');
      localStorage.removeItem('sahyog_worker_mode');
      localStorage.removeItem('sahyog_active_job_status');
      localStorage.removeItem('sahyog-service-scope');
      localStorage.removeItem('sahyog-user-bookings');
      localStorage.removeItem('sahyog_squad_name');
      localStorage.removeItem('sahyog_society_name');
      window.location.href = '/login?role=worker';
    }
  };

  const filteredBookings = allSocietyBookings.filter((b) => {
    if (bookingFilter === 'ALL') return true;
    if (bookingFilter === 'ACTIVE') return b.status === 'CREW_EN_ROUTE' || b.status === 'IN_PROGRESS';
    if (bookingFilter === 'UPCOMING') return b.status === 'SCHEDULED';
    if (bookingFilter === 'COMPLETED') return b.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-32 text-slate-900">
      {/* 1. Locked Community Squad Top Navigation Bar */}
      <header className="bg-[#0f3854] text-white p-3.5 sm:p-4 sticky top-0 z-30 shadow-md border-b border-teal-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-teal-950 font-black text-base flex items-center justify-center shadow-md flex-shrink-0">
              <HardHat className="w-5 h-5 text-teal-950" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="font-black text-base tracking-tight truncate">{workerName}</h1>
                <span className="text-[9px] font-black bg-amber-400 text-teal-950 px-2 py-0.5 rounded-full uppercase flex-shrink-0">
                  Community Squad
                </span>
              </div>
              <p className="text-[10px] text-amber-300 font-semibold truncate">
                {workerRoleInSquad === 'LEAD' ? '⭐ Squad Team Leader' : 'Certified Squad Specialist'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Squad Active</span>
            </span>

            <Link
              href="/notifications"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white relative transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white px-3 py-1.5 rounded-xl border border-rose-500/40 transition cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xs:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Interactive Feature Pills */}
        <div className="max-w-4xl mx-auto mt-3 pt-2.5 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'ACTIVE_JOB', label: '🏠 Active Task', icon: HardHat },
            { id: 'BOOKINGS', label: `📋 Society Bookings (${allSocietyBookings.length})`, icon: Calendar },
            { id: 'CHAT', label: '💬 Society Chat', icon: MessageSquare },
            { id: 'AI', label: '🤖 Squad AI Copilot', icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCurrentTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-teal-950 shadow-sm'
                    : 'bg-white/10 text-teal-100 hover:bg-white/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        {/* Toast Alert */}
        {toastNotice && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-bold flex-1">{toastNotice}</span>
            <button onClick={() => setToastNotice('')} className="text-emerald-700 hover:text-emerald-950 text-xs font-bold">✕</button>
          </div>
        )}

        {/* Lock Notice Banner */}
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between text-xs text-teal-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-700 flex-shrink-0" />
            <span><b>Dedicated Community Squad Terminal:</b> Serving verified multi-worker society deployments with automated pool collection.</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: ACTIVE SQUAD TASK (DEFAULT)                          */}
        {/* ============================================================ */}
        {currentTab === 'ACTIVE_JOB' && (
          <div className="space-y-5">
            {/* Active Society Job Card */}
            <div className="bg-gradient-to-br from-[#0f3854] via-[#0f766e] to-[#0f3854] text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-teal-800/50 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
                <span className="text-[11px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>Assigned Housing Society Task</span>
                </span>
                <span className={`text-xs font-black px-3 py-1 rounded-full uppercase ${
                  jobStatus === 'COMPLETED' 
                    ? 'bg-emerald-400 text-teal-950' 
                    : jobStatus === 'IN_PROGRESS' 
                      ? 'bg-amber-400 text-teal-950 animate-pulse' 
                      : 'bg-white/20 text-white'
                }`}>
                  {jobStatus === 'COMPLETED' ? 'Work Completed' : jobStatus === 'IN_PROGRESS' ? 'Service In Progress' : 'Squad En Route in Van'}
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black leading-tight tracking-tight">
                  {activeBooking.packageTitle}
                </h2>
                <div className="mt-2.5 flex items-center gap-2 text-xs text-teal-100 flex-wrap">
                  <span className="flex items-center gap-1 font-bold text-amber-300">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{activeBooking.societyName}</span>
                  </span>
                  <span>•</span>
                  <span>Squad Size: <b>{activeBooking.crewSize} Workers Deployed</b></span>
                  <span>•</span>
                  <span>Schedule: <b>{activeBooking.scheduledDate} ({activeBooking.scheduledTime})</b></span>
                </div>
              </div>

              {/* Society Security & Manager Details with Interactive Call & Chat Buttons */}
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5 text-xs">
                  <span className="text-[10px] uppercase font-bold text-amber-300">Society Contact Point</span>
                  <p className="font-bold text-white text-sm">{activeBooking.orderedBy}</p>
                  <p className="text-teal-200 text-[11px]">Primary Checkpoint: Main Gate 1 & 2 Security Cabin</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={`tel:${activeBooking.ordererPhone}`}
                    className="flex-1 sm:flex-none bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Phone className="w-4 h-4 text-emerald-300" />
                    <span>Call</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setCurrentTab('CHAT')}
                    className="flex-1 sm:flex-none bg-amber-400 hover:bg-amber-300 text-teal-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat Secretary</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentTab('AI')}
                    className="p-2.5 rounded-xl bg-teal-900/60 hover:bg-teal-900 text-amber-300 border border-teal-600/50 transition cursor-pointer"
                    title="Squad AI SOP Advice"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Button: Verify Gate OTP or Complete Job */}
              <div className="pt-2">
                {jobStatus === 'CREW_EN_ROUTE' && (
                  <button
                    type="button"
                    onClick={() => {
                      setEnteredOtp('');
                      setOtpError('');
                      setOtpModalOpen(true);
                    }}
                    className="w-full bg-amber-400 hover:bg-amber-300 text-teal-950 font-black py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <KeyRound className="w-5 h-5" />
                    <span>Verify Society Gate OTP & Start Squad Work</span>
                  </button>
                )}

                {jobStatus === 'IN_PROGRESS' && (
                  <button
                    type="button"
                    onClick={handleCompleteSocietyJob}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Mark Society Squad Job COMPLETED (Finish)</span>
                  </button>
                )}

                {jobStatus === 'COMPLETED' && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-center text-xs font-bold text-emerald-200">
                    🎉 Job Completed! All squad tasks verified and signed off by Society Secretary.
                  </div>
                )}
              </div>
            </div>

            {/* Squad Crew Members Roster & Direct Call */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-700" />
                    <span>Your Squad Members ({activeBooking.crewSize} Workers)</span>
                  </h3>
                  <p className="text-xs text-slate-500">Co-workers assigned with you for this society project</p>
                </div>
                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  Squad Van #GJ-01-SY-4920
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {activeBooking.crewRoster.map((member) => (
                  <div key={member.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-teal-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        {member.avatarInitials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-slate-900">{member.name}</p>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                            member.role === 'LEAD' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {member.role === 'LEAD' ? 'Team Lead' : 'Specialist'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{member.trade}</p>
                      </div>
                    </div>

                    <a
                      href={`tel:${member.phone}`}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      title={`Call ${member.name}`}
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Squad Pool Earnings Breakdown */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Squad Pool Earnings (कलेक्शन शेयर)</span>
                  </h3>
                  <p className="text-xs text-slate-500">Fixed society contract split equally across certified squad workers</p>
                </div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Direct Bank Transfer
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-center">
                  <span className="text-[11px] font-semibold text-slate-400">Total Society Bill</span>
                  <p className="text-lg font-black text-slate-900 mt-0.5">₹{activeBooking.totalAmount}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-center">
                  <span className="text-[11px] font-semibold text-slate-400">Crew Size</span>
                  <p className="text-lg font-black text-slate-900 mt-0.5">{activeBooking.crewSize} Workers</p>
                </div>
                <div className="col-span-2 sm:col-span-1 bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 text-center">
                  <span className="text-[11px] font-bold text-emerald-800">Your Share (प्रति व्यक्ति)</span>
                  <p className="text-xl font-black text-emerald-700 mt-0.5">₹{activeBooking.poolSharePerWorker}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: COMMUNITY BOOKINGS & CONTRACTS VIEW                  */}
        {/* ============================================================ */}
        {currentTab === 'BOOKINGS' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-black text-slate-900">Society Squad Contracts</h2>
                <p className="text-xs text-slate-500">Residential society tasks assigned to your crew</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center bg-slate-200/70 p-1 rounded-xl gap-1 text-xs">
                {(['ALL', 'ACTIVE', 'UPCOMING', 'COMPLETED'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setBookingFilter(tab)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      bookingFilter === tab
                        ? 'bg-white text-teal-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-teal-500 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black bg-[#0f3854] text-white px-2 py-0.5 rounded-full uppercase">
                          {b.crewSize} Workers Crew
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          b.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'IN_PROGRESS'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-blue-100 text-blue-900'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <h3 className="font-black text-base text-slate-900 mt-1">{b.packageTitle}</h3>
                      <p className="text-xs font-semibold text-teal-700 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{b.societyName}</span>
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] text-slate-400 block font-medium">Your Share</span>
                      <span className="text-lg font-black text-emerald-600">₹{b.poolSharePerWorker}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded-2xl text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Date & Time</span>
                      <span className="font-bold text-slate-900">{b.scheduledDate} ({b.scheduledTime})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Contact Point</span>
                      <span className="font-bold text-slate-900">{b.orderedBy}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 block">Gate Arrival OTP</span>
                      <span className="font-mono font-black text-teal-800 tracking-wider">
                        {b.workerOtp || '****'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <a
                      href={`tel:${b.ordererPhone}`}
                      className="text-xs font-bold text-slate-700 hover:text-teal-700 flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{b.ordererPhone}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveBooking(b);
                        setCurrentTab('ACTIVE_JOB');
                      }}
                      className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
                    >
                      Set Active Task →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: DIRECT SOCIETY SECRETARY CHAT                         */}
        {/* ============================================================ */}
        {currentTab === 'CHAT' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[560px] animate-in fade-in">
            {/* Chat Header */}
            <div className="p-4 bg-gradient-to-r from-[#0f3854] to-[#0f766e] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-teal-950 font-black text-xs flex items-center justify-center shadow-md">
                  SC
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">{activeBooking.orderedBy}</h3>
                  <p className="text-[10px] text-amber-300 font-semibold">{activeBooking.societyName} • Security Cabin</p>
                </div>
              </div>

              <a
                href={`tel:${activeBooking.ordererPhone}`}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-300"
                title="Call"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>

            {/* Quick Chips for Squad */}
            <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
              {[
                '🚚 Van arrived at Society Gate 1',
                '🔑 Ready for 4-digit Arrival OTP',
                '💧 Jetting line work underway',
                '✅ Project completed & signed off'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendSecretaryMessage(undefined, chip)}
                  className="px-2.5 py-1 bg-white border border-slate-200 hover:border-teal-600 rounded-lg text-[11px] font-bold text-slate-700 whitespace-nowrap transition cursor-pointer shadow-2xs"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'worker' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-xs sm:max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'worker'
                        ? 'bg-teal-700 text-white rounded-br-none shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none shadow-xs'
                    }`}
                  >
                    <p className="font-bold text-[10px] opacity-75 mb-1">{msg.senderName}</p>
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendSecretaryMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type update to Society Secretary..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-teal-600"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: SQUAD AI COPILOT                                      */}
        {/* ============================================================ */}
        {currentTab === 'AI' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[560px] animate-in fade-in">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-teal-900 via-[#0f3854] to-emerald-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-emerald-400 text-teal-950 font-black flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-teal-950" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                    <span>SahYog Squad AI Copilot</span>
                    <span className="text-[9px] bg-emerald-400 text-teal-950 px-1.5 py-0.2 rounded font-black">AI LIVE</span>
                  </h3>
                  <p className="text-[10px] text-emerald-200">Society SOPs, Degassing Checklist & Technical Advice</p>
                </div>
              </div>

              <span className="text-[10px] text-amber-300 font-bold">24/7 Specialist</span>
            </div>

            {/* Quick AI Chips */}
            <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
              {[
                '💧 Drain Jetting PSI & Nozzle Angles',
                '🚰 Sump Tank Degassing & Safety',
                '🔑 Society Gate Clearance Protocol',
                '⚡ Substation Electrical AMC Checklist'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendAiPrompt(chip)}
                  className="px-2.5 py-1 bg-white border border-teal-200 hover:border-teal-600 rounded-lg text-[11px] font-bold text-teal-900 whitespace-nowrap transition cursor-pointer shadow-2xs"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
              {aiChatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'worker' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'worker'
                        ? 'bg-teal-700 text-white rounded-br-none shadow-xs'
                        : 'bg-white border border-teal-100 text-slate-900 rounded-bl-none shadow-xs'
                    }`}
                  >
                    <p className="font-bold text-[10px] text-teal-700 mb-1 flex items-center gap-1">
                      {msg.sender === 'ai' && <Sparkles className="w-3 h-3 text-amber-500" />}
                      <span>{msg.senderName}</span>
                    </p>
                    <div className="whitespace-pre-line">{msg.text}</div>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
                </div>
              ))}

              {aiThinking && (
                <div className="flex items-center gap-2 text-xs text-teal-700 font-bold p-2 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Squad Copilot consulting technical SOP manuals...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendAiPrompt(); }} className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask AI technical question about this society task..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-teal-600"
              />
              <button
                type="submit"
                disabled={aiThinking}
                className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Ask AI</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Verify Gate OTP Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-teal-700" />
                <h3 className="font-black text-slate-900 text-base">Enter Society Gate OTP</h3>
              </div>
              <button 
                onClick={() => setOtpModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Ask the Security Guard or Society Secretary for the 4-digit Arrival OTP displayed on their resident screen.
            </p>

            {otpError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyGateOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={4}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9240"
                  className="w-full text-center tracking-widest text-3xl font-mono font-black py-3 border-2 border-teal-600 rounded-2xl outline-none text-slate-900 bg-slate-50"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOtpModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyingOtp || enteredOtp.length !== 4}
                  className="flex-1 py-3 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-black rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {verifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Verify Gate OTP</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav role="worker" />
    </div>
  );
}

export default function WorkerCommunityDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    }>
      <WorkerCommunityDashboardContent />
    </Suspense>
  );
}
