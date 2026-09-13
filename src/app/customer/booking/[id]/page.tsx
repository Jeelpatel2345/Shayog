'use client';
import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, Star, MapPin, ShieldCheck, Info, ChevronDown, 
  Calendar, Clock, User, CheckCircle2, ChevronRight, Sparkles 
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { allWorkers } from '@/data/workersData';

const dates = [
  { day: 'FRI', num: 24, label: 'Today' },
  { day: 'SAT', num: 25, label: 'Tomorrow' },
  { day: 'SUN', num: 26, label: 'Weekend' },
  { day: 'MON', num: 27, label: 'Standard' },
];

const times = [
  '09:00 AM',
  '10:30 AM',
  '12:00 PM',
  '02:30 PM',
  '04:00 PM',
  '06:00 PM',
];

function BookingContent({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const initialHours = parseInt(searchParams.get('hours') || '4');

  const worker = useMemo(() => {
    return (
      allWorkers.find((w) => w.id === params.id || w.id === `w-${params.id}`) ||
      allWorkers[0]
    );
  }, [params.id]);

  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState(1);
  const [durationHours, setDurationHours] = useState<number>(initialHours);
  const [showPrice, setShowPrice] = useState(true);

  // Dynamic Price Breakdown
  const { serviceFee, baseFee, trustFee, gst, totalPayable } = useMemo(() => {
    const rate = worker.rate;
    let fee = rate * durationHours;
    if (durationHours === 2) fee = Math.round(rate * 1.95);
    if (durationHours === 4) fee = Math.round(rate * 4 * 0.9); // 10% discount
    if (durationHours === 8) fee = Math.round(rate * 8 * 0.8); // 20% discount

    const base = 150;
    const trust = 25;
    const subtotal = fee + base + trust;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;

    return {
      serviceFee: fee,
      baseFee: base,
      trustFee: trust,
      gst: tax,
      totalPayable: total,
    };
  }, [worker.rate, durationHours]);

  return (
    <div className="min-h-screen bg-slate-50 pb-32 text-slate-900">
      {/* Top Header */}
      <div className="bg-[#042f2e] text-white border-b border-emerald-900/60 sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/customer/worker/${worker.id}`}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-emerald-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-bold text-base sm:text-lg text-white">Confirm Booking & Schedule</h1>
          </div>
          <span className="text-xs bg-amber-400 text-emerald-950 font-bold px-2.5 py-1 rounded-full">
            Step 2 of 3
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs sm:text-sm font-semibold text-blue-900">
              Review your service schedule, duration packages, and transparent price breakdown.
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              अपनी सेवा समय, अवधि पैकेज और पारदर्शी शुल्क विवरण की समीक्षा करें।
            </p>
          </div>
        </div>

        {/* Service Provider Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 text-white font-black text-lg flex items-center justify-center shadow-xs">
              {worker.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-base text-slate-900">{worker.name}</h3>
                <ShieldCheck className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-xs text-slate-500">{worker.title}</p>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className="flex items-center gap-0.5 font-bold text-amber-600">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  {worker.rating}
                </span>
                <span className="text-slate-400">({worker.reviewsCount} reviews)</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">{worker.locality}, {worker.city}</span>
              </div>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 font-semibold block">Base Rate</span>
            <span className="text-base font-black text-teal-800">₹{worker.rate}/hr</span>
          </div>
        </div>

        {/* DURATION SELECTOR ON BOOKING SCREEN */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-700" />
              <span>Select Service Duration (समय अवधि चुनें)</span>
            </label>
            <span className="text-xs text-teal-700 font-semibold">
              Selected: <b className="text-slate-900">{durationHours} {durationHours === 1 ? 'Hour' : 'Hours'}</b>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { hours: 1, label: '1 Hour', sub: 'Quick Fix' },
              { hours: 2, label: '2 Hours', sub: 'Standard' },
              { hours: 4, label: '4 Hours (Half Day)', sub: '10% OFF' },
              { hours: 8, label: 'Whole Day (8 Hrs)', sub: '20% OFF' },
            ].map((d) => (
              <button
                key={d.hours}
                type="button"
                onClick={() => setDurationHours(d.hours)}
                className={`py-3 px-3 rounded-2xl border-2 text-center transition ${
                  durationHours === d.hours
                    ? 'border-teal-600 bg-teal-50/70 font-black text-teal-900 shadow-xs'
                    : 'border-slate-200 bg-slate-50 font-semibold text-slate-600 hover:bg-slate-100'
                }`}
              >
                <p className="text-xs sm:text-sm">{d.label}</p>
                <p className="text-[10px] text-teal-700 font-bold mt-0.5">{d.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Schedule: Date & Time Picker */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
          <div>
            <label className="font-bold text-sm text-slate-900 flex items-center gap-1.5 mb-2.5">
              <Calendar className="w-4 h-4 text-teal-700" />
              <span>Select Date (तारीख)</span>
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {dates.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedDate(i)}
                  className={`py-3 rounded-2xl text-center border-2 transition ${
                    i === selectedDate
                      ? 'border-teal-600 bg-teal-700 text-white font-black shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 font-bold hover:bg-slate-100'
                  }`}
                >
                  <p className="text-[10px] uppercase font-bold opacity-80">{d.day}</p>
                  <p className="text-lg font-black">{d.num}</p>
                  <p className="text-[9px] opacity-75">{d.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-sm text-slate-900 flex items-center gap-1.5 mb-2.5">
              <Clock className="w-4 h-4 text-teal-700" />
              <span>Select Time Slot (समय)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {times.map((t, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedTime(i)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                    i === selectedTime
                      ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Service Location */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Address</p>
            <p className="font-bold text-sm text-slate-900">B/402, Shanti Heights, Sector 12</p>
            <p className="text-xs text-slate-500">Navrangpura, Ahmedabad, Gujarat - 380015</p>
          </div>
        </div>

        {/* Dynamic Price Breakdown Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={() => setShowPrice(!showPrice)}
            className="flex items-center justify-between w-full text-left"
          >
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Total Payable Amount
              </span>
              <span className="text-2xl font-black text-teal-800">₹ {totalPayable}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-teal-700 font-bold bg-teal-50 px-3 py-1.5 rounded-xl">
              <span>View Breakdown</span>
              <ChevronDown className={`w-4 h-4 transition ${showPrice ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {showPrice && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800">
                    Service Charge ({durationHours} {durationHours === 1 ? 'Hour' : 'Hours'})
                  </span>
                  <p className="text-[10px] text-slate-400">सेवा शुल्क / સેવા શુલ્ક</p>
                </div>
                <span className="font-bold text-slate-800">₹ {serviceFee}</span>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800">Safety, Material & Visiting Base</span>
                  <p className="text-[10px] text-slate-400">भेंट शुल्क / મુલાકાત ફી</p>
                </div>
                <span className="font-bold text-slate-800">₹ {baseFee}</span>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800">Platform Trust & Guarantee Fee</span>
                  <p className="text-[10px] text-slate-400">सहयोग सुरक्षा शुल्क</p>
                </div>
                <span className="font-bold text-slate-800">₹ {trustFee}</span>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800">GST (18%)</span>
                  <p className="text-[10px] text-slate-400">Government Tax</p>
                </div>
                <span className="font-bold text-slate-800">₹ {gst}</span>
              </div>

              <div className="pt-2.5 border-t border-dashed border-slate-200 flex justify-between items-center text-sm">
                <span className="font-black text-slate-900">Total Net Payable</span>
                <span className="font-black text-teal-800 text-base">₹ {totalPayable}</span>
              </div>
            </div>
          )}
        </div>

        {/* Trust Guarantee Alert */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-emerald-900">SahYog Trust & 30-Day Service Warranty Included</p>
            <p className="text-emerald-700">Payment released to the partner only after your 4-digit OTP verification at service completion.</p>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Confirmation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3.5 sm:p-4 z-40 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Amount
            </span>
            <span className="text-xl sm:text-2xl font-black text-teal-800">₹ {totalPayable}</span>
          </div>

          <Link
            href={`/customer/payment/${worker.id}?amount=${totalPayable}&hours=${durationHours}`}
            className="bg-teal-700 hover:bg-teal-800 active:scale-[0.98] text-white px-6 sm:px-12 py-3.5 rounded-2xl font-bold text-xs sm:text-base flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-teal-900/20 transition cursor-pointer"
          >
            <span>Proceed to UPI Payment</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold">Loading Schedule...</div>}>
      <BookingContent params={params} />
    </Suspense>
  );
}
