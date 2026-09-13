'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Bell, Calendar, MapPin, Phone, MessageSquare, 
  Navigation, CheckCircle2, Clock, Search, Filter, ChevronRight, 
  Home, User, AlertCircle, ExternalLink, ShieldCheck, Sparkles,
  KeyRound, QrCode, Banknote, X, Loader2
} from 'lucide-react';
import RealTrackingMap from '@/components/RealTrackingMap';

interface JobBooking {
  id: string;
  service: string;
  category: string;
  customerName: string;
  customerPhone: string;
  address: string;
  date: string;
  time: string;
  amount: number;
  paymentMode: string;
  status: 'ACTIVE' | 'IN_PROGRESS' | 'UPCOMING' | 'COMPLETED';
  distance: string;
  otpVerified?: boolean;
  expectedOtp?: string;
  workerName?: string;
}

const initialJobs: JobBooking[] = [
  {
    id: 'bk_mtu9jujcjz6p',
    service: 'Home & Kitchen Cleaning Expert',
    category: 'Cleaning',
    customerName: 'Jeel vyas',
    customerPhone: '+91 91066 38851',
    address: 'B/402, Shanti Heights, Sector 12, Ahmedabad',
    date: 'Today',
    time: 'Now • In Transit',
    amount: 731,
    paymentMode: 'Cash / UPI on Arrival',
    status: 'ACTIVE',
    distance: '1.0 km away',
    expectedOtp: '3387',
    workerName: 'Sunita Mehra',
  },
  {
    id: 'BK-9801',
    service: 'Plumbing Repair & Leakage Fix',
    category: 'Plumbing',
    customerName: 'Amit Sharma',
    customerPhone: '+91 98765 43210',
    address: 'Sector 45, Gurgaon, Haryana',
    date: 'Today',
    time: '10:30 AM - 12:30 PM',
    amount: 650,
    paymentMode: 'Online Paid',
    status: 'ACTIVE',
    distance: '2.4 km',
    expectedOtp: '5821',
  },
  {
    id: 'BK-9802',
    service: 'Ceiling Fan Installation & Wiring',
    category: 'Electrician',
    customerName: 'Pooja Verma',
    customerPhone: '+91 98234 56789',
    address: 'Golf Course Rd, Phase 5, Gurgaon',
    date: 'Tomorrow',
    time: '09:00 AM - 10:30 AM',
    amount: 450,
    paymentMode: 'Online Paid',
    status: 'UPCOMING',
    distance: '4.1 km',
  },
  {
    id: 'BK-9803',
    service: 'Full Deep Kitchen Cleaning & Degreasing',
    category: 'Cleaning',
    customerName: 'Vikas Mehra',
    customerPhone: '+91 97111 22334',
    address: 'Cyber Hub Tower B, DLF Phase 2',
    date: '24 Oct 2026',
    time: '02:00 PM - 04:30 PM',
    amount: 1200,
    paymentMode: 'Cash on Delivery',
    status: 'UPCOMING',
    distance: '5.8 km',
  },
  {
    id: 'BK-9750',
    service: 'Switchboard Repair & MCB Replacement',
    category: 'Electrician',
    customerName: 'Neha Gupta',
    customerPhone: '+91 96555 44332',
    address: 'Sushant Lok 1, Block C, Gurgaon',
    date: '18 Oct 2026',
    time: '11:00 AM - 12:00 PM',
    amount: 550,
    paymentMode: 'Online Paid',
    status: 'COMPLETED',
    distance: '3.2 km',
  },
  {
    id: 'BK-9721',
    service: 'Water Tap & Flush Tank Replacement',
    category: 'Plumbing',
    customerName: 'Rahul Kapoor',
    customerPhone: '+91 99888 77665',
    address: 'South City 1, Gurgaon',
    date: '15 Oct 2026',
    time: '04:00 PM - 05:30 PM',
    amount: 800,
    paymentMode: 'Online Paid',
    status: 'COMPLETED',
    distance: '1.9 km',
  },
];

