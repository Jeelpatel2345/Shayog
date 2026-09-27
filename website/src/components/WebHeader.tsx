'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShieldCheck, User, Menu, X, ArrowRight, LogOut, 
  Calendar, MapPin, Phone, Sparkles, Smartphone 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function WebHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { fullName, phone, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clientName, setClientName] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sahyog-user-name');
      if (saved) setClientName(saved);
      fetch('/api/user/profile')
        .then((res) => {
          if (!res.ok) {
            setClientName('');
            localStorage.removeItem('sahyog-user-name');
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
    }
  }, []);

  const displayName = fullName || clientName || (phone ? 'Member ' + phone.slice(-4) : '');

  const getInitials = (name: string) => {
    if (!name) return 'SY';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(displayName);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    logout();
    setClientName('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sahyog-user-name');
      localStorage.removeItem('sahyog-user-phone');
      localStorage.removeItem('sahyog-role');
      localStorage.removeItem('sahyog-user-bookings');
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#042f2e] text-white border-b border-emerald-900/60 shadow-lg backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="SahYog" className="w-11 h-11 rounded-full object-cover shadow-md group-hover:scale-105 transition" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-tight text-white">SahYog</span>
                <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded uppercase tracking-wider">
                  Community Hub
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 font-medium hidden sm:block">
                Verified Home Services & Professional Care
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 font-semibold text-sm text-emerald-100">
            <Link 
              href="/" 
              className={'hover:text-amber-300 transition ' + (pathname === '/' ? 'text-amber-300 font-bold' : '')}
            >
              Home
            </Link>
            <Link 
              href="/services" 
              className={'hover:text-amber-300 transition ' + (pathname.startsWith('/services') ? 'text-amber-300 font-bold' : '')}
            >
              All 6 Services
            </Link>
            <Link 
              href="/#how-it-works" 
              className="hover:text-amber-300 transition"
            >
              How It Works
            </Link>
            <Link 
              href="/dashboard" 
              className={'hover:text-amber-300 transition ' + (pathname === '/dashboard' ? 'text-amber-300 font-bold' : '')}
            >
              Dashboard
            </Link>
            <Link 
              href="/bookings" 
              className={'hover:text-amber-300 transition ' + (pathname === '/bookings' ? 'text-amber-300 font-bold' : '')}
            >
              My Bookings
            </Link>
            <Link 
              href="/download" 
              className={'hover:text-amber-300 transition flex items-center gap-1 ' + (pathname === '/download' ? 'text-amber-300 font-bold' : '')}
            >
              <Smartphone className="w-4 h-4 text-amber-300" />
              <span>Get App</span>
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {displayName ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 bg-emerald-950/60 border border-emerald-700/60 px-3.5 py-1.5 rounded-full hover:bg-emerald-900 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-400 text-emerald-950 font-black text-xs flex items-center justify-center shadow-xs">
                    {initials}
                  </div>
                  <span className="text-xs font-bold text-white max-w-[120px] truncate">
                    {displayName}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-emerald-300 hover:text-rose-400 hover:bg-white/5 rounded-lg transition text-xs flex items-center gap-1 font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-bold text-emerald-200 hover:text-white px-3.5 py-2 rounded-xl hover:bg-white/10 transition flex items-center gap-1.5"
              >
                <User className="w-4 h-4" />
                <span>Sign In / Register</span>
              </Link>
            )}

            <Link
              href="/services"
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Book a Service</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {displayName && (
              <Link
                href="/profile"
                className="w-8 h-8 rounded-full bg-amber-400 text-emerald-950 font-black text-xs flex items-center justify-center"
              >
                {initials}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#042f2e] border-t border-emerald-800/80 px-4 pt-3 pb-5 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-emerald-100 hover:bg-emerald-800/50"
          >
            Home
          </Link>
          <Link
            href="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-emerald-100 hover:bg-emerald-800/50"
          >
            All 6 Services
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-emerald-100 hover:bg-emerald-800/50"
          >
            Dashboard
          </Link>
          <Link
            href="/bookings"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-emerald-100 hover:bg-emerald-800/50"
          >
            My Bookings
          </Link>
          <Link
            href="/download"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-amber-300 hover:bg-emerald-800/50"
          >
            <Smartphone className="w-4 h-4" />
            <span>Download Android App (.APK)</span>
          </Link>
          <Link
            href="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-emerald-100 hover:bg-emerald-800/50"
          >
            My Profile
          </Link>
          {!displayName ? (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center bg-amber-400 text-emerald-950 font-black py-2.5 rounded-xl mt-3 text-sm"
            >
              Sign In / Register
            </Link>
          ) : (
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-rose-300 hover:bg-rose-900/30"
            >
              Log Out
            </button>
          )}
        </div>
      )}
    </header>
  );
}
