'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Bell, Star, MapPin, ShieldCheck, Heart, MessageSquare, 
  CheckCircle, Clock, Zap, Award, ChevronRight, Sparkles 
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { allWorkers } from '@/data/workersData';

export default function WorkerProfilePage({ params }: { params: { id: string } }) {
  const worker = useMemo(() => {
    return (
      allWorkers.find((w) => w.id === params.id || w.id === `w-${params.id}`) ||
      allWorkers[0]
    );
  }, [params.id]);

  // Duration options in hours: 1, 2, 4 (half day), 8 (full day)
  const [selectedHours, setSelectedHours] = useState<number>(4);
  const [isShortlisted, setIsShortlisted] = useState(false);

  // Dynamic pricing calculation
  const baseRate = worker.rate;
  const calculatedTotal = useMemo(() => {
    if (selectedHours === 1) return baseRate;
    if (selectedHours === 2) return Math.round(baseRate * 1.95);
    if (selectedHours === 4) return Math.round(baseRate * 4 * 0.9); // 10% discount on 4 hrs
    if (selectedHours === 8) return Math.round(baseRate * 8 * 0.8); // 20% discount on Full Day
    return baseRate * selectedHours;
  }, [baseRate, selectedHours]);

  return (
    <div className="min-h-screen bg-slate-50 pb-36 text-slate-900">
      {/* Top Header */}
      <div className="bg-[#042f2e] text-white border-b border-emerald-900/60 sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/customer/services"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-emerald-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-bold text-base sm:text-lg text-white">
              Professional Profile & Booking
            </h1>
          </div>
          <Link
            href="/notifications"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-white"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-6">
        {/* Worker Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 flex items-center justify-center font-black text-white text-2xl shadow-md flex-shrink-0 relative">
                {worker.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">{worker.name}</h2>
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                    {worker.badge || 'Verified'}
                  </span>
                </div>
                <p className="text-sm text-teal-700 font-semibold">{worker.title}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1 font-bold text-slate-700">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {worker.rating} ({worker.reviewsCount} reviews)
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {worker.locality}, {worker.city}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href="/chat/1"
                className="flex-1 sm:flex-none border-2 border-teal-700 text-teal-800 hover:bg-teal-50 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message</span>
              </Link>
              <button
                onClick={() => setIsShortlisted(!isShortlisted)}
                className={`flex-1 sm:flex-none border-2 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  isShortlisted
                    ? 'border-rose-500 bg-rose-50 text-rose-600'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isShortlisted ? 'fill-rose-500' : ''}`} />
                <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-200/60">
              <p className="text-xs text-slate-400 font-semibold">Experience</p>
              <p className="text-base font-black text-slate-900 mt-0.5">{worker.exp}+ Years</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-200/60">
              <p className="text-xs text-slate-400 font-semibold">Hourly Base</p>
              <p className="text-base font-black text-teal-800 mt-0.5">₹{worker.rate}/hr</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-200/60">
              <p className="text-xs text-slate-400 font-semibold">Jobs Completed</p>
              <p className="text-base font-black text-slate-900 mt-0.5">{worker.reviewsCount}+</p>
            </div>
          </div>
        </div>

        {/* DURATION SELECTION SECTION (1 Hour, 2 Hours, 4 Hours, 8 Hours Full Day) */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-700" />
                <span>Select Service Duration (समय अवधि)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose hours needed for your service. Multi-hour packages include discounted rates.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
              Save up to 20%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { hours: 1, label: '1 Hour', sub: 'Quick inspection', badge: 'Standard', savings: '' },
              { hours: 2, label: '2 Hours', sub: 'Standard repair', badge: '5% off', savings: '' },
              { hours: 4, label: '4 Hours (Half Day)', sub: 'Popular Choice', badge: '10% off', savings: 'Best for Home' },
              { hours: 8, label: '8 Hours (Full Day)', sub: 'Complete project', badge: '20% off', savings: 'Max Savings' },
            ].map((d) => {
              const isSelected = selectedHours === d.hours;
              let estPrice = baseRate * d.hours;
              if (d.hours === 2) estPrice = Math.round(baseRate * 1.95);
              if (d.hours === 4) estPrice = Math.round(baseRate * 4 * 0.9);
              if (d.hours === 8) estPrice = Math.round(baseRate * 8 * 0.8);

              return (
                <button
                  key={d.hours}
                  onClick={() => setSelectedHours(d.hours)}
                  className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/60 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-slate-900">{d.label}</span>
                      {d.badge && (
                        <span className="text-[10px] font-bold bg-amber-400 text-emerald-950 px-1.5 py-0.2 rounded">
                          {d.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{d.sub}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60">
                    <p className="text-base font-black text-teal-800">₹{estPrice}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Total service charge</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bio & Skills */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-black text-slate-900 mb-2">Professional Bio</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{worker.bio}</p>
          </div>

          <div>
            <h3 className="text-base font-black text-slate-900 mb-2.5">Skills & Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {worker.skills.map((s) => (
                <span
                  key={s}
                  className="bg-slate-100 border border-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-xl text-xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-black text-slate-900 mb-2.5">Languages Known</h3>
            <div className="flex flex-wrap gap-4">
              {worker.languages.map((l) => (
                <span key={l} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{l}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Booking Bar with Dynamic Duration Calculation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3.5 sm:p-4 z-40 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total ({selectedHours} {selectedHours === 1 ? 'Hour' : 'Hours'} Package)
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-teal-800">₹{calculatedTotal}</span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium">+ taxes & visit</span>
            </div>
          </div>

          <Link
            href={`/customer/booking/${worker.id}?hours=${selectedHours}&amount=${calculatedTotal}`}
            className="bg-teal-700 hover:bg-teal-800 active:scale-[0.98] text-white px-5 sm:px-10 py-3.5 rounded-2xl font-bold text-xs sm:text-base flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-teal-900/20 transition cursor-pointer"
          >
            <span>Proceed to Schedule</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
