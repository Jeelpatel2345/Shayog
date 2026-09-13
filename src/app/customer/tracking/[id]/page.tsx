'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Bell, CheckCircle, Phone, MessageSquare, MapPin, 
  ShieldCheck, Info, User, XCircle, AlertTriangle 
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
  const otpDigits = ['5', '8', '2', '1'];

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

          {/* Status Card */}
          <div className="px-4 -mt-4 relative z-10">
            <div className="bg-white rounded-xl shadow-md p-4 border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  <span className="font-bold text-sm">Worker is on the way</span>
                </div>
                <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold">HEADING</span>
              </div>
              <p className="text-sm text-gray-500 ml-7">3.4 km away • ~12 mins arrival</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="bg-teal-600 h-2 rounded-full" style={{ width: '65%' }} />
                </div>
                <span className="text-xs font-semibold text-gray-600">65%</span>
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

          {/* OTP Section */}
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
