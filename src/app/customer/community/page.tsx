'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Users, ShieldCheck, CheckCircle, CheckCircle2, Star, Clock, 
  MapPin, Phone, Sparkles, Building2, KeyRound, Wrench, 
  ChevronDown, AlertCircle, Check, Loader2, Calendar, ArrowRight,
  Truck, HardHat, FileText, CheckCheck, X, CreditCard, Smartphone,
  Building, ThumbsUp
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { 
  registeredSocieties, 
  communityPackages, 
  defaultActiveCommunityBooking, 
  Society, 
  CommunityPackage, 
  CommunityBooking 
} from '@/data/communityData';

export default function CustomerCommunityDashboard() {
  const router = useRouter();

  // Selected Housing Society
  const [selectedSociety, setSelectedSociety] = useState<Society>(registeredSocieties[0]);
  const [showSocietyMenu, setShowSocietyMenu] = useState(false);

  // Active bookings state
  const [activeBooking, setActiveBooking] = useState<CommunityBooking | null>(defaultActiveCommunityBooking);
  const [bookingsList, setBookingsList] = useState<CommunityBooking[]>([defaultActiveCommunityBooking]);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  // Booking Modal State
  const [bookingModalPkg, setBookingModalPkg] = useState<CommunityPackage | null>(null);
  const [selectedDate, setSelectedDate] = useState('Tomorrow');
  const [selectedTime, setSelectedTime] = useState('02:00 PM');
  const [societyTowers, setSocietyTowers] = useState('Towers A, B & Common Sump');
  const [residentNotes, setResidentNotes] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccessNotice, setBookingSuccessNotice] = useState('');

  // Payment checkout state
  const [checkoutStep, setCheckoutStep] = useState<'SCOPE' | 'PAYMENT' | 'PROCESSING' | 'CONFIRMED'>('SCOPE');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'MAINTENANCE_POOL'>('UPI');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  const [customUpiId, setCustomUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('State Bank of India');
  const [generatedGateOtp, setGeneratedGateOtp] = useState('4821');

  // Dedicated Community Feedback Modal State
  const [isCommunityFeedbackOpen, setIsCommunityFeedbackOpen] = useState(false);
  const [communityRating, setCommunityRating] = useState(5);
  const [communityHoverRating, setCommunityHoverRating] = useState(0);
  const [selectedCommunityTags, setSelectedCommunityTags] = useState<string[]>([
    '💧 Tank Cleaned & Disinfected',
    '🛡️ Safety Protocols Complied'
  ]);
  const [communityFeedbackText, setCommunityFeedbackText] = useState('');
  const [communityRecommended, setCommunityRecommended] = useState(true);
  const [communityFeedbackSubmitted, setCommunityFeedbackSubmitted] = useState(false);
  const [hasRatedCommunity, setHasRatedCommunity] = useState(false);

  const communityComplimentTags = [
    '💧 Tank Cleaned & Disinfected',
    '🛡️ Safety Protocols Complied',
    '⏱️ Finished On Schedule',
    '📋 Water Quality Test Passed',
    '⚡ Cleaned Society Area Afterward',
    '🤝 Respectful & Disciplined Crew'
  ];

  const ratingLabels: Record<number, string> = {
    1: 'Poor (खराब अनुभव) 👎',
    2: 'Fair (सुधार की आवश्यकता) ⚠️',
    3: 'Good (संतोषजनक काम) 👌',
    4: 'Very Good (बहुत बढ़िया काम) 👍',
    5: 'Exceptional (अति उत्तम / શાનદાર અનુભવ) 🌟'
  };

  const toggleCommunityTag = (tag: string) => {
    setSelectedCommunityTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Fetch live community bookings
  useEffect(() => {
    const fetchCommunityBookings = async () => {
      try {
        const res = await fetch(`/api/community/bookings?societyId=${selectedSociety.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.bookings && Array.isArray(data.bookings) && data.bookings.length > 0) {
            setBookingsList(data.bookings);
            const active = data.bookings.find((b: any) => b.status !== 'COMPLETED') || data.bookings[0];
            setActiveBooking(active);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch community bookings:', err);
      }
    };

    fetchCommunityBookings();
    const interval = setInterval(fetchCommunityBookings, 4000);

    // Cross-tab real-time sync
    const handleRealtime = (data: any) => {
      if (!data) return;
      if (data.type === 'COMMUNITY_JOB_STARTED') {
        fetchCommunityBookings();
        setActiveBooking(prev => prev ? ({ ...prev, status: 'IN_PROGRESS' }) : prev);
      } else if (data.type === 'COMMUNITY_JOB_COMPLETED') {
        fetchCommunityBookings();
        setActiveBooking(prev => prev ? ({ ...prev, status: 'COMPLETED' }) : prev);
        const commBkId = localStorage.getItem('sahyog_active_community_booking_id');
        const isCommRated = commBkId ? localStorage.getItem('sahyog-community-rated-' + commBkId) === 'true' : false;
        if (!isCommRated && !hasRatedCommunity) {
          setIsCommunityFeedbackOpen(true);
        }
      } else if (data.type === 'NEW_COMMUNITY_BOOKING') {
        fetchCommunityBookings();
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sahyog-realtime-event' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          handleRealtime(parsed);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('sahyog-realtime-sync');
      channel.onmessage = (e) => {
        if (e.data) handleRealtime(e.data);
      };
    } catch {}

    return () => {
      clearInterval(interval);
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [selectedSociety.id]);

  const handleCopyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleOpenDeployModal = (pkg: CommunityPackage) => {
    setBookingModalPkg(pkg);
    setCheckoutStep('SCOPE');
    setSelectedPaymentMethod('UPI');
    setSelectedUpiApp('gpay');
  };

  const handleProcessPayment = async (schemeAppOverride?: string) => {
    if (!bookingModalPkg) return;

    const chosenApp = schemeAppOverride || selectedUpiApp;
    if (schemeAppOverride) setSelectedUpiApp(schemeAppOverride as any);

    // 1. TRIGGER REAL UPI PAYMENT APP ON USER'S PHONE (Google Pay, PhonePe, Paytm, BHIM)
    const upiSchemeMap: Record<string, string> = {
      gpay: 'tez://upi/pay',
      phonepe: 'phonepe://pay',
      paytm: 'paytmmp://pay',
      bhim: 'upi://pay'
    };
    const schemePrefix = upiSchemeMap[chosenApp] || 'upi://pay';
    const commBookingCode = 'COMM-' + Date.now().toString().slice(-4);
    const amount = bookingModalPkg.discountedRateINR;
    const upiId = 'sahyogtrust@upi';
    const upiIntentUrl = `${schemePrefix}?pa=${upiId}&pn=SahYog%20Community&mc=0000&tid=TX${Date.now().toString().slice(-6)}&tr=${commBookingCode}&tn=SahYog%20Community%20Squad%20Booking&am=${amount}&cu=INR`;

    if (selectedPaymentMethod === 'UPI') {
      try {
        window.location.href = upiIntentUrl;
      } catch (err) {
        console.warn('UPI app launch note:', err);
      }
    }

    setCheckoutStep('PROCESSING');

    const newOtp = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedGateOtp(newOtp);
    const bookingId = 'comm_bk_' + Date.now().toString(36);

    try {
      const res = await fetch('/api/community/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: bookingId,
          societyId: selectedSociety.id,
          societyName: selectedSociety.name,
          packageId: bookingModalPkg.id,
          packageTitle: bookingModalPkg.title,
          crewSize: bookingModalPkg.crewSize,
          leadWorkerName: bookingModalPkg.leadWorkerName,
          crewRoster: bookingModalPkg.crewRoster,
          scheduledDate: selectedDate,
          scheduledTime: selectedTime,
          totalAmount: bookingModalPkg.discountedRateINR,
          workerOtp: newOtp,
          paymentMethod: selectedPaymentMethod,
          paymentStatus: 'PAID',
          orderedBy: `Resident / Secretary (${societyTowers})`,
          ordererPhone: selectedSociety.managerPhone || '+91 98250 11223',
        })
      });

      const data = await res.json();
      if (data?.booking) {
        setActiveBooking(data.booking);
        setBookingsList(prev => [data.booking, ...prev]);
        if (typeof window !== 'undefined') {
          localStorage.setItem('sahyog_active_community_booking_id', data.booking.id);
          localStorage.removeItem('sahyog-community-rated-' + data.booking.id);
          setHasRatedCommunity(false);
        }
      }
    } catch (err) {
      console.warn('Local fallback for community booking');
    }

    try {
      const channel = new BroadcastChannel('sahyog-realtime-sync');
      channel.postMessage({
        type: 'NEW_COMMUNITY_BOOKING',
        societyName: selectedSociety.name,
        timestamp: Date.now()
      });
      channel.close();
    } catch {}

    if (typeof window !== 'undefined') {
      localStorage.setItem('sahyog-realtime-event', JSON.stringify({
        type: 'NEW_COMMUNITY_BOOKING',
        societyName: selectedSociety.name,
        timestamp: Date.now()
      }));
    }

    setTimeout(() => {
      setCheckoutStep('CONFIRMED');
    }, 1500);
  };

  const handleCommunityRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBooking) return;

    const reviewObj = {
      bookingId: activeBooking.id,
      workerName: activeBooking.leadWorkerName,
      customerName: 'Society Secretary',
      service: activeBooking.packageTitle,
      rating: communityRating,
      tags: selectedCommunityTags,
      feedback: communityFeedbackText.trim() || 'Exceptional squad service, all towers serviced properly.',
      recommended: communityRecommended,
      societyName: selectedSociety.name,
      createdAt: new Date().toISOString()
    };

    try {
      fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: activeBooking.id,
          workerName: activeBooking.leadWorkerName,
          customerName: 'Society Secretary',
          rating: communityRating,
          comment: communityFeedbackText.trim() || 'Exceptional squad service, all towers serviced properly.',
          tags: selectedCommunityTags,
          recommended: communityRecommended
        })
      }).catch(() => {});
    } catch {}

    if (typeof window !== 'undefined') {
      localStorage.setItem('sahyog-community-rated-' + activeBooking.id, 'true');
      const existingReviews = JSON.parse(localStorage.getItem('sahyog-community-reviews') || '[]');
      existingReviews.unshift(reviewObj);
      localStorage.setItem('sahyog-community-reviews', JSON.stringify(existingReviews));
    }

    setCommunityFeedbackSubmitted(true);
    setHasRatedCommunity(true);

    setTimeout(() => {
      setIsCommunityFeedbackOpen(false);
      setCommunityFeedbackSubmitted(false);
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 text-slate-900">
      {/* Sticky Mobile Header */}
      <div className="bg-[#0f3854] text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Back to Profile"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base sm:text-lg tracking-tight">Community & Society Hub</h1>
                <span className="text-[10px] font-bold bg-amber-400 text-teal-950 px-2 py-0.5 rounded-full uppercase">
                  Multi-Worker
                </span>
              </div>
              <p className="text-[11px] text-teal-200">Society Squad Maintenance & Group Bookings</p>
            </div>
          </div>

          <Link
            href="/customer/dashboard"
            className="text-xs font-bold text-teal-200 hover:text-white px-2.5 py-1 rounded-lg border border-teal-700/60"
          >
            Individual Home
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5 space-y-6">
        {/* Success notification */}
        {bookingSuccessNotice && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-bold flex-1">{bookingSuccessNotice}</span>
          </div>
        )}

        {/* 1. Housing Society Selector Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-teal-700 tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              <span>Active Housing Society / Community</span>
            </span>
            <span className="text-[11px] text-slate-400 font-semibold">{selectedSociety.totalFlats} Registered Flats</span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSocietyMenu(!showSocietyMenu)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition text-left cursor-pointer"
            >
              <div>
                <h3 className="font-black text-base text-slate-900">{selectedSociety.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedSociety.locality}, {selectedSociety.city} • Reg #{selectedSociety.societyRegNo}</p>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showSocietyMenu ? 'rotate-180' : ''}`} />
            </button>

            {showSocietyMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 z-40 overflow-hidden divide-y divide-slate-100 animate-in fade-in">
                {registeredSocieties.map((soc) => (
                  <button
                    key={soc.id}
                    type="button"
                    onClick={() => {
                      setSelectedSociety(soc);
                      setShowSocietyMenu(false);
                    }}
                    className={`w-full p-3.5 text-left transition flex items-center justify-between ${
                      soc.id === selectedSociety.id ? 'bg-teal-50 text-teal-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-black">{soc.name}</p>
                      <p className="text-[11px] text-slate-500">{soc.locality}, {soc.city} ({soc.totalFlats} Flats)</p>
                    </div>
                    {soc.id === selectedSociety.id && <Check className="w-4 h-4 text-teal-700" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] font-semibold">Society Manager</span>
              <span className="font-bold text-slate-800">{selectedSociety.managerName}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] font-semibold">Security Checkpoint</span>
              <span className="font-bold text-slate-800">{selectedSociety.securityGate}</span>
            </div>
          </div>
        </div>

        {/* 2. Active Multi-Worker Squad Card */}
        {activeBooking && (
          <div className="bg-gradient-to-br from-[#0f3854] via-[#0f766e] to-[#0f3854] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-teal-800/50 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-300 animate-bounce" />
                <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                  Live Society Squad Dispatch
                </span>
              </div>
              <span className={`text-[11px] font-black px-3 py-1 rounded-full uppercase ${
                activeBooking.status === 'COMPLETED' 
                  ? 'bg-emerald-400 text-teal-950' 
                  : activeBooking.status === 'IN_PROGRESS' 
                    ? 'bg-amber-400 text-teal-950 animate-pulse' 
                    : 'bg-white/20 text-white'
              }`}>
                {activeBooking.status === 'COMPLETED' ? 'Work Completed' : activeBooking.status === 'IN_PROGRESS' ? 'Crew Working On-Site' : 'Squad En Route in Van'}
              </span>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                {activeBooking.packageTitle}
              </h3>
              <p className="text-xs text-teal-200 mt-1">
                Deployed at <span className="text-white font-bold">{activeBooking.societyName}</span> • Ordered by {activeBooking.orderedBy}
              </p>
            </div>

            {/* 4-Digit Society Arrival OTP Guard */}
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  Society Gate Arrival OTP (गेट कोड)
                </span>
                <p className="text-[11px] text-teal-100/80 mt-0.5 max-w-sm">
                  Hand this code to Crew Leader <b className="text-white">{activeBooking.leadWorkerName}</b> at the main gate checkpoint to unlock squad work.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-3xl font-mono font-black text-amber-300 tracking-widest bg-black/40 px-4 py-1.5 rounded-xl border border-amber-400/40">
                  {activeBooking.workerOtp}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyOtp(activeBooking.workerOtp)}
                  className="bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-xl transition cursor-pointer"
                  title="Copy Gate OTP"
                >
                  {copiedOtp ? <CheckCheck className="w-4 h-4 text-amber-300" /> : <ShieldCheck className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Squad Crew Members Roster */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-teal-200">
                <span className="flex items-center gap-1.5">
                  <HardHat className="w-4 h-4 text-amber-300" />
                  <span>Assigned Multi-Worker Squad ({activeBooking.crewSize} Certified Workers)</span>
                </span>
                <span className="text-amber-300">Pool Total: ₹{activeBooking.totalAmount}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {activeBooking.crewRoster.map((worker) => (
                  <div key={worker.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10 text-center space-y-1">
                    <div className="w-9 h-9 rounded-xl bg-amber-400 text-teal-950 font-black text-xs flex items-center justify-center mx-auto shadow-sm">
                      {worker.avatarInitials}
                    </div>
                    <p className="text-xs font-bold text-white truncate">{worker.name}</p>
                    <p className="text-[10px] text-teal-200 truncate">{worker.trade}</p>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                      worker.role === 'LEAD' ? 'bg-amber-400 text-teal-950' : 'bg-white/10 text-teal-200'
                    }`}>
                      {worker.role === 'LEAD' ? 'Team Lead' : 'Specialist'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. Available Multi-Worker Society Packages */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Multi-Worker Community Packages</h2>
              <p className="text-xs text-slate-500">Fixed rate group services for entire societies with industrial equipment</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              35% Group Subsidy
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communityPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-teal-500 transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-lg">
                      {pkg.tradeCategory} • {pkg.crewSize} Workers Squad
                    </span>
                    {pkg.popular && (
                      <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Popular
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-slate-900 leading-snug">
                    {pkg.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    {pkg.scopePoints.slice(0, 3).map((p, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{p}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Industrial Equipment Deployed:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {pkg.includedEquipment.slice(0, 2).map((eq, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                          ⚙️ {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-slate-900">₹{pkg.discountedRateINR}</span>
                      <span className="text-xs text-slate-400 line-through">₹{pkg.baseRateINR}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700">Save {pkg.residentSavingsPercent}% Resident Pool</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenDeployModal(pkg)}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Schedule Squad</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Booking Checkout & Payment Modal */}
      {bookingModalPkg && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-black text-teal-700 uppercase tracking-wider">
                  {checkoutStep === 'SCOPE' ? 'Step 1: Society & Towers' : checkoutStep === 'PAYMENT' ? 'Step 2: Payment' : 'Confirmation'}
                </span>
                <h3 className="font-black text-slate-900 text-base">{bookingModalPkg.title}</h3>
              </div>
              <button 
                onClick={() => setBookingModalPkg(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {checkoutStep === 'SCOPE' && (
              <div className="space-y-3.5 text-xs">
                <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200 space-y-1">
                  <div className="flex justify-between font-bold text-teal-950">
                    <span>Target Society:</span>
                    <span>{selectedSociety.name}</span>
                  </div>
                  <div className="flex justify-between text-teal-800 text-[11px]">
                    <span>Crew Deployment:</span>
                    <span>{bookingModalPkg.crewSize} Specialized Workers</span>
                  </div>
                  <div className="flex justify-between text-teal-800 text-[11px]">
                    <span>Lead Supervisor:</span>
                    <span>{bookingModalPkg.leadWorkerName}</span>
                  </div>
                  <div className="flex justify-between font-black text-teal-950 pt-1 border-t border-teal-200 text-sm">
                    <span>Squad Pool Rate:</span>
                    <span className="text-teal-900">₹{bookingModalPkg.discountedRateINR}</span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Select Schedule Date</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Today', 'Tomorrow', 'This Weekend'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedDate(d)}
                        className={`py-2 px-3 rounded-xl font-bold border transition ${
                          selectedDate === d
                            ? 'bg-teal-700 text-white border-teal-700'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Preferred Time Slot</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['09:00 AM', '02:00 PM', '04:00 PM'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTime(t)}
                        className={`py-2 px-3 rounded-xl font-bold border transition ${
                          selectedTime === t
                            ? 'bg-teal-700 text-white border-teal-700'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Building Wings / Towers</label>
                  <input
                    type="text"
                    value={societyTowers}
                    onChange={(e) => setSocietyTowers(e.target.value)}
                    placeholder="e.g. Towers A, B, C & Clubhouse Sump"
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-medium outline-none focus:border-teal-600"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingModalPkg(null)}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('PAYMENT')}
                    className="flex-1 py-3 bg-teal-700 hover:bg-teal-800 text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Next: Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 'PAYMENT' && (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1.5">
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>Base Package Rate:</span>
                    <span>₹{bookingModalPkg.baseRateINR}</span>
                  </div>
                  <div className="flex justify-between font-medium text-emerald-700">
                    <span>Group Society Subsidy ({bookingModalPkg.residentSavingsPercent}%):</span>
                    <span>-₹{bookingModalPkg.baseRateINR - bookingModalPkg.discountedRateINR}</span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>GST (18% Included):</span>
                    <span>Included</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                    <span>Total Amount:</span>
                    <span className="text-base text-teal-800">₹{bookingModalPkg.discountedRateINR}</span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-2 uppercase tracking-wider text-[10px]">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('UPI')}
                      className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                        selectedPaymentMethod === 'UPI'
                          ? 'bg-teal-50 border-teal-600 text-teal-950 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 text-teal-700 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-black">UPI Instant</p>
                        <p className="text-[10px] text-slate-500">GPay, PhonePe, Paytm</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('CARD')}
                      className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                        selectedPaymentMethod === 'CARD'
                          ? 'bg-teal-50 border-teal-600 text-teal-950 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-teal-700 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-black">Society Card</p>
                        <p className="text-[10px] text-slate-500">Visa, Mastercard</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('NETBANKING')}
                      className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                        selectedPaymentMethod === 'NETBANKING'
                          ? 'bg-teal-50 border-teal-600 text-teal-950 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <Building className="w-5 h-5 text-teal-700 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-black">Net Banking</p>
                        <p className="text-[10px] text-slate-500">SBI, HDFC, ICICI</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('MAINTENANCE_POOL')}
                      className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                        selectedPaymentMethod === 'MAINTENANCE_POOL'
                          ? 'bg-teal-50 border-teal-600 text-teal-950 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <Users className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-black">RWA Fund Pool</p>
                        <p className="text-[10px] text-slate-500">Pay on Gate Arrival</p>
                      </div>
                    </button>
                  </div>

                  {/* Direct Mobile UPI Apps */}
                  {selectedPaymentMethod === 'UPI' && (
                    <div className="mt-3 space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase text-slate-700 block">Tap App to Pay Directly:</span>
                        <span className="text-[10px] text-emerald-700 font-bold">Opens Real App on Phone</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'gpay', name: 'Google Pay', badge: 'Popular', color: 'border-blue-300 text-blue-900 bg-white hover:bg-blue-50' },
                          { id: 'phonepe', name: 'PhonePe', badge: 'Instant', color: 'border-purple-300 text-purple-900 bg-white hover:bg-purple-50' },
                          { id: 'paytm', name: 'Paytm UPI', badge: 'Fast', color: 'border-sky-300 text-sky-900 bg-white hover:bg-sky-50' },
                          { id: 'bhim', name: 'BHIM / CRED', badge: 'Universal', color: 'border-emerald-300 text-emerald-900 bg-white hover:bg-emerald-50' }
                        ].map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => handleProcessPayment(app.id)}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition flex items-center justify-between ${app.color} ${
                              selectedUpiApp === app.id ? 'ring-2 ring-teal-600 font-black shadow-xs' : 'font-bold'
                            }`}
                          >
                            <div>
                              <p className="text-xs font-black">{app.name}</p>
                              <span className="text-[9px] text-slate-500 font-medium">Launch App ↗</span>
                            </div>
                            <span className="text-[9px] font-black bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                              {app.badge}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('SCOPE')}
                    className="px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProcessPayment()}
                    className="flex-1 py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer text-sm"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize & Pay ₹{bookingModalPkg.discountedRateINR}</span>
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 'PROCESSING' && (
              <div className="py-10 text-center space-y-3 animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
                <h4 className="font-black text-base text-slate-900">Authorizing Society Payment...</h4>
                <p className="text-xs text-slate-500">
                  Generating 4-Digit Gate Arrival OTP & Dispatching Multi-Worker Squad.
                </p>
              </div>
            )}

            {checkoutStep === 'CONFIRMED' && (
              <div className="py-6 text-center space-y-4 animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-slate-900">Society Squad Dispatched!</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Assigned to {selectedSociety.name}.
                  </p>
                </div>

                <div className="p-4 bg-teal-900 text-white rounded-2xl max-w-xs mx-auto space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-300">Society Gate Arrival OTP</span>
                  <div className="text-3xl font-mono font-black tracking-widest text-white py-1">
                    {generatedGateOtp}
                  </div>
                  <p className="text-[10px] text-teal-200">
                    Hand over this OTP to the Security Guard for gate entry.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setBookingModalPkg(null);
                    setCheckoutStep('SCOPE');
                  }}
                  className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-black rounded-xl text-xs cursor-pointer"
                >
                  View Active Booking
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Dedicated Community Squad Feedback Modal */}
      {isCommunityFeedbackOpen && activeBooking && (
        <div className="fixed inset-0 z-[115] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 flex flex-col max-h-[85vh] my-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0f3854] via-[#0d9488] to-[#16a34a] text-white p-4 sm:p-5 relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsCommunityFeedbackOpen(false)}
                className="absolute top-3.5 right-3.5 text-emerald-200 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-400 text-teal-950 font-black text-base flex items-center justify-center shadow-md flex-shrink-0">
                  <HardHat className="w-6 h-6 text-teal-950" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full">
                    Society Squad Feedback
                  </span>
                  <h3 className="font-black text-base text-white mt-1 leading-tight">
                    {activeBooking.packageTitle}
                  </h3>
                  <p className="text-xs text-emerald-100/90">
                    Lead: {activeBooking.leadWorkerName} • {selectedSociety.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 overscroll-contain">
              {communityFeedbackSubmitted ? (
                <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="font-black text-xl text-slate-900">Society Feedback Recorded!</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Thank you for rating <b>{activeBooking.leadWorkerName}</b> and the crew.
                  </p>
                </div>
              ) : (
                <form id="comm-feedback-form" onSubmit={handleCommunityRatingSubmit} className="space-y-4 text-xs">
                  <div className="text-center py-2 bg-slate-50 rounded-2xl border border-slate-100 p-4">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                      Rate Overall Squad Work Quality
                    </label>
                    <div className="flex items-center justify-center gap-2 my-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = (communityHoverRating || communityRating) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setCommunityHoverRating(star)}
                            onMouseLeave={() => setCommunityHoverRating(0)}
                            onClick={() => setCommunityRating(star)}
                            className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${
                                isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-300 fill-slate-100'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs font-black text-teal-800 mt-1">
                      {ratingLabels[communityHoverRating || communityRating]}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Society Quality Compliance
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {communityComplimentTags.map((tag) => {
                        const isSelected = selectedCommunityTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleCommunityTag(tag)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1 ${
                              isSelected
                                ? 'bg-teal-700 text-white border-teal-700'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span>{tag}</span>
                            {isSelected && <CheckCircle className="w-3 h-3 text-emerald-300 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Society Secretary / Resident Feedback (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={communityFeedbackText}
                      onChange={(e) => setCommunityFeedbackText(e.target.value)}
                      placeholder="e.g. Squad was punctual, drained and disinfected all 3 overhead tanks..."
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-teal-600 focus:bg-white resize-none text-slate-800"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <ThumbsUp className="w-4 h-4 text-teal-600" />
                      <span>Recommend Squad for Next AMC?</span>
                    </span>
                    <div className="flex gap-1 bg-slate-200 p-0.5 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setCommunityRecommended(true)}
                        className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                          communityRecommended ? 'bg-teal-700 text-white' : 'text-slate-600'
                        }`}
                      >
                        Yes 👍
                      </button>
                      <button
                        type="button"
                        onClick={() => setCommunityRecommended(false)}
                        className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                          !communityRecommended ? 'bg-rose-600 text-white' : 'text-slate-600'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {!communityFeedbackSubmitted && (
              <div className="p-3.5 sm:p-4 bg-white border-t border-slate-100 flex-shrink-0">
                <button
                  type="submit"
                  form="comm-feedback-form"
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white font-black py-3.5 rounded-2xl shadow-lg transition text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Star className="w-4 h-4 fill-white" />
                  <span>Submit Society Review</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNav role="customer" />
    </div>
  );
}
