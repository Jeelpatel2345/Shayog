'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, MapPin, Sparkles, ShieldCheck, Star, Clock, 
  ArrowRight, CheckCircle2, ChevronRight, Users, Award, 
  Smartphone, Wrench, Zap, Cpu, Hammer, Paintbrush, Shield, Building2 
} from 'lucide-react';
import { serviceCategories, allWorkers } from '@/data/workersData';
import { communityPackages } from '@/data/communityData';

const iconMap: Record<string, any> = {
  Sparkles,
  Wrench,
  Zap,
  Cpu,
  Hammer,
  Paintbrush,
};

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [scope, setScope] = useState<'INDIVIDUAL' | 'COMMUNITY'>('INDIVIDUAL');

  const featuredWorkers = allWorkers.slice(0, 6);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#022c2b] via-[#0d9488] to-[#042f2e] text-white py-20 lg:py-28 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>India's Most Trusted Home Services Network</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                Skilled Hands for Your Home, <br className="hidden sm:block" />
                <span className="text-amber-300">Right on Demand.</span>
              </h1>

              <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed max-w-2xl">
                Book background-verified electricians, plumbers, cleaners, painters, and carpenters in minutes. 
                Transparent hourly rates, direct UPI payments, and guaranteed satisfaction across Gujarat.
              </p>

              {/* Scope Selector: Individual vs Community */}
              <div className="inline-flex bg-white/15 p-1 rounded-2xl border border-white/20 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setScope('INDIVIDUAL')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    scope === 'INDIVIDUAL'
                      ? 'bg-white text-teal-900 shadow-md'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <span>👤 Individual Home Service</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScope('COMMUNITY')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    scope === 'COMMUNITY'
                      ? 'bg-amber-400 text-teal-950 shadow-md'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <span>🏢 Community & Society Service</span>
                </button>
              </div>

              {/* Desktop Search Box */}
              <div className="bg-white rounded-2xl p-2.5 shadow-2xl border border-emerald-800/30 flex flex-col sm:flex-row items-center gap-2 text-slate-800">
                <div className="flex items-center gap-2 px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-200 w-full sm:w-auto flex-shrink-0">
                  <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <select 
                    value={selectedCity} 
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="text-xs font-bold bg-transparent outline-none cursor-pointer text-slate-700"
                  >
                    <option value="All Cities">All Cities</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Surat">Surat</option>
                    <option value="Vadodara">Vadodara</option>
                    <option value="Rajkot">Rajkot</option>
                    <option value="Gandhinagar">Gandhinagar</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 px-3 flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      scope === 'COMMUNITY'
                        ? "Search 'Society Water Tank Cleaning', 'Apartment AMC', 'Streetlight Maintenance'..."
                        : "Search 'Plumber', 'Sofa Deep Cleaning', 'AC Repair', 'Fan Fitting'..."
                    }
                    className="w-full text-xs sm:text-sm font-medium outline-none text-slate-900 placeholder-slate-400"
                  />
                </div>

                <Link
                  href={'/services?search=' + encodeURIComponent(searchQuery || (scope === 'COMMUNITY' ? 'Society' : '')) + (selectedCity !== 'All Cities' ? '&city=' + encodeURIComponent(selectedCity) : '')}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition flex-shrink-0 w-full sm:w-auto text-center flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Quick Tags */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-emerald-100">
                <span className="font-bold text-amber-300">Popular:</span>
                {(scope === 'COMMUNITY' 
                  ? ['Society Water Tank Cleaning', 'Apartment Electrical AMC', 'Common Area Sanitization', 'Central Pump Maintenance']
                  : ['Home Cleaning', 'Sofa Shampooing', 'Pipe Leak', 'Fan Fitting', 'Painting']
                ).map((tag) => (
                  <Link
                    key={tag}
                    href={'/services?search=' + encodeURIComponent(tag)}
                    className="bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1 rounded-full text-white transition"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Hero Stats Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <span className="text-xs uppercase font-bold text-amber-300 tracking-wider">
                    Live Network Metrics
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live in Gujarat
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-950/50 border border-white/10 rounded-2xl p-4">
                    <div className="text-3xl font-black text-amber-400">100+</div>
                    <div className="text-xs text-emerald-200 mt-1 font-medium">Verified Professionals</div>
                  </div>
                  <div className="bg-emerald-950/50 border border-white/10 rounded-2xl p-4">
                    <div className="text-3xl font-black text-white">6</div>
                    <div className="text-xs text-emerald-200 mt-1 font-medium">Service Categories</div>
                  </div>
                  <div className="bg-emerald-950/50 border border-white/10 rounded-2xl p-4">
                    <div className="text-3xl font-black text-white">4.8★</div>
                    <div className="text-xs text-emerald-200 mt-1 font-medium">Average Customer Rating</div>
                  </div>
                  <div className="bg-emerald-950/50 border border-white/10 rounded-2xl p-4">
                    <div className="text-3xl font-black text-amber-400">15 Min</div>
                    <div className="text-xs text-emerald-200 mt-1 font-medium">Avg Arrival Confirmation</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs text-emerald-200">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Aadhaar Police-Cleared</span>
                  </div>
                  <Link href="/services" className="text-amber-300 font-bold hover:underline flex items-center gap-1">
                    <span>Browse All</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Ribbon */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900">100% Verified</div>
                <div className="text-[11px] text-slate-500">Biometric & Police Check</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900">Transparent Pricing</div>
                <div className="text-[11px] text-slate-500">Hourly / Half / Full Day</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900">Instant UPI Payments</div>
                <div className="text-[11px] text-slate-500">PhonePe, GPay, Paytm</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900">Job Insurance</div>
                <div className="text-[11px] text-slate-500">Up to ₹10,000 Cover</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories / Community Packages Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
                {scope === 'COMMUNITY' ? '🏢 Society & Community Contracts' : '👤 All 6 Core Home Categories'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
                {scope === 'COMMUNITY' 
                  ? 'Official Community & Society Service Packages' 
                  : 'Professional Services You Can Trust'}
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                {scope === 'COMMUNITY'
                  ? 'Industrial-grade multi-worker crew packages tailored for residential societies, commercial complexes & apartments with pooled savings.'
                  : 'Choose a category to browse all 100+ active background-checked professionals in Gujarat.'}
              </p>
            </div>
            <Link
              href={scope === 'COMMUNITY' ? '/services?scope=community' : '/services'}
              className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-800 transition"
            >
              <span>{scope === 'COMMUNITY' ? 'View all society packages' : 'View all 100 workers'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {scope === 'COMMUNITY' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              {communityPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-black bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>{pkg.tradeCategory} Squad</span>
                      </span>
                      <span className="text-xs font-black bg-amber-400 text-teal-950 px-3 py-1 rounded-full shadow-xs">
                        👥 {pkg.crewSize} Workers Crew
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-slate-900 leading-snug">
                        {pkg.title}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl font-black text-teal-800">₹{pkg.discountedRateINR}</span>
                        <span className="text-xs text-slate-400 line-through font-semibold">₹{pkg.baseRateINR}</span>
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {pkg.residentSavingsPercent}% Society Discount
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Included Industrial Equipment:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {pkg.includedEquipment.map((eq, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200"
                          >
                            ✓ {eq}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Scope of Work:
                      </p>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {pkg.scopePoints.map((pt, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold">
                      Estimated Duration: <b>{pkg.durationHours} Hours</b>
                    </span>
                    <Link
                      href={'/services?search=' + encodeURIComponent(pkg.tradeCategory)}
                      className="inline-flex items-center gap-2 text-xs font-black bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 rounded-xl shadow-xs transition"
                    >
                      <span>Book Squad Service</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceCategories.map((cat) => {
                const IconComp = iconMap[cat.icon] || Wrench;
                return (
                  <Link
                    key={cat.id}
                    href={'/services?category=' + encodeURIComponent(cat.name)}
                    className="group bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-teal-400 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-14 h-14 rounded-2xl bg-teal-50 group-hover:bg-teal-600 text-teal-700 group-hover:text-white flex items-center justify-center transition shadow-xs">
                          <IconComp className="w-7 h-7" />
                        </div>
                        <span className="text-xs font-black bg-slate-100 group-hover:bg-amber-400 group-hover:text-emerald-950 text-slate-600 px-3 py-1 rounded-full transition">
                          {cat.count}
                        </span>
                      </div>

                      <h3 className="text-xl font-black text-slate-900 group-hover:text-teal-700 transition">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700 group-hover:translate-x-1 transition">
                      <span>Browse {cat.name}</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-wider font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
              How SahYog Works
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Effortless booking from your desktop or phone. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 relative text-center space-y-4">
              <div className="w-12 h-12 bg-teal-700 text-white rounded-2xl flex items-center justify-center font-black text-lg mx-auto shadow-md">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900">Choose Your Service & Worker</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter from 100+ verified professionals based on real customer ratings, city, hourly rates, and skills.
              </p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 relative text-center space-y-4">
              <div className="w-12 h-12 bg-amber-400 text-emerald-950 rounded-2xl flex items-center justify-center font-black text-lg mx-auto shadow-md">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900">Select Time & Duration</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pick your preferred time slot and duration (hourly, 4 hours, or whole day). The price updates automatically.
              </p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 relative text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-700 text-white rounded-2xl flex items-center justify-center font-black text-lg mx-auto shadow-md">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900">Pay After Service Satisfaction</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Worker arrives on time. Share arrival OTP, get the job done, and pay via UPI or cash with platform protection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Professionals Preview */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
                Top Rated Partners
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
                Featured Professionals Near You
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                Handpicked 5-star service providers with proven track records.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
            >
              <span>Explore All 100 Workers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredWorkers.map((w) => (
              <div
                key={w.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-lg transition space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-700 to-emerald-800 text-white font-black text-base flex items-center justify-center shadow-md">
                        {getInitials(w.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 text-base">{w.name}</h4>
                          <ShieldCheck className="w-4 h-4 text-teal-600" />
                        </div>
                        <p className="text-xs text-teal-700 font-semibold">{w.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-black text-amber-700">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{w.rating}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {w.bio}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{(w.exp + " yrs exp")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{w.city}</span>
                    </div>
                    <div className="flex items-center gap-1 text-teal-700 font-bold ml-auto">
                      <span>{w.reviewsCount}+ jobs</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Starting from</span>
                    <span className="text-lg font-black text-slate-900">₹{w.rate}<span className="text-xs font-normal text-slate-500">/hr</span></span>
                  </div>

                  <Link
                    href={'/book/' + w.id}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Android Mobile App CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#042f2e] to-[#0d9488] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs uppercase font-bold text-amber-300 bg-amber-400/20 border border-amber-400/40 px-3 py-1 rounded-full">
                Android Application Available
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Prefer Booking on Your Mobile Phone?
              </h2>
              <p className="text-sm text-emerald-100 leading-relaxed max-w-xl">
                Download the official SahYog Android APK for fast OTP login, instant push notifications, 
                and live worker GPS map tracking on every service booking.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/download"
                  className="inline-flex items-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition"
                >
                  <Smartphone className="w-5 h-5" />
                  <span>Download Android App (.APK)</span>
                </Link>
                <span className="text-xs text-emerald-200 font-semibold">
                  Version 2.4.0 • 5.4 MB • Android 8.0+
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 text-center">
              <div className="inline-block bg-emerald-950/80 border border-white/20 rounded-2xl p-6 text-emerald-100 space-y-2">
                <div className="text-3xl font-black text-amber-300">10,000+</div>
                <div className="text-xs font-semibold">Satisfied Households</div>
                <div className="text-[11px] text-emerald-300/80 pt-2 border-t border-white/10">
                  Direct APK Installation Guide Included
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
