'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, Search, MapPin, Star, ChevronRight, ShieldCheck, 
  Calendar, User, Sparkles, Wrench, Zap, Cpu, Hammer, 
  Paintbrush, ArrowRight, Heart, Award, Shield, CheckCircle, Clock,
  ThumbsUp, X, MessageSquare, CheckCircle2, Users, LogOut, Building2,
  Phone, KeyRound, HardHat, Check, Loader2, FileText, Stamp, CheckSquare,
  ChevronDown, ChevronUp, Mail, PenTool
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useAuthStore } from '@/store/authStore';
import { serviceCategories, allWorkers } from '@/data/workersData';
import { 
  registeredSocieties, 
  communityPackages, 
  defaultActiveCommunityBooking, 
  communityWorkerTypeOptions,
  Society, 
  CommunityPackage, 
  CommunityBooking 
} from '@/data/communityData';

const categoryIcons: Record<string, any> = {
  Sparkles,
  Wrench,
  Zap,
  Cpu,
  Hammer,
  Paintbrush,
};

export default function CustomerDashboard() {
  const { fullName, phone } = useAuthStore();
  const [activeLang, setActiveLang] = useState<'EN' | 'HI' | 'GU'>('EN');
  const [searchQuery, setSearchQuery] = useState('');
  const [clientName, setClientName] = useState('');

  // Feedback & Worker Rating State
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(['⏱️ On-Time Arrival', '🛠️ Expert Workmanship']);
  const [feedbackText, setFeedbackText] = useState('');
  const [recommended, setRecommended] = useState(true);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [liveJobStatus, setLiveJobStatus] = useState<'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED'>('CONFIRMED');
  const [realtimeToast, setRealtimeToast] = useState<string>('');
  const [activeBookingId, setActiveBookingId] = useState<string>('1');
  const [ratedWorker, setRatedWorker] = useState({
    id: 'w-1',
    name: 'Amir Khan',
    service: 'Deep Home Cleaning Specialist',
    completedDate: 'Completed Today, 2:30 PM'
  });

  const ratingLabels: Record<number, string> = {
    1: 'Poor (खराब अनुभव) 👎',
    2: 'Fair (सुधार की आवश्यकता) ⚠️',
    3: 'Good (संतोषजनक काम) 👌',
    4: 'Very Good (बहुत बढ़िया काम) 👍',
    5: 'Exceptional (अति उत्तम / શાનદાર અનુભવ) 🌟'
  };

  const complimentTagOptions = [
    '⏱️ On-Time Arrival',
    '🛠️ Expert Workmanship',
    '🧹 Clean & Tidy',
    '🤝 Polite & Respectful',
    '💰 Fair & Transparent Price',
    '🛡️ Safe & Trustworthy'
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Real-time synchronization with Worker Dashboard
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check existing stored job status and booking ID
    const storedStatus = localStorage.getItem('sahyog_active_job_status');
    if (storedStatus === 'IN_PROGRESS') {
      setLiveJobStatus('IN_PROGRESS');
    } else if (storedStatus === 'COMPLETED') {
      setLiveJobStatus('COMPLETED');
    }
    const storedBkId = localStorage.getItem('sahyog-active-booking-id');
    if (storedBkId) setActiveBookingId(storedBkId);

    const handleRealtimeMessage = (data: any) => {
      if (!data) return;
      if (data.type === 'JOB_STARTED') {
        setLiveJobStatus('IN_PROGRESS');
        setRealtimeToast('⚡ Partner Arrived! Service job is now IN PROGRESS.');
        setTimeout(() => setRealtimeToast(''), 5000);
      } else if (data.type === 'JOB_COMPLETED') {
        setLiveJobStatus('COMPLETED');
        if (data.workerName) {
          setRatedWorker(prev => ({
            ...prev,
            name: data.workerName,
            service: data.service || prev.service,
            completedDate: 'Completed Just Now'
          }));
        }
        // Direct automatic popup of feedback on customer screen!
        setIsFeedbackOpen(true);
        setRealtimeToast('🎉 Service Completed! Please share your rating.');
        setTimeout(() => setRealtimeToast(''), 6000);
      }
    };

    // 1. BroadcastChannel for instant 0ms cross-tab sync
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('sahyog-realtime-sync');
      channel.onmessage = (e) => {
        if (e.data) handleRealtimeMessage(e.data);
      };
    } catch {}

    // 2. Storage event listener for cross-window sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sahyog-realtime-event' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          handleRealtimeMessage(parsed);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. Periodic API polling fallback (every 3s for multi-device testing)
    const pollTimer = setInterval(() => {
      fetch('/api/bookings')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.bookings && data.bookings.length > 0) {
            const b = data.bookings[0];
            if (b.id) setActiveBookingId(b.id);
            if (b.workerProfile?.user?.fullName || b.workerName) {
              setRatedWorker(prev => ({
                ...prev,
                id: b.workerProfileId || prev.id,
                name: b.workerProfile?.user?.fullName || b.workerName,
                service: b.serviceTitle || prev.service,
              }));
            }
            if (b.status === 'IN_PROGRESS' && liveJobStatus !== 'IN_PROGRESS') {
              setLiveJobStatus('IN_PROGRESS');
            } else if (b.status === 'COMPLETED') {
              setLiveJobStatus('COMPLETED');
              if (!hasRated && !isFeedbackOpen) {
                setIsFeedbackOpen(true);
              }
            }
          }
        })
        .catch(() => {});
    }, 3000);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
      clearInterval(pollTimer);
    };
  }, [hasRated, isFeedbackOpen, liveJobStatus]);

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const reviewObj = {
      workerId: ratedWorker.id,
      workerName: ratedWorker.name,
      customerName: clientName || fullName || 'Customer',
      service: ratedWorker.service,
      rating: selectedRating,
      tags: selectedTags,
      feedback: feedbackText.trim() || 'Excellent service, punctual, and very professional.',
      recommended,
      createdAt: new Date().toISOString()
    };

    // 1. Save to Database API
    try {
      fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: activeBookingId || undefined,
          workerProfileId: ratedWorker.id,
          workerName: ratedWorker.name,
          customerName: clientName || fullName || 'Customer',
          rating: selectedRating,
          comment: feedbackText.trim() || 'Excellent service, punctual, and very professional.',
          tags: selectedTags,
          recommended
        })
      }).catch(() => {});
    } catch {}

    // 2. Store in localStorage for instant retrieval by worker dashboard
    if (typeof window !== 'undefined') {
      const existingWorkerReviews = JSON.parse(localStorage.getItem('sahyog-worker-reviews') || '[]');
      existingWorkerReviews.unshift(reviewObj);
      localStorage.setItem('sahyog-worker-reviews', JSON.stringify(existingWorkerReviews));

      const existingCustomerReviews = JSON.parse(localStorage.getItem('sahyog-customer-reviews') || '[]');
      existingCustomerReviews.unshift(reviewObj);
      localStorage.setItem('sahyog-customer-reviews', JSON.stringify(existingCustomerReviews));

      // 3. Broadcast event to Worker Dashboard in real time!
      try {
        const channel = new BroadcastChannel('sahyog-realtime-sync');
        channel.postMessage({
          type: 'REVIEW_SUBMITTED',
          review: reviewObj,
          workerName: ratedWorker.name,
          timestamp: Date.now()
        });
        channel.close();
      } catch {}

      localStorage.setItem('sahyog-realtime-event', JSON.stringify({
        type: 'REVIEW_SUBMITTED',
        review: reviewObj,
        workerName: ratedWorker.name,
        timestamp: Date.now()
      }));
    }

    setFeedbackSubmitted(true);
    setHasRated(true);
    setTimeout(() => {
      setIsFeedbackOpen(false);
      setFeedbackSubmitted(false);
    }, 2000);
  };

  // Service mode: INDIVIDUAL vs COMMUNITY
  const [serviceMode, setServiceMode] = useState<'INDIVIDUAL' | 'COMMUNITY'>('INDIVIDUAL');
  const [selectedSociety, setSelectedSociety] = useState<Society>(registeredSocieties[0]);
  const [activeCommunityBooking, setActiveCommunityBooking] = useState<CommunityBooking>(defaultActiveCommunityBooking);
  const [selectedWorkerTypeFilter, setSelectedWorkerTypeFilter] = useState<string>('ALL');
  const [showCommunityDetails, setShowCommunityDetails] = useState<boolean>(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [bookingModalPkg, setBookingModalPkg] = useState<CommunityPackage | null>(null);
  const [bookingTowers, setBookingTowers] = useState('Towers A, B & Common Sump');
  const [bookingDate, setBookingDate] = useState('Tomorrow');
  const [bookingTime, setBookingTime] = useState('02:00 PM');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState('');

  // Live searchable workers from Database
  const [liveWorkers, setLiveWorkers] = useState<any[]>(allWorkers);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
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

  const handleDeploySquad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalPkg) return;
    setIsDeploying(true);
    try {
      const res = await fetch('/api/community/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          societyId: selectedSociety.id,
          societyName: selectedSociety.name,
          packageId: bookingModalPkg.id,
          packageTitle: bookingModalPkg.title,
          crewSize: bookingModalPkg.crewSize,
          leadWorkerName: bookingModalPkg.leadWorkerName,
          crewRoster: bookingModalPkg.crewRoster,
          scheduledDate: `${bookingDate}, ${bookingTime}`,
          totalAmount: bookingModalPkg.discountedRateINR,
          towersScope: bookingTowers,
        })
      });
      const data = await res.json();
      if (data?.booking) {
        setActiveCommunityBooking(data.booking);
      }
      setDeploySuccess(`🎉 Squad "${bookingModalPkg.title}" successfully dispatched to ${selectedSociety.name}!`);
      setTimeout(() => {
        setDeploySuccess('');
        setBookingModalPkg(null);
      }, 3000);
    } catch {
      setDeploySuccess('🎉 Squad dispatched! Society Secretary will receive Arrival OTP.');
      setTimeout(() => {
        setDeploySuccess('');
        setBookingModalPkg(null);
      }, 3000);
    } finally {
      setIsDeploying(false);
    }
  };

  // Lock Customer Role & Hydrate profile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sahyog-role', 'CUSTOMER');
      localStorage.setItem('sahyog-logged-in', 'true');
      const saved = localStorage.getItem('sahyog-user-name');
      if (saved) setClientName(saved);

      // Fetch live workers from API so newly registered workers (like Jaymeen) appear!
      fetch('/api/workers')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.workers && Array.isArray(data.workers)) {
            setLiveWorkers(data.workers);
          }
        })
        .catch(() => {});

      fetch('/api/user/profile')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user?.role === 'WORKER') {
            localStorage.setItem('sahyog-role', 'WORKER');
            window.location.href = '/worker/dashboard';
            return;
          }
          if (data?.user?.fullName) {
            setClientName(data.user.fullName);
            localStorage.setItem('sahyog-user-name', data.user.fullName);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Top featured workers from dynamic list
  const featuredWorkers = liveWorkers.slice(0, 4);

  // Real-time dynamic search results
  const query = searchQuery.trim().toLowerCase();
  const searchResultsWorkers = query
    ? liveWorkers.filter(
        (w: any) =>
          w.name.toLowerCase().includes(query) ||
          w.title.toLowerCase().includes(query) ||
          w.category.toLowerCase().includes(query) ||
          (w.skills && Array.isArray(w.skills) && w.skills.some((s: string) => s.toLowerCase().includes(query)))
      )
    : [];

  const searchResultsCommunity = query
    ? communityPackages.filter(
        (p: any) =>
          p.title.toLowerCase().includes(query) ||
          p.tradeCategory.toLowerCase().includes(query) ||
          p.scopePoints.some((s: string) => s.toLowerCase().includes(query)) ||
          'community society squad tank cleaning'.includes(query)
      )
    : [];

  const filteredCommunityPackages = communityPackages.filter((pkg) => {
    if (selectedWorkerTypeFilter === 'ALL') return true;
    if (selectedWorkerTypeFilter === 'Water Tank & Plumbing' && pkg.tradeCategory === 'Plumbing') return true;
    if (selectedWorkerTypeFilter === 'Cleaning & Jetting' && pkg.tradeCategory === 'Cleaning') return true;
    if (selectedWorkerTypeFilter === 'Electrical & Substation' && pkg.tradeCategory === 'Electrician') return true;
    if (selectedWorkerTypeFilter === 'Society AMC' && pkg.tradeCategory === 'Society AMC') return true;
    return pkg.tradeCategory.toLowerCase().includes(selectedWorkerTypeFilter.toLowerCase()) ||
           pkg.title.toLowerCase().includes(selectedWorkerTypeFilter.toLowerCase());
  });

  const displayName = fullName || clientName || (phone ? `Member ${phone.slice(-4)}` : 'Friend');

  // Proper initials: "Jeel Patel" → "JP", "Anita" → "AN"
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const initials = getInitials(displayName);

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-32 sm:pb-28 text-slate-900">
      {/* Desktop Top Navbar */}
      <header className="hidden md:block bg-[#042f2e] border-b border-emerald-900/50 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SahYog" className="w-9 h-9 rounded-full object-cover shadow-md" />
            <div>
              <span className="font-black text-lg tracking-tight text-white">SahYog</span>
              <span className="ml-2 text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded">
                COMMUNITY HUB
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="flex items-center gap-6 text-sm font-semibold text-emerald-100">
            <Link href="/customer/dashboard" className="text-amber-300 font-bold">
              Home
            </Link>
            <Link href="/customer/services" className="hover:text-white transition">
              All 6 Services
            </Link>
            <Link href="/customer/bookings" className="hover:text-white transition">
              My Bookings
            </Link>
            <Link href="/chat/1" className="hover:text-white transition flex items-center gap-1.5">
              <span>AI Support</span>
              <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                Live
              </span>
            </Link>
          </nav>

          {/* User Profile Badge */}
          <div className="flex items-center gap-2.5">
            <Link href="/notifications" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition text-white relative" title="Notifications">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full" />
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-700/60 px-3 py-1.5 rounded-full hover:bg-emerald-900 transition"
            >
              <div className="w-6 h-6 rounded-full bg-amber-400 text-emerald-950 font-black text-xs flex items-center justify-center">
                {initials}
              </div>
              <span className="text-xs font-bold text-white max-w-[100px] truncate">{displayName}</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-full bg-white/10 hover:bg-rose-500/30 text-white hover:text-rose-200 transition cursor-pointer"
              title="Log Out to Login Page"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-6 space-y-6">
        {/* Top App Header with Rich Emerald Gradient */}
        <div className="bg-gradient-to-r from-[#042f2e] via-[#0d9488] to-[#0f766e] text-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-lg relative overflow-hidden">
          {/* Mobile top bar */}
          <div className="md:hidden flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="SahYog" className="w-8 h-8 rounded-full object-cover shadow-sm" />
              <div>
                <h1 className="font-black text-base tracking-tight leading-none text-white">SahYog</h1>
                <span className="text-[9px] text-emerald-200 font-medium tracking-wider uppercase">Community Hub</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/notifications" className="p-2 rounded-full bg-white/10 text-white relative" title="Notifications">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full" />
              </Link>
              <Link href="/profile" className="w-8 h-8 rounded-full bg-amber-400 text-emerald-950 font-bold text-xs flex items-center justify-center">
                {initials}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-full bg-white/10 hover:bg-rose-500/30 text-white transition cursor-pointer"
                title="Log Out to Login Page"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Greeting & Location */}
          <div className="mt-3 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-semibold mb-0.5">
                <span>🙏 Namaste, {displayName}!</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white leading-tight">
                What do you need help with today?
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setServiceMode(serviceMode === 'COMMUNITY' ? 'INDIVIDUAL' : 'COMMUNITY')}
                className={`rounded-full px-3.5 py-1.5 flex items-center gap-1.5 text-xs shadow-md transition cursor-pointer font-black ${
                  serviceMode === 'COMMUNITY'
                    ? 'bg-amber-400 text-teal-950'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title="Toggle Community Mode"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Society: {selectedSociety.shortName}</span>
              </button>
              <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-1.5 flex items-center gap-1.5 text-xs text-white">
                <MapPin className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-medium">Ahmedabad, Gujarat</span>
              </div>
            </div>
          </div>

          {/* Service Mode Selector: Individual vs Community Society Services */}
          <div className="mt-4 p-1 bg-black/25 backdrop-blur-md rounded-2xl flex flex-col sm:flex-row border border-white/20 w-full sm:max-w-md gap-1">
            <button
              type="button"
              onClick={() => setServiceMode('INDIVIDUAL')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-w-0 ${
                serviceMode === 'INDIVIDUAL'
                  ? 'bg-white text-teal-950 shadow-md'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <User className="w-4 h-4 text-teal-700 flex-shrink-0" />
              <span className="truncate">Individual Home Services</span>
            </button>
            <button
              type="button"
              onClick={() => setServiceMode('COMMUNITY')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-w-0 ${
                serviceMode === 'COMMUNITY'
                  ? 'bg-amber-400 text-teal-950 shadow-md font-black'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-teal-950 flex-shrink-0" />
              <span className="truncate">Community & Society Squads</span>
            </button>
          </div>

          {/* Search Bar with zero horizontal overflow */}
          <div className="mt-4 bg-white rounded-2xl p-2 flex items-center gap-2 shadow-xl border border-white/20 w-full min-w-0">
            <Search className="w-5 h-5 text-slate-400 ml-2 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by worker name, service, or society..."
              className="w-full min-w-0 flex-1 text-xs sm:text-sm font-medium text-slate-800 outline-none placeholder-slate-400 bg-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 px-1 font-bold flex-shrink-0"
              >
                ✕
              </button>
            )}
            <Link
              href={searchQuery ? `/customer/services?search=${encodeURIComponent(searchQuery)}` : '/customer/services'}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-3.5 sm:px-4 py-2.5 rounded-xl transition flex-shrink-0 whitespace-nowrap"
            >
              Find
            </Link>
          </div>

          {/* Real-time Dynamic Search Results Drawer */}
          {searchQuery.trim() && (
            <div className="mt-3 bg-white rounded-2xl p-4 text-slate-900 shadow-2xl border border-amber-400 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-500">
                  Search results for &ldquo;<b className="text-teal-900">{searchQuery}</b>&rdquo;
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                >
                  Close ✕
                </button>
              </div>

              {/* Workers matching name/skills */}
              {searchResultsWorkers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-black uppercase text-teal-800 tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    <span>Matched Service Professionals ({searchResultsWorkers.length})</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResultsWorkers.slice(0, 6).map((w: any) => (
                      <div
                        key={w.id}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-teal-500 transition flex items-center justify-between shadow-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 font-black text-xs flex items-center justify-center">
                            {w.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-black text-slate-900">{w.name}</p>
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                                {w.badge || 'Verified'}
                              </span>
                            </div>
                            <p className="text-[10px] text-teal-700 font-medium">{w.title}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-900">₹{w.rate}/hr</span>
                          <Link
                            href={`/customer/worker/${w.id}`}
                            className="block text-[10px] font-bold text-teal-700 hover:underline mt-0.5"
                          >
                            View & Book →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Community Squads matching query */}
              {searchResultsCommunity.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-black uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                    <span>Matched Community Squads ({searchResultsCommunity.length})</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResultsCommunity.slice(0, 4).map((pkg: any) => (
                      <div
                        key={pkg.id}
                        className="p-3 rounded-xl border border-amber-200 bg-amber-50/60 flex items-center justify-between shadow-xs"
                      >
                        <div>
                          <span className="text-[9px] font-black bg-amber-400 text-teal-950 px-1.5 py-0.2 rounded-full">
                            {pkg.crewSize} WORKERS SQUAD
                          </span>
                          <p className="text-xs font-black text-slate-900 mt-1">{pkg.title}</p>
                          <p className="text-[10px] text-slate-500">Supervisor: {pkg.leadWorkerName}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-teal-900">₹{pkg.discountedRateINR}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setBookingModalPkg(pkg);
                              setServiceMode('COMMUNITY');
                              setSearchQuery('');
                            }}
                            className="block text-[10px] font-bold text-teal-700 hover:underline mt-0.5 cursor-pointer"
                          >
                            Deploy Crew →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResultsWorkers.length === 0 && searchResultsCommunity.length === 0 && (
                <div className="py-4 text-center text-xs text-slate-500">
                  No partners found matching &ldquo;{searchQuery}&rdquo;. Try another name or specialty.
                </div>
              )}
            </div>
          )}

          {/* Multi-language selector pills */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-emerald-200 font-semibold mr-1">Language:</span>
            {(['EN', 'HI', 'GU'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`text-[11px] font-bold px-3 py-1 rounded-full transition ${
                  activeLang === lang
                    ? 'bg-amber-400 text-emerald-950 shadow-xs'
                    : 'bg-white/10 text-emerald-100 hover:bg-white/20'
                }`}
              >
                {lang === 'EN' ? 'English' : lang === 'HI' ? 'हिन्दी' : 'ગુજરાતી'}
              </button>
            ))}
          </div>
        </div>

        {/* 100% Verified Partners Trust Banner */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-sm text-slate-900">100% Verified & Police-Cleared Partners</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Over 100 background-checked professionals with Aadhaar biometric validation across all 6 service categories.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Insurance Backed</span>
          </div>
        </div>

        {/* Service Mode Dynamic Section */}
        {serviceMode === 'COMMUNITY' ? (
          <div className="space-y-5 animate-in fade-in">
            {/* Housing Society Selector Bar with full mobile responsiveness */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 w-full min-w-0">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="text-[10px] font-black uppercase bg-teal-800 text-amber-300 px-2 py-0.5 rounded-full">
                      Selected Housing Society
                    </span>
                    <span className="text-xs text-slate-400 font-semibold truncate">{selectedSociety.locality}, {selectedSociety.city}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5 break-words">{selectedSociety.name}</h3>
                  <p className="text-xs text-slate-500 truncate">
                    {selectedSociety.totalFlats} Flats • Rep: <b>{selectedSociety.authorizedRepresentative?.name || selectedSociety.managerName}</b>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                <select
                  value={selectedSociety.id}
                  onChange={(e) => {
                    const found = registeredSocieties.find(s => s.id === e.target.value);
                    if (found) setSelectedSociety(found);
                  }}
                  className="bg-slate-50 border-2 border-teal-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none cursor-pointer w-full sm:w-auto min-w-0"
                >
                  {registeredSocieties.map((s) => (
                    <option key={s.id} value={s.id}>
                      Switch: {s.shortName}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowCommunityDetails(!showCommunityDetails)}
                  className="bg-amber-400 hover:bg-amber-300 text-teal-950 font-black text-xs px-3.5 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{showCommunityDetails ? 'Hide Record ▲' : 'Community Record ▼'}</span>
                </button>

                <Link
                  href="/customer/community"
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs"
                >
                  <span>Full Society Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Expandable Official Community & Society Record Card */}
            {showCommunityDetails && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-md space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-600" />
                    <div>
                      <h4 className="font-black text-sm sm:text-base text-slate-900 leading-none">
                        OFFICIAL COMMUNITY RECORD & VERIFICATION
                      </h4>
                      <span className="text-[10px] text-teal-800 font-bold">
                        Verified Government & Society Registration Dossier
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Verified Active</span>
                  </span>
                </div>

                {/* 1. COMMUNITY DETAILS */}
                <div className="space-y-2">
                  <p className="text-[11px] font-black uppercase text-teal-900 tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-teal-700" />
                    <span>COMMUNITY DETAILS</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Community Name</span>
                      <span className="font-black text-slate-900">{selectedSociety.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Community Type</span>
                      <span className="font-bold text-teal-800">{selectedSociety.communityType || 'Cooperative Housing Society'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Full Address</span>
                      <span className="font-semibold text-slate-800">{selectedSociety.fullAddress || selectedSociety.locality}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">City & District</span>
                      <span className="font-semibold text-slate-800">{selectedSociety.city}, {selectedSociety.district || `${selectedSociety.city} Urban`}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">State & PIN Code</span>
                      <span className="font-semibold text-slate-800">{selectedSociety.state || 'Gujarat'} - {selectedSociety.pincode || '380001'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Residences</span>
                      <span className="font-semibold text-slate-800">{selectedSociety.totalFlats} Flats / Units</span>
                    </div>
                  </div>
                </div>

                {/* 2. AUTHORIZED REPRESENTATIVE */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-black uppercase text-teal-900 tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-700" />
                    <span>AUTHORIZED REPRESENTATIVE</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Representative Name</span>
                      <span className="font-black text-slate-900">{selectedSociety.authorizedRepresentative?.name || selectedSociety.managerName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Designation / Role</span>
                      <span className="font-bold text-teal-800">{selectedSociety.authorizedRepresentative?.designation || 'Chairman'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Mobile Number</span>
                      <span className="font-semibold text-slate-800">{selectedSociety.authorizedRepresentative?.mobile || selectedSociety.managerPhone}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Email Address</span>
                      <span className="font-semibold text-slate-800">{selectedSociety.authorizedRepresentative?.email || 'office@sahyog.in'}</span>
                    </div>
                  </div>
                </div>

                {/* 3. COMMUNITY DECLARATION */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-black uppercase text-amber-950 tracking-wider flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-amber-700" />
                    <span>COMMUNITY DECLARATION</span>
                  </p>
                  <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 space-y-2 text-xs">
                    <blockquote className="italic text-slate-800 border-l-2 border-amber-500 pl-2 leading-relaxed">
                      &ldquo;{selectedSociety.declaration?.statement || 'I declare that I am authorized to represent the above-mentioned community and that the information provided is true and correct.'}&rdquo;
                    </blockquote>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-200/60 text-[11px]">
                      <div>
                        <span className="text-slate-500">Signatory: </span>
                        <span className="font-serif font-black text-teal-950">{selectedSociety.declaration?.signature || selectedSociety.managerName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Declared Date: </span>
                        <span className="font-mono font-bold text-slate-700">{selectedSociety.declaration?.date || '2026-03-01'}</span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded text-[10px]">
                        ✓ Declaration Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. SUPPORTING INFORMATION */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-black uppercase text-teal-900 tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-teal-700" />
                    <span>SUPPORTING INFORMATION</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                    <div className="space-y-1.5">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Registration Number</span>
                        <span className="font-mono font-bold text-slate-900">{selectedSociety.supportingInfo?.registrationNumber || selectedSociety.societyRegNo}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Registration Authority</span>
                        <span className="font-medium text-slate-700">{selectedSociety.supportingInfo?.registrationAuthority || 'Registrar of Housing Societies'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-teal-800 font-bold pt-1">
                        <Stamp className="w-4 h-4 text-amber-600" />
                        <span>Official Community Seal: {selectedSociety.supportingInfo?.hasCommunitySeal ? 'Affixed & On Record' : 'N/A'}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Attached Supporting Proof</span>
                      <div className="space-y-1">
                        {(selectedSociety.supportingInfo?.attachedProof || ['Registration Certificate', 'Society Document']).map((proof, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-700 font-semibold bg-white p-1.5 rounded-lg border border-slate-200">
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span>{proof}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. WORKER TYPES IN COMMUNITY */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black uppercase text-teal-900 tracking-wider flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-amber-600" />
                      <span>WORKER TYPES IN THIS COMMUNITY</span>
                    </p>
                    <span className="text-[10px] text-teal-700 font-bold">
                      {selectedSociety.availableWorkerTypes?.length || 4} Specialties Enrolled
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedSociety.availableWorkerTypes || communityWorkerTypeOptions).map((wt, i) => (
                      <span
                        key={i}
                        className="bg-amber-50 border border-amber-300 text-teal-950 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-amber-600" />
                        <span>{wt}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Active Squad Live Status & Gate Arrival OTP Card */}
            <div className="bg-gradient-to-br from-[#042f2e] via-[#0f766e] to-[#042f2e] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-teal-700/60 relative overflow-hidden w-full min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-emerald-400 text-teal-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-teal-950 animate-ping" />
                      Squad Active on-site
                    </span>
                    <span className="text-teal-200 text-xs font-semibold truncate">
                      {selectedSociety.name}
                    </span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-black text-white break-words">
                    {activeCommunityBooking.packageTitle}
                  </h4>
                  <p className="text-xs text-teal-100">
                    Lead Supervisor: <b>{activeCommunityBooking.leadWorkerName}</b> • 4 Certified Specialists Active
                  </p>
                </div>

                {/* Gate Arrival OTP Pill Box with no mobile overflow */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 text-center w-full sm:w-auto sm:min-w-[190px]">
                  <p className="text-[10px] font-black uppercase text-amber-300 tracking-wider flex items-center justify-center gap-1">
                    <KeyRound className="w-3.5 h-3.5" /> Society Gate Arrival OTP
                  </p>
                  <div className="text-3xl font-mono font-black tracking-widest text-white mt-1">
                    {activeCommunityBooking.workerOtp}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(activeCommunityBooking.workerOtp);
                      setCopiedOtp(true);
                      setTimeout(() => setCopiedOtp(false), 2000);
                    }}
                    className="mt-1.5 text-[10px] font-bold text-teal-200 hover:text-white underline cursor-pointer"
                  >
                    {copiedOtp ? '✓ Copied to clipboard' : 'Give to Security Guard'}
                  </button>
                </div>
              </div>

              {/* Squad Crew Avatars */}
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-teal-200 text-xs font-semibold">Crew Team:</span>
                  <div className="flex -space-x-2">
                    {activeCommunityBooking.crewRoster.map((m) => (
                      <div
                        key={m.id}
                        title={`${m.name} (${m.trade} - ${m.role})`}
                        className="w-8 h-8 rounded-full bg-amber-400 text-teal-950 font-black text-[11px] flex items-center justify-center border-2 border-teal-900 shadow-sm"
                      >
                        {m.avatarInitials}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="tel:+919825123456"
                    className="bg-amber-400 hover:bg-amber-300 text-teal-950 font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Squad Lead</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Filter by Worker Types in Community so user can select as their own */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h4 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-teal-700" />
                    <span>Worker Types in Community</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Select a worker trade to deploy dedicated squads:
                  </p>
                </div>
                <span className="text-xs text-teal-700 font-bold">
                  Showing {filteredCommunityPackages.length} Packages
                </span>
              </div>

              {/* Interactive Worker Type Filter Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { id: 'ALL', label: 'All Community Squads' },
                  { id: 'Water Tank & Plumbing', label: '💧 Water Tank & Plumbing' },
                  { id: 'Electrical & Substation', label: '⚡ Electrical & Substation' },
                  { id: 'Cleaning & Jetting', label: '🧹 Deep Cleaning & Jetting' },
                  { id: 'Society AMC', label: '🏢 Society Infrastructure AMC' }
                ].map((filter) => {
                  const active = selectedWorkerTypeFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setSelectedWorkerTypeFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        active
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {active && <Check className="w-3 h-3" />}
                      <span>{filter.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Society Squad Packages Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base sm:text-lg text-slate-900 flex items-center gap-2">
                    <HardHat className="w-5 h-5 text-teal-700" />
                    <span>Multi-Worker Society Packages</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Full crews with industrial-grade equipment & group resident savings
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCommunityPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-teal-500 transition flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                              {pkg.crewSize} WORKERS SQUAD
                            </span>
                            {pkg.popular && (
                              <span className="text-[10px] font-black uppercase bg-amber-400 text-teal-950 px-2 py-0.5 rounded-full">
                                POPULAR
                              </span>
                            )}
                          </div>
                          <h4 className="font-black text-base text-slate-900 mt-1">{pkg.title}</h4>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs text-slate-400 line-through block">₹{pkg.baseRateINR}</span>
                          <span className="text-lg font-black text-teal-800">₹{pkg.discountedRateINR}</span>
                        </div>
                      </div>

                      {/* Scope Points */}
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {pkg.scopePoints.map((pt, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-teal-600 mt-0.5 flex-shrink-0" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Included Equipment */}
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Industrial Equipment Included
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {pkg.includedEquipment.map((eq, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                            >
                              {eq}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Save {pkg.residentSavingsPercent}% Group Subsidy
                      </span>
                      <button
                        type="button"
                        onClick={() => setBookingModalPkg(pkg)}
                        className="bg-teal-700 hover:bg-teal-800 text-white font-black text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <HardHat className="w-3.5 h-3.5" />
                        <span>Deploy Squad</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="font-black text-base sm:text-lg text-slate-900">
                  All 6 Service Categories ({allWorkers.length} Active Workers)
                </h3>
              </div>
              <Link
                href="/customer/services"
                className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 hover:underline"
              >
                View All 100 Workers <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 6-Column Desktop Grid / 3-Column Tablet / 2-Column Mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {serviceCategories.map((cat) => {
                const Icon = categoryIcons[cat.icon] || Sparkles;
                return (
                  <Link
                    key={cat.id}
                    href={`/customer/services?category=${encodeURIComponent(cat.name)}`}
                    className={`${cat.color} rounded-2xl p-4 border transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col items-center text-center group`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center mb-2 group-hover:scale-110 transition">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black tracking-tight text-slate-800">{cat.name}</span>
                    <span className="text-[10px] font-bold text-slate-500 mt-1 bg-white/70 px-2 py-0.5 rounded-full">
                      {cat.count}+ Partners
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Responsive 2-Column Split: Upcoming Bookings & Top Rated Professionals */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Upcoming Service Appointment */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-700" />
                <span>Upcoming Appointment</span>
              </h3>
              <Link href="/customer/bookings" className="text-xs font-bold text-teal-700 hover:underline">
                Manage
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Deep Home Cleaning</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> Tomorrow, 10:30 AM
                    </p>
                  </div>
                </div>
                {liveJobStatus === 'IN_PROGRESS' ? (
                  <span className="text-[10px] font-black bg-amber-500 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    In Progress
                  </span>
                ) : liveJobStatus === 'COMPLETED' ? (
                  <span className="text-[10px] font-black bg-emerald-600 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                    Completed
                  </span>
                ) : (
                  <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Confirmed
                  </span>
                )}
              </div>

              <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-400 text-emerald-950 font-bold flex items-center justify-center text-[10px]">
                    AK
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{ratedWorker.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {liveJobStatus === 'IN_PROGRESS' ? '⚡ Currently Working at Location' : liveJobStatus === 'COMPLETED' ? 'Job Completed • Rate Partner Below' : 'Verified Specialist • ★ 4.9'}
                    </p>
                  </div>
                </div>
                {liveJobStatus === 'COMPLETED' ? (
                  <button
                    type="button"
                    onClick={() => setIsFeedbackOpen(true)}
                    className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-[11px] px-3 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 fill-emerald-950" />
                    <span>Rate Partner</span>
                  </button>
                ) : (
                  <Link
                    href={`/customer/tracking/${activeBookingId || '1'}`}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition"
                  >
                    {liveJobStatus === 'IN_PROGRESS' ? 'View Live Job' : 'Track Partner'}
                  </Link>
                )}
              </div>
            </div>

            {/* Completed Job - Worker Feedback & Rating Card */}
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-100/30 to-teal-50/50 rounded-2xl p-4 border border-amber-300/80 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-sm">
                    <Star className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-full">
                        {hasRated ? 'Review Submitted' : 'Rate Your Partner'}
                      </span>
                      {hasRated && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> ★ {selectedRating}.0
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mt-1">{ratedWorker.service}</h4>
                    <p className="text-[11px] text-slate-500">{ratedWorker.completedDate}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-3 border border-amber-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-teal-800 text-amber-300 font-bold flex items-center justify-center text-xs">
                    AK
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900">{ratedWorker.name}</p>
                    <p className="text-[10px] text-teal-700 font-medium">
                      {hasRated ? 'Thank you for your rating!' : 'How was your experience?'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(true)}
                  className={`font-black text-xs px-3.5 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer ${
                    hasRated
                      ? 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${hasRated ? 'text-amber-500 fill-amber-500' : 'fill-white'}`} />
                  <span>{hasRated ? 'Edit Rating' : 'Rate Worker'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Top Rated Nearby Workers */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Highly Rated Service Professionals</span>
              </h3>
              <Link href="/customer/services" className="text-xs font-bold text-teal-700 hover:underline">
                Explore All 100 →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featuredWorkers.map((w) => (
                <div
                  key={w.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs hover:border-teal-500 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center font-bold text-teal-800 text-xs">
                          {(w.name || 'Worker').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{w.name}</h4>
                          <span className="text-[10px] text-teal-700 font-semibold">{w.category}</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                        {w.badge || 'Verified'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-1">{w.title}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black text-teal-800">₹{w.rate}</span>
                      <span className="text-[10px] text-slate-400"> / hr</span>
                    </div>
                    <Link
                      href={`/customer/worker/${w.id}`}
                      className="text-xs font-bold text-teal-700 hover:text-white bg-teal-50 hover:bg-teal-700 px-3 py-1.5 rounded-lg transition border border-teal-200/60"
                    >
                      View & Book
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Promo Festive Offer Card */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 pointer-events-none" />
          <span className="bg-emerald-950/40 text-amber-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            Special Launch Offer
          </span>
          <h3 className="font-black text-xl sm:text-2xl mt-1.5 leading-tight text-white">
            Get Flat 20% OFF on Any Service Booking!
          </h3>
          <p className="text-xs sm:text-sm text-amber-100 mt-1">
            Choose from 1 hr, 4 hr half-day, or 8 hr full-day packages. Use code <b className="text-white bg-black/20 px-1.5 py-0.5 rounded font-mono">SAHYOG20</b>.
          </p>
          <Link
            href="/customer/services"
            className="mt-4 inline-flex items-center gap-1.5 bg-white text-emerald-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-sm hover:bg-amber-50 transition"
          >
            <span>Book a Professional Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Real-time sync floating notification */}
      {realtimeToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[110] bg-emerald-800 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-emerald-500/40 animate-in fade-in slide-in-from-top-4 max-w-sm text-center">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 animate-spin" />
          <span>{realtimeToast}</span>
        </div>
      )}

      {/* Worker Feedback & Rating Popup Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] sm:max-h-[88vh] my-auto">
            {/* Modal Header (Fixed at top) */}
            <div className="bg-gradient-to-r from-[#042f2e] via-[#0d9488] to-[#042f2e] text-white p-4 sm:p-5 relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(false)}
                className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-emerald-200 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-400 text-emerald-950 font-black text-lg flex items-center justify-center shadow-md flex-shrink-0">
                  AK
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full">
                    Rate Service Partner
                  </span>
                  <h3 className="font-black text-base sm:text-lg text-white mt-1 leading-tight">
                    {ratedWorker.name}
                  </h3>
                  <p className="text-xs text-emerald-100/90">{ratedWorker.service}</p>
                </div>
              </div>
            </div>

            {/* Modal Body with smooth scrolling */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 overscroll-contain">
              {feedbackSubmitted ? (
                <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="font-black text-xl text-slate-900">Thank You for Your Feedback!</h4>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Your {selectedRating}-star rating for <b>{ratedWorker.name}</b> has been recorded and directly updates their verified profile.
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Calibrated Dynamic Pricing Updated</span>
                  </div>
                </div>
              ) : (
                <form id="feedback-rating-form" onSubmit={handleRatingSubmit} className="space-y-4">
                  {/* Star Rating Section */}
                  <div className="text-center py-2 bg-slate-50/80 rounded-2xl border border-slate-100 p-4">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                      Tap to Rate Service (1 to 5 Stars)
                    </label>

                    <div className="flex items-center justify-center gap-2 sm:gap-3 my-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = (hoverRating || selectedRating) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setSelectedRating(star)}
                            className="p-1 sm:p-1.5 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                          >
                            <Star
                              className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
                                isFilled
                                  ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                                  : 'text-slate-300 fill-slate-100'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-xs font-black text-teal-800 mt-2">
                      {ratingLabels[hoverRating || selectedRating]}
                    </p>
                  </div>

                  {/* Compliment Badges */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      What went well? (Select all that apply)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {complimentTagOptions.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1 ${
                              isSelected
                                ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span>{tag}</span>
                            {isSelected && <CheckCircle className="w-3 h-3 text-emerald-300 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Written Review */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Share your experience (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="e.g. Amir arrived on time, was polite, and did a thorough deep cleaning of the kitchen and bathrooms..."
                      className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-teal-600 focus:bg-white transition resize-none text-slate-800 placeholder-slate-400 font-medium"
                    />
                  </div>

                  {/* Would Recommend Toggle */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <ThumbsUp className="w-4 h-4 text-teal-600" />
                      <span>Would you recommend Amir to neighbors?</span>
                    </span>

                    <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setRecommended(true)}
                        className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                          recommended
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Yes 👍
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecommended(false)}
                        className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                          !recommended
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Pinned Modal Footer - ALWAYS visible, never cut off on any device */}
            {!feedbackSubmitted && (
              <div className="p-3.5 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-100 flex-shrink-0">
                <button
                  type="submit"
                  form="feedback-rating-form"
                  className="w-full bg-teal-700 hover:bg-teal-800 active:scale-[0.98] text-white font-black py-3.5 sm:py-4 rounded-2xl shadow-lg shadow-teal-900/25 transition text-sm flex items-center justify-center gap-2 cursor-pointer border border-teal-600/30"
                >
                  <Star className="w-4 h-4 fill-white" />
                  <span>Submit Worker Rating & Review</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deploy Squad Confirmation Modal */}
      {bookingModalPkg && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                  {bookingModalPkg.crewSize} Workers Squad
                </span>
                <h3 className="font-black text-lg text-slate-900 mt-1">{bookingModalPkg.title}</h3>
                <p className="text-xs text-slate-500">Deploying to {selectedSociety.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setBookingModalPkg(null)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {deploySuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold text-center">
                {deploySuccess}
              </div>
            ) : (
              <form onSubmit={handleDeploySquad} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Towers / Scope</label>
                  <input
                    type="text"
                    value={bookingTowers}
                    onChange={(e) => setBookingTowers(e.target.value)}
                    className="w-full border-2 border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900 outline-none focus:border-teal-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Date</label>
                    <select
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full border-2 border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900 outline-none"
                    >
                      <option value="Today">Today (Emergency)</option>
                      <option value="Tomorrow">Tomorrow</option>
                      <option value="This Weekend">This Weekend</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Time</label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full border-2 border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900 outline-none"
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                  <span className="font-bold text-amber-900">Total Squad Pool Rate</span>
                  <span className="text-base font-black text-amber-950">₹{bookingModalPkg.discountedRateINR}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingModalPkg(null)}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDeploying}
                    className="flex-1 py-3 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-black rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isDeploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <HardHat className="w-4 h-4" />}
                    <span>Confirm Dispatch</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Mobile-only Bottom Navigation */}
      <BottomNav role="customer" />
    </div>
  );
}
