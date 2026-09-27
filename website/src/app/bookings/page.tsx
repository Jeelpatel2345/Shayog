'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Calendar, Clock, MapPin, CheckCircle, ArrowRight, 
  ShieldCheck, AlertCircle, Sparkles, ChevronRight, Phone, 
  Navigation, RefreshCw, MessageSquare, RotateCcw 
} from 'lucide-react';
import WorkerChatDrawer from '@/components/WorkerChatDrawer';

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedChatBooking, setSelectedChatBooking] = useState<any | null>(null);

  const loadBookings = () => {
    let localList: any[] = [];
    if (typeof window !== 'undefined') {
      const logged = localStorage.getItem('sahyog-logged-in') === 'true';
      if (!logged) {
        router.replace('/login?redirect=/bookings');
        return;
      }
      try {
        const raw = localStorage.getItem('sahyog-user-bookings');
        if (raw) {
          localList = JSON.parse(raw);
          setBookings(localList);
        }
      } catch {}
    }

    fetch('/api/bookings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const dbBookings = data?.bookings || (Array.isArray(data) ? data : []);
        const map = new Map();
        localList.forEach((b: any) => map.set(b.id, b));
        dbBookings.forEach((b: any) => {
          map.set(b.id, {
            ...b,
            serviceCode: b.bookingCode || b.serviceCode || ('SY-' + b.id.slice(0, 4)),
            serviceName: b.serviceTitle || b.serviceName,
            bookingDate: b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Upcoming',
            bookingTime: b.scheduledTime || '10:00 AM',
            address: b.serviceLocation || b.address || 'Ahmedabad, Gujarat',
          });
        });
        setBookings(Array.from(map.values()));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filtered = bookings.filter((b) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ACTIVE') return b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS' || b.status === 'PENDING';
    if (activeTab === 'COMPLETED') return b.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Service Bookings</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track your appointments, real-time worker GPS, and safety OTP codes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadBookings}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition text-xs font-bold flex items-center gap-1.5"
              title="Refresh Bookings"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <Link
              href="/services"
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Book Another Service</span>
            </Link>
          </div>
        </div>

        {/* Tab Filter */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit shadow-xs">
          {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={'text-xs font-bold px-5 py-2 rounded-xl transition ' + (
                activeTab === tab
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              {tab === 'ALL' ? `All (${bookings.length})` : tab === 'ACTIVE' ? 'Active / In Progress' : 'Completed'}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        #{b.serviceCode || b.bookingCode || b.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className={'text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ' + (
                        b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      )}>
                        {b.status}
                      </span>
                      {b.status !== 'COMPLETED' && (
                        <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-amber-600" />
                          Arrival OTP: {b.workerOtp || '5821'}
                        </span>
                      )}
                      {b.paymentTiming === 'AFTER_SERVICE' && b.status !== 'COMPLETED' && (
                        <span className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-md">
                          Pay After Service
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{b.serviceName || b.serviceTitle || 'Home Service'}</h3>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-slate-400 block font-medium">Total Payable</span>
                      <span className="text-xl font-black text-teal-800">₹{b.totalAmount}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {b.status === 'COMPLETED' ? (
                        <>
                          <a
                            href={`tel:${b.workerPhone || '+919876543210'}`}
                            className="p-2.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded-xl border border-slate-200 transition flex items-center gap-1.5 text-xs font-bold"
                            title="Call Worker / Partner"
                          >
                            <Phone className="w-3.5 h-3.5 text-teal-600" />
                            <span>Call</span>
                          </a>

                          <button
                            onClick={() => setSelectedChatBooking(b)}
                            className="p-2.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded-xl border border-slate-200 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                            title="Chat with assigned partner"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                            <span>Chat</span>
                          </button>

                          <Link
                            href="/services"
                            className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-black px-3.5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5"
                            title="Book service again"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Re-book</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <a
                            href={`tel:${b.workerPhone || '+919876543210'}`}
                            className="p-2.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded-xl border border-slate-200 transition flex items-center justify-center"
                            title="Call Worker"
                          >
                            <Phone className="w-3.5 h-3.5 text-teal-600" />
                          </a>

                          <button
                            onClick={() => setSelectedChatBooking(b)}
                            className="bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                            title="Chat with assigned partner"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                            <span>Chat</span>
                          </button>

                          <Link
                            href={`/tracking/${b.id}`}
                            className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Track Live GPS</span>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span><b>Date:</b> {b.bookingDate || 'Scheduled'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span><b>Time:</b> {b.bookingTime || '10:00 AM'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span><b>Safety Guard:</b> OTP 5821</span>
                  </div>
                </div>

                {b.address && (
                  <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{b.address}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-xs space-y-4 max-w-md mx-auto">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-slate-800">No bookings found</h3>
              <p className="text-xs text-slate-500 mt-1">
                When you book home services, they will appear right here with live GPS tracking.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs"
            >
              <span>Explore Services & Book</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Side Chat Drawer for Booking Partner */}
      {selectedChatBooking && (
        <WorkerChatDrawer
          isOpen={Boolean(selectedChatBooking)}
          onClose={() => setSelectedChatBooking(null)}
          workerName={selectedChatBooking.workerName || 'Sunita Mehra'}
          workerRole={selectedChatBooking.serviceName || selectedChatBooking.serviceTitle || 'Home Service Professional'}
          bookingCode={selectedChatBooking.serviceCode || selectedChatBooking.bookingCode || selectedChatBooking.id?.slice(0, 8).toUpperCase() || 'SY-9842'}
        />
      )}
    </div>
  );
}
