'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Bell, CheckCircle, Phone, MessageSquare, MapPin, 
  ShieldCheck, Info, User, XCircle, AlertTriangle, Sparkles, Star
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';

import RealTrackingMap from '@/components/RealTrackingMap';
import WorkerChatDrawer from '@/components/WorkerChatDrawer';

export default function JobTrackingPage() {
  const router = useRouter();
  const [isCancelled, setIsCancelled] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [liveJobStatus, setLiveJobStatus] = useState<'ARRIVING' | 'IN_PROGRESS' | 'COMPLETED'>('ARRIVING');
  const [liveToast, setLiveToast] = useState('');
  const otpDigits = ['5', '8', '2', '1'];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check stored status
    const storedStatus = localStorage.getItem('sahyog_active_job_status');
    if (storedStatus === 'IN_PROGRESS') setLiveJobStatus('IN_PROGRESS');
    if (storedStatus === 'COMPLETED') setLiveJobStatus('COMPLETED');

    const handleSync = (data: any) => {
      if (!data) return;
      if (data.type === 'JOB_STARTED') {
        setLiveJobStatus('IN_PROGRESS');
        setLiveToast('⚡ OTP Verified! Partner has started working.');
        setTimeout(() => setLiveToast(''), 5000);
      } else if (data.type === 'JOB_COMPLETED') {
        setLiveJobStatus('COMPLETED');
        setLiveToast('🎉 Service Completed! Redirecting to Partner Review...');
        setTimeout(() => {
          router.push('/customer/dashboard');
        }, 2500);
      }
    };

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('sahyog-realtime-sync');
      channel.onmessage = (e) => {
        if (e.data) handleSync(e.data);
      };
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sahyog-realtime-event' && e.newValue) {
        try {
          handleSync(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      channel?.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [router]);

  const handleConfirmCancel = () => {
    setIsCancelled(true);
    setShowCancelModal(false);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-32 text-slate-900">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b sticky top-0 bg-white z-20 shadow-xs">
        <Link href="/customer/bookings" className="p-1.5 rounded-lg hover:bg-slate-100 transition">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <h1 className="font-bold text-lg flex-1 text-slate-900">Live Job Tracking</h1>
        <Link href="/notifications" className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-600">
          <Bell className="w-5 h-5" />
        </Link>
        <Link href="/profile" className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-800 font-bold text-xs">
          JP
        </Link>
      </div>

      {isCancelled ? (
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Booking Cancelled</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
            Your booking #SY-9842 has been cancelled. A 100% full refund of ₹450.00 has been initiated to your UPI account.
          </p>
          <div className="mt-6 space-y-2">
            <Link
              href="/customer/dashboard"
              className="block w-full py-3 bg-teal-600 text-white font-bold rounded-xl text-sm hover:bg-teal-700 transition"
            >
              Back to Home
            </Link>
            <Link
              href="/customer/bookings"
              className="block w-full py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition"
            >
              View My Bookings
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Real Interactive OpenStreetMap */}
          <RealTrackingMap 
            workerName="Rajesh Kumar (Master Plumber)" 
            customerAddress="B/402, Shanti Heights, Navrangpura, Ahmedabad"
            initialDistanceKm={2.4}
          />

          {/* Live Notification Banner */}
          {liveToast && (
            <div className="mx-4 mt-3 p-3 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-bounce z-30">
              <Sparkles className="w-4 h-4 text-yellow-300 flex-shrink-0" />
              <span>{liveToast}</span>
            </div>
          )}

          {/* Status Card */}
          <div className="px-4 -mt-4 relative z-10">
            <div className="bg-white rounded-xl shadow-md p-4 border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-5 h-5 ${liveJobStatus === 'COMPLETED' ? 'text-blue-600' : liveJobStatus === 'IN_PROGRESS' ? 'text-emerald-600' : 'text-teal-600'}`} />
                  <span className="font-bold text-sm">
                    {liveJobStatus === 'COMPLETED' 
                      ? 'Job Completed!' 
                      : liveJobStatus === 'IN_PROGRESS' 
                        ? '⚡ Service In Progress' 
                        : 'Worker is on the way'}
                  </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  liveJobStatus === 'COMPLETED'
                    ? 'bg-blue-50 text-blue-700'
                    : liveJobStatus === 'IN_PROGRESS'
                      ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                      : 'bg-teal-50 text-teal-700'
                }`}>
                  {liveJobStatus === 'COMPLETED' ? 'DONE' : liveJobStatus === 'IN_PROGRESS' ? 'ACTIVE' : 'HEADING'}
                </span>
              </div>
              <p className="text-sm text-gray-500 ml-7">
                {liveJobStatus === 'COMPLETED'
                  ? 'Work finished. Please rate your experience.'
                  : liveJobStatus === 'IN_PROGRESS'
                    ? 'Partner is currently working at your location.'
                    : '3.4 km away • ~12 mins arrival'}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      liveJobStatus === 'COMPLETED' 
                        ? 'bg-blue-600' 
                        : liveJobStatus === 'IN_PROGRESS' 
                          ? 'bg-emerald-500' 
                          : 'bg-teal-600'
                    }`} 
                    style={{ width: liveJobStatus === 'COMPLETED' ? '100%' : liveJobStatus === 'IN_PROGRESS' ? '100%' : '65%' }} 
                  />
                </div>
                <span className="text-xs font-semibold text-gray-600">
                  {liveJobStatus === 'COMPLETED' || liveJobStatus === 'IN_PROGRESS' ? '100%' : '65%'}
                </span>
              </div>
            </div>
          </div>

          {/* Worker Info */}
          <div className="px-4 mt-4">
            <div className="flex items-center justify-between bg-white rounded-xl p-4 border shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center relative">
                  <User className="w-6 h-6 text-teal-600" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-white" />
                </div>
                <div>
                  <p className="font-bold text-sm">Rajesh Kumar</p>
                  <p className="text-xs text-gray-500">Master Plumber • ⭐4.8 (124 jobs)</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a href="tel:+919123456789" className="w-10 h-10 border rounded-xl flex items-center justify-center hover:bg-gray-50" title="Call Worker">
                  <Phone className="w-4 h-4 text-teal-600" />
                </a>
                <button 
                  onClick={() => setIsChatDrawerOpen(true)}
                  className="w-10 h-10 border rounded-xl flex items-center justify-center hover:bg-teal-50 text-teal-600 transition" 
                  title="Chat with Worker"
                >
                  <MessageSquare className="w-4 h-4 text-teal-600" />
                </button>
              </div>
            </div>
          </div>

          {/* OTP Section or Completion Rating Prompt */}
          {liveJobStatus === 'COMPLETED' ? (
            <div className="mx-4 mt-4 bg-linear-to-r from-teal-700 to-emerald-700 rounded-xl p-5 text-center text-white shadow-md">
              <Sparkles className="w-8 h-8 mx-auto text-yellow-300 mb-1" />
              <h3 className="font-bold text-base">Service Completed Successfully!</h3>
              <p className="text-xs text-teal-100 mt-1 mb-3">Your feedback helps partners maintain top service quality.</p>
              <Link
                href="/customer/dashboard"
                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-white text-teal-800 font-bold rounded-xl text-sm shadow-md hover:bg-teal-50 transition"
              >
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Rate & Review Rajesh Now</span>
              </Link>
            </div>
          ) : liveJobStatus === 'IN_PROGRESS' ? (
            <div className="mx-4 mt-4 bg-emerald-600 rounded-xl p-4 text-center text-white shadow-sm">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700/80 rounded-full text-xs font-bold text-emerald-100 mb-2">
                <CheckCircle className="w-3.5 h-3.5 text-white" /> OTP Verified Successfully
              </div>
              <p className="text-sm font-semibold">Service job is active and ongoing</p>
              <p className="text-xs text-emerald-100 mt-1">Once completed, you can provide ratings & review for Rajesh.</p>
            </div>
          ) : (
            <div className="mx-4 mt-4 bg-teal-600 rounded-xl p-4 text-center text-white shadow-sm">
              <p className="text-xs tracking-widest text-teal-200 font-semibold mb-2">SHARE THIS OTP UPON ARRIVAL</p>
              <div className="flex justify-center gap-2 mb-2">
                {otpDigits.map((d, i) => (
                  <div key={i} className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${i % 2 === 0 ? 'bg-white text-teal-700' : 'bg-teal-500 text-white'}`}>
                    {d}
                  </div>
                ))}
              </div>
              <p className="text-xs text-teal-200 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> SahYog Safety Guard enabled
              </p>
            </div>
          )}

          {/* Job Details */}
          <div className="px-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm">Job Details</h3>
              <span className="text-teal-600 text-xs font-semibold">Service Code: #SY-9842</span>
            </div>
            <div className="bg-white rounded-xl p-4 border shadow-xs space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Kitchen Sink Leak Repair</p>
                  <p className="text-xs text-gray-500">Sector 14, Huda City, Gurgaon</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t text-sm">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Emergency repair
                </p>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400">Total Price</p>
                  <p className="font-bold text-base text-gray-900">₹ 450.00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cancel Booking Section */}
          <div className="px-4 mt-6">
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full py-3.5 border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-600 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel This Booking</span>
            </button>
            <p className="text-[11px] text-gray-400 text-center mt-1.5">
              100% full instant refund guaranteed under SahYog Trust Policy
            </p>
          </div>
        </>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl animate-fade-in">
            <div className="flex items-center gap-2 text-red-600 font-bold pb-2 border-b">
              <AlertTriangle className="w-5 h-5" />
              <h3>Cancel Booking #SY-9842</h3>
            </div>

            <div className="py-3 text-xs space-y-3">
              <p className="text-gray-700">Are you sure you want to cancel the plumbing repair service?</p>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Select reason:</label>
                <select 
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full border rounded-xl p-2 bg-gray-50 text-xs"
                >
                  <option>Change of plans / Not available</option>
                  <option>Worker is taking too long</option>
                  <option>Issue already resolved</option>
                  <option>Booked by mistake</option>
                </select>
              </div>

              <div className="p-2.5 bg-teal-50 border border-teal-100 rounded-xl text-teal-800 text-[11px]">
                <p className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Full Refund
                </p>
                <p className="mt-0.5">₹450 will be returned to your UPI handle within 15 minutes.</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl text-xs hover:bg-gray-200"
              >
                Keep
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2 bg-red-600 text-white font-bold rounded-xl text-xs hover:bg-red-700"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side Chat Drawer */}
      <WorkerChatDrawer
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        workerName="Rajesh Kumar"
        workerRole="Master Plumber"
        workerPhone="+91 91234 56789"
        bookingCode="SY-9842"
      />

      <BottomNav />
    </div>
  );
}
