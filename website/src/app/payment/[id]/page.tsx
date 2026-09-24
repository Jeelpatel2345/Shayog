'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, Clock, CheckCircle2, ArrowRight, Copy, 
  Check, Smartphone, AlertCircle, Loader2, RefreshCw, 
  ArrowLeft, Lock, Sparkles, Building 
} from 'lucide-react';
import { allWorkers } from '@/data/workersData';

export default function PaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = params.id as string;

  // Retrieve query params or defaults
  const workerId = searchParams.get('workerId') || 'w-101';
  const amountStr = searchParams.get('amount') || '625';
  const totalAmount = parseInt(amountStr) || 625;
  const serviceName = searchParams.get('service') || 'Home Service';
  const date = searchParams.get('date') || 'Tomorrow';
  const time = searchParams.get('time') || '10:00 AM';
  const address = searchParams.get('address') || 'Ahmedabad, Gujarat';

  const worker = allWorkers.find((w) => w.id === workerId) || allWorkers[0];

  // 5-Minute Timer (300 seconds)
  const [timeLeft, setTimeLeft] = useState(300);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'QR' | 'APP' | 'CASH'>('QR');

  const upiId = 'sahyog.pay@okaxis';
  const upiString = `upi://pay?pa=${upiId}&pn=SahYog%20Home%20Services&am=${totalAmount}&cu=INR&tn=Booking%20${bookingId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiString)}&margin=1`;

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Listen for real-time payment confirmation from Service Partner
  useEffect(() => {
    const handleSync = (data: any) => {
      if (!data) return;
      if (data.type === 'PAYMENT_RECEIVED') {
        handleConfirmPayment();
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

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleConfirmPayment = () => {
    setVerifying(true);
    // Simulate webhook verification
    setTimeout(() => {
      setVerifying(false);
      setPaymentSuccess(true);

      // Update booking status in localStorage
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('sahyog-user-bookings');
          if (raw) {
            const list = JSON.parse(raw);
            const updated = list.map((b: any) => 
              b.id === bookingId ? { ...b, status: 'CONFIRMED', paymentStatus: 'PAID' } : b
            );
            localStorage.setItem('sahyog-user-bookings', JSON.stringify(updated));
          }
        } catch {}
      }

      // Redirect to live tracking page
      setTimeout(() => {
        router.push(`/tracking/${bookingId}`);
      }, 1500);
    }, 1800);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-2xl text-center max-w-md space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Payment Received!</h2>
          <p className="text-xs text-slate-600">
            ₹{totalAmount} confirmed via UPI. Worker <b>{worker.name}</b> has been notified and is heading to your location.
          </p>
          <div className="pt-2 text-xs font-bold text-teal-700 animate-pulse">
            Opening Real-Time GPS Tracking Map...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation back */}
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Back</span>
        </Link>

        {/* Progress Stepper */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500 max-w-xl mx-auto">
          <div className="flex items-center gap-2 text-emerald-700">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs">✓</div>
            <span>1. Schedule</span>
          </div>
          <div className="w-12 h-0.5 bg-teal-600" />
          <div className="flex items-center gap-2 text-teal-700">
            <div className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs">2</div>
            <span>2. Scan & Pay</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-200" />
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">3</div>
            <span>3. Live Tracking</span>
          </div>
        </div>

        {/* 2-Column Layout: Left Order Summary, Right Live UPI QR Code */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
              <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
                Booking Summary
              </h3>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white font-black text-base flex items-center justify-center shadow-md">
                  {getInitials(worker.name)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{worker.name}</h4>
                  <p className="text-xs text-teal-700 font-semibold">{serviceName}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                <div className="flex justify-between">
                  <span className="text-slate-400">Booking Code:</span>
                  <span className="font-mono font-bold text-slate-800">#{bookingId.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Scheduled Date:</span>
                  <span className="font-bold text-slate-800">{date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Time Slot:</span>
                  <span className="font-bold text-slate-800">{time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">City / State:</span>
                  <span className="font-bold text-slate-800">Ahmedabad, Gujarat</span>
                </div>
              </div>

              {/* Price Details */}
              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Professional Service Fee:</span>
                  <span className="font-bold text-slate-800">₹{Math.round(totalAmount * 0.8)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Safety Trust Fee:</span>
                  <span className="font-bold text-slate-800">₹25</span>
                </div>
                <div className="flex justify-between">
                  <span>GST & Service Taxes (18%):</span>
                  <span className="font-bold text-slate-800">₹{Math.round(totalAmount * 0.18)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount:</span>
                  <span className="text-teal-700 text-lg">₹{totalAmount}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-emerald-800 font-semibold bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Escrow Protected</span>
                </div>
                <span>SahYog Trust Guard</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic UPI QR Code with 5-Min Timer */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 text-center">
              {/* Timer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="text-left">
                  <span className="text-xs uppercase font-bold text-teal-700">Scan & Pay via UPI</span>
                  <h3 className="text-lg font-black text-slate-900">Official SahYog QR Payment</h3>
                </div>

                {/* 5-Min Countdown Clock */}
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl text-amber-800">
                  <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-600 leading-none">Time Left</div>
                    <div className="text-base font-black leading-tight font-mono">
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                </div>
              </div>

              {timeLeft <= 0 ? (
                <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 space-y-3">
                  <AlertCircle className="w-8 h-8 mx-auto" />
                  <h4 className="font-bold text-sm">QR Code Expired</h4>
                  <p className="text-xs">The 5-minute payment session has expired. Please refresh to generate a new QR code.</p>
                  <button
                    onClick={() => setTimeLeft(300)}
                    className="bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    Generate New QR Code
                  </button>
                </div>
              ) : (
                <>
                  {/* Dynamic QR Code */}
                  <div className="bg-slate-50 border-2 border-dashed border-teal-600/40 rounded-3xl p-6 inline-block shadow-inner relative">
                    <img 
                      src={qrUrl} 
                      alt="SahYog UPI QR Code" 
                      className="w-56 h-56 mx-auto rounded-xl shadow-md bg-white p-2"
                    />
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-black text-slate-800">
                      <span>Exact Amount:</span>
                      <span className="text-teal-700 text-sm font-black">₹{totalAmount}</span>
                    </div>
                  </div>

                  {/* UPI ID copy box */}
                  <div className="max-w-md mx-auto flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700">
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">UPI ID</span>
                      <span className="font-mono font-bold text-slate-900">{upiId}</span>
                    </div>
                    <button
                      onClick={handleCopyUpi}
                      className="text-xs font-bold text-teal-700 hover:text-teal-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1 transition"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Popular UPI Apps supported */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">
                      Scan with any UPI App
                    </span>
                    <div className="flex items-center justify-center gap-4 flex-wrap text-xs font-bold text-slate-600">
                      <span className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">Google Pay</span>
                      <span className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">PhonePe</span>
                      <span className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">Paytm</span>
                      <span className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">BHIM UPI</span>
                    </div>
                  </div>

                  {/* Awaiting Service Partner Verification Status (Customer cannot self-confirm) */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="w-5 h-5 text-emerald-700 animate-pulse" />
                      </div>
                      <div className="space-y-1 text-left">
                        <div className="text-xs font-black text-emerald-900 flex items-center gap-2">
                          <span>Awaiting Service Partner Confirmation</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        </div>
                        <p className="text-[11px] text-emerald-800 leading-relaxed">
                          Scan the QR code above with any UPI app to pay <b>₹{totalAmount}</b>. Payment is verified and confirmed on the service partner's console upon receipt.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium py-1">
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                      <span>Live sync active • Tracking will open automatically upon partner confirmation</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
