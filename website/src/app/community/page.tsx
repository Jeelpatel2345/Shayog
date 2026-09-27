'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, Users, ShieldCheck, CheckCircle2, Star, Clock, 
  MapPin, Phone, Sparkles, KeyRound, Wrench, ChevronDown, 
  AlertCircle, Check, Loader2, Calendar, ArrowRight, Truck, 
  HardHat, FileText, CheckCheck, X, CreditCard, Smartphone, 
  Building, ThumbsUp, Download, Share2, HelpCircle
} from 'lucide-react';
import { 
  registeredSocieties, 
  communityPackages, 
  defaultActiveCommunityBooking, 
  Society, 
  CommunityPackage, 
  CommunityBooking 
} from '@/data/communityData';

export default function WebsiteCommunityServicesPage() {
  const router = useRouter();

  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');

  // Selected Housing Society
  const [selectedSociety, setSelectedSociety] = useState<Society>(registeredSocieties[0]);
  const [showSocietyMenu, setShowSocietyMenu] = useState(false);

  // Active bookings state
  const [activeBooking, setActiveBooking] = useState<CommunityBooking | null>(defaultActiveCommunityBooking);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'MAINTENANCE_POOL' | 'UPI' | 'CARD' | 'NETBANKING'>('MAINTENANCE_POOL');
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

  // Gate Pass Modal
  const [showGatePassModal, setShowGatePassModal] = useState(false);

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const logged = localStorage.getItem('sahyog-logged-in') === 'true';
      setIsLoggedIn(logged);
      const name = localStorage.getItem('sahyog-user-name') || '';
      const phone = localStorage.getItem('sahyog-user-phone') || '';
      setUserName(name);
      setUserPhone(phone);
    }
  }, []);

  const handleCopyOtp = (otp: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(otp);
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2500);
    }
  };

  const handleStartBooking = (pkg: CommunityPackage) => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/community`);
      return;
    }
    setBookingModalPkg(pkg);
    setCheckoutStep('SCOPE');
    setResidentNotes('');
  };

  const handleProceedToPayment = () => {
    setCheckoutStep('PAYMENT');
  };

  const handleConfirmCommunityPayment = () => {
    setIsSubmittingBooking(true);
    setCheckoutStep('PROCESSING');

    setTimeout(() => {
      setIsSubmittingBooking(false);
      const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedGateOtp(newOtp);

      if (bookingModalPkg) {
        const newBooking: CommunityBooking = {
          id: 'SY-COM-' + Math.floor(100000 + Math.random() * 900000),
          societyId: selectedSociety.id,
          societyName: selectedSociety.name,
          societyAddress: selectedSociety.fullAddress,
          packageId: bookingModalPkg.id,
          packageTitle: bookingModalPkg.title,
          crewSize: bookingModalPkg.crewSize,
          leadWorkerName: bookingModalPkg.leadWorkerName,
          crewRoster: bookingModalPkg.crewRoster,
          scheduledDate: selectedDate,
          scheduledTime: selectedTime,
          totalAmount: bookingModalPkg.discountedRateINR,
          workerOtp: newOtp,
          status: 'SCHEDULED',
          orderedBy: userName || selectedSociety.authorizedRepresentative.name,
          ordererPhone: userPhone || selectedSociety.authorizedRepresentative.mobile,
          poolSharePerWorker: Math.round(bookingModalPkg.discountedRateINR / bookingModalPkg.crewSize),
          createdAt: new Date().toISOString()
        };

        setActiveBooking(newBooking);
      }

      setCheckoutStep('CONFIRMED');
      setBookingSuccessNotice('🎉 Community Service Crew Dispatched & Gate Entry Pass Generated!');
    }, 1500);
  };

  const handleCloseBookingModal = () => {
    setBookingModalPkg(null);
    setCheckoutStep('SCOPE');
  };

  const handleSubmitCommunityFeedback = () => {
    setCommunityFeedbackSubmitted(true);
    setHasRatedCommunity(true);
    setTimeout(() => {
      setIsCommunityFeedbackOpen(false);
      setCommunityFeedbackSubmitted(false);
    }, 2000);
  };

  const toggleCommunityTag = (tag: string) => {
    setSelectedCommunityTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredPackages = communityPackages.filter((pkg) => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'CLEANING') return pkg.tradeCategory === 'Cleaning';
    if (selectedCategory === 'PLUMBING') return pkg.tradeCategory === 'Plumbing';
    if (selectedCategory === 'ELECTRICIAN') return pkg.tradeCategory === 'Electrician';
    if (selectedCategory === 'AMC') return pkg.tradeCategory === 'Society AMC' || pkg.tradeCategory === 'Appliance Repair';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Banner / Breadcrumb */}
      <section className="bg-gradient-to-r from-[#022c2b] via-[#064e3b] to-[#042f2e] text-white py-12 px-4 sm:px-6 lg:px-8 shadow-inner relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-200">
              <Link href="/" className="hover:text-amber-300 transition">Home</Link>
              <span>/</span>
              <span className="text-amber-300 font-bold">Community & Society Services</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>RERA & Co-op Society Approved</span>
              </span>
              <Link
                href="/dashboard"
                className="text-xs font-bold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 rounded-full transition"
              >
                Society RWA Console →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-700/60 px-3 py-1 rounded-full text-xs font-bold text-emerald-300">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Multi-Worker Crew & Industrial Equipment Fleet</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Society & Community <br />
                <span className="text-amber-300">Industrial Maintenance Hub</span>
              </h1>
              <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl leading-relaxed">
                Book authorized 3-to-4 member certified worker squads for overhead water tank disinfection, 
                common area high-pressure washing, storm drain clearance, and comprehensive society AMCs 
                with pooled society maintenance discounts.
              </p>

              {/* Society Selector Bar */}
              <div className="pt-2 relative">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 max-w-2xl">
                  <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Active Housing Society / Apartment Complex:</span>
                    <span className="text-amber-300 font-bold">{selectedSociety.totalFlats} Registered Units</span>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowSocietyMenu(!showSocietyMenu)}
                      className="w-full bg-white text-slate-900 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-left font-bold text-sm shadow-md hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Building className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                        <span className="truncate">{selectedSociety.name}</span>
                        <span className="text-xs text-slate-500 font-normal hidden sm:inline">({selectedSociety.locality}, {selectedSociety.city})</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    </button>

                    {showSocietyMenu && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 max-h-72 overflow-y-auto">
                        <div className="text-[11px] font-bold text-slate-400 px-3 py-1.5 uppercase">
                          Select Society to Deploy Squad:
                        </div>
                        {registeredSocieties.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSelectedSociety(s);
                              setShowSocietyMenu(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center justify-between text-xs sm:text-sm font-semibold ${
                              selectedSociety.id === s.id
                                ? 'bg-emerald-50 text-emerald-900 font-bold'
                                : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="truncate text-slate-900 font-bold">{s.name}</div>
                              <div className="text-[11px] text-slate-500 truncate">{s.fullAddress}</div>
                            </div>
                            {selectedSociety.id === s.id && (
                              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-[11px] text-emerald-200/80 flex items-center justify-between flex-wrap gap-2">
                    <span>Secretary: <strong>{selectedSociety.authorizedRepresentative.name}</strong> ({selectedSociety.authorizedRepresentative.designation})</span>
                    <span>Security Gate: <strong>{selectedSociety.securityGate}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Column */}
            <div className="lg:col-span-4">
              <div className="bg-emerald-950/70 border border-emerald-600/40 rounded-3xl p-6 text-white space-y-4 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
                  <span className="text-xs uppercase font-bold text-amber-300 tracking-wider">Society Network Stats</span>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-300 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Gujarat Verified
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-700/50">
                    <div className="text-2xl font-black text-amber-300">25-30%</div>
                    <div className="text-[11px] text-emerald-100 font-medium">Bulk Pool Savings</div>
                  </div>
                  <div className="bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-700/50">
                    <div className="text-2xl font-black text-white">4 Crew</div>
                    <div className="text-[11px] text-emerald-100 font-medium">Standard Squad Size</div>
                  </div>
                  <div className="bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-700/50">
                    <div className="text-2xl font-black text-white">100%</div>
                    <div className="text-[11px] text-emerald-100 font-medium">Police-Cleared Crew</div>
                  </div>
                  <div className="bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-700/50">
                    <div className="text-2xl font-black text-amber-300">Instant</div>
                    <div className="text-[11px] text-emerald-100 font-medium">Gate Security Pass</div>
                  </div>
                </div>
                <div className="text-[11px] text-emerald-200/90 pt-2 border-t border-emerald-800/80 flex items-center justify-between">
                  <span>Billing: Society Pool / RWA Account</span>
                  <span className="text-amber-300 font-bold">GST Invoices</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Active Dispatch Card */}
        {activeBooking && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-md relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full text-xs font-black">
                    <Truck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>STATUS: {activeBooking.status.replace('_', ' ')}</span>
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    Booking ID: <strong className="text-slate-800">{activeBooking.id}</strong>
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-semibold">
                    {activeBooking.scheduledDate} at {activeBooking.scheduledTime}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {activeBooking.packageTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>Deployed at <strong>{activeBooking.societyName}</strong> ({activeBooking.societyAddress || selectedSociety.fullAddress})</span>
                </p>
              </div>

              {/* Gate Pass & OTP Box */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 text-center flex-1 sm:flex-initial">
                  <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    Society Security Gate Entry OTP
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="font-mono text-2xl font-black text-teal-950 tracking-widest">
                      {activeBooking.workerOtp}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyOtp(activeBooking.workerOtp)}
                      className="text-xs font-bold text-teal-800 hover:text-teal-950 underline ml-1"
                    >
                      {copiedOtp ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="text-[10px] text-amber-700/90 mt-0.5">
                    Show to Main Gate Security Guard
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setShowGatePassModal(true)}
                    className="flex-1 sm:flex-initial bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Gate Pass</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCommunityFeedbackOpen(true)}
                    className="flex-1 sm:flex-initial bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Rate Crew</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Crew Details & Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 items-center">
              <div className="md:col-span-7 space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Assigned Industrial Squad ({activeBooking.crewSize} Certified Members):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeBooking.crewRoster.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80"
                    >
                      <div className="w-9 h-9 rounded-full bg-teal-800 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        {m.avatarInitials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                          <span>{m.name}</span>
                          {m.role === 'LEAD' && (
                            <span className="text-[9px] font-black bg-amber-400 text-teal-950 px-1.5 py-0.2 rounded uppercase">
                              Lead
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{m.trade} • {m.phone}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-5 bg-teal-50/70 border border-teal-200 rounded-2xl p-4 space-y-2">
                <div className="text-xs font-bold text-teal-950 uppercase tracking-wider flex items-center justify-between">
                  <span>Standard Operational Checklist</span>
                  <span className="text-emerald-700 font-bold">100% In Progress</span>
                </div>
                <ul className="text-xs text-teal-900 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>High-power sludge vacuuming & de-watering</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Food-grade antibacterial tank spray & UV sterilize</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Before & After digital photo documentation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Society Water Purity Compliance Certificate</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Catalog Section Header & Filter */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
                Society Squad Catalog
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                Standardized Society Maintenance Packages
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                All packages include multi-worker squads, industrial-grade equipment, safety harnesses, 
                and official society compliance certification.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-2xl flex-wrap">
              {[
                { id: 'ALL', label: 'All Packages' },
                { id: 'CLEANING', label: 'Tank & Deep Cleaning' },
                { id: 'PLUMBING', label: 'Storm Drains & Pumps' },
                { id: 'ELECTRICIAN', label: 'Electrical & Panels' },
                { id: 'AMC', label: 'Full Society AMC' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedCategory === tab.id
                      ? 'bg-white text-teal-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Package Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-xl hover:border-teal-400 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-amber-500 text-teal-950 text-[10px] font-black uppercase tracking-wider px-4 py-1 rounded-bl-xl shadow-xs">
                    ★ Most Requested by Societies
                  </div>
                )}

                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-black bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>{pkg.tradeCategory} Squad</span>
                    </span>
                    <span className="text-xs font-black bg-amber-400 text-teal-950 px-3 py-1 rounded-full shadow-xs">
                      👥 {pkg.crewSize} Certified Workers
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-snug">
                      {pkg.title}
                    </h3>
                    <div className="flex items-baseline gap-2.5 mt-2">
                      <span className="text-2xl font-black text-teal-900">₹{pkg.discountedRateINR.toLocaleString()}</span>
                      <span className="text-xs text-slate-400 line-through font-semibold">₹{pkg.baseRateINR.toLocaleString()}</span>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                        {pkg.residentSavingsPercent}% Society Discount
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>Est. Duration: {pkg.durationHours} Hours | Lead: {pkg.leadWorkerName} ({pkg.leadWorkerTrade})</span>
                    </div>
                    <div className="text-slate-500">
                      Direct Supervisor Phone: <strong className="text-slate-700">{pkg.leadWorkerPhone}</strong>
                    </div>
                  </div>

                  {/* Scope checklist */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Included Work Scope:
                    </div>
                    <ul className="text-xs text-slate-700 space-y-1.5">
                      {pkg.scopePoints.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Included Equipment */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Provided Industrial Equipment:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {pkg.includedEquipment.map((eq, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200"
                        >
                          ⚙️ {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    <div>Pool billing available</div>
                    <div className="font-bold text-slate-700">₹{Math.round(pkg.discountedRateINR / selectedSociety.totalFlats)}/flat avg</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartBooking(pkg)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-md transition flex items-center gap-2 hover:scale-[1.02]"
                  >
                    <span>Deploy Squad</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Society AMC & Inquiries Card */}
        <section className="bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="text-xs font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-full">
              Annual Maintenance Contract (AMC)
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Need a Custom AMC for Your Entire Housing Society?
            </h3>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              We offer customized annual contracts covering regular overhead water tank disinfection, 
              monsoon stormwater pump overhauls, common area pressure washing, and dedicated on-call 
              electricians for society streetlights & lift rooms.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <a
                href="tel:18001237249"
                className="bg-amber-400 hover:bg-amber-300 text-teal-950 font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md transition flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call Society Desk: 1800-123-SAHYOG</span>
              </a>
              <a
                href="#societies"
                onClick={(e) => {
                  e.preventDefault();
                  setShowSocietyMenu(true);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl transition cursor-pointer"
              >
                View 42+ Registered Societies
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Booking / Checkout Modal */}
      {bookingModalPkg && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={handleCloseBookingModal}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Step 1: SCOPE */}
            {checkoutStep === 'SCOPE' && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
                    Society Crew Dispatch Request
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                    {bookingModalPkg.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    For <strong>{selectedSociety.name}</strong> ({selectedSociety.locality}, {selectedSociety.city})
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Target Towers / Sump Areas
                    </label>
                    <input
                      type="text"
                      value={societyTowers}
                      onChange={(e) => setSocietyTowers(e.target.value)}
                      placeholder="e.g. Towers A, B & Common Sump"
                      className="w-full text-sm font-semibold border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-teal-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Scheduled Day
                      </label>
                      <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full text-sm font-semibold border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:border-teal-700 bg-white"
                      >
                        <option value="Today">Today (Urgent)</option>
                        <option value="Tomorrow">Tomorrow</option>
                        <option value="This Saturday">This Saturday</option>
                        <option value="This Sunday">This Sunday</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Time Slot
                      </label>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full text-sm font-semibold border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:border-teal-700 bg-white"
                      >
                        <option value="09:00 AM">09:00 AM (Morning)</option>
                        <option value="11:30 AM">11:30 AM (Midday)</option>
                        <option value="02:00 PM">02:00 PM (Afternoon)</option>
                        <option value="04:30 PM">04:30 PM (Evening)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Society Manager / Security Gate Notes (Optional)
                    </label>
                    <textarea
                      value={residentNotes}
                      onChange={(e) => setResidentNotes(e.target.value)}
                      rows={2}
                      placeholder="e.g. Please bring extra 50-meter water hose for Tower C rooftop"
                      className="w-full text-xs font-medium border border-slate-300 rounded-xl p-3 outline-none focus:border-teal-700"
                    />
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Standard Society Rate:</span>
                      <span className="line-through">₹{bookingModalPkg.baseRateINR}</span>
                    </div>
                    <div className="flex justify-between text-xs text-emerald-700 font-bold">
                      <span>Community Bulk Savings ({bookingModalPkg.residentSavingsPercent}%):</span>
                      <span>-₹{(bookingModalPkg.baseRateINR - bookingModalPkg.discountedRateINR).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total Payable:</span>
                      <span className="text-teal-900 text-lg">₹{bookingModalPkg.discountedRateINR.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="w-full bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm py-3.5 rounded-2xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>Select Payment & Generate Gate Pass</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 2: PAYMENT */}
            {checkoutStep === 'PAYMENT' && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
                    Payment & Settlement
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                    Select Billing Source
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Total Amount: <strong className="text-teal-900 text-sm">₹{bookingModalPkg.discountedRateINR.toLocaleString()}</strong>
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Maintenance Pool Option */}
                  <label
                    className={`block p-4 rounded-2xl border cursor-pointer transition ${
                      selectedPaymentMethod === 'MAINTENANCE_POOL'
                        ? 'border-emerald-600 bg-emerald-50/60'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payMethod"
                        checked={selectedPaymentMethod === 'MAINTENANCE_POOL'}
                        onChange={() => setSelectedPaymentMethod('MAINTENANCE_POOL')}
                        className="text-emerald-700 focus:ring-emerald-700"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-black text-slate-900">
                          🏢 Deduct from Society Maintenance Pool Account
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Charged to RWA current account. GST invoice emailed to secretary.
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* UPI Option */}
                  <label
                    className={`block p-4 rounded-2xl border cursor-pointer transition ${
                      selectedPaymentMethod === 'UPI'
                        ? 'border-emerald-600 bg-emerald-50/60'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payMethod"
                        checked={selectedPaymentMethod === 'UPI'}
                        onChange={() => setSelectedPaymentMethod('UPI')}
                        className="text-emerald-700 focus:ring-emerald-700"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-black text-slate-900">
                          📱 Instant UPI (GPay / PhonePe / Paytm / BHIM)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Instant zero fee UPI transfer with immediate gate pass generation.
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* Card Option */}
                  <label
                    className={`block p-4 rounded-2xl border cursor-pointer transition ${
                      selectedPaymentMethod === 'CARD'
                        ? 'border-emerald-600 bg-emerald-50/60'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payMethod"
                        checked={selectedPaymentMethod === 'CARD'}
                        onChange={() => setSelectedPaymentMethod('CARD')}
                        className="text-emerald-700 focus:ring-emerald-700"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-black text-slate-900">
                          💳 Society Corporate Credit / Debit Card
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Visa, Mastercard, RuPay corporate cards supported.
                        </div>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('SCOPE')}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-2xl transition"
                  >
                    Back to Scope
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCommunityPayment}
                    className="flex-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm py-3 rounded-2xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    <span>Authorize & Dispatch Squad</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: PROCESSING */}
            {checkoutStep === 'PROCESSING' && (
              <div className="py-12 text-center space-y-4">
                <Loader2 className="w-12 h-12 text-teal-700 animate-spin mx-auto" />
                <h4 className="text-xl font-black text-slate-900">
                  Allocating Society Squad & Generating Pass...
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Alerting Lead Supervisor {bookingModalPkg.leadWorkerName} and assigning 
                  security gate entry OTP for {selectedSociety.name}.
                </p>
              </div>
            )}

            {/* Step 4: CONFIRMED */}
            {checkoutStep === 'CONFIRMED' && (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCheck className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    Squad Dispatched Successfully!
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                    {bookingSuccessNotice || 'Society maintenance crew is scheduled.'}
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-center">
                  <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                    Official Security Gate Entry Pass OTP:
                  </div>
                  <div className="text-3xl font-mono font-black text-teal-950 tracking-widest mt-1">
                    {generatedGateOtp}
                  </div>
                  <div className="text-[11px] text-amber-700 mt-1">
                    Present this PIN at {selectedSociety.securityGate}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseBookingModal();
                      setShowGatePassModal(true);
                    }}
                    className="flex-1 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs py-3 rounded-2xl transition flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Open Gate Pass</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseBookingModal}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 rounded-2xl transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official Security Gate Pass Modal */}
      {showGatePassModal && activeBooking && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowGatePassModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-800 text-amber-400 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-black tracking-widest text-teal-700">
                    SahYog Authorized Entry Pass
                  </div>
                  <h3 className="text-lg font-black text-slate-900 leading-snug">
                    Society Security Clearance Certificate
                  </h3>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Destination:</span>
                  <span className="font-bold text-slate-800">{activeBooking.societyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Time:</span>
                  <span className="font-bold text-slate-800">{activeBooking.scheduledDate} ({activeBooking.scheduledTime})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Service Task:</span>
                  <span className="font-bold text-teal-800">{activeBooking.packageTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Authorized Squad Size:</span>
                  <span className="font-bold text-slate-800">{activeBooking.crewSize} Verified Workers</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-center">
                <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  Gate Security Clearance OTP:
                </div>
                <div className="text-3xl font-mono font-black text-teal-950 tracking-widest mt-1">
                  {activeBooking.workerOtp}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Authorized Personnel:
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {activeBooking.crewRoster.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-xl">
                      <div className="font-bold text-slate-800">
                        {m.name} <span className="text-[10px] text-slate-500">({m.trade})</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        ✓ Police Cleared
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => alert('Gate pass shared with Society Security Desk!')}
                  className="flex-1 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs py-3 rounded-2xl transition flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share with Guard</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowGatePassModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 rounded-2xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Community Feedback Modal */}
      {isCommunityFeedbackOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setIsCommunityFeedbackOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {communityFeedbackSubmitted ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Society Review Recorded!
                </h3>
                <p className="text-xs text-slate-500">
                  Thank you for rating the industrial crew. Your review helps maintain high quality standards.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
                    Society Quality Review
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-2">
                    Rate Society Crew Performance
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For {activeBooking?.packageTitle || 'Community Service'}
                  </p>
                </div>

                {/* Stars */}
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const fill = (communityHoverRating || communityRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setCommunityHoverRating(star)}
                          onMouseLeave={() => setCommunityHoverRating(0)}
                          onClick={() => setCommunityRating(star)}
                          className="p-1 transition hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              fill
                                ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                                : 'text-slate-200'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-xs font-bold text-teal-900">
                    {ratingLabels[communityHoverRating || communityRating]}
                  </div>
                </div>

                {/* Compliment Tags */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Select Compliments:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {communityComplimentTags.map((tag) => {
                      const isSelected = selectedCommunityTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleCommunityTag(tag)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${
                            isSelected
                              ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comment Box */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Feedback for Society Committee Records:
                  </label>
                  <textarea
                    value={communityFeedbackText}
                    onChange={(e) => setCommunityFeedbackText(e.target.value)}
                    rows={3}
                    placeholder="e.g. Squad arrived punctually with full PPE and industrial de-sludge machinery. Water quality certificate handed over."
                    className="w-full text-xs font-medium border border-slate-300 rounded-xl p-3 outline-none focus:border-teal-700"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmitCommunityFeedback}
                  className="w-full bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm py-3.5 rounded-2xl shadow-md transition"
                >
                  Submit Official Society Feedback
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
