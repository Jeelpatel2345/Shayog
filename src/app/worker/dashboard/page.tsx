'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell, MapPin, Clock, Zap, ChevronRight, AlertTriangle, 
  Calendar, Home, MessageSquare, User, Navigation, Phone, 
  CheckCircle2, X, Upload, ShieldCheck, Check, ExternalLink,
  ChevronDown, HelpCircle, ArrowRight, KeyRound, AlertCircle,
  Star, ThumbsUp, Sparkles, Users, Building2, LogOut
} from 'lucide-react';
import RealTrackingMap from '@/components/RealTrackingMap';
import BottomNav from '@/components/BottomNav';

export default function WorkerDashboard() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [workerName, setWorkerName] = useState<string>('Sunita Mehra');
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [activeJobStatus, setActiveJobStatus] = useState<'IN PROGRESS' | 'ON THE WAY' | 'COMPLETED'>('ON THE WAY');
  const [uploadedAadhar, setUploadedAadhar] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);

  // Active Job state - null when waiting for customer bookings, populated strictly for this worker
  const [activeBooking, setActiveBooking] = useState<{
    id: string;
    bookingCode?: string;
    customerName: string;
    customerPhone: string;
    service: string;
    address: string;
    amount: number;
    otpVerified: boolean;
    expectedOtp?: string;
  } | null>(null);

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [toastNotice, setToastNotice] = useState('');

  // Live Reviews & Customer Feedback strictly for this Worker
  const [workerReviews, setWorkerReviews] = useState<any[]>([]);
  const [liveRatingAverage, setLiveRatingAverage] = useState<number>(4.9);
  const [liveReviewCount, setLiveReviewCount] = useState<number>(14);
  const [newReviewReceived, setNewReviewReceived] = useState<any | null>(null);

  // STRICT INDIVIDUAL WORKER DASHBOARD LOCK:
  // Individual workers can ONLY see the Individual Dashboard and cannot access the community dashboard!
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('sahyog-role');
      const mode = localStorage.getItem('sahyog_worker_mode');
      if (role === 'CUSTOMER') {
        window.location.replace('/customer/dashboard');
        return;
      }
      if (mode === 'COMMUNITY') {
        window.location.replace('/worker/community');
        return;
      }

      localStorage.setItem('sahyog_worker_mode', 'INDIVIDUAL');
      localStorage.setItem('sahyog-role', 'WORKER');
      localStorage.setItem('sahyog-logged-in', 'true');

      const currentWorkerName = localStorage.getItem('sahyog-user-name') || 'Sunita Mehra';
      const currentWorkerPhone = localStorage.getItem('sahyog-user-phone') || '';
      setWorkerName(currentWorkerName);

      // 1. Fetch live database bookings for THIS worker
      const pollBookings = async () => {
        try {
          const res = await fetch('/api/bookings');
          if (res.ok) {
            const data = await res.json();
            if (data?.bookings && Array.isArray(data.bookings)) {
              // 1. Priority: booking specifically matching this worker by name or phone
              let active = data.bookings.find((b: any) => {
                const bWorkerName = b.workerProfile?.user?.fullName || b.workerName;
                const bWorkerPhone = b.workerProfile?.user?.phone || b.workerPhone;
                const matchesName = bWorkerName && currentWorkerName && (
                  bWorkerName.toLowerCase().includes(currentWorkerName.toLowerCase()) ||
                  currentWorkerName.toLowerCase().includes(bWorkerName.toLowerCase())
                );
                const matchesPhone = bWorkerPhone && currentWorkerPhone && (
                  bWorkerPhone.replace(/\D/g, '').includes(currentWorkerPhone.replace(/\D/g, '').slice(-10))
                );
                const isActive = b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS' || b.status === 'ACCEPTED' || b.status === 'PENDING';
                return (matchesName || matchesPhone) && isActive;
              });

              // 2. Second priority: any active booking created by a customer in the system
              if (!active) {
                active = data.bookings.find((b: any) => {
                  return b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS' || b.status === 'ACCEPTED' || b.status === 'PENDING';
                });
              }

              if (active) {
                const isVerified = active.status === 'IN_PROGRESS' || !!active.otpVerifiedAt;
                setActiveBooking({
                  id: active.id,
                  bookingCode: active.bookingCode,
                  customerName: active.customer?.fullName || active.customerName || 'Verified Customer',
                  customerPhone: active.customer?.phone || active.customerPhone || '+919876543210',
                  service: active.serviceTitle || 'Home Service Specialist',
                  address: active.serviceLocation || 'Ahmedabad, Gujarat',
                  amount: active.totalAmount || 500,
                  otpVerified: isVerified,
                  expectedOtp: active.workerOtp,
                });
                setActiveJobStatus(isVerified ? 'IN PROGRESS' : 'ON THE WAY');
              } else {
                // Check if completed
                const completed = data.bookings.find((b: any) => b.status === 'COMPLETED');
                if (completed && activeJobStatus === 'IN PROGRESS') {
                  setActiveJobStatus('COMPLETED');
                } else if (!active) {
                  setActiveBooking(null);
                }
              }
            }
          }
        } catch (err) {
          console.warn('Booking poll error:', err);
        }
      };

      // 2. Fetch live reviews for THIS worker
      const pollReviews = async () => {
        try {
          const res = await fetch('/api/reviews');
          if (res.ok) {
            const data = await res.json();
            if (data?.reviews && Array.isArray(data.reviews)) {
              let myRevs = data.reviews.filter((r: any) => {
                const rWorker = r.workerName || r.workerProfile?.user?.fullName;
                return !rWorker || (currentWorkerName && (
                  rWorker.toLowerCase().includes(currentWorkerName.toLowerCase()) ||
                  currentWorkerName.toLowerCase().includes(rWorker.toLowerCase())
                ));
              });

              if (myRevs.length === 0 && data.reviews.length > 0) {
                myRevs = data.reviews;
              }

              if (myRevs.length > 0) {
                setWorkerReviews(myRevs);
                const avg = myRevs.reduce((acc: number, r: any) => acc + (parseFloat(r.rating) || 5), 0) / myRevs.length;
                setLiveRatingAverage(Math.round(avg * 10) / 10);
                setLiveReviewCount(myRevs.length);
              }
            }
          }
        } catch (err) {
          console.warn('Review poll error:', err);
        }
      };

      pollBookings();
      pollReviews();

      const bookingInterval = setInterval(pollBookings, 3000);
      const reviewInterval = setInterval(pollReviews, 4000);

      // 3. Real-time sync listener for live customer reviews & new bookings
      const handleRealtimeMessage = (data: any) => {
        if (data?.type === 'REVIEW_SUBMITTED' && data.review) {
          const r = data.review;
          const rWorker = r.workerName;
          const isForMe = !rWorker || (currentWorkerName && (
            rWorker.toLowerCase().includes(currentWorkerName.toLowerCase()) ||
            currentWorkerName.toLowerCase().includes(rWorker.toLowerCase())
          ));

          if (isForMe) {
            const newRev = { ...r, timeAgo: 'Just now' };
            setWorkerReviews((prev) => [newRev, ...prev.filter(p => p.id !== r.id)]);
            setNewReviewReceived(newRev);
            setLiveReviewCount(prev => prev + 1);
            setToastNotice(`🎉 New ${r.rating}-Star Review Received from ${r.customerName || 'Customer'}!`);
            setTimeout(() => setToastNotice(''), 7000);
          }
        } else if (data?.type === 'NEW_BOOKING' && data.booking) {
          const b = data.booking;
          const bWorker = b.workerName || b.workerProfile?.user?.fullName;
          const isForMe = !bWorker || (currentWorkerName && (
            bWorker.toLowerCase().includes(currentWorkerName.toLowerCase()) ||
            currentWorkerName.toLowerCase().includes(bWorker.toLowerCase())
          ));
          if (isForMe) {
            setActiveBooking({
              id: b.id,
              bookingCode: b.bookingCode,
              customerName: b.customerName || 'Customer',
              customerPhone: b.customerPhone || '+919876543210',
              service: b.serviceTitle || 'Home Service',
              address: b.serviceLocation || 'Ahmedabad, Gujarat',
              amount: b.totalAmount || 500,
              otpVerified: false,
              expectedOtp: b.workerOtp,
            });
            setActiveJobStatus('ON THE WAY');
            setToastNotice(`🔔 New Booking Received from ${b.customerName || 'Customer'}!`);
            setTimeout(() => setToastNotice(''), 6000);
          }
        }
      };

      // BroadcastChannel for instant cross-tab sync
      let channel: BroadcastChannel | null = null;
      try {
        channel = new BroadcastChannel('sahyog-realtime-sync');
        channel.onmessage = (e) => {
          if (e.data) handleRealtimeMessage(e.data);
        };
      } catch {}

      // Storage event listener for cross-window sync
      const handleStorage = (e: StorageEvent) => {
        if (e.key === 'sahyog-realtime-event' && e.newValue) {
          try {
            handleRealtimeMessage(JSON.parse(e.newValue));
          } catch {}
        }
      };
      window.addEventListener('storage', handleStorage);

      return () => {
        clearInterval(bookingInterval);
        clearInterval(reviewInterval);
        if (channel) channel.close();
        window.removeEventListener('storage', handleStorage);
      };
    }
  }, []);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const initials = getInitials(workerName);

  const handleAadharUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedAadhar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationSubmitted(true);
      setShowUploadModal(false);
    }, 1200);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.length < 4) {
      setOtpError('Please enter the full 4-digit code provided by customer');
      return;
    }
    if (!activeBooking?.id) {
      setOtpError('No active booking found to verify');
      return;
    }
    setOtpError('');
    setVerifyingOtp(true);

    try {
      const res = await fetch(`/api/bookings/${activeBooking.id}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: enteredOtp }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Incorrect OTP code');
      }

      setActiveJobStatus('IN PROGRESS');
      setActiveBooking((prev) => prev ? ({ ...prev, otpVerified: true }) : null);
      setOtpModalOpen(false);
      setEnteredOtp('');
      setToastNotice('✅ 4-Digit OTP Verified! Work is now IN PROGRESS.');
      setTimeout(() => setToastNotice(''), 4000);

      // Broadcast real-time event to Customer Dashboard
      try {
        const channel = new BroadcastChannel('sahyog-realtime-sync');
        channel.postMessage({
          type: 'JOB_STARTED',
          bookingId: activeBooking.id,
          workerName,
          timestamp: Date.now()
        });
        channel.close();
      } catch {}

      if (typeof window !== 'undefined') {
        localStorage.setItem('sahyog_active_job_status', 'IN_PROGRESS');
        localStorage.setItem('sahyog-realtime-event', JSON.stringify({
          type: 'JOB_STARTED',
          bookingId: activeBooking.id,
          workerName,
          timestamp: Date.now()
        }));
      }
    } catch (err: any) {
      // STRICT OTP CHECK: Never accept random numbers on error!
      setOtpError(err.message || 'Incorrect 4-digit OTP. Please ask customer to check their screen.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleCompleteJob = async () => {
    if (!activeBooking?.id) return;
    try {
      await fetch(`/api/bookings/${activeBooking.id}/complete`, { method: 'POST' }).catch(() => {});
    } catch (_) {}
    setActiveJobStatus('COMPLETED');
    setToastNotice(`🎉 Job Completed! ₹${activeBooking.amount} added to your account.`);
    setTimeout(() => setToastNotice(''), 5000);

    // Broadcast real-time event to Customer Dashboard to auto-open feedback
    try {
      const channel = new BroadcastChannel('sahyog-realtime-sync');
      channel.postMessage({
        type: 'JOB_COMPLETED',
        bookingId: activeBooking.id,
        workerName: workerName || 'Worker Partner',
        service: activeBooking.service,
        timestamp: Date.now()
      });
      channel.close();
    } catch {}

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sahyog_active_job_status', 'COMPLETED');
        localStorage.setItem('sahyog-realtime-event', JSON.stringify({
          type: 'JOB_COMPLETED',
          bookingId: activeBooking.id,
          workerName: workerName || 'Worker Partner',
          service: activeBooking.service,
          timestamp: Date.now()
        }));

        const raw = localStorage.getItem('sahyog-user-bookings');
        if (raw) {
          const list = JSON.parse(raw);
          const updatedList = list.map((b: any) =>
            b.id === activeBooking.id || b.bookingCode === activeBooking.id
              ? { ...b, status: 'COMPLETED', paymentStatus: 'PAID' }
              : b
          );
          localStorage.setItem('sahyog-user-bookings', JSON.stringify(updatedList));
        }
      } catch {}
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
    <div className="min-h-screen bg-slate-100/70 pb-28 text-slate-900">
      {/* Container to maintain max width on mobile while looking elegant on desktop */}
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl shadow-slate-200/50 flex flex-col">
        
        {/* Top Header Bar */}
        <header className="bg-white px-5 py-4 flex items-center justify-between border-b border-slate-100 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2.5">
            <img 
              src="/logo.png" 
              alt="SahYog" 
              className="w-9 h-9 object-contain drop-shadow-sm" 
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-lg tracking-tight text-slate-900 leading-none">
                  SahYog Worker
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Partner
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Welcome back, <b className="text-teal-900">{workerName}</b>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link 
              href="/notifications" 
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-600 rounded-full" />
            </Link>

            <Link 
              href="/profile" 
              className="w-9 h-9 rounded-full bg-teal-700 hover:bg-teal-800 text-white font-black text-xs flex items-center justify-center shadow-sm transition"
              title="My Profile"
            >
              {initials}
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
              title="Log Out to Login Page"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-5 space-y-4 pb-16 sm:pb-8">
          
          {/* Status Toggle Card (Online / Offline) */}
          <div 
            className={`rounded-2xl p-4 transition-all duration-300 shadow-sm ${
              isOnline 
                ? 'bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white shadow-teal-900/10' 
                : 'bg-slate-700 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-300 animate-ping' : 'bg-slate-400'}`} />
                  <p className="text-white font-black text-lg tracking-tight">
                    {isOnline ? 'You are Online' : 'You are Offline'}
                  </p>
                </div>
                <p className="text-teal-100 text-xs sm:text-sm mt-0.5">
                  {isOnline ? 'Accepting new jobs nearby' : 'Not accepting jobs • Switch on when ready'}
                </p>
              </div>

              {/* iOS style toggle switch */}
              <button 
                type="button"
                onClick={() => setIsOnline(!isOnline)} 
                className={`w-14 h-8 rounded-full relative transition-colors duration-200 cursor-pointer ${
                  isOnline ? 'bg-white/30' : 'bg-slate-600'
                }`}
                aria-label="Toggle Online Status"
              >
                <div 
                  className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all duration-200 shadow-md ${
                    isOnline ? 'right-1' : 'left-1'
                  }`} 
                />
              </button>
            </div>

            {isOnline && (
              <div className="mt-3.5 bg-teal-800/60 backdrop-blur-xs rounded-xl p-2.5 flex items-center gap-2 border border-teal-500/30">
                <Zap className="w-4 h-4 text-amber-300 animate-bounce flex-shrink-0" />
                <span className="text-white text-xs font-semibold">
                  High demand in your area! 4+ requests waiting.
                </span>
              </div>
            )}
          </div>

          {/* Society Squad Mode Option */}
          <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 rounded-2xl p-4 text-white shadow-md border border-teal-800/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center flex-shrink-0 text-teal-300">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black tracking-wide text-white uppercase">Society Squad Mode</span>
                    <span className="text-[10px] font-black bg-teal-400 text-slate-950 px-2 py-0.5 rounded-full">CREW</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                    Provide services in societies with multi-worker teams & pool earnings
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-teal-200 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-300" /> Private Home Visits Verified
              </span>
              <span className="text-[10px] font-black text-amber-300 bg-white/10 px-2.5 py-1 rounded-full uppercase">
                1-on-1 Individual Mode
              </span>
            </div>
          </div>

          {/* Weekly Earnings Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                WEEKLY EARNINGS
              </p>
              <Link 
                href="/worker/earnings" 
                className="text-teal-700 hover:text-teal-800 text-xs font-bold flex items-center gap-0.5"
              >
                History <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex items-center justify-between mt-1">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ₹ 4,850
                </span>
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-xs font-bold ml-2 px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                  📈 +12%
                </span>
              </div>

              {/* 7-Day Visual Mini Bar Chart */}
              <div className="flex items-end gap-1.5 h-10 px-2 py-1 bg-slate-50 rounded-xl border border-slate-100">
                {[
                  { day: 'M', h: 40 },
                  { day: 'T', h: 60 },
                  { day: 'W', h: 35 },
                  { day: 'T', h: 80 },
                  { day: 'F', h: 55 },
                  { day: 'S', h: 70 },
                  { day: 'S', h: 95, active: true },
                ].map((bar, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <div 
                      className={`w-2.5 rounded-t-sm transition-all ${
                        bar.active ? 'bg-teal-700 shadow-xs' : 'bg-slate-200'
                      }`} 
                      style={{ height: `${bar.h * 0.35}px` }} 
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs">
              <span className="text-slate-500 font-medium">Target: ₹ 6,000</span>
              <span className="text-teal-700 font-bold">80% Reached</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-teal-600 to-emerald-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: '80%' }} 
              />
            </div>

            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-xs">
              <span className="text-slate-400">Next payout: <b>Monday, 27 Oct</b></span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Direct Bank Transfer
              </span>
            </div>
          </div>

          {/* Active Job Card or Waiting State */}
          {activeBooking ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-700" />
                  Active Assignment
                </h3>
                <span className="text-[11px] font-bold border border-teal-600 bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {activeJobStatus}
                </span>
              </div>

              <div className="bg-white rounded-2xl p-4 border-2 border-teal-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-full -mr-10 -mt-10 pointer-events-none" />

                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <span className="text-teal-700 font-black text-base tracking-tight block">
                      {activeBooking.service}
                    </span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      {activeBooking.customerName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xl text-slate-900 leading-none">₹ {activeBooking.amount}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Fixed Fee</p>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
                    <span className="font-medium text-slate-800">{activeBooking.address}</span>
                    <span className="text-[11px] text-slate-400">• 2.4 km away</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
                    <span>Scheduled: <b>Today (Active)</b></span>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setShowDirectionsModal(true)}
                    className="flex-1 bg-teal-700 hover:bg-teal-800 text-white py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Open Directions</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setShowContactModal(true)}
                    className="p-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl flex items-center justify-center transition"
                    title="Contact Customer"
                  >
                    <Phone className="w-4 h-4 text-teal-700" />
                  </button>

                  <Link
                    href="/chat/1?role=worker"
                    className="p-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl flex items-center justify-center transition relative"
                    title="Chat with Customer"
                  >
                    <MessageSquare className="w-4 h-4 text-teal-700" />
                    <span className="w-2 h-2 bg-amber-500 rounded-full absolute top-1 right-1" />
                  </Link>
                </div>

                {/* 4-Digit Arrival OTP & Job Completion Trigger */}
                <div className="mt-3">
                  {activeJobStatus !== 'COMPLETED' ? (
                    !activeBooking.otpVerified && activeJobStatus !== 'IN PROGRESS' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setOtpModalOpen(true);
                          setEnteredOtp('');
                          setOtpError('');
                        }}
                        className="w-full py-2.5 px-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
                      >
                        <KeyRound className="w-4 h-4 text-slate-950" />
                        <span>Arrived? Enter Customer 4-Digit OTP</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCompleteJob}
                        className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Complete Job & Collect ₹{activeBooking.amount}</span>
                      </button>
                    )
                  ) : (
                    <div className="w-full py-2.5 bg-emerald-50 text-emerald-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Job Completed & Payment Credited (₹{activeBooking.amount})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto relative">
                <Zap className="w-6 h-6 text-amber-500 animate-pulse" />
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Online • Ready for Customer Bookings</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                  No active assignments right now. When a customer books your service, it will appear here in real time with the 4-digit arrival OTP!
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Live Status Radar:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Listening for bookings
                </span>
              </div>
            </div>
          )}

          {/* Upcoming Bookings Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span>📋</span> Upcoming Bookings
              </h3>
              <Link 
                href="/worker/bookings" 
                className="text-teal-700 hover:text-teal-800 text-xs font-bold flex items-center gap-0.5"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {[
                { 
                  id: 'bk-101',
                  title: 'Fan Installation & Wiring', 
                  loc: 'Golf Course Rd, Gurgaon', 
                  date: 'TOMORROW', 
                  time: '09:00 AM', 
                  price: 450,
                  customer: 'Pooja Verma'
                }, 
                { 
                  id: 'bk-102',
                  title: 'Deep Kitchen Cleaning', 
                  loc: 'Cyber Hub, DLF Phase 2', 
                  date: '24 OCT', 
                  time: '02:00 PM', 
                  price: 1200,
                  customer: 'Vikas Mehra'
                }
              ].map((booking) => (
                <Link
                  key={booking.id}
                  href="/worker/bookings"
                  className="bg-white rounded-xl p-3.5 border border-slate-200 hover:border-teal-300 transition flex items-center gap-3.5 group shadow-2xs"
                >
                  <div className="w-10 h-10 bg-teal-50 group-hover:bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center flex-shrink-0 transition">
                    <Calendar className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                      {booking.title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {booking.customer} • {booking.loc}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {booking.date}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {booking.time}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-slate-900 text-sm sm:text-base">
                      ₹{booking.price}
                    </p>
                    <ChevronRight className="w-4 h-4 text-slate-400 ml-auto mt-1 group-hover:text-teal-700 transition" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Verification Pending Alert Card */}
          {!verificationSubmitted ? (
            <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-rose-900 text-sm">
                    Verification Pending
                  </p>
                  <span className="text-[10px] font-bold bg-rose-200 text-rose-800 px-2 py-0.5 rounded-md uppercase">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Please upload your Aadhaar Card back side to complete your profile verification and unlock 100% daily payouts.
                </p>
                <button 
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="mt-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3.5 py-1.5 rounded-lg transition inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Now
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-900 text-sm">
                  Documents Submitted for Verification
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Your Aadhaar card has been submitted. Our team is verifying it within 2 business hours.
                </p>
              </div>
            </div>
          )}

          {/* ⭐ Customer Ratings & Live Reviews Card (Filtered ONLY for this Worker) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs">
                  <Star className="w-5 h-5 fill-slate-950" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900 leading-tight">
                    Customer Ratings & Reviews
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Live feedback for <b className="text-teal-900">{workerName}</b>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-xl shadow-2xs">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-black text-sm text-slate-900">{liveRatingAverage.toFixed(1)}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                  {liveReviewCount} Ratings
                </p>
              </div>
            </div>

            {/* Live review celebration alert if just received */}
            {newReviewReceived && (
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-3.5 rounded-xl flex items-center justify-between animate-in zoom-in-95 duration-300 shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-spin flex-shrink-0" />
                  <div>
                    <p className="text-xs font-black">New Review Received Just Now!</p>
                    <p className="text-[10px] text-emerald-100">From {newReviewReceived.customerName || 'Customer'}</p>
                  </div>
                </div>
                <span className="bg-white/20 backdrop-blur-xs text-white text-xs font-black px-2.5 py-1 rounded-lg border border-white/20">
                  ★ {newReviewReceived.rating}.0
                </span>
              </div>
            )}

            {/* Reviews Feed */}
            <div className="space-y-3">
              {workerReviews.map((rev, idx) => (
                <div
                  key={rev.id || idx}
                  className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/90 hover:border-teal-300 transition space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-teal-800 text-amber-300 font-bold text-xs flex items-center justify-center shadow-xs">
                        {(rev.customerName || 'Customer').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-xs text-slate-900">
                            {rev.customerName || 'Verified Customer'}
                          </p>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                            Verified
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {rev.timeAgo || 'Just now'} • {rev.service || activeBooking?.service || 'Home Service'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= (rev.rating || 5)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Compliment Badges */}
                  {rev.tags && rev.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {rev.tags.map((tag: string, tIdx: number) => (
                        <span
                          key={tIdx}
                          className="text-[10px] font-bold bg-white text-teal-800 px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Written Comment */}
                  {rev.comment || rev.feedback ? (
                    <p className="text-xs text-slate-700 italic font-medium leading-relaxed bg-white/70 p-2.5 rounded-xl border border-slate-100">
                      "{rev.comment || rev.feedback}"
                    </p>
                  ) : null}

                  {/* Recommendation Badge */}
                  {rev.recommended !== false && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 pt-0.5">
                      <ThumbsUp className="w-3 h-3 text-emerald-600" />
                      <span>Customer would recommend to neighbors</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </main>

        {/* Standard Bottom Navigation Bar */}
        <BottomNav role="worker" />
      </div>

      {/* Real Directions & Map Modal */}
      {showDirectionsModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] my-auto">
            <div className="bg-teal-800 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-amber-300" />
                  Route to Amit Sharma
                </h3>
                <p className="text-xs text-teal-200">Sector 45, Gurgaon • 2.4 km (8 mins)</p>
              </div>
              <button 
                type="button"
                onClick={() => setShowDirectionsModal(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {/* Interactive Live Route Map */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <RealTrackingMap 
                  workerName="You (On the way)" 
                  customerAddress="Sector 45, Gurgaon" 
                  initialDistanceKm={2.4} 
                />
              </div>

              {/* Status Updater */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Update Job Progress
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(['ON THE WAY', 'IN PROGRESS', 'COMPLETED'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setActiveJobStatus(status)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition border ${
                        activeJobStatus === status
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* External GPS launcher */}
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Sector+45+Gurgaon"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
              >
                <ExternalLink className="w-4 h-4" />
                Open Turn-by-Turn in Google Maps
              </a>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDirectionsModal(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aadhaar Upload Verification Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-5 space-y-4 max-h-[85vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-base text-slate-900">Upload Aadhaar Card (Back)</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Upload a clear photo or scanned copy of the backside of your Aadhaar card showing your residential address for verified partner status.
            </p>

            <div className="border-2 border-dashed border-teal-300 bg-teal-50/40 rounded-2xl p-6 text-center">
              {uploadedAadhar ? (
                <div className="space-y-2">
                  <img 
                    src={uploadedAadhar} 
                    alt="Aadhaar Preview" 
                    className="max-h-36 mx-auto rounded-lg object-contain border border-teal-200 shadow-xs" 
                  />
                  <p className="text-xs text-emerald-700 font-bold flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" /> Ready to Submit
                  </p>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-2">
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 mx-auto flex items-center justify-center shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-teal-800">Tap to Choose Photo or Document</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, or PDF up to 5MB</p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*,application/pdf" 
                    className="hidden" 
                    onChange={handleAadharUpload}
                  />
                </label>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!uploadedAadhar || isVerifying}
                onClick={submitVerification}
                className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                {isVerifying ? 'Verifying...' : 'Submit Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Customer Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-5 space-y-4 max-h-[85vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Contact Customer</h3>
              <button 
                type="button"
                onClick={() => setShowContactModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center">
                {activeBooking?.customerName ? activeBooking.customerName.slice(0, 2).toUpperCase() : 'CU'}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{activeBooking?.customerName || 'Customer'}</p>
                <p className="text-xs text-slate-500">{activeBooking?.address || 'Ahmedabad, Gujarat'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <a 
                href={`tel:${activeBooking?.customerPhone || '+919876543210'}`}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Phone className="w-4 h-4" />
                Call Customer ({activeBooking?.customerPhone || '+91 98765 43210'})
              </a>

              <Link
                href="/chat/1?role=worker"
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
              >
                <MessageSquare className="w-4 h-4" />
                Open Live In-App Chat
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastNotice && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-700 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Enter Customer 4-Digit OTP Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-slate-900 text-base">Verify Customer OTP</h3>
              </div>
              <button 
                type="button"
                onClick={() => setOtpModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-800">{activeBooking?.customerName || 'Customer'}</p>
              <p className="text-slate-500">{activeBooking?.service || 'Service'}</p>
              <p className="text-slate-400 text-[11px]">{activeBooking?.address || 'Location'}</p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Ask {activeBooking?.customerName || 'the customer'} for the <b>4-digit code</b> shown on their SahYog tracking screen to unlock the job.
            </p>

            {otpError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={4}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 5821"
                  className="w-full text-center tracking-widest text-3xl font-mono font-black py-3 border-2 border-amber-400 rounded-xl outline-none focus:ring-2 focus:ring-amber-400/30 text-slate-900 bg-amber-50/40"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={verifyingOtp || enteredOtp.length < 4}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-sm transition shadow-sm cursor-pointer"
              >
                {verifyingOtp ? 'Verifying OTP...' : 'Unlock & Start Job'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
