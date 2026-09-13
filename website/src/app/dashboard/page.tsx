'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, Users, Calendar, Clock, Star, MapPin, Search, ArrowRight, 
  ShieldCheck, CheckCircle2, ChevronRight, LogOut, Sparkles, 
  Briefcase, TrendingUp, AlertCircle 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { allWorkers, serviceCategories } from '@/data/workersData';

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { fullName, phone, logout } = useAuthStore();
  const [clientName, setClientName] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sahyog-user-name');
      if (saved) setClientName(saved);

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
        })
        .catch(() => {});

      fetch('/api/bookings')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const list = data?.bookings || (Array.isArray(data) ? data : []);
          setBookings(list);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, []);

  const displayName = fullName || clientName || (phone ? ('Member ' + phone.slice(-4)) : 'Valued Customer');

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(displayName);
  const featured = allWorkers.slice(0, 3);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
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

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Welcome Bar */}
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
                Your SahYog Customer Account is active. All services guaranteed.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/community"
              className="bg-emerald-900/80 hover:bg-emerald-900 text-white font-black text-xs px-4 py-3 rounded-xl border border-emerald-500/50 transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4 text-amber-300" />
              <span>Society: Shanti Heights</span>
            </Link>
            <Link
              href="/services"
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs px-5 py-3 rounded-xl transition shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Book New Service</span>
            </Link>
            <Link
              href="/profile"
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-3 rounded-xl border border-white/20 transition"
            >
              Edit Profile
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs px-4 py-3 rounded-xl border border-rose-500/50 transition flex items-center gap-1.5 cursor-pointer"
              title="Log Out to Login Page"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
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

        {/* Main 2-Column Section: Bookings on Left, Quick Recommendations on Right */}
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
                      href={'/bookings'}
                      className="text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/80 px-4 py-2 rounded-xl transition"
                    >
                      Details & Tracking →
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
      </div>
    </div>
  );
}
