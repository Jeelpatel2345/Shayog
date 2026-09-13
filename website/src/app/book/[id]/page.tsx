'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Star, ShieldCheck, Clock, MapPin, Calendar, 
  CreditCard, CheckCircle2, ChevronRight, AlertCircle, Loader2, 
  Sparkles, Check 
} from 'lucide-react';
import { allWorkers } from '@/data/workersData';
import { useAuthStore } from '@/store/authStore';

export default function BookWorkerPage() {
  const params = useParams();
  const router = useRouter();
  const workerId = params.id as string;
  const { fullName, phone } = useAuthStore();

  const worker = allWorkers.find((w) => w.id === workerId) || allWorkers[0];

  const [selectedDate, setSelectedDate] = useState('Tomorrow');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [duration, setDuration] = useState<'hourly' | 'halfDay' | 'fullDay'>('hourly');
  const [hours, setHours] = useState(2);
  const [serviceAddress, setServiceAddress] = useState('B/402, Shanti Heights, Sector 12, Navrangpura, Ahmedabad');
  const [customerPhone, setCustomerPhone] = useState(phone || '98765 43210');
  const [notes, setNotes] = useState('');
  const [paymentTiming, setPaymentTiming] = useState<'AFTER_SERVICE' | 'PAY_NOW'>('AFTER_SERVICE');
  const [loading, setLoading] = useState(false);

  // Price Calculation
  const calculation = useMemo(() => {
    let serviceFee = 0;
    if (duration === 'hourly') {
      serviceFee = worker.rate * hours;
    } else if (duration === 'halfDay') {
      serviceFee = Math.round(worker.rate * 4 * 0.9); // 10% discount
    } else {
      serviceFee = Math.round(worker.rate * 8 * 0.8); // 20% discount
    }

    const platformFee = 25;
    const gst = Math.round(serviceFee * 0.18);
    const total = serviceFee + platformFee + gst;

    return { serviceFee, platformFee, gst, total };
  }, [duration, hours, worker.rate]);

  const handleProceedToPayment = async () => {
    setLoading(true);
    const tempId = 'bk_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    let finalBookingId = tempId;
    let finalBookingCode = 'SY-' + Math.floor(1000 + Math.random() * 9000);
    const generatedOtp = String(Math.floor(1000 + Math.random() * 9000));

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tempId,
          bookingCode: finalBookingCode,
          workerProfileId: worker.id,
          workerName: worker.name,
          workerPhone: worker.phone,
          serviceTitle: worker.title,
          serviceName: worker.title,
          category: worker.category,
          scheduledDate: selectedDate,
          scheduledTime: selectedTime,
          serviceLocation: serviceAddress,
          customerPhone: customerPhone,
          customerName: fullName || 'Jeel Patel',
          totalAmount: calculation.total,
          serviceFee: calculation.serviceFee,
          platformFee: calculation.platformFee,
          gstAmount: calculation.gst,
          workerOtp: generatedOtp,
          paymentTiming: paymentTiming,
          status: 'CONFIRMED',
          notes: notes,
        }),
      });

      const data = await res.json();
      if (data?.booking?.id) {
        finalBookingId = data.booking.id;
        finalBookingCode = data.booking.bookingCode || finalBookingCode;
      }
    } catch (err) {
      console.warn('Network booking sync fallback to local store');
    }

    // Always store to local storage so user sees it instantly
    if (typeof window !== 'undefined') {
      try {
        const newBooking = {
          id: finalBookingId,
          serviceCode: finalBookingCode,
          bookingCode: finalBookingCode,
          workerId: worker.id,
          workerName: worker.name,
          workerPhone: worker.phone,
          serviceTitle: worker.title,
          serviceName: worker.title,
          scheduledDate: selectedDate,
          bookingDate: selectedDate,
          scheduledTime: selectedTime,
          bookingTime: selectedTime,
          address: serviceAddress,
          serviceLocation: serviceAddress,
          totalAmount: calculation.total,
          status: 'CONFIRMED',
          workerOtp: generatedOtp,
          paymentTiming: paymentTiming,
          paymentStatus: paymentTiming === 'AFTER_SERVICE' ? 'PENDING_POST_SERVICE' : 'PENDING_UPI',
          createdAt: new Date().toISOString(),
        };

        const raw = localStorage.getItem('sahyog-user-bookings');
        const list = raw ? JSON.parse(raw) : [];
        list.unshift(newBooking);
        localStorage.setItem('sahyog-user-bookings', JSON.stringify(list));

        // Real-time cross-tab / cross-device broadcast
        try {
          const channel = new BroadcastChannel('sahyog-realtime-sync');
          channel.postMessage({
            type: 'NEW_BOOKING',
            booking: newBooking,
            workerName: worker.name,
            timestamp: Date.now()
          });
          channel.close();
        } catch {}

        localStorage.setItem('sahyog-realtime-event', JSON.stringify({
          type: 'NEW_BOOKING',
          booking: newBooking,
          workerName: worker.name,
          timestamp: Date.now()
        }));
      } catch {}
    }

    setLoading(false);

    if (paymentTiming === 'AFTER_SERVICE') {
      // Safe Pay After Service: go straight to live tracking with 4-Digit Arrival OTP
      router.push(`/tracking/${finalBookingId}`);
    } else {
      // Prepay with SahYog Escrow: navigate to 5-Minute UPI QR Payment Screen
      const query = new URLSearchParams({
        workerId: worker.id,
        amount: String(calculation.total),
        service: worker.title,
        date: selectedDate,
        time: selectedTime,
        address: serviceAddress,
      }).toString();

      router.push(`/payment/${finalBookingId}?${query}`);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Back Link */}
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Workers</span>
        </Link>

        {/* 2-Column Grid: Left Worker Profile Summary, Right Booking Form & Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Worker Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-700 to-emerald-800 text-white font-black text-xl flex items-center justify-center shadow-md flex-shrink-0">
                  {getInitials(worker.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-900">{worker.name}</h3>
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                  </div>
                  <p className="text-xs text-teal-700 font-semibold">{worker.title}</p>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-700 mt-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{worker.rating}</span>
                    <span className="text-slate-400 font-normal">({worker.reviewsCount} completed jobs)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                <p>{worker.bio}</p>
              </div>

              {/* Skills Tags */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-2">Verified Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {worker.skills.map((s, i) => (
                    <span key={i} className="text-[11px] font-semibold bg-teal-50 text-teal-800 px-2.5 py-1 rounded-lg border border-teal-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Verification Badges */}
              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Government Aadhaar Validated</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Local Police Clearance Done</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Booking Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-4">
                Schedule & Customize Your Service
              </h2>

              {/* Step 1: Select Date */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Date (तारीख)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Today', 'Tomorrow', 'Day After'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDate(d)}
                      className={'py-3 px-4 rounded-xl text-xs font-bold border transition text-center ' + (
                        selectedDate === d
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Time Slot */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Time Slot (समय)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['09:00 AM', '11:00 AM', '02:00 PM', '04:30 PM'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTime(t)}
                      className={'py-2.5 rounded-xl text-xs font-bold border transition text-center ' + (
                        selectedTime === t
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Duration / Booking Package */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Service Duration & Package (अवधि)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setDuration('hourly')}
                    className={'p-4 rounded-2xl border text-left transition ' + (
                      duration === 'hourly'
                        ? 'border-teal-600 bg-teal-50/60 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    )}
                  >
                    <div className="text-xs font-black text-slate-900">Custom Hours</div>
                    <div className="text-[11px] text-slate-500 mt-1">₹{worker.rate} / hour</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDuration('halfDay')}
                    className={'p-4 rounded-2xl border text-left transition relative ' + (
                      duration === 'halfDay'
                        ? 'border-teal-600 bg-teal-50/60 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    )}
                  >
                    <span className="absolute -top-2 right-2 bg-amber-400 text-emerald-950 font-black text-[9px] px-2 py-0.5 rounded-full">
                      10% OFF
                    </span>
                    <div className="text-xs font-black text-slate-900">Half Day (4h)</div>
                    <div className="text-[11px] text-slate-500 mt-1">Fix discount package</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDuration('fullDay')}
                    className={'p-4 rounded-2xl border text-left transition relative ' + (
                      duration === 'fullDay'
                        ? 'border-teal-600 bg-teal-50/60 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    )}
                  >
                    <span className="absolute -top-2 right-2 bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full">
                      20% OFF
                    </span>
                    <div className="text-xs font-black text-slate-900">Full Day (8h)</div>
                    <div className="text-[11px] text-slate-500 mt-1">Best value for deep jobs</div>
                  </button>
                </div>

                {duration === 'hourly' && (
                  <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-700">Estimated Hours:</span>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4].map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setHours(h)}
                          className={'w-8 h-8 rounded-lg font-bold text-xs transition ' + (
                            hours === h ? 'bg-teal-700 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          )}
                        >
                          {h}h
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 4: Service Address */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Service Location & Address *
                </label>
                <textarea
                  rows={2}
                  value={serviceAddress}
                  onChange={(e) => setServiceAddress(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm font-medium border border-slate-200 rounded-xl outline-none focus:border-teal-600 transition text-slate-900"
                />
              </div>

              {/* Step 5: Trust-First Payment & Safety Option */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">
                    Payment Preference & Protection (भुगतान विकल्प) *
                  </label>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    SahYog Safe Shield
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentTiming('AFTER_SERVICE')}
                    className={'p-4 rounded-2xl border text-left transition relative cursor-pointer ' + (
                      paymentTiming === 'AFTER_SERVICE'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    )}
                  >
                    <span className="absolute -top-2.5 right-3 bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wide flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      ₹0 Upfront • Recommended
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <Check className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">Pay After Service / Upon Arrival</div>
                        <div className="text-[11px] text-emerald-700 font-bold mt-0.5">Pay ₹0 today</div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                      A secret 4-Digit Arrival OTP verifies your partner at the door. Pay via 5-min UPI QR or Cash only after work is completed!
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentTiming('PAY_NOW')}
                    className={'p-4 rounded-2xl border text-left transition relative cursor-pointer ' + (
                      paymentTiming === 'PAY_NOW'
                        ? 'border-teal-600 bg-teal-50/70 shadow-sm ring-2 ring-teal-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    )}
                  >
                    <span className="absolute -top-2.5 right-3 bg-teal-700 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wide">
                      Escrow Protection
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                        <CreditCard className="w-4 h-4 text-teal-700" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">Pay Online Now</div>
                        <div className="text-[11px] text-teal-700 font-bold mt-0.5">5-Minute UPI QR Code</div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                      Money held in SahYog Escrow and released only after Arrival OTP is verified. 100% instant refund if worker cancels.
                    </p>
                  </button>
                </div>
              </div>

              {/* Step 6: Price Breakdown Box */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Professional Service Fee:</span>
                  <span className="font-bold text-slate-800">₹{calculation.serviceFee}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>SahYog Platform Trust Fee:</span>
                  <span className="font-bold text-slate-800">₹{calculation.platformFee}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (18%):</span>
                  <span className="font-bold text-slate-800">₹{calculation.gst}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
                  <span>Total Amount Payable:</span>
                  <span className="text-teal-700 text-lg">₹{calculation.total}</span>
                </div>
                {paymentTiming === 'AFTER_SERVICE' && (
                  <div className="text-[11px] font-bold text-emerald-800 bg-emerald-100/60 px-3 py-1.5 rounded-lg text-center mt-1">
                    Due after service completion • ₹0 payable right now
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button
                type="button"
                disabled={loading}
                onClick={handleProceedToPayment}
                className={`w-full font-black py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-60 ${
                  paymentTiming === 'AFTER_SERVICE'
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-900/10'
                    : 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-900/10'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Confirming Booking with OTP Security...</span>
                  </>
                ) : paymentTiming === 'AFTER_SERVICE' ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-amber-300" />
                    <span>Confirm Booking (Pay ₹{calculation.total} After Service)</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Proceed to 5-Min UPI QR Payment (₹{calculation.total})</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
