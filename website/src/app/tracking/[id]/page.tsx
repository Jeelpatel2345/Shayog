'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Phone, MessageSquare, ShieldCheck, MapPin, 
  Clock, CheckCircle2, AlertTriangle, Navigation, Star, 
  Sparkles, Check, Share2, CreditCard, QrCode, X, Loader2, 
  Banknote, AlertCircle, KeyRound, CheckCheck
} from 'lucide-react';
import RealTrackingMap from '@/components/RealTrackingMap';
import { allWorkers } from '@/data/workersData';

export default function TrackingPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<any>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [jobStage, setJobStage] = useState<'IN_TRANSIT' | 'IN_PROGRESS' | 'COMPLETED'>('IN_TRANSIT');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyOtpInput, setVerifyOtpInput] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // 5-Minute Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentTimer, setPaymentTimer] = useState(300); // 5 mins
  const [paymentDone, setPaymentDone] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    // 1. Check local storage bookings
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('sahyog-user-bookings');
        if (raw) {
          const list = JSON.parse(raw);
          const found = list.find((b: any) => b.id === bookingId);
          if (found) {
            setBooking(found);
            if (found.status === 'IN_PROGRESS') setJobStage('IN_PROGRESS');
            if (found.status === 'COMPLETED') setJobStage('COMPLETED');
            if (found.paymentStatus === 'PAID') setPaymentDone(true);
          }
        }
      } catch {}

      // 2. Also query API
      fetch('/api/bookings')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.bookings) {
            const found = data.bookings.find((b: any) => b.id === bookingId || b.bookingCode === bookingId);
            if (found) {
              setBooking(found);
              if (found.status === 'IN_PROGRESS') setJobStage('IN_PROGRESS');
              if (found.status === 'COMPLETED') setJobStage('COMPLETED');
              if (found.paymentStatus === 'PAID') setPaymentDone(true);
            }
          }
        })
        .catch(() => {});
    }
  }, [bookingId]);

  // 5-Minute Timer countdown
  useEffect(() => {
    if (!showPaymentModal || paymentTimer <= 0) return;
    const t = setInterval(() => {
      setPaymentTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [showPaymentModal, paymentTimer]);

  // Listen for real-time payment confirmation broadcast from service partner
  useEffect(() => {
    const handleSync = (data: any) => {
      if (!data) return;
      if (data.type === 'PAYMENT_RECEIVED') {
        handleSettlePayment('UPI');
      }
    };

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('sahyog-realtime-sync');
      channel.onmessage = (e) => {
        if (e.data) handleSync(e.data);
      };
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sahyog-realtime-event' && e.newValue) {
        try {
          handleSync(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      channel?.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [bookingId]);

  const worker = allWorkers.find((w) => w.id === booking?.workerId) || allWorkers[0];
  const workerOtp = booking?.workerOtp || '5821';
  const totalAmount = booking?.totalAmount || 625;
  const isPayAfterService = booking?.paymentTiming === 'AFTER_SERVICE' || booking?.paymentStatus !== 'PAID';

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(workerOtp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleVerifyArrivalOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');
    setVerifying(true);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: verifyOtpInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Incorrect OTP');
      }

      setJobStage('IN_PROGRESS');
      setShowVerifyModal(false);

      // Update localStorage
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('sahyog-user-bookings');
          if (raw) {
            const list = JSON.parse(raw);
            const updated = list.map((b: any) => 
              b.id === bookingId ? { ...b, status: 'IN_PROGRESS', otpVerifiedAt: new Date().toISOString() } : b
            );
            localStorage.setItem('sahyog-user-bookings', JSON.stringify(updated));
          }
        } catch {}
      }
    } catch (err: any) {
      setVerifyError(err.message || 'Incorrect 4-digit code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSettlePayment = (method: 'UPI' | 'CASH') => {
    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentDone(true);
      setJobStage('COMPLETED');
      setShowPaymentModal(false);

      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('sahyog-user-bookings');
          if (raw) {
            const list = JSON.parse(raw);
            const updated = list.map((b: any) => 
              b.id === bookingId ? { ...b, status: 'COMPLETED', paymentStatus: 'PAID', paymentMethod: method } : b
            );
            localStorage.setItem('sahyog-user-bookings', JSON.stringify(updated));
          }
        } catch {}
      }
    }, 1500);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const upiString = `upi://pay?pa=sahyog.pay@okaxis&pn=SahYog%20Home%20Services&am=${totalAmount}&cu=INR&tn=SahYog%20Job%20${bookingId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiString)}&margin=1`;

  return (
    <div className="min-h-screen bg-slate-50 py-8 text-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link
            href="/bookings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Bookings</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${jobStage === 'IN_TRANSIT' ? 'bg-emerald-500 animate-ping' : 'bg-teal-600'}`} />
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{jobStage === 'IN_TRANSIT' ? 'Live GPS Active' : jobStage === 'IN_PROGRESS' ? 'Service In Progress' : 'Job Completed'}</span>
            </span>
          </div>
        </div>

        {/* 2-Column Desktop View: Left GPS Map, Right Status & Worker Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Real Map */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Real-Time Worker Location</h2>
                  <p className="text-xs text-slate-500">Live GPS tracking powered by OpenStreetMap</p>
                </div>
                <div className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
                  #{bookingId.slice(0, 8).toUpperCase()}
                </div>
              </div>

              {/* The Real Interactive Map */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-inner">
                <RealTrackingMap
                  workerName={worker.name + ' (' + worker.title + ')'}
                  customerAddress={booking?.address || 'B/402, Shanti Heights, Navrangpura, Ahmedabad'}
                  initialDistanceKm={jobStage === 'IN_TRANSIT' ? 2.4 : 0.0}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-teal-600" />
                  <span>Route: C.G. Road & Ashram Road, Ahmedabad</span>
                </div>
                <span className="font-semibold text-emerald-700">
                  {jobStage === 'IN_TRANSIT' ? 'Traffic: Clear' : 'Partner Reached Location'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Status Card + OTP + Worker Details */}
          <div className="lg:col-span-5 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${
                  jobStage === 'IN_TRANSIT'
                    ? 'text-amber-700 bg-amber-50 border-amber-200'
                    : jobStage === 'IN_PROGRESS'
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200 animate-pulse'
                      : 'text-teal-700 bg-teal-50 border-teal-200'
                }`}>
                  Status: {jobStage === 'IN_TRANSIT' ? 'In Transit' : jobStage === 'IN_PROGRESS' ? 'Service Ongoing' : 'Completed'}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {jobStage === 'IN_TRANSIT' ? 'ETA ~ 8 Mins' : jobStage === 'IN_PROGRESS' ? 'Work Started' : 'Finished'}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {jobStage === 'IN_TRANSIT'
                    ? 'Worker is On The Way'
                    : jobStage === 'IN_PROGRESS'
                      ? 'Arrival Verified • Work in Progress'
                      : 'Job Successfully Completed'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {jobStage === 'IN_TRANSIT'
                    ? `${worker.name} has accepted your booking and is traveling with tools.`
                    : jobStage === 'IN_PROGRESS'
                      ? `${worker.name} is performing the requested service at your address.`
                      : `Service fulfilled with 100% SahYog Quality Guarantee.`}
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Trip / Job Progress</span>
                  <span className="text-teal-700">
                    {jobStage === 'IN_TRANSIT' ? '65%' : jobStage === 'IN_PROGRESS' ? '90%' : '100%'}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-600 to-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: jobStage === 'IN_TRANSIT' ? '65%' : jobStage === 'IN_PROGRESS' ? '90%' : '100%' }} 
                  />
                </div>
              </div>

              {/* 4-Digit Arrival OTP Guard Box */}
              <div className="bg-gradient-to-br from-[#042f2e] to-[#0d9488] text-white p-5 rounded-2xl space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    4-Digit Arrival OTP
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>SahYog Guard</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-3xl font-black font-mono tracking-widest text-amber-300">
                    {workerOtp}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyOtp}
                      className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedOtp ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Share2 className="w-3.5 h-3.5" />}
                      <span>{copiedOtp ? 'Copied' : 'Share'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-black/20 rounded-xl border border-white/10 text-[11px] text-emerald-100/90 leading-snug">
                  {jobStage === 'IN_TRANSIT' ? (
                    <span>⚠️ <b>Safety Rule:</b> Give this 4-digit code to {worker.name} <b>ONLY AFTER</b> they physically arrive at your door. This unlocks the job safely.</span>
                  ) : (
                    <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                      <CheckCheck className="w-4 h-4 text-emerald-300" />
                      Arrival OTP Verified! Worker unlocked and timer active.
                    </span>
                  )}
                </div>

                {jobStage === 'IN_TRANSIT' && (
                  <button
                    type="button"
                    onClick={() => {
                      setVerifyOtpInput(workerOtp);
                      setShowVerifyModal(true);
                    }}
                    className="w-full mt-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Test: Enter OTP as Worker</span>
                  </button>
                )}
              </div>

              {/* Worker Profile Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-700 text-white font-black text-base flex items-center justify-center shadow-md">
                    {getInitials(worker.name)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{worker.name}</h4>
                    <p className="text-xs text-teal-700 font-semibold">{worker.title}</p>
                    <div className="flex items-center gap-1 text-xs text-amber-600 font-bold mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{worker.rating}</span>
                      <span className="text-slate-400 font-normal">({worker.reviewsCount} jobs)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={'tel:' + worker.phone}
                    className="p-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white shadow-xs transition"
                    title="Call Worker"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <Link
                    href={'/dashboard'}
                    className="p-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                    title="Chat / Message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Service & Payment Summary */}
              <div className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Service:</span>
                  <span className="font-bold text-slate-800">{booking?.serviceTitle || booking?.serviceName || worker.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Address:</span>
                  <span className="font-bold text-slate-800 max-w-[200px] truncate text-right">
                    {booking?.address || 'Navrangpura, Ahmedabad'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                  <span className="text-slate-400 font-medium">Payment Status:</span>
                  <span className={`font-black text-xs px-2.5 py-0.5 rounded-md ${
                    paymentDone 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {paymentDone ? `₹${totalAmount} (PAID)` : `₹${totalAmount} (Due After Service)`}
                  </span>
                </div>
              </div>

              {/* Action: Settle Payment if Pay After Service */}
              {isPayAfterService && !paymentDone && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-black py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-amber-300" />
                    <span>Pay ₹{totalAmount} via 5-Min UPI QR / Cash</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Verify Arrival OTP Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base">Verify Arrival OTP</h3>
              </div>
              <button 
                onClick={() => setShowVerifyModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Enter the 4-digit code provided by the customer to verify physical doorstep arrival and start the job timer.
            </p>

            {verifyError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyArrivalOtp} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Enter 4-Digit Customer Code
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={verifyOtpInput}
                  onChange={(e) => setVerifyOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 5821"
                  className="w-full text-center tracking-widest text-2xl font-mono font-black py-2.5 border-2 border-teal-600 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 bg-slate-50"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={verifying || verifyOtpInput.length !== 4}
                className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-black py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Verify OTP & Start Work</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5-Minute UPI QR Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="flex items-center justify-between text-left">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Scan & Pay via UPI</h3>
                <p className="text-xs text-slate-500">Fast, verified payment for {worker.name}</p>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Countdown Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-1.5 rounded-full text-xs font-bold">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>QR Expires in: <span className="font-mono text-amber-700 font-black">{formatTimer(paymentTimer)}</span></span>
            </div>

            {/* QR Code Container */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block mx-auto shadow-inner">
              <img 
                src={qrUrl} 
                alt="UPI Payment QR Code" 
                className="w-44 h-44 mx-auto rounded-xl shadow-xs" 
              />
              <p className="text-[11px] font-mono font-bold text-slate-700 mt-2">
                UPI ID: sahyog.pay@okaxis
              </p>
            </div>

            <div className="text-xs text-slate-500">
              Accepting Google Pay, PhonePe, Paytm, BHIM & all UPI apps
            </div>

            {/* Service Partner Payment Confirmation Status (Customer cannot self-confirm) */}
            <div className="pt-3 border-t border-slate-200 space-y-2.5">
              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-left flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-spin" />
                <div>
                  <p className="text-xs font-bold text-amber-950">Awaiting Service Partner Confirmation</p>
                  <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                    Scan &amp; pay ₹{totalAmount} using any UPI app. Once received, your service partner will click &quot;Confirm Payment Received&quot; on their dashboard.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium py-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Live payment sync active • Completing automatically</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
