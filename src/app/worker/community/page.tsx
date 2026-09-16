'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Users, ShieldCheck, CheckCircle2, Star, Clock, 
  MapPin, Phone, Sparkles, Building2, KeyRound, Wrench, 
  AlertCircle, Check, Loader2, Calendar, ArrowRight,
  Truck, HardHat, FileText, CheckCheck, X, LogOut, RefreshCw, Banknote, Shield
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { 
  defaultActiveCommunityBooking, 
  registeredSocieties, 
  CommunityBooking, 
  CrewMember 
} from '@/data/communityData';

export default function WorkerCommunityDashboard() {
  const router = useRouter();

  // STRICT COMMUNITY DASHBOARD LOCK:
  // Community workers can ONLY see the Community Dashboard and never the individual worker dashboard.
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
  const [jobStatus, setJobStatus] = useState<'CREW_EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED'>('CREW_EN_ROUTE');
  
  // OTP Verification Modal
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [toastNotice, setToastNotice] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('sahyog-user-name') || 'Mahesh Barot';
      setWorkerName(savedName);

      // Check if user is lead or squad member
      if (savedName.toLowerCase().includes('mahesh') || savedName.toLowerCase().includes('sunita') || savedName.toLowerCase().includes('karan') || savedName.toLowerCase().includes('rajesh')) {
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
              const active = data.bookings.find((b: any) => b.status !== 'COMPLETED') || data.bookings[0];
              setActiveBooking(active);
              if (active.status === 'IN_PROGRESS') setJobStatus('IN_PROGRESS');
              if (active.status === 'COMPLETED') setJobStatus('COMPLETED');
            }
          }
        } catch {}
      };

      poll();
      const interval = setInterval(poll, 3000);

      // Broadcast receiver
      const handleRealtime = (data: any) => {
        if (data?.type === 'NEW_COMMUNITY_BOOKING') {
          poll();
          setToastNotice('🔔 New Society Squad Job Assigned to your Crew!');
          setTimeout(() => setToastNotice(''), 6000);
        }
      };

      let channel: BroadcastChannel | null = null;
      try {
        channel = new BroadcastChannel('sahyog-realtime-sync');
        channel.onmessage = (e) => handleRealtime(e.data);
      } catch {}

      return () => {
        clearInterval(interval);
        if (channel) channel.close();
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

  return (
    <div className="min-h-screen bg-slate-50 pb-32 text-slate-900">
      {/* Locked Community Squad Top Bar */}
      <div className="bg-[#0f3854] text-white p-4 sticky top-0 z-30 shadow-md border-b border-teal-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-teal-950 font-black text-base flex items-center justify-center shadow-md">
              <HardHat className="w-5 h-5 text-teal-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base sm:text-lg tracking-tight">{workerName}</h1>
                <span className="text-[10px] font-black bg-amber-400 text-teal-950 px-2 py-0.5 rounded-full uppercase">
                  Community Squad
                </span>
              </div>
              <p className="text-[11px] text-amber-300 font-semibold">
                {workerRoleInSquad === 'LEAD' ? '⭐ Squad Team Leader' : 'Certified Squad Specialist'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Squad Active</span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white px-3 py-1.5 rounded-xl border border-rose-500/40 transition cursor-pointer"
              title="Log Out to Login Page"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5 space-y-6">
        {/* Toast Alert */}
        {toastNotice && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-bold flex-1">{toastNotice}</span>
          </div>
        )}

        {/* Lock Notice Banner */}
        <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between text-xs text-teal-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-700 flex-shrink-0" />
            <span><b>Dedicated Community Squad Dashboard:</b> You are serving as a verified multi-worker Society Squad partner. Private individual jobs are segregated to this dedicated squad terminal.</span>
          </div>
        </div>

        {/* 1. Active Society Job Card */}
        <div className="bg-gradient-to-br from-[#0f3854] via-[#0f766e] to-[#0f3854] text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-teal-800/50 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
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
            <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
              {activeBooking.packageTitle}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-teal-200">
              <span className="flex items-center gap-1 font-bold text-white">
                <MapPin className="w-4 h-4 text-amber-300" />
                {activeBooking.societyName}
              </span>
              <span>•</span>
              <span>Squad Size: <b>{activeBooking.crewSize} Workers Deployed</b></span>
              <span>•</span>
              <span>Schedule: <b>{activeBooking.scheduledDate} ({activeBooking.scheduledTime})</b></span>
            </div>
          </div>

          {/* Society Security & Manager Details */}
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5 text-xs">
              <span className="text-[10px] uppercase font-bold text-amber-300">Society Contact Point</span>
              <p className="font-bold text-white text-sm">{activeBooking.orderedBy}</p>
              <p className="text-teal-200 text-[11px]">Primary Checkpoint: Main Gate 1 & 2 Security Cabin</p>
            </div>

            <a
              href={`tel:${activeBooking.ordererPhone}`}
              className="bg-amber-400 hover:bg-amber-300 text-teal-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Call Society Contact</span>
            </a>
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

        {/* 2. Squad Crew Members Roster & Direct Call */}
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

        {/* 3. Squad Pool Earnings Breakdown */}
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
