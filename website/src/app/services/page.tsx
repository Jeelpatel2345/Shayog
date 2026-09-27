'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, Filter, MapPin, Star, ShieldCheck, Clock, 
  ArrowRight, Sparkles, CheckCircle2, ChevronRight, SlidersHorizontal,
  Building2, Users, Wrench, HardHat, Truck, FileText, Check, 
  CreditCard, Smartphone, Building, KeyRound, Copy, CheckCheck, Loader2, X
} from 'lucide-react';
import { serviceCategories, allWorkers } from '@/data/workersData';
import { 
  registeredSocieties, 
  communityPackages, 
  Society, 
  CommunityPackage, 
  CommunityBooking,
  defaultActiveCommunityBooking 
} from '@/data/communityData';

function ServicesCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';
  const initialCity = searchParams.get('city') || 'All';
  const initialScope = searchParams.get('scope')?.toUpperCase() || '';

  // Scope state: INDIVIDUAL vs COMMUNITY
  const [scope, setScope] = useState<'INDIVIDUAL' | 'COMMUNITY'>('INDIVIDUAL');

  // Individual filters
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<'rating' | 'price-low' | 'price-high' | 'experience'>('rating');

  // Community filters
  const [communityCategory, setCommunityCategory] = useState<string>('ALL');
  const [selectedSocietyId, setSelectedSocietyId] = useState<string>('ALL');

  // Booking & Payment Modal state for Community Squads
  const [bookingModalPkg, setBookingModalPkg] = useState<CommunityPackage | null>(null);
  const [selectedSociety, setSelectedSociety] = useState<Society>(registeredSocieties[0]);
  const [checkoutStep, setCheckoutStep] = useState<'SCOPE' | 'PAYMENT' | 'PROCESSING' | 'CONFIRMED'>('SCOPE');
  const [selectedDate, setSelectedDate] = useState('Tomorrow');
  const [selectedTime, setSelectedTime] = useState('02:00 PM');
  const [societyTowers, setSocietyTowers] = useState('Towers A, B & Common Sump');
  const [residentNotes, setResidentNotes] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'MAINTENANCE_POOL' | 'UPI' | 'CARD' | 'NETBANKING'>('MAINTENANCE_POOL');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  const [customUpiId, setCustomUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('State Bank of India');
  const [generatedGateOtp, setGeneratedGateOtp] = useState('4821');
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [lastCreatedBookingId, setLastCreatedBookingId] = useState('');

  // Synchronize scope with localStorage & URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const logged = localStorage.getItem('sahyog-logged-in') === 'true';
      setIsLoggedIn(logged);
      setUserName(localStorage.getItem('sahyog-user-name') || '');
      setUserPhone(localStorage.getItem('sahyog-user-phone') || '');

      const storedScope = localStorage.getItem('sahyog_selected_scope');
      if (initialScope === 'COMMUNITY' || initialScope === 'INDIVIDUAL') {
        setScope(initialScope as any);
        localStorage.setItem('sahyog_selected_scope', initialScope);
      } else if (storedScope === 'COMMUNITY' || storedScope === 'INDIVIDUAL') {
        setScope(storedScope as any);
      }

      const handleStorage = (e: StorageEvent) => {
        if (e.key === 'sahyog_selected_scope' && (e.newValue === 'COMMUNITY' || e.newValue === 'INDIVIDUAL')) {
          setScope(e.newValue as any);
        }
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }
  }, [initialScope]);

  const handleScopeChange = (newScope: 'INDIVIDUAL' | 'COMMUNITY') => {
    setScope(newScope);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sahyog_selected_scope', newScope);
      try {
        window.dispatchEvent(new Event('storage'));
      } catch {}
    }
  };

  // Filter individual workers
  const filteredWorkers = useMemo(() => {
    return allWorkers.filter((worker) => {
      const catMatch = selectedCategory === 'All' || worker.category === selectedCategory;
      const cityMatch = selectedCity === 'All' || worker.city === selectedCity;
      const q = searchQuery.toLowerCase().trim();
      const textMatch = 
        !q ||
        worker.name.toLowerCase().includes(q) ||
        worker.title.toLowerCase().includes(q) ||
        worker.category.toLowerCase().includes(q) ||
        worker.city.toLowerCase().includes(q) ||
        worker.skills.some((s) => s.toLowerCase().includes(q));

      return catMatch && cityMatch && textMatch;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price-low') return a.rate - b.rate;
      if (sortBy === 'price-high') return b.rate - a.rate;
      if (sortBy === 'experience') {
        return (b.exp || 0) - (a.exp || 0);
      }
      return 0;
    });
  }, [selectedCategory, selectedCity, searchQuery, sortBy]);

  // Filter community packages
  const filteredCommunityPackages = useMemo(() => {
    return communityPackages.filter((pkg) => {
      let catMatch = true;
      if (communityCategory === 'CLEANING') catMatch = pkg.tradeCategory === 'Cleaning';
      else if (communityCategory === 'PLUMBING') catMatch = pkg.tradeCategory === 'Plumbing';
      else if (communityCategory === 'ELECTRICIAN') catMatch = pkg.tradeCategory === 'Electrician';
      else if (communityCategory === 'AMC') catMatch = pkg.tradeCategory === 'Society AMC' || pkg.tradeCategory === 'Appliance Repair';

      const q = searchQuery.toLowerCase().trim();
      const textMatch = 
        !q ||
        pkg.title.toLowerCase().includes(q) ||
        pkg.tradeCategory.toLowerCase().includes(q) ||
        pkg.leadWorkerName.toLowerCase().includes(q) ||
        pkg.includedEquipment.some((eq) => eq.toLowerCase().includes(q)) ||
        pkg.scopePoints.some((sp) => sp.toLowerCase().includes(q));

      return catMatch && textMatch;
    });
  }, [communityCategory, searchQuery]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const cities = ['All', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'];

  // Start booking community squad
  const handleOpenCommunityBooking = (pkg: CommunityPackage) => {
    if (!isLoggedIn && (typeof window !== 'undefined' && localStorage.getItem('sahyog-logged-in') !== 'true')) {
      router.push('/login?redirect=/services?scope=COMMUNITY');
      return;
    }
    setBookingModalPkg(pkg);
    setCheckoutStep('SCOPE');
    setResidentNotes('');
  };

  const handleCopyOtp = (otp: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(otp);
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2500);
    }
  };

  const handleConfirmCommunityPayment = async () => {
    setCheckoutStep('PROCESSING');
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedGateOtp(newOtp);
    const bkId = 'SY-COM-' + Math.floor(100000 + Math.random() * 900000);
    setLastCreatedBookingId(bkId);

    if (bookingModalPkg) {
      const orderData: CommunityBooking = {
        id: bkId,
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

      // 1. Post to Neon PostgreSQL DB via /api/community/bookings
      try {
        await fetch('/api/community/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });
      } catch (err) {
        console.warn('API community bookings post notice:', err);
      }

      // 2. Also register into standard /api/bookings so phone worker dashboard sees it instantly
      try {
        await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingCode: bkId,
            serviceTitle: `[Community: ${selectedSociety.name}] ${bookingModalPkg.title} (${bookingModalPkg.crewSize} Workers)`,
            workerName: bookingModalPkg.leadWorkerName,
            customerName: userName || selectedSociety.authorizedRepresentative.name,
            customerPhone: userPhone || selectedSociety.authorizedRepresentative.mobile,
            serviceLocation: `${selectedSociety.name}, ${selectedSociety.fullAddress}`,
            city: selectedSociety.city,
            totalAmount: bookingModalPkg.discountedRateINR,
            workerOtp: newOtp,
            status: 'PENDING',
            paymentMethod: selectedPaymentMethod,
            scheduledDate: selectedDate,
            scheduledTime: selectedTime
          })
        });
      } catch (err) {
        console.warn('API booking sync notice:', err);
      }

      // 3. Store to localStorage
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('sahyog-user-bookings');
          const existing = raw ? JSON.parse(raw) : [];
          existing.unshift({
            id: bkId,
            bookingCode: bkId,
            serviceTitle: bookingModalPkg.title,
            workerName: bookingModalPkg.leadWorkerName + ' (Squad Lead)',
            status: 'CONFIRMED',
            scheduledDate: selectedDate,
            scheduledTime: selectedTime,
            serviceLocation: selectedSociety.name,
            totalAmount: bookingModalPkg.discountedRateINR,
            workerOtp: newOtp,
            crewSize: bookingModalPkg.crewSize,
            isCommunity: true
          });
          localStorage.setItem('sahyog-user-bookings', JSON.stringify(existing));
          localStorage.setItem('sahyog_active_community_booking_id', bkId);
          localStorage.setItem('sahyog-active-booking-id', bkId);

          // 4. Broadcast live notification to Worker phone console
          const eventPayload = {
            type: 'NEW_COMMUNITY_BOOKING',
            bookingId: bkId,
            societyName: selectedSociety.name,
            packageTitle: bookingModalPkg.title,
            workerShare: Math.round(bookingModalPkg.discountedRateINR / bookingModalPkg.crewSize),
            workerOtp: newOtp,
            leadWorker: bookingModalPkg.leadWorkerName,
            timestamp: Date.now()
          };
          localStorage.setItem('sahyog-realtime-event', JSON.stringify(eventPayload));

          const channel = new BroadcastChannel('sahyog-realtime-sync');
          channel.postMessage(eventPayload);
          channel.close();
        } catch {}
      }
    }

    setTimeout(() => {
      setCheckoutStep('CONFIRMED');
    }, 1200);
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* ============================================================== */}
        {/* SCOPE SWITCHER BAR */}
        {/* ============================================================== */}
        <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
              Viewing Catalog:
            </span>
            <div className="inline-flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => handleScopeChange('INDIVIDUAL')}
                className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                  scope === 'INDIVIDUAL'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Individual Home Services (1-on-1 Experts)</span>
              </button>
              <button
                type="button"
                onClick={() => handleScopeChange('COMMUNITY')}
                className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                  scope === 'COMMUNITY'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Community &amp; Society Squads (Crew AMC)</span>
              </button>
            </div>
          </div>

          <div className="text-xs font-bold text-slate-500">
            {scope === 'COMMUNITY' ? (
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Society Scope Active • 0 Individual Solo Workers Shown</span>
              </span>
            ) : (
              <span className="text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Individual Scope Active • Direct Hourly Bookings</span>
              </span>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* BANNER HEADER (DYNAMIC BY SCOPE) */}
        {/* ============================================================== */}
        {scope === 'COMMUNITY' ? (
          <div className="bg-gradient-to-r from-[#022c2b] via-[#064e3b] to-[#042f2e] text-white rounded-3xl p-8 sm:p-10 shadow-lg border border-emerald-900/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl space-y-3">
              <span className="text-xs uppercase font-bold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                RERA &amp; Cooperative Society Certified Catalog
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Society Squads &amp; Industrial Campus Services
              </h1>
              <p className="text-sm text-emerald-200/90 leading-relaxed">
                Deploy 4 to 6 member specialized squads equipped with industrial pressure washers, sludge pumps, 
                and thermal imaging rigs. Includes gate security entry OTP, transparent pooled pricing, and RWA maintenance billing.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#042f2e] text-white rounded-3xl p-8 sm:p-10 shadow-lg border border-emerald-900/60 relative overflow-hidden">
            <div className="relative z-10 max-w-3xl space-y-3">
              <span className="text-xs uppercase font-bold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-3 py-1 rounded-full">
                Full Network Catalog
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Browse 100+ Verified Service Experts
              </h1>
              <p className="text-sm text-emerald-200/90 leading-relaxed">
                Every worker has verified Aadhaar credentials, police clearing, and transparent hourly pricing. 
                Book direct with instant confirmation.
              </p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* COMMUNITY SQUADS VIEW */}
        {/* ============================================================== */}
        {scope === 'COMMUNITY' && (
          <div className="space-y-6">
            {/* Community Filters & Controls */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search Input */}
                <div className="relative w-full md:max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search society packages, equipment, or supervisors..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium border border-slate-200 rounded-xl outline-none focus:border-teal-600 transition text-slate-800"
                  />
                </div>

                {/* Society Target Selector */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-semibold text-slate-500">Target Society:</span>
                  <select
                    value={selectedSociety.id}
                    onChange={(e) => {
                      const soc = registeredSocieties.find(s => s.id === e.target.value);
                      if (soc) setSelectedSociety(soc);
                    }}
                    className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer text-slate-700"
                  >
                    {registeredSocieties.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Trade Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-slate-100">
                {[
                  { id: 'ALL', label: 'All Society Squads', count: communityPackages.length },
                  { id: 'PLUMBING', label: '💧 Water Tank & Plumbing', count: 2 },
                  { id: 'CLEANING', label: '🧹 Common Area Jetting', count: 1 },
                  { id: 'ELECTRICIAN', label: '⚡ Electrical AMC & DG', count: 1 },
                  { id: 'AMC', label: '🏢 Comprehensive Society AMC', count: 2 },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCommunityCategory(cat.id)}
                    className={'text-xs font-bold px-4 py-2 rounded-xl transition whitespace-nowrap ' + (
                      communityCategory === cat.id 
                        ? 'bg-teal-700 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {cat.label} ({cat.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>Showing <b>{filteredCommunityPackages.length}</b> verified society squad packages for <b>{selectedSociety.shortName}</b></span>
              {(communityCategory !== 'ALL' || searchQuery) && (
                <button
                  onClick={() => {
                    setCommunityCategory('ALL');
                    setSearchQuery('');
                  }}
                  className="text-teal-700 hover:underline font-bold"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* Society Squad Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCommunityPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-5">
                    {/* Header Row: Badge & Crew size */}
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          <span>{pkg.crewSize}-Worker Certified Squad</span>
                        </span>
                        {pkg.popular && (
                          <span className="text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full">
                            ★ High Society Demand
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{pkg.durationHours} Hours Dedicated</span>
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                        {pkg.title}
                      </h3>
                      <p className="text-xs text-teal-700 font-bold mt-1 flex items-center gap-1">
                        <HardHat className="w-3.5 h-3.5" />
                        <span>Lead Supervisor: {pkg.leadWorkerName} ({pkg.leadWorkerTrade})</span>
                      </p>
                    </div>

                    {/* Crew Roster Preview */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        Assigned Squad Crew ({pkg.crewRoster.length} Specialists)
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {pkg.crewRoster.map((crew) => (
                          <div key={crew.id} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200/70 text-xs">
                            <div className="w-7 h-7 rounded-lg bg-teal-800 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                              {crew.avatarInitials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate text-[11px]">{crew.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{crew.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Industrial Equipment Tags */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Industrial Equipment Manifest Included
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {pkg.includedEquipment.map((eq, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-1 rounded-lg flex items-center gap-1"
                          >
                            <Wrench className="w-3 h-3 text-emerald-600" />
                            <span>{eq}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Scope points */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Society Deliverables &amp; Safety Compliance
                      </span>
                      {pkg.scopePoints.map((pt, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & Booking CTA */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-slate-900">
                          ₹{pkg.discountedRateINR}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ₹{pkg.baseRateINR}
                        </span>
                        <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                          {pkg.residentSavingsPercent}% RESIDENT SAVINGS
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                        Flat Society Rate • Pool share: ₹{Math.round(pkg.discountedRateINR / pkg.crewSize)}/worker
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenCommunityBooking(pkg)}
                      className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl transition flex items-center gap-2 shadow-sm hover:scale-[1.02] cursor-pointer"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Deploy Squad</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* INDIVIDUAL HOME SERVICES VIEW */}
        {/* ============================================================== */}
        {scope === 'INDIVIDUAL' && (
          <div className="space-y-6">
            {/* Filters and Search Bar Container */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search Input */}
                <div className="relative w-full md:max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by worker name, skill, or service..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium border border-slate-200 rounded-xl outline-none focus:border-teal-600 transition text-slate-800"
                  />
                </div>

                {/* City & Sort controls */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-semibold text-slate-500">City:</span>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer text-slate-700"
                    >
                      {cities.map((c) => (
                        <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-500">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e: any) => setSortBy(e.target.value)}
                      className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer text-slate-700"
                    >
                      <option value="rating">Top Rated (Highest)</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="experience">Most Experienced</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={'text-xs font-bold px-4 py-2 rounded-xl transition whitespace-nowrap ' + (
                    selectedCategory === 'All' 
                      ? 'bg-teal-700 text-white shadow-xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  All Categories ({allWorkers.length})
                </button>

                {serviceCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={'text-xs font-bold px-4 py-2 rounded-xl transition whitespace-nowrap ' + (
                      selectedCategory === cat.name 
                        ? 'bg-teal-700 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {cat.name} ({cat.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>Showing <b>{filteredWorkers.length}</b> verified partners available</span>
              {(selectedCategory !== 'All' || searchQuery || selectedCity !== 'All') && (
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedCity('All');
                    setSearchQuery('');
                  }}
                  className="text-teal-700 hover:underline font-bold"
                >
                  Reset All Filters
                </button>
              )}
            </div>

            {/* Worker Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkers.map((w) => (
                <div
                  key={w.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-teal-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header: Photo + Name + Rating */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-teal-700 to-emerald-800 text-white font-black text-base flex items-center justify-center shadow-md flex-shrink-0">
                          {getInitials(w.name)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-slate-900 text-base leading-snug">{w.name}</h3>
                            <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
                          </div>
                          <p className="text-xs text-teal-700 font-semibold">{w.title}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-black text-amber-800 flex-shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{w.rating}</span>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {w.bio}
                    </p>

                    {/* Skills tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {w.skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                      {w.skills.length > 3 && (
                        <span className="text-[10px] font-semibold bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded">
                          +{w.skills.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Details row */}
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{w.exp} yrs exp</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{w.city}</span>
                      </div>
                      <div className="font-bold text-emerald-700">
                        {w.reviewsCount}+ jobs
                      </div>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Standard Rate</span>
                      <span className="text-lg font-black text-slate-900">
                        ₹{w.rate}
                        <span className="text-xs font-normal text-slate-500">/hr</span>
                      </span>
                    </div>

                    <Link
                      href={'/book/' + w.id}
                      className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm hover:scale-[1.02]"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {((scope === 'INDIVIDUAL' && filteredWorkers.length === 0) || (scope === 'COMMUNITY' && filteredCommunityPackages.length === 0)) && (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 max-w-md mx-auto space-y-3">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No matching services found</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or reset your filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setCommunityCategory('ALL');
              }}
              className="bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl mt-2"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* COMPLETE COMMUNITY PAYMENT GATEWAY MODAL */}
      {/* ============================================================== */}
      {bookingModalPkg && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setBookingModalPkg(null);
                setCheckoutStep('SCOPE');
              }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* STEP 1: SCOPE & SCHEDULE */}
            {checkoutStep === 'SCOPE' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    Step 1 of 2: Society Deployment Scope
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                    {bookingModalPkg.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Deploying certified {bookingModalPkg.crewSize}-worker crew supervised by {bookingModalPkg.leadWorkerName}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Select Society */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                      Target Housing Society / RWA Campus
                    </label>
                    <select
                      value={selectedSociety.id}
                      onChange={(e) => {
                        const s = registeredSocieties.find(soc => soc.id === e.target.value);
                        if (s) setSelectedSociety(s);
                      }}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-teal-600"
                    >
                      {registeredSocieties.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.locality}, {s.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Towers */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                      Campus Wings / Towers / Sump Areas
                    </label>
                    <input
                      type="text"
                      value={societyTowers}
                      onChange={(e) => setSocietyTowers(e.target.value)}
                      placeholder="e.g. Wings A, B, C & Main Underground Sump"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-teal-600"
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                        Scheduled Date
                      </label>
                      <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-teal-600"
                      >
                        <option value="Today">Today (Emergency Squad)</option>
                        <option value="Tomorrow">Tomorrow</option>
                        <option value="Within 48 Hours">Within 48 Hours</option>
                        <option value="Weekend AMC Slot">This Saturday / Sunday</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                        Squad Arrival Time
                      </label>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-teal-600"
                      >
                        <option value="09:00 AM">09:00 AM - Morning Slot</option>
                        <option value="02:00 PM">02:00 PM - Afternoon Slot</option>
                        <option value="04:30 PM">04:30 PM - Evening Slot</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                      Main Gate Security Clearance &amp; Vehicle Parking Notes
                    </label>
                    <textarea
                      value={residentNotes}
                      onChange={(e) => setResidentNotes(e.target.value)}
                      rows={2}
                      placeholder="e.g. Jetting van can park near Gate 2 visitor bay. Water supply valves located behind clubhouse."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                {/* Price summary & Proceed */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Flat Society Rate</span>
                    <span className="text-2xl font-black text-slate-900">
                      ₹{bookingModalPkg.discountedRateINR}
                    </span>
                    <span className="text-xs text-emerald-700 font-bold ml-2">
                      ({bookingModalPkg.residentSavingsPercent}% Resident Subsidy)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCheckoutStep('PAYMENT')}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl transition flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <span>Proceed to Society Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PAYMENT GATEWAY */}
            {checkoutStep === 'PAYMENT' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                    Step 2 of 2: Society Payment Gateway
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                    Authorize Society Squad Payout
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Select RWA fund debit, instant UPI settlement, or corporate society card.
                  </p>
                </div>

                {/* Payment Methods Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'MAINTENANCE_POOL', label: 'RWA Fund', icon: Building },
                    { id: 'UPI', label: 'Instant UPI', icon: Smartphone },
                    { id: 'CARD', label: 'Society Card', icon: CreditCard },
                    { id: 'NETBANKING', label: 'Net Banking', icon: FileText }
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedPaymentMethod(m.id as any)}
                        className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                          selectedPaymentMethod === m.id
                            ? 'border-teal-700 bg-teal-50 text-teal-900 font-black shadow-xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-bold'
                        }`}
                      >
                        <Icon className="w-5 h-5 text-teal-700" />
                        <span className="text-xs">{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Payment Fields */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  {selectedPaymentMethod === 'MAINTENANCE_POOL' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Building className="w-4 h-4 text-teal-700" />
                        <span>Direct Charge to {selectedSociety.shortName} Maintenance Account</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Authorized under Society Reg: <b>{selectedSociety.societyRegNo}</b>. 
                        Amount will be reconciled against the monthly maintenance fund with an automated tax invoice generated for the Auditor.
                      </p>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>Society Current Account Balance:</span>
                          <span className="text-emerald-700">₹ 2,45,800.00</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Post-Deployment Balance:</span>
                          <span>₹ {(245800 - bookingModalPkg.discountedRateINR).toLocaleString('en-IN')}.00</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'UPI' && (
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-slate-700 uppercase block">
                        Select Instant UPI App
                      </span>
                      <div className="grid grid-cols-4 gap-2">
                        {['gpay', 'phonepe', 'paytm', 'bhim'].map((app) => (
                          <button
                            key={app}
                            type="button"
                            onClick={() => setSelectedUpiApp(app as any)}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize cursor-pointer ${
                              selectedUpiApp === app
                                ? 'bg-teal-700 text-white border-teal-700'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {app}
                          </button>
                        ))}
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                          Or Enter UPI VPA / ID
                        </label>
                        <input
                          type="text"
                          value={customUpiId}
                          onChange={(e) => setCustomUpiId(e.target.value)}
                          placeholder="rwa.society@okaxis"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-teal-600"
                        />
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'CARD' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                          Society / RWA Corporate Card Number
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4532 •••• •••• 9012"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 outline-none focus:border-teal-600"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-teal-600"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                            CVV
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="•••"
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-teal-600"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'NETBANKING' && (
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                        Select Corporate Banking Portal
                      </label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-teal-600"
                      >
                        <option value="State Bank of India">State Bank of India (Corporate RWA)</option>
                        <option value="HDFC Bank">HDFC Bank SmartHub RWA</option>
                        <option value="ICICI Bank">ICICI Bank Corporate Portal</option>
                        <option value="Bank of Baroda">Bank of Baroda Housing Society AMC</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Amount Confirmation & Trigger */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('SCOPE')}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-2 cursor-pointer"
                  >
                    ← Back to Scope
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmCommunityPayment}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm px-7 py-3 rounded-2xl transition flex items-center gap-2 shadow-md hover:scale-[1.02] cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize &amp; Pay ₹{bookingModalPkg.discountedRateINR}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PROCESSING */}
            {checkoutStep === 'PROCESSING' && (
              <div className="py-16 text-center space-y-4">
                <Loader2 className="w-12 h-12 text-teal-700 animate-spin mx-auto" />
                <h4 className="text-xl font-black text-slate-900">
                  Processing Society Clearance &amp; Squad Dispatch...
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Authorizing payment with RWA pool fund, creating society gate pass, and alerting {bookingModalPkg.leadWorkerName}&apos;s squad on their phones.
                </p>
              </div>
            )}

            {/* STEP 4: CONFIRMED */}
            {checkoutStep === 'CONFIRMED' && (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCheck className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    Squad Deployed &amp; Gate Entry Pass Generated!
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Booking #{lastCreatedBookingId} has been confirmed. The squad lead has received the assignment on their phone.
                  </p>
                </div>

                {/* Security Gate OTP Card */}
                <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 max-w-md mx-auto text-center space-y-2 shadow-sm">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                    Society Security Cabin Arrival OTP
                  </span>
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-mono text-4xl font-black text-slate-950 tracking-widest">
                      {generatedGateOtp}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyOtp(generatedGateOtp)}
                      className="p-2 bg-white rounded-xl border border-amber-300 text-amber-800 hover:bg-amber-100 transition shadow-2xs cursor-pointer"
                      title="Copy OTP"
                    >
                      {copiedOtp ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-800 font-medium">
                    Provide this code to Main Gate Security Marshal or Squad Supervisor upon arrival to verify entry.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-4">
                  <Link
                    href="/dashboard"
                    className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl transition shadow-sm"
                  >
                    View in Society Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setBookingModalPkg(null);
                      setCheckoutStep('SCOPE');
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ServicesCatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20 text-slate-500 font-bold text-sm">
        Loading services catalog...
      </div>
    }>
      <ServicesCatalogContent />
    </Suspense>
  );
}
