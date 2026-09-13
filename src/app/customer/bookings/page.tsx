'use client';
import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Bell, Calendar, MapPin, Clock, AlertTriangle, 
  CheckCircle2, XCircle, ChevronRight, ShieldCheck, User, 
  RotateCcw, Sparkles, Wrench, Zap, Search, Filter, Phone, MessageSquare
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import WorkerChatDrawer from '@/components/WorkerChatDrawer';

interface BookingItem {
  id: string;
  code: string;
  service: string;
  workerName: string;
  workerRole: string;
  dateTime: string;
  location: string;
  amount: number;
  status: 'IN_PROGRESS' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  otp?: string;
  categoryIcon: string;
}

const initialBookings: BookingItem[] = [
  {
    id: '1',
    code: 'SY-9021',
    service: 'Kitchen Sink Leak Repair',
    workerName: 'Rajesh Kumar',
    workerRole: 'Master Plumber (⭐4.8)',
    dateTime: 'Today • 10:30 AM',
    location: 'Sector 45, Gurgaon, Haryana',
    amount: 650,
    status: 'IN_PROGRESS',
    otp: '5821',
    categoryIcon: 'wrench'
  },
  {
    id: '2',
    code: 'SY-8823',
    service: 'Deep Home Cleaning (3BHK)',
    workerName: 'Sunita Mehra',
    workerRole: 'Cleaning Expert (⭐4.9)',
    dateTime: 'Tomorrow • 10:00 AM',
    location: 'B/402, Shanti Heights, Ahmedabad',
    amount: 1250,
    status: 'CONFIRMED',
    otp: '3947',
    categoryIcon: 'sparkles'
  },
  {
    id: '3',
    code: 'BK-8291',
    service: 'MCB & Power Outlet Repair',
    workerName: 'Amit Shah',
    workerRole: 'Certified Electrician (⭐4.7)',
    dateTime: '15 Aug 2026 • 02:00 PM',
    location: 'Navrangpura, Ahmedabad',
    amount: 450,
    status: 'COMPLETED',
    categoryIcon: 'zap'
  }
];