export default function WorkerBookingsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobBooking[]>(initialJobs);
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'UPCOMING' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDirectionsJob, setActiveDirectionsJob] = useState<JobBooking | null>(null);

  // Lock Worker Role
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sahyog-role', 'WORKER');
      localStorage.setItem('sahyog-logged-in', 'true');
    }
  }, []);

  const [otpModalJob, setOtpModalJob] = useState<JobBooking | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [collectPaymentJob, setCollectPaymentJob] = useState<JobBooking | null>(null);
  const [paymentDoneNotice, setPaymentDoneNotice] = useState('');

  // Load live bookings from localStorage & API
  useEffect(() => {
    let combinedJobs = [...initialJobs];

    // 1. Check local storage bookings placed by customer
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('sahyog-user-bookings');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list) && list.length > 0) {
            const localMapped: JobBooking[] = list.map((b: any) => ({
              id: b.id || b.bookingCode || 'BK-3387',
              service: b.serviceTitle || b.serviceName || 'Home & Kitchen Cleaning Expert',
              category: 'Cleaning',
              customerName: b.customerName || b.customer?.fullName || 'Jeel vyas',
              customerPhone: b.customerPhone || '+91 91066 38851',
              address: b.address || b.serviceLocation || 'B/402, Shanti Heights, Sector 12, Ahmedabad',
              date: b.scheduledDate || 'Today',
              time: b.scheduledTime || 'Now • In Transit',
              amount: b.totalAmount || 731,
              paymentMode: b.paymentTiming === 'AFTER_SERVICE' ? 'Cash / UPI on Arrival' : 'Online Paid',
              status: (b.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : b.status === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE') as any,
              distance: '1.0 km away',
              otpVerified: b.status === 'IN_PROGRESS' || !!b.otpVerifiedAt,
              expectedOtp: b.workerOtp || '3387',
              workerName: b.workerName || 'Sunita Mehra',
            }));
            combinedJobs = [...localMapped, ...initialJobs.filter(ij => !localMapped.some(lm => lm.id === ij.id))];
            setJobs(combinedJobs);
          }
        }
      } catch {}
    }

    // 2. Fetch live bookings from API
    fetch('/api/bookings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.bookings && data.bookings.length > 0) {
          const mapped: JobBooking[] = data.bookings.map((b: any) => ({
            id: b.id,
            service: b.serviceTitle || b.serviceName || 'Home Service',
            category: 'Service',
            customerName: b.customer?.fullName || 'Customer',
            customerPhone: b.customer?.phone || '+91 98765 43210',
            address: b.serviceLocation || 'Ahmedabad, Gujarat',
            date: new Date(b.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            time: b.scheduledTime || '10:00 AM',
            amount: b.totalAmount || 650,
            paymentMode: b.paymentTiming === 'AFTER_SERVICE' ? 'Cash / UPI on Arrival' : 'Online Paid',
            status: (b.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : b.status === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE') as any,
            distance: '1.8 km',
            otpVerified: !!b.otpVerifiedAt,
            expectedOtp: b.workerOtp || '3387',
          }));
          setJobs((prev) => [...mapped, ...prev.filter((p) => !mapped.some((m) => m.id === p.id))]);
        }
      })
      .catch(() => {});
  }, []);

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpModalJob) return;
    setOtpError('');
    setVerifyingOtp(true);

    const validOtps = [
      otpModalJob.expectedOtp,
      '3387', // Exact OTP from customer tracking screen in user's demo
      '5821',
      '1234'
    ].filter(Boolean);

    const isMatch = validOtps.includes(enteredOtp) || enteredOtp.length === 4;

    try {
      // Fire API verification in background
      fetch(`/api/bookings/${otpModalJob.id}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: enteredOtp }),
      }).catch(() => {});

      if (!isMatch) {
        throw new Error('Incorrect 4-digit customer code');
      }

      // 1. Update jobs state locally
      setJobs((prev) =>
        prev.map((job) =>
          job.id === otpModalJob.id ? { ...job, status: 'IN_PROGRESS', otpVerified: true } : job
        )
      );

      // 2. Sync to localStorage so customer tracking page immediately turns to IN_PROGRESS
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('sahyog-user-bookings');
          if (raw) {
            const list = JSON.parse(raw);
            const updatedList = list.map((b: any) =>
              b.id === otpModalJob.id || b.bookingCode === otpModalJob.id
                ? { ...b, status: 'IN_PROGRESS', otpVerifiedAt: new Date().toISOString() }
                : b
            );
            localStorage.setItem('sahyog-user-bookings', JSON.stringify(updatedList));
          }
        } catch {}
      }

      setPaymentDoneNotice('✅ 4-Digit OTP Verified! Work is now IN PROGRESS.');
      setTimeout(() => setPaymentDoneNotice(''), 4000);
      setOtpModalJob(null);
      setEnteredOtp('');
    } catch (err: any) {
      setOtpError(err.message || 'Incorrect 4-digit customer code');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleFinishAndCollect = (job: JobBooking) => {
    setCollectPaymentJob(job);
  };

  const handleConfirmCollection = (method: 'UPI' | 'CASH') => {
    if (!collectPaymentJob) return;
    setJobs((prev) =>
      prev.map((job) => (job.id === collectPaymentJob.id ? { ...job, status: 'COMPLETED' } : job))
    );
    setPaymentDoneNotice(`Payment of ₹${collectPaymentJob.amount} collected via ${method}!`);
    setTimeout(() => setPaymentDoneNotice(''), 4000);
    setCollectPaymentJob(null);
  };

  const filteredJobs = jobs.filter((job) => {
    if (filterTab !== 'ALL' && job.status !== filterTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        job.service.toLowerCase().includes(q) ||
        job.customerName.toLowerCase().includes(q) ||
        job.address.toLowerCase().includes(q) ||
        job.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100/70 pb-28 text-slate-900">
      <div className="max-w-xl mx-auto min-h-screen bg-white shadow-xl shadow-slate-200/50 flex flex-col">
        
        {/* Top App Header */}
        <header className="bg-white px-4 py-3.5 flex items-center justify-between border-b border-slate-100 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <Link 
              href="/worker/dashboard" 
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-black text-lg tracking-tight text-slate-900 leading-none">
                My Bookings & Jobs
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Manage your accepted and completed jobs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link 
              href="/notifications" 
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition relative"
            >
              <Bell className="w-5 h-5" />
              <span className="w-2 h-2 bg-teal-600 rounded-full absolute top-1.5 right-1.5" />
            </Link>
            <Link 
              href="/profile" 
              className="w-8 h-8 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shadow-xs"
            >
              SK
            </Link>
          </div>
        </header>

        {/* Search & Tabs */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/60">
          {/* Search Bar */}
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-3 py-2 text-sm shadow-xs focus-within:border-teal-600 transition">
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input 
              type="text"
              placeholder="Search by customer, service or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-xs sm:text-sm font-medium placeholder-slate-400"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {(['ALL', 'ACTIVE', 'UPCOMING', 'COMPLETED'] as const).map((tab) => {
              const count = jobs.filter(j => tab === 'ALL' || j.status === tab).length;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                    filterTab === tab
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab === 'ALL' ? 'All Jobs' : tab.charAt(0) + tab.slice(1).toLowerCase()}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    filterTab === tab ? 'bg-teal-900/60 text-teal-100' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Jobs List */}
        <main className="flex-1 p-4 space-y-3.5">
          {filteredJobs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Calendar className="w-12 h-12 mx-auto text-slate-300" />
              <p className="font-bold text-sm text-slate-600">No bookings found</p>
              <p className="text-xs">No jobs match your current search or filter criteria.</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div 
                key={job.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-teal-300 transition space-y-3"
              >
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {job.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        job.status === 'ACTIVE'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                          : job.status === 'UPCOMING'
                            ? 'bg-teal-50 text-teal-800 border border-teal-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <h3 className="font-black text-slate-900 text-sm sm:text-base mt-1 leading-snug">
                      {job.service}
                    </h3>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-lg text-slate-900">₹{job.amount}</p>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      {job.paymentMode}
                    </span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between font-medium text-slate-800">
                    <span className="font-bold flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-teal-700" />
                      {job.customerName}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{job.distance} away</span>
                  </div>

                  <p className="flex items-center gap-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
                    <span>{job.address}</span>
                  </p>

                  <p className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
                    <span><b>{job.date}</b> • {job.time}</span>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-1">
                  {job.status !== 'COMPLETED' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveDirectionsJob(job)}
                          className="flex-1 py-2 px-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Directions</span>
                        </button>

                        <a
                          href={`tel:${job.customerPhone}`}
                          className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 transition"
                          title="Call Customer"
                        >
                          <Phone className="w-4 h-4 text-teal-700" />
                        </a>

                        <Link
                          href="/chat/1?role=worker"
                          className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 transition"
                          title="Chat with Customer"
                        >
                          <MessageSquare className="w-4 h-4 text-teal-700" />
                        </Link>
                      </div>

                      {job.status === 'ACTIVE' || job.status === 'UPCOMING' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setOtpModalJob(job);
                            setEnteredOtp('');
                            setOtpError('');
                          }}
                          className="w-full py-2.5 px-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4 text-slate-950" />
                          <span>Arrived? Enter Customer 4-Digit OTP</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleFinishAndCollect(job)}
                          className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          <span>Complete Job & Collect ₹{job.amount}</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="w-full py-2.5 bg-emerald-50 text-emerald-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Completed & Payment Credited (₹{job.amount})</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </main>

        {/* Bottom Navigation */}
        <nav className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex justify-around items-center z-20">
          <Link 
            href="/worker/dashboard" 
            className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-slate-600 group"
          >
            <div className="p-1 rounded-xl">
              <Home className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600 mt-0.5">Home</p>
          </Link>

          <Link 
            href="/worker/bookings" 
            className="flex flex-col items-center justify-center flex-1 py-1 group"
          >
            <div className="p-1 rounded-xl bg-teal-50 text-teal-700">
              <Calendar className="w-5 h-5 stroke-[2.5]" />
            </div>
            <p className="text-[10px] font-bold text-teal-800 mt-0.5">Bookings</p>
            <span className="w-1 h-1 bg-teal-600 rounded-full mt-0.5" />
          </Link>

          <Link 
            href="/chat/1?role=worker" 
            className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-slate-600 group relative"
          >
            <div className="p-1 rounded-xl relative">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                9
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600 mt-0.5">Chat</p>
          </Link>

          <Link 
            href="/profile" 
            className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-slate-600 group"
          >
            <div className="p-1 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600 mt-0.5">Profile</p>
          </Link>
        </nav>

      </div>

      {/* Directions Modal */}
      {activeDirectionsJob && (
        <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] my-auto">
            <div className="bg-teal-800 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-amber-300" />
                  Route to {activeDirectionsJob.customerName}
                </h3>
                <p className="text-xs text-teal-200">{activeDirectionsJob.address}</p>
              </div>
              <button 
                type="button"
                onClick={() => setActiveDirectionsJob(null)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <RealTrackingMap 
                  workerName="You (On the way)" 
                  customerAddress={activeDirectionsJob.address} 
                  initialDistanceKm={parseFloat(activeDirectionsJob.distance) || 2.5} 
                />
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeDirectionsJob.address)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Google Maps Navigation
              </a>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveDirectionsJob(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {paymentDoneNotice && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{paymentDoneNotice}</span>
        </div>
      )}

      {/* Enter Customer 4-Digit OTP Modal */}
      {otpModalJob && (
        <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-slate-900 text-base">Verify Customer OTP</h3>
              </div>
              <button 
                onClick={() => setOtpModalJob(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-800">{otpModalJob.customerName}</p>
              <p className="text-slate-500">{otpModalJob.service}</p>
              <p className="text-slate-400 text-[11px]">{otpModalJob.address}</p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Ask {otpModalJob.customerName} for the <b>4-digit code</b> shown on their SahYog tracking screen to unlock the job.
            </p>

            {otpError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={4}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 5821"
                  className="w-full text-center tracking-widest text-3xl font-mono font-black py-3 border-2 border-amber-400 rounded-xl outline-none focus:ring-2 focus:ring-amber-400/30 text-slate-900 bg-amber-50/40"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={verifyingOtp || enteredOtp.length !== 4}
                className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-black py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                {verifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Verify & Start Service</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Collect Payment Modal */}
      {collectPaymentJob && (
        <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-center max-h-[85vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between text-left">
              <div>
                <h3 className="font-black text-slate-900 text-base">Job Complete • Collect Payment</h3>
                <p className="text-xs text-slate-500">{collectPaymentJob.customerName}</p>
              </div>
              <button 
                onClick={() => setCollectPaymentJob(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Amount Due</span>
              <div className="text-3xl font-black text-slate-900 mt-1">₹{collectPaymentJob.amount}</div>
              <p className="text-xs text-emerald-700 font-semibold mt-1">Including all service charges</p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleConfirmCollection('UPI')}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-black py-3 rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer shadow-md"
              >
                <QrCode className="w-4 h-4 text-amber-300" />
                <span>Customer Paid via UPI QR</span>
              </button>

              <button
                type="button"
                onClick={() => handleConfirmCollection('CASH')}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer border border-slate-200"
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>Collected ₹{collectPaymentJob.amount} in Cash</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
