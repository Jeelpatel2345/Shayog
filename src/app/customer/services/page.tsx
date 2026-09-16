'use client';
import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, Bell, Search, Star, MapPin, Filter, ChevronRight, 
  User, Zap, Clock, ShieldCheck, Sparkles, SlidersHorizontal, CheckCircle
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { allWorkers, serviceCategories } from '@/data/workersData';

function ServiceResultsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCity, setSelectedCity] = useState('All');
  const [sortBy, setSortBy] = useState<'rating' | 'price_low' | 'price_high'>('rating');

  const filteredWorkers = useMemo(() => {
    return allWorkers.filter((w) => {
      // Category filter
      if (selectedCategory !== 'All' && w.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // City filter
      if (selectedCity !== 'All' && !w.city.toLowerCase().includes(selectedCity.toLowerCase())) {
        return false;
      }
      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = w.name.toLowerCase().includes(q);
        const matchTitle = w.title.toLowerCase().includes(q);
        const matchLoc = w.locality.toLowerCase().includes(q);
        const matchCity = w.city.toLowerCase().includes(q);
        const matchSkill = w.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchTitle && !matchLoc && !matchCity && !matchSkill) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price_low') return a.rate - b.rate;
      if (sortBy === 'price_high') return b.rate - a.rate;
      return 0;
    });
  }, [selectedCategory, selectedCity, search, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-slate-900">
      {/* Top Header */}
      <div className="bg-[#0f3854] text-white border-b border-emerald-900/60 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/customer/dashboard"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-emerald-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-black text-lg tracking-tight text-white leading-none">
                Verified Service Partners
              </h1>
              <span className="text-[10px] text-emerald-300 font-medium">
                100+ Background-Checked Specialists
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-white relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full" />
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Search Container */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 space-y-4">
        {/* Search Bar & City Selector */}
        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by worker name, specialty (e.g. AC, Geyser, Sofa, Wiring)..."
              className="w-full bg-transparent outline-none text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-xs text-slate-400 hover:text-slate-600">
                ✕
              </button>
            )}
          </div>

          {/* City selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="All">All Cities (Gujarat & India)</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Surat">Surat</option>
              <option value="Vadodara">Vadodara</option>
              <option value="Rajkot">Rajkot</option>
            </select>

            {/* Sort selector */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="rating">Top Rated (★)</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* 6 Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Categories ({allWorkers.length})
          </button>
          {serviceCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 flex items-center gap-1.5 ${
                selectedCategory === cat.name
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === cat.name ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Results Count Header */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <p>
            Showing <b className="text-slate-900">{filteredWorkers.length}</b> verified partners
            {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
            {selectedCity !== 'All' ? ` in ${selectedCity}` : ''}
          </p>
          <span className="text-[11px] text-teal-800 font-semibold">100% Aadhaar Verified</span>
        </div>

        {/* Workers Grid (3 columns on desktop, 2 on tablet, 1 on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map((w) => (
            <div
              key={w.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-500 transition flex flex-col justify-between"
            >
              <div>
                {/* Header: Photo + Name + Badge */}
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 via-teal-100 to-amber-100 flex items-center justify-center font-black text-teal-800 text-base flex-shrink-0 shadow-xs">
                    {w.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-bold text-sm text-slate-900 truncate">{w.name}</h3>
                      <span className="flex items-center gap-0.5 text-xs font-black text-amber-500 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-full flex-shrink-0">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{w.rating}</span>
                      </span>
                    </div>

                    <p className="text-xs text-teal-700 font-semibold truncate">{w.title}</p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{w.exp} yrs exp</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {w.locality}, {w.city}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {w.skills.slice(0, 3).map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {w.bio}
                </p>
              </div>

              {/* Card Footer: Hourly Price + Book CTA */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Starting At
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-teal-800">₹{w.rate}</span>
                    <span className="text-xs text-slate-400 font-semibold">/ hour</span>
                  </div>
                </div>

                <Link
                  href={`/customer/worker/${w.id}`}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1 hover:gap-1.5"
                >
                  <span>Book Now</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav role="customer" />
    </div>
  );
}

export default function ServiceResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold">Loading Services...</div>}>
      <ServiceResultsContent />
    </Suspense>
  );
}
