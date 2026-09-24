'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, Users, Calendar, Clock, Star, MapPin, Search, ArrowRight, 
  ShieldCheck, CheckCircle2, ChevronRight, LogOut, Sparkles, 
  Briefcase, TrendingUp, AlertCircle, Award, FileText, Banknote,
  DollarSign, Check, AlertTriangle, Phone, Play, CheckCheck, Loader2
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { allWorkers } from '@/data/workersData';

export default function UnifiedDashboardPage() {
  const router = useRouter();
  const { fullName, phone, role: storeRole, logout } = useAuthStore();
  const [clientName, setClientName] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Role toggle: 'CUSTOMER' | 'WORKER'
  const [activeRole, setActiveRole] = useState<'CUSTOMER' | 'WORKER'>('CUSTOMER');

  // Partner Console specific states
  const [isOnline, setIsOnline] = useState(true);
  const [isDocVerified, setIsDocVerified] = useState(true);
  const [preferredTrades, setPreferredTrades] = useState<string[]>([
    'Plumbing & Sanitation',
    'Electrical Works',
    'Deep Cleaning'
  ]);
  const [partnerActiveBooking, setPartnerActiveBooking] = useState<any>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [partnerPaymentConfirmed, setPartnerPaymentConfirmed] = useState(false);
  const [partnerToast, setPartnerToast] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sahyog-user-name');
      if (saved) setClientName(saved);

      const savedRole = localStorage.getItem('sahyog-role');
      if (savedRole === 'WORKER') {
        setActiveRole('WORKER');
      }

      const savedDocVerified = localStorage.getItem('sahyog_worker_verified');
      if (savedDocVerified !== null) {
        setIsDocVerified(savedDocVerified === 'true');
      }

      const savedTrades = localStorage.getItem('sahyog_preferred_work');
      if (savedTrades) {
        try {
          const parsed = JSON.parse(savedTrades);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPreferredTrades(parsed);
          }
        } catch {}
      }

      // Check active booking for partner console
      const userBookingsRaw = localStorage.getItem('sahyog-user-bookings');
      if (userBookingsRaw) {
        try {
          const parsedBookings = JSON.parse(userBookingsRaw);
          if (Array.isArray(parsedBookings) && parsedBookings.length > 0) {
            setPartnerActiveBooking(parsedBookings[0]);
          }
        } catch {}
      }

      // Fetch live user & bookings
      fetch('/api/user/profile')
        .then((res) => {
          if (!res.ok) {
            setClientName('');
            localStorage.removeItem('sahyog-user-name');
            router.push('/login');
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data?.user?.fullName) {
            setClientName(data.user.fullName);
            localStorage.setItem('sahyog-user-name', data.user.fullName);
          }
          if (data?.user?.role) {
            setActiveRole(data.user.role === 'WORKER' ? 'WORKER' : 'CUSTOMER');
          }
        })
        .catch(() => {});

      fetch('/api/bookings')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) {
            setBookings(data);
            if (data.length > 0 && !partnerActiveBooking) {
              setPartnerActiveBooking(data[0]);
            }
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, []);

  const handleRoleToggle = (newRole: 'CUSTOMER' | 'WORKER') => {
    setActiveRole(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sahyog-role', newRole);
    }
  };

  const handleToggleDocVerification = () => {
    const nextState = !isDocVerified;
    setIsDocVerified(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sahyog_worker_verified', String(nextState));
    }
    setPartnerToast(nextState ? '✓ KYC Approved! You are now eligible to accept jobs.' : 'KYC Status reset to Pending.');
    setTimeout(() => setPartnerToast(''), 4000);
  };

  const handleVerifyCustomerOtp = () => {
    if (otpInput.length === 4) {
      setOtpVerified(true);
      setPartnerToast('⚡ OTP Verified! Service timer started.');
      try {
        const channel = new BroadcastChannel('sahyog-realtime-sync');
        channel.postMessage({ type: 'JOB_STARTED', timestamp: Date.now() });
        channel.close();
      } catch {}
      localStorage.setItem('sahyog-realtime-event', JSON.stringify({ type: 'JOB_STARTED', timestamp: Date.now() }));
      setTimeout(() => setPartnerToast(''), 4000);
    }
  };

  const handleConfirmPaymentReceived = () => {
    setPartnerPaymentConfirmed(true);
    setPartnerToast('🎉 Payment Confirmed! Customer screen updated in real-time.');
    try {
      const channel = new BroadcastChannel('sahyog-realtime-sync');
      channel.postMessage({
        type: 'PAYMENT_RECEIVED',
        bookingId: partnerActiveBooking?.id,
        amount: partnerActiveBooking?.totalAmount || 625,
        timestamp: Date.now()
      });
      channel.close();
    } catch {}
    localStorage.setItem('sahyog-realtime-event', JSON.stringify({
      type: 'PAYMENT_RECEIVED',
      bookingId: partnerActiveBooking?.id,
      amount: partnerActiveBooking?.totalAmount || 625,
      timestamp: Date.now()
    }));
    setTimeout(() => setPartnerToast(''), 5000);
  };

  const displayName = fullName || clientName || (phone ? ('Member ' + phone.slice(-4)) : (activeRole === 'WORKER' ? 'Service Partner' : 'Valued Customer'));

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(displayName);
  const featured = allWorkers.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Toast Notification */}
        {partnerToast && (
          <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 text-xs font-bold animate-in slide-in-from-top-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{partnerToast}</span>
          </div>
        )}

        {/* Dual-Role Switcher Bar (Mobile & Laptop Dual Access) */}
        <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3">
              Console View:
            </span>
            <div className="inline-flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => handleRoleToggle('CUSTOMER')}
                className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  activeRole === 'CUSTOMER'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Customer Dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleToggle('WORKER')}
                className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  activeRole === 'WORKER'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Service Partner Console</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 px-3">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Active Mode: <strong className="text-slate-900">{activeRole === 'WORKER' ? 'Service Partner' : 'Customer'}</strong>
            </span>
            <Link
              href="/profile"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 transition"
            >
              Manage Profile →
            </Link>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CUSTOMER VIEW */}
        {/* ============================================================== */}
        {activeRole === 'CUSTOMER' && (
          <>
            {/* Customer Welcome Bar */}
            <div className="bg-gradient-to-r from-[#042f2e] via-[#0d9488] to-[#042f2e] text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-emerald-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-400 text-emerald-950 font-black text-2xl flex items-center justify-center shadow-md">
                  {initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-white">
                      Namaste, {displayName}!
                    </h1>
                    <ShieldCheck className="w-5 h-5 text-amber-300" />
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
                    Your SahYog Customer Account is active. All services guaranteed & insured.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/services"
                  className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs px-5 py-3 rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Book New Service</span>
                </Link>
                <Link
                  href="/profile"
                  className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-3 rounded-xl border border-white/20 transition cursor-pointer"
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">My Bookings</span>
                  <Calendar className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">{bookings.length}</div>
                <div className="text-[11px] text-teal-700 font-medium mt-1">Active on account</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Available Experts</span>
                  <Users className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">100+</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Across 4 major cities</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Trust Shield</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">100%</div>
                <div className="text-[11px] text-emerald-700 font-medium mt-1">Aadhaar verified partners</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Insurance Coverage</span>
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">₹10,000</div>
                <div className="text-[11px] text-blue-700 font-medium mt-1">On all verified jobs</div>
              </div>
            </div>

            {/* Main 2-Column Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Recent Bookings */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900">Recent Service Bookings</h2>
                  <Link href="/bookings" className="text-xs font-bold text-teal-700 hover:underline">
                    View All →
                  </Link>
                </div>

                {bookings.length > 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
                    {bookings.map((b) => (
                      <div key={b.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 font-mono">#{b.serviceCode || b.id.slice(0, 8)}</span>
                            <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ' + (
                              b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                              b.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                            )}>
                              {b.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900">{b.serviceName || 'Home Service'}</h4>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>{b.bookingDate || 'Upcoming'}</span>
                            <span>•</span>
                            <span>{b.bookingTime || 'Morning'}</span>
                            <span>•</span>
                            <span className="font-bold text-slate-700">₹{b.totalAmount}</span>
                          </div>
                        </div>

                        <Link
                          href={'/tracking/' + b.id}
                          className="text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/80 px-4 py-2 rounded-xl transition"
                        >
                          Details &amp; Tracking →
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs space-y-4">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">No active bookings yet</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Browse our 100+ verified plumbers, electricians, cleaners, and painters to book your first service.
                      </p>
                    </div>
                    <Link
                      href="/services"
                      className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
                    >
                      <span>Browse Services</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Right Column: Top Rated Nearby */}
              <div className="lg:col-span-4 space-y-4">
                <h2 className="text-xl font-black text-slate-900">Recommended Experts</h2>

                <div className="space-y-4">
                  {featured.map((w) => (
                    <div key={w.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-700 text-white font-bold text-sm flex items-center justify-center">
                            {getInitials(w.name)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{w.name}</h4>
                            <p className="text-xs text-teal-700 font-medium">{w.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{w.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="font-black text-slate-900">₹{w.rate}/hr</span>
                        <Link
                          href={'/book/' + w.id}
                          className="text-teal-700 hover:underline font-bold flex items-center gap-1"
                        >
                          <span>Book</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* SERVICE PARTNER CONSOLE VIEW */}
        {/* ============================================================== */}
        {activeRole === 'WORKER' && (
          <div className="space-y-8">
            {/* Partner Console Top Bar */}
            <div className="bg-gradient-to-r from-[#042f2e] via-[#0f766e] to-[#042f2e] text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-teal-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-400 text-emerald-950 font-black text-2xl flex items-center justify-center shadow-md">
                  {initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-white">
                      Partner Console: {displayName}
                    </h1>
                    <span className="bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      ID: SY-PRT-{phone ? phone.slice(-4) : '9021'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-teal-100/90 mt-1">
                    Accept live customer requests, complete jobs, and verify UPI/Cash settlements.
                  </p>
                </div>
              </div>

              {/* Online/Offline Status Toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsOnline(!isOnline)}
                  className={`px-5 py-3 rounded-2xl font-black text-xs transition flex items-center gap-2 shadow-md cursor-pointer ${
                    isOnline 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-white animate-ping' : 'bg-slate-400'}`} />
                  <span>{isOnline ? '🟢 Online (Accepting Jobs)' : '⚪ Offline (Paused)'}</span>
                </button>
              </div>
            </div>

            {/* Mandatory Document Verification Guard Banner */}
            {!isDocVerified ? (
              <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-100 text-red-600 rounded-2xl shrink-0">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-black text-red-950 text-base">
                      KYC Verification Mandatory — Ineligible to Work
                    </h3>
                    <p className="text-xs text-red-800 leading-relaxed max-w-2xl">
                      Without verification of documents (Aadhaar Card, Skill Trade Certificate, and Police Clearance), service partners cannot accept customer requests, verify arrival OTPs, or receive payouts.
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] font-bold text-red-700">
                      <span className="flex items-center gap-1">❌ Aadhaar: Unverified</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">❌ Trade License: Pending</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">❌ Police Clearance: Required</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleDocVerification}
                  className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-6 py-3 rounded-xl transition shadow-md shrink-0 cursor-pointer"
                >
                  Verify Documents Now (Sandbox Pass)
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 shadow-xs flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                      <span>Documents Verified &amp; KYC Compliant</span>
                      <span className="bg-emerald-200/60 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                        ACTIVE BADGE
                      </span>
                    </h4>
                    <p className="text-xs text-emerald-800">
                      Government Aadhaar, Skill Certificate, and Police Clearance are on file. Eligible for all dispatches.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleDocVerification}
                  className="text-xs font-bold text-slate-500 hover:text-red-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition"
                  title="Toggle to test unverified state"
                >
                  Reset Verification Status (Dev Test)
                </button>
              </div>
            )}

            {/* Partner Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Today&apos;s Earnings</span>
                  <Banknote className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">₹3,450.00</div>
                <div className="text-[11px] text-emerald-700 font-medium mt-1">Direct bank payout daily</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Completed Jobs</span>
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">48</div>
                <div className="text-[11px] text-teal-700 font-medium mt-1">100% completion rate</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Partner Rating</span>
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">4.9 ★</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Based on 46 verified reviews</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">On-Time Arrival</span>
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">99.2%</div>
                <div className="text-[11px] text-blue-700 font-medium mt-1">Punctuality badge active</div>
              </div>
            </div>

            {/* Preferred Work Chips Section */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-teal-700" />
                  <h3 className="font-black text-slate-900 text-sm">Preferred Trades &amp; Work Types</h3>
                </div>
                <span className="text-xs text-slate-400">Chosen during Partner Registration</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {preferredTrades.map((trade) => (
                  <span
                    key={trade}
                    className="bg-teal-50 border border-teal-200 text-teal-900 font-bold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                    <span>{trade}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Active Job Management & Payment Verification (Worker Side Confirmation) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900">Current Assigned Job</h2>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                    Live Dispatch
                  </span>
                </div>

                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  {/* Job Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                          #{partnerActiveBooking?.id?.slice(0, 8) || 'SY-9021'}
                        </span>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          {otpVerified ? 'IN PROGRESS' : 'ASSIGNED & EN ROUTE'}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 mt-1">
                        {partnerActiveBooking?.serviceName || 'Home Plumbing & Fixture Repair'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        📍 {partnerActiveBooking?.address || 'B/402, Shanti Heights, Navrangpura, Ahmedabad'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Job Payout</span>
                      <span className="text-2xl font-black text-emerald-700">
                        ₹{partnerActiveBooking?.totalAmount || 625}
                      </span>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Customer</span>
                      <strong className="text-slate-800 font-bold">{partnerActiveBooking?.customerName || 'Customer'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Contact</span>
                      <strong className="text-slate-800 font-bold">{partnerActiveBooking?.customerPhone || '+91 98251 01001'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Payment Mode</span>
                      <strong className="text-teal-700 font-bold">UPI QR / Escrow</strong>
                    </div>
                  </div>

                  {/* Step 1: Start Job with Customer Arrival OTP */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
                      <span>Arrival &amp; Job Start Verification</span>
                    </h4>

                    {!isDocVerified ? (
                      <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-bold border border-red-200 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>KYC Documents must be verified before you can start this service.</span>
                      </div>
                    ) : otpVerified ? (
                      <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>OTP Verified! Service is actively being fulfilled.</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          maxLength={4}
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter 4-digit Customer OTP"
                          className="px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 w-56"
                        />
                        <button
                          type="button"
                          disabled={otpInput.length !== 4}
                          onClick={handleVerifyCustomerOtp}
                          className="bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
                        >
                          Verify &amp; Start Job
                        </button>
                        <span className="text-[11px] text-slate-400">
                          (Ask customer for OTP displayed on their screen)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Payment Verification - Confirmed Strictly on Worker Side */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
                      <span>Payment Receipt Confirmation</span>
                    </h4>

                    <p className="text-xs text-slate-500">
                      Customers scan the UPI QR code on their device. As service partner, you verify receipt in your account and confirm below to release completion &amp; ratings.
                    </p>

                    {partnerPaymentConfirmed ? (
                      <div className="bg-emerald-100 border border-emerald-300 text-emerald-950 p-4 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCheck className="w-5 h-5 text-emerald-700" />
                          <div>
                            <p className="text-xs font-black">
                              ✓ Payment of ₹{partnerActiveBooking?.totalAmount || 625} Confirmed by You
                            </p>
                            <p className="text-[11px] text-emerald-800">
                              Amount settled to your registered bank account via SahYog Escrow.
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold bg-white text-emerald-900 px-3 py-1 rounded-xl shadow-2xs">
                          SETTLED
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <button
                          type="button"
                          disabled={!isDocVerified}
                          onClick={handleConfirmPaymentReceived}
                          className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-black text-xs px-6 py-3.5 rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm Payment Received (₹{partnerActiveBooking?.totalAmount || 625})</span>
                        </button>
                        <span className="text-[11px] text-slate-400">
                          Clicking this notifies customer screen in real-time and unlocks review.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Payout Bank Account Details */}
              <div className="lg:col-span-4 space-y-6">
                <h2 className="text-xl font-black text-slate-900">Payout Account</h2>

                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">HDFC Bank Ltd</h4>
                      <p className="text-xs text-slate-500">Savings •••• 8912</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account Holder:</span>
                      <strong className="text-slate-800">{displayName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">IFSC Code:</span>
                      <strong className="text-slate-800 font-mono">HDFC0001042</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">UPI Payout VPA:</span>
                      <strong className="text-emerald-700 font-mono">{phone ? `${phone}@okaxis` : 'partner@upi'}</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant Daily Auto-Settlement at 11:00 PM IST</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
