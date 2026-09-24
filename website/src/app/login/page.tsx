'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, Phone, CheckCircle, ArrowRight, Lock, 
  Loader2, Sparkles, User, AlertCircle, MessageSquare 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [role, setRole] = useState<'CUSTOMER' | 'WORKER'>('CUSTOMER');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');
  const [showTwilioNotification, setShowTwilioNotification] = useState(false);
  const [preferredWork, setPreferredWork] = useState<string[]>(['Electrician & Power']);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setReceivedOtp(data.otp);
      setShowTwilioNotification(true);
      setStep('OTP');
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (code: string) => {
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ''),
          otp: code,
          role,
          fullName: fullName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      const userFullName = data.user.fullName || fullName.trim() || ('User ' + phone.slice(-4));
      setAuth({
        userId: data.user.id,
        role: data.user.role,
        phone: data.user.phone,
        fullName: userFullName,
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('sahyog-user-name', userFullName);
        localStorage.setItem('sahyog-user-phone', data.user.phone);
        localStorage.setItem('sahyog-role', data.user.role || role);
        localStorage.setItem('sahyog-logged-in', 'true');
        if ((data.user.role || role) === 'WORKER') {
          localStorage.setItem('sahyog_preferred_work', JSON.stringify(preferredWork));
        }
      }

      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect verification code. Please check and retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) return;
    const clean = val.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = clean;
    setOtp(newOtp);

    if (clean && index < 3) {
      const next = document.getElementById('web-otp-' + (index + 1));
      next?.focus();
    }
    if (index === 3 && clean) {
      const fullCode = newOtp.join('');
      if (fullCode.length === 4) {
        setTimeout(() => handleVerifyOtp(fullCode), 150);
      }
    }
  };

  const handleAutoFill = () => {
    if (!receivedOtp) return;
    const digits = receivedOtp.split('').slice(0, 4);
    setOtp(digits);
    handleVerifyOtp(receivedOtp);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-8 relative">
      {/* Live Carrier SMS Push Notification Toast */}
      {showTwilioNotification && (
        <div className="fixed top-3 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md z-50 bg-slate-900/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-emerald-500/50 animate-in slide-in-from-top-4 flex items-start gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl flex-shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <div className="flex items-center justify-between gap-1">
              <p className="font-bold text-white flex items-center gap-1.5">
                <span>💬 MESSAGES • SahYog</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded font-mono font-bold">
                  Carrier SMS
                </span>
              </p>
              <span className="text-[10px] text-slate-400">now</span>
            </div>
            <p className="text-slate-200 mt-1 leading-relaxed text-xs">
              ✅ OTP sent to{' '}
              <span className="font-bold text-emerald-300">
                +91 {phone.replace(/\D/g,'').slice(-10).slice(0,5)} {phone.replace(/\D/g,'').slice(-10).slice(5)}
              </span>
              . Please check your SMS inbox. Valid for 10 minutes.
            </p>
          </div>
          <button
            onClick={() => setShowTwilioNotification(false)}
            className="text-slate-400 hover:text-white p-1"
          >
            ✕
          </button>
        </div>
      )}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Side: Brand & Benefits */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#022c2b] via-[#0d9488] to-[#042f2e] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 bg-amber-400 text-emerald-950 font-black rounded-xl flex items-center justify-center shadow-md text-sm">
                SY
              </div>
              <span className="font-black text-xl tracking-tight text-white">SahYog</span>
            </Link>

            <div className="space-y-2 pt-4">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Welcome to SahYog Portal
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                Connect your account securely to our live cloud network. Real-time booking tracking on all devices.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-emerald-100 bg-white/10 p-3 rounded-xl border border-white/10">
                <CheckCircle className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span>Instant 4-digit code sent directly to your phone</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-emerald-100 bg-white/10 p-3 rounded-xl border border-white/10">
                <Lock className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span>Encrypted live Neon PostgreSQL cloud security</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-emerald-100 bg-white/10 p-3 rounded-xl border border-white/10">
                <ShieldCheck className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span>Zero spam, zero unnecessary promotional calls</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-white/15 text-[11px] text-emerald-200 flex justify-between font-semibold">
            <span>256-Bit SSL Encrypted</span>
            <span>Made in Gujarat</span>
          </div>
        </div>

        {/* Right Side: Interactive Form */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-white">
          <div>
            {/* Role Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-8 border border-slate-200">
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={'flex-1 py-2 text-xs font-bold rounded-xl transition ' + (
                  role === 'CUSTOMER' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                )}
              >
                Customer Account
              </button>
              <button
                type="button"
                onClick={() => setRole('WORKER')}
                className={'flex-1 py-2 text-xs font-bold rounded-xl transition ' + (
                  role === 'WORKER' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                )}
              >
                Service Partner
              </button>
            </div>

            {errorMsg && (
              <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {step === 'PHONE' ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Sign in with Mobile OTP</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your phone number to receive a 4-digit verification code.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Your Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-3 text-xs sm:text-sm font-medium border border-slate-200 rounded-xl outline-none focus:border-teal-600 transition text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Mobile Phone Number *
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-xl px-3 focus-within:border-teal-600 transition">
                    <span className="text-xs font-bold text-slate-500 pr-2 border-r border-slate-200">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98765 43210"
                      maxLength={10}
                      required
                      className="w-full px-3 py-3 text-xs sm:text-sm font-medium outline-none text-slate-900"
                    />
                  </div>
                </div>

                {role === 'WORKER' && (
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      What type of work do you prefer to do? (पसंदीदा कार्य चुनें)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Select one or more trades you are skilled at:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Electrician & Power',
                        'Plumbing & Pipe Fitting',
                        'Home & Deep Cleaning',
                        'AC & Appliance Repair',
                        'Carpenter & Woodwork',
                        'Painting & Waterproofing',
                        'Water Tank Disinfection',
                        'Society Substation AMC'
                      ].map((trade) => {
                        const isSelected = preferredWork.includes(trade);
                        return (
                          <button
                            key={trade}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                if (preferredWork.length > 1) {
                                  setPreferredWork(preferredWork.filter((t) => t !== trade));
                                }
                              } else {
                                setPreferredWork([...preferredWork, trade]);
                              }
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
                              isSelected
                                ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}{trade}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending verification code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send 4-Digit Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900">Enter Verification Code</h3>
                    <button
                      onClick={() => setStep('PHONE')}
                      className="text-xs font-bold text-teal-700 hover:underline"
                    >
                      Change Phone
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Sent to <b>+91 {phone}</b>
                  </p>
                </div>


                {/* 4 Digit Boxes */}
                <div className="flex justify-center gap-3 sm:gap-4 my-6">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={'web-otp-' + idx}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && idx > 0) {
                          const prev = document.getElementById('web-otp-' + (idx - 1));
                          prev?.focus();
                        }
                      }}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-black rounded-2xl border-2 border-slate-200 focus:border-teal-600 outline-none text-slate-900 bg-slate-50 transition"
                    />
                  ))}
                </div>




                <button
                  type="button"
                  disabled={loading || otp.join('').length < 4}
                  onClick={() => handleVerifyOtp(otp.join(''))}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-6">
            By continuing, you agree to SahYog's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
