'use client';
import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Bell, CheckCircle2, ShieldCheck, Tag, Clock, 
  Calendar, Trash2, Check, Sparkles, AlertCircle, ChevronRight 
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';

interface NotificationItem {
  id: string;
  type: 'booking' | 'security' | 'offer' | 'system';
  title: string;
  desc: string;
  time: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'booking',
    title: 'Service Partner On The Way',
    desc: 'Amir Khan (Verified Professional) is heading to your address for Deep Cleaning. Estimated arrival in 15 mins.',
    time: '10 mins ago',
    read: false,
    actionUrl: '/customer/tracking/1',
    actionLabel: 'Track Partner'
  },
  {
    id: 'notif-2',
    type: 'security',
    title: '4-Digit Safety Completion OTP',
    desc: 'Your security release code is 5821. Share this with your partner only when the service is fully completed to your satisfaction.',
    time: '25 mins ago',
    read: false,
  },
  {
    id: 'notif-3',
    type: 'offer',
    title: 'Festival Special: Flat 20% OFF Active',
    desc: 'Use voucher code SAHYOG20 on your next booking of 4 hours or whole day package across any of our 6 service categories.',
    time: '2 hours ago',
    read: true,
    actionUrl: '/customer/services',
    actionLabel: 'Explore Services'
  },
  {
    id: 'notif-4',
    type: 'system',
    title: 'Account Successfully Connected to Cloud DB',
    desc: 'Your mobile profile is securely synchronized with our high-speed Neon cloud database.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 'notif-5',
    type: 'booking',
    title: 'Booking Confirmed #SY-9021',
    desc: 'Your service request for Deep Kitchen Cleaning has been accepted by top rated partner Rajesh Kumar.',
    time: 'Yesterday',
    read: true,
    actionUrl: '/customer/bookings',
    actionLabel: 'View Order'
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'booking' | 'security' | 'offer'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const isWorker = typeof window !== 'undefined' && localStorage.getItem('sahyog-role') === 'WORKER';
  const isCommunity = typeof window !== 'undefined' && localStorage.getItem('sahyog_worker_mode') === 'COMMUNITY';
  const backHref = isWorker ? (isCommunity ? '/worker/community' : '/worker/dashboard') : '/customer/dashboard';

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900">
      {/* Top Header */}
      <div className="bg-[#0f3854] text-white border-b border-emerald-900/60 sticky top-0 z-30 shadow-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={backHref}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-emerald-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-base sm:text-lg text-white leading-tight">
                Notifications Center
              </h1>
              <p className="text-[11px] text-emerald-300">
                {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 bg-white/10 px-3 py-1.5 rounded-lg transition"
              >
                Mark Read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-3 sm:px-6 pt-4 space-y-4">
        {/* Filter Chips */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'All Alerts' },
              { id: 'booking', label: 'Bookings' },
              { id: 'security', label: 'Security & OTP' },
              { id: 'offer', label: 'Offers' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ${
                  filter === t.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 font-semibold flex-shrink-0 px-2"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Notifications List */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((n) => {
              const iconBg =
                n.type === 'booking'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : n.type === 'security'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : n.type === 'offer'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200';

              const Icon =
                n.type === 'booking'
                  ? Calendar
                  : n.type === 'security'
                  ? ShieldCheck
                  : n.type === 'offer'
                  ? Tag
                  : Bell;

              return (
                <div
                  key={n.id}
                  className={`rounded-2xl p-4 border transition ${
                    n.read
                      ? 'bg-white border-slate-200/90 shadow-2xs'
                      : 'bg-teal-50/40 border-teal-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl border flex items-center justify-center flex-shrink-0 mt-0.5 ${iconBg}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-sm text-slate-900 truncate">
                          {n.title}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                          {n.time}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {n.desc}
                      </p>

                      {n.actionUrl && (
                        <div className="mt-2.5">
                          <Link
                            href={n.actionUrl}
                            className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 px-3 py-1 rounded-lg border border-teal-200/60"
                          >
                            <span>{n.actionLabel || 'View Details'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-800">No Notifications</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              You are completely up to date. Updates about your bookings and OTPs will appear here.
            </p>
          </div>
        )}
      </div>

      <BottomNav role="customer" />
    </div>
  );
}
