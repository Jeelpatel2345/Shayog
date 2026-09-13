'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Users, ShieldCheck, CheckCircle2, Star, Clock, 
  MapPin, Phone, Sparkles, Building2, KeyRound, Wrench, 
  ChevronDown, AlertCircle, Check, Loader2, Calendar, ArrowRight,
  Truck, HardHat, FileText, CheckCheck, X
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
      if (data?.type === 'COMMUNITY_JOB_STARTED' || data?.type === 'COMMUNITY_JOB_COMPLETED' || data?.type === 'NEW_COMMUNITY_BOOKING') {
        fetchCommunityBookings();
      }
    };

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
    };
  }, [selectedSociety.id]);

  const handleCopyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleConfirmCommunityBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalPkg) return;

    setIsSubmittingBooking(true);
    const newOtp = String(Math.floor(1000 + Math.random() * 9000));
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
          orderedBy: `Resident / Secretary (${societyTowers})`,
          ordererPhone: selectedSociety.managerPhone,
        })
      });

      const data = await res.json();
      if (data?.booking) {
        setActiveBooking(data.booking);
        setBookingsList(prev => [data.booking, ...prev]);
      }
    } catch (err) {
      console.warn('Local fallback for community booking');
    }

    setIsSubmittingBooking(false);
    setBookingModalPkg(null);
    setBookingSuccessNotice(`🎉 Multi-Worker Squad Scheduled for ${selectedSociety.shortName}! Gate Arrival OTP: ${newOtp}`);
    setTimeout(() => setBookingSuccessNotice(''), 7000);

    // Broadcast event
    try {
      const channel = new BroadcastChannel('sahyog-realtime-sync');
      channel.postMessage({
        type: 'NEW_COMMUNITY_BOOKING',
        societyName: selectedSociety.name,
        timestamp: Date.now()
      });
      channel.close();
    } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 text-slate-900">
      {/* Sticky Mobile Header */}
      <div className="bg-[#042f2e] text-white p-4 sticky top-0 z-30 shadow-md">
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
          <div className="bg-gradient-to-br from-[#042f2e] via-[#0f766e] to-[#042f2e] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-teal-800/50 space-y-5">
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
                    onClick={() => setBookingModalPkg(pkg)}
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

      {/* Booking Modal */}
      {bookingModalPkg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Deploy Society Squad</span>
                <h3 className="font-black text-slate-900 text-base">{bookingModalPkg.title}</h3>
              </div>
              <button 
                onClick={() => setBookingModalPkg(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCommunityBooking} className="space-y-4 text-xs">
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
                  <span>Team Leader:</span>
                  <span>{bookingModalPkg.leadWorkerName}</span>
                </div>
                <div className="flex justify-between font-black text-teal-950 pt-1 border-t border-teal-200 text-sm">
                  <span>Society Pool Total:</span>
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
                <label className="font-bold text-slate-700 block mb-1">Building Wings / Towers to Cover</label>
                <input
                  type="text"
                  value={societyTowers}
                  onChange={(e) => setSocietyTowers(e.target.value)}
                  placeholder="e.g. Towers A, B, C & Clubhouse"
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-medium outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Instructions for Security Gate / Supervisor</label>
                <textarea
                  rows={2}
                  value={residentNotes}
                  onChange={(e) => setResidentNotes(e.target.value)}
                  placeholder="e.g. Squad van should park near Tower B basement ramp..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 outline-none focus:border-teal-600 resize-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setBookingModalPkg(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="flex-1 py-3 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingBooking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Confirm Society Squad</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav role="customer" />
    </div>
  );
}
