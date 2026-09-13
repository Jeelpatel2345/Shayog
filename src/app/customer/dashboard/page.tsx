'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, Search, MapPin, Star, ChevronRight, ShieldCheck, 
  Calendar, User, Sparkles, Wrench, Zap, Cpu, Hammer, 
  Paintbrush, ArrowRight, Heart, Award, Shield, CheckCircle, Clock,
  ThumbsUp, X, MessageSquare, CheckCircle2
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useAuthStore } from '@/store/authStore';
import { serviceCategories, allWorkers } from '@/data/workersData';

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

    // Check existing stored job status
    const storedStatus = localStorage.getItem('sahyog_active_job_status');
    if (storedStatus === 'IN_PROGRESS') {
      setLiveJobStatus('IN_PROGRESS');
    } else if (storedStatus === 'COMPLETED') {
      setLiveJobStatus('COMPLETED');
    }

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

    // 3. Periodic API polling fallback (every 3.5s for multi-device testing)
    const pollTimer = setInterval(() => {
      fetch('/api/bookings')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.bookings && data.bookings.length > 0) {
            const b = data.bookings[0];
            if (b.status === 'IN_PROGRESS' && liveJobStatus !== 'IN_PROGRESS') {
              setLiveJobStatus('IN_PROGRESS');
            } else if (b.status === 'COMPLETED' && liveJobStatus !== 'COMPLETED') {
              setLiveJobStatus('COMPLETED');
              if (!hasRated && !isFeedbackOpen) {
                setIsFeedbackOpen(true);
              }
            }
          }
        })
        .catch(() => {});
    }, 3500);

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

  // Lock Customer Role & Hydrate profile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sahyog-role', 'CUSTOMER');
      localStorage.setItem('sahyog-logged-in', 'true');
      const saved = localStorage.getItem('sahyog-user-name');
      if (saved) setClientName(saved);
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

  // Top featured workers from the 100 workers collection
  const featuredWorkers = allWorkers.slice(0, 4);

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
          <div className="flex items-center gap-3">
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

            <div className="self-start sm:self-auto bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-1.5 flex items-center gap-1.5 text-xs text-white">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-medium">Gujarat / Pan-India Multi-City</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-5 bg-white rounded-2xl p-2 flex items-center gap-2 shadow-xl border border-white/20">
            <Search className="w-5 h-5 text-slate-400 ml-2 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search from 100+ Plumbers, Cleaners, Electricians, Carpenters..."
              className="w-full text-xs sm:text-sm font-medium text-slate-800 outline-none placeholder-slate-400"
            />
            <Link
              href={searchQuery ? `/customer/services?search=${encodeURIComponent(searchQuery)}` : '/customer/services'}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex-shrink-0"
            >
              Find
            </Link>
          </div>

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

        {/* 6 Popular Service Categories in Full Responsive Grid */}
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
                <Link
                  href="/customer/tracking/1"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition"
                >
                  {liveJobStatus === 'IN_PROGRESS' ? 'View Live Job' : 'Track Partner'}
                </Link>
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
                          {w.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
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

      {/* Mobile-only Bottom Navigation */}
      <BottomNav role="customer" />
    </div>
  );
}