export default function BookingsListPage() {
  const [bookings, setBookings] = useState<BookingItem[]>(initialBookings);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [cancellingBooking, setCancellingBooking] = useState<BookingItem | null>(null);
  const [selectedChatBooking, setSelectedChatBooking] = useState<BookingItem | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [cancelNotification, setCancelNotification] = useState<string | null>(null);

  const handleConfirmCancel = () => {
    if (!cancellingBooking) return;

    setBookings(prev => 
      prev.map(b => b.id === cancellingBooking.id ? { ...b, status: 'CANCELLED' } : b)
    );

    setCancelNotification(`Booking #${cancellingBooking.code} was cancelled. Full refund of ₹${cancellingBooking.amount} initiated to your original payment method.`);
    setCancellingBooking(null);
    setTimeout(() => setCancelNotification(null), 5000);
  };

  const filtered = bookings.filter(b => {
    if (activeTab === 'active') return b.status === 'IN_PROGRESS' || b.status === 'CONFIRMED';
    if (activeTab === 'completed') return b.status === 'COMPLETED' || b.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-32">
      {/* Top App Bar */}
      <div className="bg-white p-4 flex items-center justify-between border-b sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/customer/dashboard">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <h1 className="font-bold text-lg text-gray-900">My Bookings</h1>
        </div>
        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-xs">
          AS
        </div>
      </div>

      {cancelNotification && (
        <div className="bg-amber-600 text-white text-xs p-3 sticky top-[57px] z-30 flex items-start gap-2 shadow-md animate-fade-in">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="flex-1">{cancelNotification}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white px-4 py-2.5 border-b flex gap-2">
        {(['all', 'active', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold capitalize transition ${
              activeTab === tab
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3.5">
        {filtered.map((b) => {
          const isCancelled = b.status === 'CANCELLED';
          const isInProgress = b.status === 'IN_PROGRESS';
          const isConfirmed = b.status === 'CONFIRMED';

          return (
            <div key={b.id} className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">{b.service}</span>
                    <span className="text-xs text-teal-600 font-semibold">#{b.code}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{b.workerName} • {b.workerRole}</p>
                </div>

                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    isInProgress
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : isConfirmed
                      ? 'bg-teal-50 text-teal-700 border border-teal-200'
                      : isCancelled
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}
                >
                  {b.status.replace('_', ' ')}
                </span>
              </div>

              {/* Details */}
              <div className="py-3 space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>{b.dateTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">{b.location}</span>
                </div>
                {b.otp && !isCancelled && (
                  <div className="flex items-center gap-2 pt-1 text-teal-800 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>Arrival OTP: <span className="bg-teal-100 px-2 py-0.5 rounded text-teal-900 font-mono text-sm tracking-wider">{b.otp}</span></span>
                  </div>
                )}
              </div>

              {/* Price & Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase">Total Amount</span>
                  <span className="text-base font-bold text-gray-900">₹{b.amount}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Cancel Button on Active Bookings */}
                  {(isInProgress || isConfirmed) && (
                    <button
                      onClick={() => setCancellingBooking(b)}
                      className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}

                  {isInProgress && (
                    <Link
                      href={`/customer/tracking/${b.id}`}
                      className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-xs"
                    >
                      <span>Track Job &gt;</span>
                    </Link>
                  )}

                  {isConfirmed && (
                    <button
                      onClick={() => setSelectedChatBooking(b)}
                      className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-xs"
                    >
                      <span>Chat with Worker</span>
                    </button>
                  )}

                  {isCancelled && (
                    <span className="text-xs text-red-500 font-medium italic">
                      Cancelled & Refunded
                    </span>
                  )}

                  {b.status === 'COMPLETED' && (
                    <div className="flex items-center gap-1.5">
                      <a
                        href="tel:+919876543210"
                        className="p-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl flex items-center gap-1 transition"
                        title="Call Worker"
                      >
                        <Phone className="w-3.5 h-3.5 text-teal-600" />
                        <span>Call</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setSelectedChatBooking(b)}
                        className="p-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl flex items-center gap-1 transition cursor-pointer"
                        title="Chat with Worker"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                        <span>Chat</span>
                      </button>

                      <Link
                        href="/customer/services"
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition"
                      >
                        <RotateCcw className="w-3 h-3" /> Re-book
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel Booking Confirmation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2 text-red-600 font-bold">
                <AlertTriangle className="w-5 h-5" />
                <h3>Cancel Booking</h3>
              </div>
              <button onClick={() => setCancellingBooking(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="py-3 text-xs space-y-3">
              <p className="text-gray-700 font-medium">
                Are you sure you want to cancel booking <b>#{cancellingBooking.code}</b> ({cancellingBooking.service})?
              </p>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Reason for Cancellation:</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full border rounded-xl p-2 bg-gray-50 text-xs text-gray-800 outline-none"
                >
                  <option>Change of plans / Not at home</option>
                  <option>Worker is delayed</option>
                  <option>Booked by mistake</option>
                  <option>Found alternative local solution</option>
                  <option>Pricing dispute</option>
                </select>
              </div>

              <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 text-teal-800">
                <p className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-teal-600" /> SahYog 100% Refund Guarantee
                </p>
                <p className="text-[11px] text-teal-700 mt-1">
                  Your full amount of <b>₹{cancellingBooking.amount}</b> will be credited back instantly to your original payment method.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <button
                onClick={() => setCancellingBooking(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl text-xs hover:bg-gray-200"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl text-xs hover:bg-red-700 shadow-sm"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side Chat Drawer for Worker & Customer */}
      {selectedChatBooking && (
        <WorkerChatDrawer
          isOpen={Boolean(selectedChatBooking)}
          onClose={() => setSelectedChatBooking(null)}
          workerName={selectedChatBooking.workerName}
          workerRole={selectedChatBooking.workerRole}
          bookingCode={selectedChatBooking.code}
        />
      )}

      <BottomNav />
    </div>
  );
}
