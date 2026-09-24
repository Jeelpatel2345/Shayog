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

export default function JobTrackingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isCancelled, setIsCancelled] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [liveJobStatus, setLiveJobStatus] = useState<'ARRIVING' | 'IN_PROGRESS' | 'COMPLETED'>('ARRIVING');
  const [liveToast, setLiveToast] = useState('');
  const [bookingData, setBookingData] = useState<any>(null);
  const [otpDigits, setOtpDigits] = useState<string[]>(['5', '8', '2', '1']);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['⏱️ On-Time Arrival', '🛠️ Expert Workmanship']);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check stored OTP fallback
    const storedOtp = localStorage.getItem('sahyog-active-booking-otp');
    if (storedOtp && storedOtp.length === 4) {
      setOtpDigits(storedOtp.split(''));
    }

    // Check stored status
    const storedStatus = localStorage.getItem('sahyog_active_job_status');
    if (storedStatus === 'IN_PROGRESS') setLiveJobStatus('IN_PROGRESS');
    if (storedStatus === 'COMPLETED') {
      setLiveJobStatus('COMPLETED');
      setShowFeedbackModal(true);
    }

    const fetchBooking = async () => {
      try {
        const lookupId = (params?.id && params.id !== '1') ? params.id : (localStorage.getItem('sahyog-active-booking-id') || params?.id || '1');
        const res = await fetch(`/api/bookings/${lookupId}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.booking) {
            setBookingData(data.booking);
            if (data.booking.workerOtp) {
              setOtpDigits(data.booking.workerOtp.split(''));
            }
            if (data.booking.status === 'IN_PROGRESS') {
              setLiveJobStatus('IN_PROGRESS');
            } else if (data.booking.status === 'COMPLETED') {
              setLiveJobStatus('COMPLETED');
              setShowFeedbackModal((prev) => {
                const alreadyRated = typeof window !== 'undefined' && localStorage.getItem(`sahyog-rated-${data.booking.id}`);
                if (!alreadyRated && !prev && !feedbackSubmitted) return true;
                return prev;
              });
            }
          }
        }
      } catch {}
    };

    fetchBooking();
    const pollInterval = setInterval(fetchBooking, 3000);

    const handleSync = (data: any) => {
      if (!data) return;
      if (data.type === 'JOB_STARTED') {
        setLiveJobStatus('IN_PROGRESS');
        setLiveToast('⚡ OTP Verified! Partner has started working.');
        setTimeout(() => setLiveToast(''), 5000);
      } else if (data.type === 'JOB_COMPLETED') {
        setLiveJobStatus('COMPLETED');
        setLiveToast('🎉 Service Completed! Please rate your partner.');
        setShowFeedbackModal(true);
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
      clearInterval(pollInterval);
      channel?.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [params?.id, feedbackSubmitted]);

  const handleConfirmCancel = () => {
    setIsCancelled(true);
    setShowCancelModal(false);
  };

  const currentWorkerName = bookingData?.workerProfile?.user?.fullName || bookingData?.workerName || 'Rajesh Kumar';
  const currentWorkerPhone = bookingData?.workerProfile?.user?.phone || bookingData?.workerPhone || '+919825101001';
  const currentServiceTitle = bookingData?.serviceTitle || 'Home Service';
  const currentServiceLocation = bookingData?.serviceLocation || 'B/402, Shanti Heights, Navrangpura, Ahmedabad';
  const currentBookingCode = bookingData?.bookingCode || '#SY-9842';
  const currentTotalAmount = bookingData?.totalAmount || 450;

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
          <User className="w-4 h-4" />
        </Link>
      </div>

      {isCancelled ? (
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Booking Cancelled</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
            Your booking #{currentBookingCode} has been cancelled. A 100% full refund of ₹{currentTotalAmount}.00 has been initiated to your UPI account.
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
            workerName={currentWorkerName} 
            customerAddress={currentServiceLocation}
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
                  <p className="font-bold text-sm">{currentWorkerName}</p>
                  <p className="text-xs text-gray-500">{currentServiceTitle} • ⭐4.9 (Verified Pro)</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`tel:${currentWorkerPhone}`} className="w-10 h-10 border rounded-xl flex items-center justify-center hover:bg-gray-50" title="Call Worker">
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
            <div className="mx-4 mt-4 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 rounded-2xl p-5 text-center text-white shadow-xl space-y-2 border border-teal-500/30">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto text-amber-300">
                <Star className="w-7 h-7 fill-amber-300" />
              </div>
              <p className="text-[11px] tracking-widest text-emerald-200 font-bold uppercase">SERVICE COMPLETED</p>
              <h3 className="text-base font-black text-white">Service Completed Successfully!</h3>
              <p className="text-xs text-emerald-100">Partner {currentWorkerName} has finished your service.</p>
              <button
                type="button"
                onClick={() => setShowFeedbackModal(true)}
                className="w-full mt-2 py-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Star className="w-4 h-4 fill-emerald-950" />
                <span>{feedbackSubmitted ? 'Review Submitted ✓' : 'Rate & Review Your Experience'}</span>
              </button>
            </div>
          ) : liveJobStatus === 'IN_PROGRESS' ? (
            <div className="mx-4 mt-4 bg-emerald-600 rounded-xl p-4 text-center text-white shadow-sm">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700/80 rounded-full text-xs font-bold text-emerald-100 mb-2">
                <CheckCircle className="w-3.5 h-3.5 text-white" /> OTP Verified Successfully
              </div>
              <p className="text-sm font-semibold">Service job is active and ongoing</p>
              <p className="text-xs text-emerald-100 mt-1">Once completed, you can provide ratings & review for {currentWorkerName}.</p>
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
              <span className="text-teal-600 text-xs font-semibold">Service Code: {currentBookingCode}</span>
            </div>
            <div className="bg-white rounded-xl p-4 border shadow-xs space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">{currentServiceTitle}</p>
                  <p className="text-xs text-gray-500">{currentServiceLocation}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t text-sm">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Direct Service Booking
                </p>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400">Total Price</p>
                  <p className="font-bold text-base text-gray-900">₹ {currentTotalAmount}.00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cancel Booking Section - STRICTLY ONLY SHOWN WHEN ARRIVING (BEFORE WORK STARTS) */}
          {liveJobStatus === 'ARRIVING' && (
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
          )}
        </>
      )}

      {/* Live Feedback & Rating Popup Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Rate Your Experience</h3>
                  <p className="text-[10px] text-slate-500">{currentWorkerName} • {currentServiceTitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="font-black text-slate-900 text-base">Thank You!</h4>
                <p className="text-xs text-slate-500">Your review was submitted directly to {currentWorkerName}&apos;s profile.</p>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setFeedbackSubmitting(true);
                const workerName = bookingData?.workerProfile?.user?.fullName || bookingData?.workerName || currentWorkerName;
                const workerProfileId = bookingData?.workerProfileId;

                try {
                  await fetch('/api/reviews', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      bookingId: bookingData?.id || params?.id,
                      workerProfileId,
                      workerName,
                      customerName: bookingData?.customer?.fullName || 'Verified Customer',
                      rating: feedbackRating,
                      comment: feedbackComment.trim() || 'Exceptional service, highly recommend this partner!',
                      tags: selectedTags,
                      recommended: true
                    })
                  });

                  if (typeof window !== 'undefined' && bookingData?.id) {
                    localStorage.setItem(`sahyog-rated-${bookingData.id}`, 'true');
                  }
                } catch {}

                setFeedbackSubmitting(false);
                setFeedbackSubmitted(true);
                setTimeout(() => {
                  setShowFeedbackModal(false);
                  router.push('/customer/dashboard');
                }, 1800);
              }} className="space-y-4">
                {/* 5-Star Selection */}
                <div className="text-center space-y-1">
                  <p className="text-xs font-bold text-slate-700">How was the service?</p>
                  <div className="flex justify-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFeedbackRating(s)}
                        className="p-1 cursor-pointer transition transform active:scale-90 hover:scale-110"
                      >
                        <Star className={`w-8 h-8 ${s <= feedbackRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-amber-600">
                    {feedbackRating === 5 ? '🌟 Exceptional (5.0)' : feedbackRating === 4 ? '👍 Very Good (4.0)' : feedbackRating === 3 ? '👌 Good (3.0)' : '⚠️ Needs Improvement'}
                  </span>
                </div>

                {/* Quick Compliment Tags */}
                <div>
                  <p className="text-[11px] font-bold text-slate-600 mb-1.5">What did you like best?</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['⏱️ On-Time Arrival', '🛠️ Expert Work', '🧹 Clean & Tidy', '🤝 Polite Behavior', '💰 Fair Price'].map((tag) => {
                      const isSel = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setSelectedTags(prev => isSel ? prev.filter(t => t !== tag) : [...prev, tag])}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition border ${
                            isSel ? 'bg-teal-700 text-white border-teal-700 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comment input */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Feedback / Comment (Optional)</label>
                  <textarea
                    rows={2}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Share any comments about the partner's service..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-600 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={feedbackSubmitting}
                  className="w-full py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {feedbackSubmitting ? 'Submitting Review...' : 'Submit Review to Partner ⭐'}
                </button>
              </form>
            )}
          </div>
        </div>
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
