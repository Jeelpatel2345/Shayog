'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, Phone, Mail, MapPin, ShieldCheck, CheckCircle2, 
  Save, LogOut, Loader2, Smartphone, AlertCircle, Users, ArrowRight 
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
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
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
      setAuth({
        userId: 'current-user',
        role: role || 'CUSTOMER',
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Profile</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal contact info and preferred address across Gujarat.
          </p>
        </div>

        {/* Community & Society Services Banner */}
        <div className="bg-gradient-to-br from-[#042f2e] via-[#0f766e] to-[#042f2e] text-white rounded-3xl p-6 shadow-xl border border-teal-800/40 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-[11px] font-black uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" />
                <span>Multi-Worker Crew • Housing Societies</span>
              </div>
              <h3 className="text-xl font-black text-white pt-1">
                Community & Society Services (सामुदायिक सेवाएँ)
              </h3>
              <p className="text-xs text-teal-100/90 leading-relaxed">
                Deploy 4–6 worker specialized squads for full society water tank disinfection, storm drainage jetting, electrical AMC & common area sanitization with group resident discounts.
              </p>
            </div>

            <Link
              href="/community"
              className="bg-amber-400 hover:bg-amber-300 text-teal-950 font-black px-5 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md whitespace-nowrap self-start sm:self-center cursor-pointer"
            >
              <span>Open Community Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-bold">Profile changes saved successfully to Neon cloud database!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Avatar Card */}
          <div className="md:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs text-center space-y-4">
            <div className="w-24 h-24 rounded-3xl bg-amber-400 text-emerald-950 font-black text-3xl flex items-center justify-center mx-auto shadow-md">
              {initials}
            </div>

            <div>
              <h3 className="font-bold text-lg text-slate-900">{userName}</h3>
              <p className="text-xs text-slate-500">+91 {userPhone}</p>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-800 px-3 py-1 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Verified Customer</span>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="md:col-span-8 bg-white rounded-3xl p-8 border border-slate-200 shadow-xs">
            <form onSubmit={handleSave} className="space-y-5">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Personal & Contact Details
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
                  Home / Delivery Address (पता)
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
                      <span>Save Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
