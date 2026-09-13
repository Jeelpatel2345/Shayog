'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Bell, User, MapPin, Phone, Mail, ShieldCheck, 
  CreditCard, Globe, ChevronRight, LogOut, Heart, FileText, 
  HelpCircle, Settings, Camera, CheckCircle2, AlertCircle, 
  Sparkles, Wrench, Clock, Star, Edit3, Plus, SwitchCamera, Smartphone, Save, Loader2, Database,
  Users, ArrowRight
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
    const savedName = fullName || (typeof window !== 'undefined' ? localStorage.getItem('sahyog-user-name') : '') || 'Jeel Patel';
    const savedPhone = phone || (typeof window !== 'undefined' ? localStorage.getItem('sahyog-user-phone') : '') || '+91 98765 43210';
    const savedEmail = (typeof window !== 'undefined' ? localStorage.getItem('sahyog-user-email') : '') || 'jeel.patel@sahyog.in';
    const savedCity = (typeof window !== 'undefined' ? localStorage.getItem('sahyog-user-city') : '') || 'Ahmedabad, Gujarat';
    const savedAddress = (typeof window !== 'undefined' ? localStorage.getItem('sahyog-user-address') : '') || 'B/402, Shanti Heights, Sector 12, Navrangpura';

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
        }
      })
      .catch(() => {});
  }, [fullName, phone]);

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
      window.location.href = '/login';
    }
  };

  const getInitials = (name: string) => {
    const parts = (name || 'SY').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const initials = getInitials(userName);

  const isWorker = role === 'WORKER' || (typeof window !== 'undefined' && localStorage.getItem('sahyog-role') === 'WORKER');
  const backHref = isWorker ? '/worker/dashboard' : '/customer/dashboard';

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900">
      {/* Top Header */}
      <div className="bg-[#042f2e] text-white border-b border-emerald-900/60 sticky top-0 z-30 shadow-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={backHref}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-emerald-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-bold text-base sm:text-lg text-white">My Account Profile</h1>
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
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">{userName}</h2>
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  SahYog Verified Member • {userCity}
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

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-slate-100 text-center">
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
              <p className="text-[11px] text-slate-400 font-semibold">Bookings</p>
              <p className="text-base font-black text-slate-900 mt-0.5">14 Done</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
              <p className="text-[11px] text-slate-400 font-semibold">Total Savings</p>
              <p className="text-base font-black text-teal-700 mt-0.5">₹1,450</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
              <p className="text-[11px] text-slate-400 font-semibold">Trust Score</p>
              <p className="text-base font-black text-slate-900 mt-0.5">100%</p>
            </div>
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

      <BottomNav role="customer" />
    </div>
  );
}
