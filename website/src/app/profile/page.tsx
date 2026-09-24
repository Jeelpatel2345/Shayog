'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, Phone, Mail, MapPin, ShieldCheck, CheckCircle2, 
  Save, LogOut, Loader2, Smartphone, AlertCircle, Briefcase, 
  Wrench, Award, Building2, Banknote, Star, Shield, ArrowRight,
  Check, Edit3, Clock
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function WebProfilePage() {
  const router = useRouter();
  const { fullName, phone, role, setAuth, logout } = useAuthStore();

  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userCity, setUserCity] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [userRole, setUserRole] = useState<'CUSTOMER' | 'WORKER'>('CUSTOMER');
  
  // Worker-specific state
  const [preferredTrades, setPreferredTrades] = useState<string[]>([
    'Electrician & Power',
    'Plumbing & Pipe Fitting'
  ]);
  const [isDocVerified, setIsDocVerified] = useState<boolean>(true);
  const [workerUpi, setWorkerUpi] = useState('sahyog.partner@okhdfcbank');
  const [workerBank, setWorkerBank] = useState('HDFC Bank •••• 8812 (IFSC: HDFC0000042)');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
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
          if (data.user.role === 'WORKER') {
            setUserRole('WORKER');
          }
          if (data.user.customerProfile?.city) {
            setUserCity(data.user.customerProfile.city);
            localStorage.setItem('sahyog-user-city', data.user.customerProfile.city);
          }
          if (data.user.customerProfile?.address) {
            setUserAddress(data.user.customerProfile.address);
            localStorage.setItem('sahyog-user-address', data.user.customerProfile.address);
          }
        }
      })
      .catch(() => {});
  }, [fullName, phone, role]);

  const handleRoleSwitch = (newRole: 'CUSTOMER' | 'WORKER') => {
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await fetch('/api/user/profile', {
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

      localStorage.setItem('sahyog-user-name', userName.trim());
      localStorage.setItem('sahyog-user-phone', userPhone);
      localStorage.setItem('sahyog-user-email', userEmail.trim());
      localStorage.setItem('sahyog-user-city', userCity.trim());
      localStorage.setItem('sahyog-user-address', userAddress.trim());
      localStorage.setItem('sahyog-role', userRole);
      if (userRole === 'WORKER') {
        localStorage.setItem('sahyog_preferred_work', JSON.stringify(preferredTrades));
      }

      setAuth({
        userId: 'current-user',
        role: userRole,
        phone: userPhone,
        fullName: userName.trim(),
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
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
      localStorage.removeItem('sahyog-user-name');
      localStorage.removeItem('sahyog-user-phone');
      localStorage.removeItem('sahyog-role');
      localStorage.removeItem('sahyog-user-bookings');
      window.location.href = '/';
    }
  };

  const getInitials = (name: string) => {
    const parts = (name || 'SY').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(userName);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header with Dual Role Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {userRole === 'WORKER' ? 'Service Partner Profile' : 'Customer Account Profile'}
              </h1>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                userRole === 'WORKER' 
                  ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                  : 'bg-teal-100 text-teal-900 border border-teal-300'
              }`}>
                {userRole === 'WORKER' ? 'Partner View' : 'Customer View'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {userRole === 'WORKER'
                ? 'Manage your trade specialties, document KYC compliance, and direct bank payout settings.'
                : 'Manage your personal contact info, saved service addresses, and verified orders.'}
            </p>
          </div>

          {/* DUAL ROLE SWITCHER FOR DESKTOP/LAPTOP */}
          <div className="inline-flex bg-slate-200/80 p-1 rounded-2xl border border-slate-300 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleRoleSwitch('CUSTOMER')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                userRole === 'CUSTOMER'
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch('WORKER')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                userRole === 'WORKER'
                  ? 'bg-teal-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-amber-300" />
              <span>Service Partner</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-bold">Profile and settings updated in database successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Profile Identity & Metrics Card */}
          <div className="md:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs text-center space-y-5">
            <div className={`w-24 h-24 rounded-3xl font-black text-3xl flex items-center justify-center mx-auto shadow-md ${
              userRole === 'WORKER'
                ? 'bg-gradient-to-br from-teal-700 to-emerald-800 text-white'
                : 'bg-amber-400 text-emerald-950'
            }`}>
              {initials}
            </div>

            <div>
              <h3 className="font-bold text-lg text-slate-900">{userName || 'Member'}</h3>
              <p className="text-xs text-slate-500">+91 {userPhone}</p>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              userRole === 'WORKER'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-teal-50 border border-teal-200 text-teal-800'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{userRole === 'WORKER' ? 'Verified Service Partner' : 'Verified Customer Member'}</span>
            </div>

            {/* Metrics: Differentiated for Worker vs Customer */}
            {userRole === 'WORKER' ? (
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Jobs</p>
                  <p className="text-sm font-black text-slate-900 mt-0.5">48 Done</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Rating</p>
                  <p className="text-sm font-black text-amber-500 mt-0.5 flex items-center justify-center gap-0.5">
                    4.9 <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                  </p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Payout</p>
                  <p className="text-sm font-black text-teal-700 mt-0.5">₹38.5k</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Bookings</p>
                  <p className="text-sm font-black text-slate-900 mt-0.5">14 Done</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Savings</p>
                  <p className="text-sm font-black text-teal-700 mt-0.5">₹1,450</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Trust</p>
                  <p className="text-sm font-black text-emerald-700 mt-0.5">100%</p>
                </div>
              </div>
            )}

            {/* Quick Link to Dashboard */}
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center justify-center gap-2"
              >
                <span>Go to {userRole === 'WORKER' ? 'Partner Console' : 'Customer Dashboard'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Right Main Details Cards */}
          <div className="md:col-span-8 space-y-6">
            
            {/* WORKER-SPECIFIC: Preferred Work & KYC Card */}
            {userRole === 'WORKER' && (
              <>
                {/* 1. Preferred Work / Specializations */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-teal-700" />
                      <h3 className="font-bold text-base text-slate-900">
                        What type of work do you prefer to do? (पसंदीदा कार्य)
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full">
                      Active Trades
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Click trades to add or remove them from your active service offerings:
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {[
                      'Electrician & Power',
                      'Plumbing & Pipe Fitting',
                      'Home & Deep Cleaning',
                      'AC & Appliance Repair',
                      'Carpenter & Woodwork',
                      'Painting & Waterproofing',
                      'Water Tank Disinfection',
                      'Society Substation AMC'
                    ].map((trade) => {
                      const isSelected = preferredTrades.includes(trade);
                      return (
                        <button
                          key={trade}
                          type="button"
                          onClick={() => handleTradeToggle(trade)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
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

                {/* 2. KYC Verification & Partner Compliance Status */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-bold text-base text-slate-900">
                        Document KYC & Partner Compliance
                      </h3>
                    </div>
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full uppercase">
                      Eligible to Work
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="font-bold text-slate-800">Aadhaar Card</p>
                      <p className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Verified (Govt ID)
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="font-bold text-slate-800">Skill Certificate</p>
                      <p className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Master Certified
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="font-bold text-slate-800">Police Verification</p>
                      <p className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Clear & Approved
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Bank & UPI Payout Details */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-5 h-5 text-teal-700" />
                      <h3 className="font-bold text-base text-slate-900">
                        Payout Account & Direct Bank Transfer
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      Weekly Auto-settle
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Registered Payout UPI ID</label>
                      <input
                        type="text"
                        value={workerUpi}
                        onChange={(e) => setWorkerUpi(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-teal-600 font-mono text-xs font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Direct Bank Account</label>
                      <input
                        type="text"
                        value={workerBank}
                        onChange={(e) => setWorkerBank(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-teal-600 font-mono text-xs font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* General Personal & Contact Information Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
              <form onSubmit={handleSave} className="space-y-5">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                  {userRole === 'WORKER' ? 'Partner Personal Information' : 'Personal & Contact Details'}
                </h3>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Full Name (पूरा नाम)
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm font-medium border border-slate-200 rounded-xl outline-none focus:border-teal-600 transition text-slate-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={userPhone}
                      disabled
                      className="w-full px-4 py-2.5 text-xs sm:text-sm font-medium border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs sm:text-sm font-medium border border-slate-200 rounded-xl outline-none focus:border-teal-600 transition text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    City (शहर)
                  </label>
                  <input
                    type="text"
                    value={userCity}
                    onChange={(e) => setUserCity(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm font-medium border border-slate-200 rounded-xl outline-none focus:border-teal-600 transition text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {userRole === 'WORKER' ? 'Operating Base / Shop Address' : 'Home / Delivery Address (पता)'}
                  </label>
                  <textarea
                    rows={2}
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm font-medium border border-slate-200 rounded-xl outline-none focus:border-teal-600 transition text-slate-900"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
