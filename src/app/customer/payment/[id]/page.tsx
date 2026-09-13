'use client';
import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, Bell, Info, CheckCircle2, CreditCard, Building, 
  Banknote, ShieldCheck, ChevronRight, User, ExternalLink, 
  Smartphone, QrCode, Lock, Sparkles, Check, Loader2, ArrowUpRight
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { allWorkers } from '@/data/workersData';

interface UpiApp {
  id: string;
  name: string;
  scheme: string;
  color: string;
  textColor: string;
  badge: string;
}

const upiApps: UpiApp[] = [
  {
    id: 'gpay',
    name: 'Google Pay',
    scheme: 'tez://upi/pay',
    color: 'bg-white border border-gray-200 hover:border-blue-500',
    textColor: 'text-gray-800',
    badge: 'Popular'
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    scheme: 'phonepe://pay',
    color: 'bg-[#5f259f]/5 border border-[#5f259f]/20 hover:border-[#5f259f]',
    textColor: 'text-[#5f259f]',
    badge: 'Instant'
  },
  {
    id: 'paytm',
    name: 'Paytm UPI',
    scheme: 'paytmmp://pay',
    color: 'bg-[#002e6e]/5 border border-[#002e6e]/20 hover:border-[#002e6e]',
    textColor: 'text-[#002e6e]',
    badge: 'Fast'
  },
  {
    id: 'bhim',
    name: 'Any UPI App (BHIM / CRED)',
    scheme: 'upi://pay',
    color: 'bg-emerald-50 border border-emerald-200 hover:border-emerald-500',
    textColor: 'text-emerald-800',
    badge: 'Universal'
  }
];

function PaymentContent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Dynamic parameters passed from booking screen
  const rawAmount = searchParams.get('amount');
  const amount = rawAmount ? parseInt(rawAmount) : 1250;
  const durationHours = parseInt(searchParams.get('hours') || '4');

  const worker = useMemo(() => {
    return (
      allWorkers.find((w) => w.id === params.id || w.id === `w-${params.id}`) ||
      allWorkers[0]
    );
  }, [params.id]);

  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking' | 'cash'>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('gpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const bookingCode = 'SY-9021';
  const upiId = 'sahyogtrust@upi';
  const upiIntentUrl = `upi://pay?pa=${upiId}&pn=SahYog%20Services&mc=0000&tid=TX${Date.now().toString().slice(-6)}&tr=${bookingCode}&tn=SahYog%20Home%20Service%20Booking&am=${amount}&cu=INR`;

  const handleTriggerPayment = (schemePrefix?: string) => {
    setIsProcessing(true);

    const intentToOpen = schemePrefix 
      ? `${schemePrefix}?pa=${upiId}&pn=SahYog%20Services&mc=0000&tr=${bookingCode}&tn=SahYog%20Booking&am=${amount}&cu=INR`
      : upiIntentUrl;

    try {
      window.location.href = intentToOpen;
    } catch {
      // Fallback
    }

    // Simulate payment callback confirmation
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        router.push('/customer/tracking/1');
      }, 2000);
    }, 1800);
  };

  // Breakdown figures based on dynamic amount
  const baseServiceFee = Math.round(amount * 0.78);
  const platformSafety = Math.round(amount * 0.05);
  const gstAmount = amount - (baseServiceFee + platformSafety);

  return (
    <div className="min-h-screen bg-slate-50 pb-36 sm:pb-32 text-slate-900">
      {/* Top Header */}
      <div className="bg-[#042f2e] text-white border-b border-emerald-900/60 sticky top-0 z-30 shadow-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/customer/booking/${worker.id}`}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-emerald-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-bold text-base sm:text-lg text-white">Select UPI Payment Method</h1>
          </div>
          <span className="text-xs font-bold text-amber-300 bg-emerald-950/60 border border-emerald-700/50 px-3 py-1 rounded-full">
            256-Bit SSL Encrypted
          </span>
        </div>
      </div>

      {/* Success Overlay */}
      {paymentSuccess && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 text-center max-w-sm w-full shadow-2xl space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Payment Successful!</h2>
            <p className="text-xs text-slate-500">
              ₹{amount}.00 received via UPI. Funds held safely in SahYog Escrow until service is completed.
            </p>
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-800 text-xs font-mono font-bold">
              Ref: TXN-SY-{Date.now().toString().slice(-6)}
            </div>
            <p className="text-[11px] text-slate-400">Redirecting to live job tracking...</p>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 text-center max-w-sm w-full shadow-2xl space-y-3">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Connecting to UPI App...</h2>
            <p className="text-xs text-slate-500">
              Opening Google Pay / PhonePe on your device. Please approve the payment of ₹{amount}.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-5">
        {/* Booking Summary Card */}
        <div className="bg-gradient-to-br from-[#042f2e] via-[#0d9488] to-[#059669] text-white rounded-3xl p-5 sm:p-7 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none" />
          
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-100 mb-2">
            <span className="uppercase tracking-wider">Booking #SY-9021</span>
            <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white font-bold">
              {durationHours} {durationHours === 1 ? 'Hour' : 'Hours'} Package
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">{worker.title}</h2>
          <p className="text-xs text-emerald-100 mt-1">
            👤 Partner: <b className="text-white">{worker.name}</b> • 📍 {worker.locality}, {worker.city}
          </p>

          <div className="mt-4 pt-3 border-t border-emerald-400/30 space-y-1.5 text-xs text-emerald-50">
            <div className="flex justify-between">
              <span>Service Package ({durationHours} Hrs)</span>
              <span>₹ {baseServiceFee}.00</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Trust, Safety & Escrow</span>
              <span>₹ {platformSafety}.00</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18% Govt Tax)</span>
              <span>₹ {gstAmount}.00</span>
            </div>
            <div className="flex justify-between text-base font-black text-amber-300 pt-2 border-t border-emerald-400/30">
              <span>Total Payable</span>
              <span>₹ {amount}.00</span>
            </div>
          </div>
        </div>

        {/* UPI Payment Methods */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-teal-700" />
              <span>Instant UPI Payment (PhonePe, GPay, Paytm)</span>
            </h3>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              Zero Surcharge
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upiApps.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => {
                  setSelectedUpiApp(app.id);
                  handleTriggerPayment(app.scheme);
                }}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between text-left transition ${
                  selectedUpiApp === app.id
                    ? 'border-teal-600 bg-teal-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center font-black text-xs text-teal-900">
                    {app.name.slice(0, 2)}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">{app.name}</span>
                    <span className="text-[10px] text-teal-700 font-medium">Tap to pay ₹{amount}</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>

          {/* Direct Trigger Button */}
          <button
            type="button"
            onClick={() => handleTriggerPayment()}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-900/20 transition text-sm cursor-pointer"
          >
            <span>Pay ₹{amount}.00 with UPI</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* SahYog Escrow Guarantee Banner */}
        <div className="bg-slate-100 rounded-2xl p-4 flex items-center gap-3 border border-slate-200 text-xs text-slate-600">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-slate-800">100% Escrow Protection Guaranteed</p>
            <p className="text-[11px] text-slate-500">Your ₹{amount} is held safely until you verify the service completion OTP with the partner.</p>
          </div>
        </div>
      </div>

      <BottomNav role="customer" />
    </div>
  );
}

export default function PaymentPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold">Loading Payment Gateway...</div>}>
      <PaymentContent params={params} />
    </Suspense>
  );
}
