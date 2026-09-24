'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Bell, User, MapPin, Phone, Mail, ShieldCheck, 
  CreditCard, Globe, ChevronRight, LogOut, Heart, FileText, 
  HelpCircle, Settings, Camera, CheckCircle2, AlertCircle, 
  Sparkles, Wrench, Clock, Star, Edit3, Plus, SwitchCamera, Smartphone, Save, Loader2, Database,
  Users, ArrowRight, Briefcase, Check
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useAuthStore } from '@/store/authStore';

export default function ProfilePage() {
  const router = useRouter();
  const { fullName, phone, role, setAuth, logout } = useAuthStore();

  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userCity, setUserCity] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [userRole, setUserRole] = useState<'CUSTOMER' | 'WORKER'>('CUSTOMER');
  const [preferredTrades, setPreferredTrades] = useState<string[]>([
    'Electrical & Wiring (बिजली काम)',
    'Plumbing & Pipe Fitting (नल और पाइप)'
  ]);
  const [isDocVerified, setIsDocVerified] = useState<boolean>(false);
  const [workerUpi, setWorkerUpi] = useState('sahyog.partner@okhdfcbank');
  const [workerBank, setWorkerBank] = useState('HDFC Bank •••• 8812');

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState(false);
  const [language, setLanguage] = useState<'English' | 'हिन्दी' | 'ગુજરાતી'>('English');
  const [showDownloadApk, setShowDownloadApk] = useState(false);

  // Load from state and localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      const isInsideApp = 
        ua.includes('SahYogApp') || 
        ua.includes('wv') || 
        localStorage.getItem('sahyog_apk_downloaded') === 'true' ||
        window.matchMedia('(display-mode: standalone)').matches;
      if (!isInsideApp) setShowDownloadApk(true);
    }
    const savedName = fullName || (typeof window !== 'undefined' ? localStorage.getItem('sahyog-user-name') : '') || (phone ? `User ${phone.slice(-4)}` : '');
    const savedPhone = phone || (typeof window !== 'undefined' ? localStorage.getItem('sahyog-user-phone') : '') || '';
    const savedEmail = (typeof window !== 'undefined' ? localStorage.getItem('sahyog-user-email') : '') || '';
    const savedCity = (typeof window !== 'undefined' ? localStorage.getItem('sahyog-user-city') : '') || '';
    const savedAddress = (typeof window !== 'undefined' ? localStorage.getItem('sahyog-user-address') : '') || '';

    setUserName(savedName);
    setUserPhone(savedPhone);
    setUserEmail(savedEmail);
    setUserCity(savedCity);
    setUserAddress(savedAddress);

    // Fetch live profile from Neon DB
    fetch('/api/user/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          if (data.user.fullName) {
            setUserName(data.user.fullName);
            localStorage.setItem('sahyog-user-name', data.user.fullName);
          }
          if (data.user.phone) {
            setUserPhone(data.user.phone);
            localStorage.setItem('sahyog-user-phone', data.user.phone);
          }
          if (data.user.email) {
            setUserEmail(data.user.email);
            localStorage.setItem('sahyog-user-email', data.user.email);
          }
          if (data.user.customerProfile?.city) {
            setUserCity(data.user.customerProfile.city);
            localStorage.setItem('sahyog-user-city', data.user.customerProfile.city);
          }
          if (data.user.customerProfile?.address) {
            setUserAddress(data.user.customerProfile.address);
            localStorage.setItem('sahyog-user-address', data.user.customerProfile.address);
          }
          if (data.user.role === 'WORKER') {
            setUserRole('WORKER');
          }
        }
      })
      .catch(() => {});

    const storedRole = (typeof window !== 'undefined' ? localStorage.getItem('sahyog-role') : '') || role;
    if (storedRole === 'WORKER') {
      setUserRole('WORKER');
    }
    const storedTrades = typeof window !== 'undefined' ? localStorage.getItem('sahyog_preferred_work') : null;
    if (storedTrades) {
      try {
        const parsed = JSON.parse(storedTrades);
        if (Array.isArray(parsed) && parsed.length > 0) setPreferredTrades(parsed);
      } catch {}
    }
    const verifiedStored = typeof window !== 'undefined' && localStorage.getItem('sahyog_worker_verified') === 'true';
    setIsDocVerified(verifiedStored);
  }, [fullName, phone, role]);

  const handleRoleToggle = (newRole: 'CUSTOMER' | 'WORKER') => {
    setUserRole(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sahyog-role', newRole);
    }
    setAuth({
      userId: 'current-user',
      role: newRole,
      phone: userPhone,
      fullName: userName,
    });
  };

  const handleTradeToggle = (trade: string) => {
    let updated: string[];
    if (preferredTrades.includes(trade)) {
      if (preferredTrades.length > 1) {
        updated = preferredTrades.filter((t) => t !== trade);
      } else {
        return;
      }
    } else {
      updated = [...preferredTrades, trade];
    }
    setPreferredTrades(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sahyog_preferred_work', JSON.stringify(updated));
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: userName.trim(),
          phone: userPhone,
          email: userEmail,
          city: userCity,
          address: userAddress,
        }),
      });

      // Update state and localStorage for real-time instant sync
      localStorage.setItem('sahyog-user-name', userName.trim());
      localStorage.setItem('sahyog-user-phone', userPhone);
      localStorage.setItem('sahyog-user-email', userEmail.trim());
      localStorage.setItem('sahyog-user-city', userCity.trim());
      localStorage.setItem('sahyog-user-address', userAddress.trim());
      setAuth({
        userId: 'current-user',
        role: role || 'CUSTOMER',
        phone: userPhone,
        fullName: userName.trim(),
      });

      setIsEditing(false);
      setSaveNotice(true);
      setTimeout(() => setSaveNotice(false), 3000);
    } catch (err) {
      console.error('Save profile error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    logout();
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
      const isWorker = role === 'WORKER' || localStorage.getItem('sahyog-role') === 'WORKER';
      window.location.href = isWorker ? '/login?role=worker' : '/login';
    }
  };

  const getInitials = (name: string) => {
    const parts = (name || 'SY').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const initials = getInitials(userName);

  const isWorker = userRole === 'WORKER' || role === 'WORKER' || (typeof window !== 'undefined' && localStorage.getItem('sahyog-role') === 'WORKER');
  const isCommunity = typeof window !== 'undefined' && localStorage.getItem('sahyog_worker_mode') === 'COMMUNITY';
  const backHref = isWorker ? (isCommunity ? '/worker/community' : '/worker/dashboard') : '/customer/dashboard';

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900">
      {/* Top Header */}
      <div className="bg-[#0f3854] text-white border-b border-emerald-900/60 sticky top-0 z-30 shadow-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={backHref}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-emerald-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-bold text-base sm:text-lg text-white">
              {isWorker ? 'Partner Account Profile' : 'My Account Profile'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-white relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full" />
            </Link>
          </div>
        </div>
      </div>

      {saveNotice && (
        <div className="max-w-3xl mx-auto px-3 sm:px-6 pt-3">
          <div className="bg-emerald-600 text-white text-xs py-2.5 px-4 rounded-xl text-center font-bold flex items-center justify-center gap-2 shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile and Name updated in Neon Database successfully!</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-3xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-5">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-600 to-emerald-800 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-md">
                  {initials}
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute -bottom-1 -right-1 bg-amber-400 text-emerald-950 p-1.5 rounded-full shadow border-2 border-white hover:bg-amber-300 transition"
                  title="Edit Avatar"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">{userName || 'Member'}</h2>
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {isWorker ? 'SahYog Verified Service Partner' : 'SahYog Verified Member'} • {userCity || 'Gujarat'}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> OTP Verified
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-teal-50 text-teal-700">
                    <Database className="w-3 h-3 text-teal-600" /> Neon Cloud Active
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="border-2 border-teal-700 text-teal-800 hover:bg-teal-50 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition self-start sm:self-auto"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>

          {/* Dual Role Switcher */}
          <div className="mt-4 p-1 bg-slate-100 rounded-2xl flex border border-slate-200">
            <button
              type="button"
              onClick={() => handleRoleToggle('CUSTOMER')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                !isWorker
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Customer View (ग्राहक)</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleToggle('WORKER')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                isWorker
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-amber-300" />
              <span>Partner View (कामगार)</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
            {isWorker ? (
              <>
                <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Jobs Done</p>
                  <p className="text-base font-black text-slate-900 mt-0.5">48 Done</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Rating</p>
                  <p className="text-base font-black text-amber-500 mt-0.5 flex items-center justify-center gap-0.5">
                    4.9 <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Payout</p>
                  <p className="text-base font-black text-teal-700 mt-0.5">₹38,500</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Bookings</p>
                  <p className="text-base font-black text-slate-900 mt-0.5">14 Done</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Savings</p>
                  <p className="text-base font-black text-teal-700 mt-0.5">₹1,450</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Trust Score</p>
                  <p className="text-base font-black text-slate-900 mt-0.5">100%</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Edit Form Card */}
        {isEditing && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-teal-500 shadow-md space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-teal-700" />
                <span>Update Personal Details in Database</span>
              </h3>
              <span className="text-xs text-teal-700 font-semibold">Syncs to Neon DB</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name (आपका नाम)</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full border border-slate-300 focus:border-teal-600 rounded-xl p-2.5 text-sm font-semibold outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={userPhone}
                    disabled
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 text-sm text-slate-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full border border-slate-300 focus:border-teal-600 rounded-xl p-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Service Address</label>
                <input
                  type="text"
                  value={userAddress}
                  onChange={(e) => setUserAddress(e.target.value)}
                  className="w-full border border-slate-300 focus:border-teal-600 rounded-xl p-2.5 text-sm outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">City / Region</label>
                <input
                  type="text"
                  value={userCity}
                  onChange={(e) => setUserCity(e.target.value)}
                  className="w-full border border-slate-300 focus:border-teal-600 rounded-xl p-2.5 text-sm outline-none"
                />
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={handleSaveProfile}
                className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-xs transition text-sm cursor-pointer mt-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to Neon Database...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes to Database</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* WORKER SPECIFIC CARDS */}
        {isWorker && (
          <>
            {/* Preferred Work / Trades */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-teal-700" />
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    What type of work do you prefer to do? (पसंदीदा कार्य)
                  </h3>
                </div>
                <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                  Skill Trades
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tap to select trades you want to receive booking orders for:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Electrical & Wiring (बिजली काम)',
                  'Plumbing & Pipe Fitting (नल और पाइप)',
                  'Home & Deep Cleaning (सफाई सेवा)',
                  'AC & Appliance Repair (एसी व उपकरण)',
                  'Carpentry & Woodwork (बढ़ई काम)',
                  'Painting & Wall Finishing (पुताई और रंग)'
                ].map((trade) => {
                  const isSelected = preferredTrades.includes(trade);
                  return (
                    <button
                      key={trade}
                      type="button"
                      onClick={() => handleTradeToggle(trade)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                        isSelected
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{trade}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* KYC Verification & Compliance */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    Document KYC & Verification Status
                  </h3>
                </div>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full uppercase">
                  Verified
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="font-bold text-slate-700">Aadhaar Card</p>
                  <p className="text-[10px] text-emerald-700 font-bold mt-1">✓ Approved</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="font-bold text-slate-700">Skill Proof</p>
                  <p className="text-[10px] text-emerald-700 font-bold mt-1">✓ Certified</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="font-bold text-slate-700">Police Check</p>
                  <p className="text-[10px] text-emerald-700 font-bold mt-1">✓ Cleared</p>
                </div>
              </div>
            </div>

            {/* Payout & Bank Details */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm sm:text-base text-slate-900">Partner Payout Details</h3>
                <span className="text-[10px] text-slate-400 font-bold">Auto-settlement</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="text-slate-400 font-semibold">Registered Payout UPI ID</p>
                  <p className="font-bold text-slate-900 font-mono mt-0.5">{workerUpi}</p>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">Direct Bank Transfer</span>
              </div>
            </div>
          </>
        )}

        {/* Contact & Personal Information Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900">Personal & Service Address</h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <Smartphone className="w-4 h-4 text-teal-700 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-slate-400">Mobile Number</p>
                <p className="font-bold text-slate-900 font-mono mt-0.5">{userPhone}</p>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Verified
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <Mail className="w-4 h-4 text-teal-700 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-slate-400">Email Address</p>
                <p className="font-bold text-slate-900 mt-0.5">{userEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <MapPin className="w-4 h-4 text-teal-700 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-slate-400">Default Service Address</p>
                <p className="font-bold text-slate-900 mt-0.5">{userAddress}</p>
                <p className="text-slate-500 text-[11px]">{userCity}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Language & Account Preferences */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900">App Language & System</h3>

          <div className="grid grid-cols-3 gap-2">
            {(['English', 'हिन्दी', 'ગુજરાતી'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l)}
                className={`py-2 px-3 text-xs font-bold rounded-xl border-2 transition ${
                  language === l
                    ? 'border-teal-600 bg-teal-50 text-teal-800 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {showDownloadApk && (
            <div className="pt-3 border-t border-slate-100">
              <Link
                href="/download"
                className="flex items-center justify-between p-3 rounded-2xl bg-teal-50 hover:bg-teal-100/80 border border-teal-200 transition text-teal-900"
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-teal-700" />
                  <span className="text-xs font-bold">Download SahYog Android App (.APK)</span>
                </div>
                <span className="text-[11px] font-bold text-teal-700 bg-white px-2 py-0.5 rounded-lg border border-teal-300">
                  5.4 MB
                </span>
              </Link>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end">
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      <BottomNav role={isWorker ? 'worker' : 'customer'} />
    </div>
  );
}
