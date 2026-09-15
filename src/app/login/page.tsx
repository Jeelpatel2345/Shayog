'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Globe, ChevronRight, Shield, Lock, CheckCircle, Smartphone, 
  Loader2, ArrowRight, Sparkles, MessageSquare, AlertCircle, RefreshCw, User, Briefcase,
  Users, Building2, Wrench, HardHat, Check, FileText, CheckSquare, Square, Stamp,
  Mail, MapPin, Calendar, PenTool
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { registeredSocieties, communityWorkerTypeOptions } from '@/data/communityData';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<'CUSTOMER' | 'WORKER'>('CUSTOMER');
  
  // Community Squad Options & Official Registration Form
  const [workerType, setWorkerType] = useState<'INDIVIDUAL' | 'COMMUNITY'>('INDIVIDUAL');
  
  // COMMUNITY DETAILS
  const [communityName, setCommunityName] = useState('Shanti Heights Resident Society');
  const [customCommunityName, setCustomCommunityName] = useState('');
  const [communityType, setCommunityType] = useState('Cooperative Housing Society');
  const [fullAddress, setFullAddress] = useState('Plot 42, Sector 12, Near Commerce Six Roads, Navrangpura');
  const [city, setCity] = useState('Ahmedabad');
  const [district, setDistrict] = useState('Ahmedabad Urban');
  const [stateName, setStateName] = useState('Gujarat');
  const [pincode, setPincode] = useState('380009');

  // AUTHORIZED REPRESENTATIVE
  const [repName, setRepName] = useState('Kiritbhai Shah');
  const [repDesignation, setRepDesignation] = useState('Chairman');
  const [repMobile, setRepMobile] = useState('+91 98250 11223');
  const [repEmail, setRepEmail] = useState('chairman@shantiheights.org');

  // WORKER TYPES IN COMMUNITY
  const [selectedWorkerTypes, setSelectedWorkerTypes] = useState<string[]>([
    'Water Tank & Plumbing Technicians',
    'Substation & High-Voltage Electricians',
    'Common Area Deep Jetting & Sanitization',
    'Lift, Elevator & DG Set Operators'
  ]);

  // SUPPORTING INFORMATION
  const [registrationNumber, setRegistrationNumber] = useState('GUJ/AHM/2018/4891');
  const [registrationAuthority, setRegistrationAuthority] = useState('District Registrar of Co-operative Societies, Ahmedabad');
  const [attachedProofs, setAttachedProofs] = useState<string[]>([
    'Registration Certificate',
    'Society/Association Document',
    'Cooperative Certificate'
  ]);
  const [hasCommunitySeal, setHasCommunitySeal] = useState(true);

  // COMMUNITY DECLARATION
  const [repSignature, setRepSignature] = useState('Kiritbhai R. Shah');
  const [declarationDate, setDeclarationDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [declarationAccepted, setDeclarationAccepted] = useState(true);

  // Squad specifics
  const [squadName, setSquadName] = useState('Shanti Heights Community Squad');
  const [crewSize, setCrewSize] = useState('4 Workers Squad');

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [receivedOtp, setReceivedOtp] = useState<string | null>(null);
  const [showTwilioNotification, setShowTwilioNotification] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Sync selected society with form fields
  const handleSelectSociety = (socName: string) => {
    setCommunityName(socName);
    if (socName === 'CUSTOM') {
      setCustomCommunityName('');
      return;
    }
    const soc = registeredSocieties.find(s => s.name === socName);
    if (soc) {
      setCommunityType(soc.communityType || 'Cooperative Housing Society');
      setFullAddress(soc.fullAddress || `${soc.locality}, ${soc.city}`);
      setCity(soc.city);
      setDistrict(soc.district || `${soc.city} Urban`);
      setStateName(soc.state || 'Gujarat');
      setPincode(soc.pincode || '380001');
      if (soc.authorizedRepresentative) {
        setRepName(soc.authorizedRepresentative.name);
        setRepDesignation(soc.authorizedRepresentative.designation);
        setRepMobile(soc.authorizedRepresentative.mobile);
        setRepEmail(soc.authorizedRepresentative.email);
      }
      if (soc.supportingInfo) {
        setRegistrationNumber(soc.supportingInfo.registrationNumber || soc.societyRegNo);
        setRegistrationAuthority(soc.supportingInfo.registrationAuthority || 'Registrar of Societies');
        setAttachedProofs(soc.supportingInfo.attachedProof || ['Registration Certificate']);
        setHasCommunitySeal(soc.supportingInfo.hasCommunitySeal ?? true);
      }
      if (soc.declaration) {
        setRepSignature(soc.declaration.signature);
        setDeclarationDate(soc.declaration.date || new Date().toISOString().split('T')[0]);
      }
      if (soc.availableWorkerTypes) {
        setSelectedWorkerTypes(soc.availableWorkerTypes);
      }
      setSquadName(`${soc.shortName} Community Squad`);
    }
  };

  // Auto-redirect if already logged in (critical for APK WebView experience)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const requestedRole = urlParams.get('role')?.toUpperCase();
      const isSwitch = urlParams.get('switch') === 'true';

      if (requestedRole === 'WORKER') {
        setSelectedRole('WORKER');
        localStorage.setItem('sahyog-role', 'WORKER');
      } else if (requestedRole === 'CUSTOMER') {
        setSelectedRole('CUSTOMER');
        localStorage.setItem('sahyog-role', 'CUSTOMER');
      }

      // Only auto-redirect if NOT switching accounts and NO explicit role was requested
      if (!isSwitch && !requestedRole) {
        const storedRole = localStorage.getItem('sahyog-role');
        const isLoggedIn = localStorage.getItem('sahyog-logged-in') === 'true';
        if (isLoggedIn) {
          if (storedRole === 'WORKER') {
            const isCommunity = localStorage.getItem('sahyog_worker_mode') === 'COMMUNITY';
            router.replace(isCommunity ? '/worker/community' : '/worker/dashboard');
            return;
          } else if (storedRole === 'ADMIN') {
            router.replace('/admin/overview');
            return;
          } else {
            router.replace('/customer/dashboard');
            return;
          }
        }
      }

      const storedRole = localStorage.getItem('sahyog-role');
      if (storedRole === 'WORKER') {
        setSelectedRole('WORKER');
      } else {
        setSelectedRole('CUSTOMER');
      }
    }
  }, [router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [otpSent, countdown]);

  const handleSendOtp = async () => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, fullName: fullName.trim(), role: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setOtpSent(true);
      setReceivedOtp(data.otp);
      setCountdown(30);
      setCanResend(false);
      setShowTwilioNotification(true);

      // Trigger genuine system notification if permitted
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('SahYog Verification', {
            body: `Your SahYog verification code is dispatched via Twilio SMS. Valid for 10 minutes.`,
            icon: '/logo.png',
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              new Notification('SahYog Verification', {
                body: `Your SahYog verification code is dispatched via Twilio SMS. Valid for 10 minutes.`,
                icon: '/logo.png',
              });
            }
          });
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otp.join('');
    if (code.length !== 4) {
      setErrorMsg('Please enter all 4 digits of the OTP');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const roleToSubmit = selectedRole || localStorage.getItem('sahyog-role') || 'CUSTOMER';
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          otp: code,
          role: roleToSubmit,
          fullName: fullName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Ensure if user selected WORKER tab, role is strictly WORKER
      const assignedRole = selectedRole === 'WORKER' ? 'WORKER' : (data.user.role || roleToSubmit);
      const userFullName = fullName.trim() || data.user.fullName || (assignedRole === 'WORKER' ? 'Jaymeen Patel' : `User ${phone.slice(-4)}`);
      
      setAuth({
        userId: data.user.id,
        role: assignedRole,
        phone: data.user.phone,
        fullName: userFullName,
      });

      // Save to localStorage for instant persistence across reloads
      localStorage.setItem('sahyog-user-name', userFullName);
      localStorage.setItem('sahyog-user-phone', data.user.phone);
      localStorage.setItem('sahyog-role', assignedRole);
      localStorage.setItem('sahyog-logged-in', 'true');

      // Auto-register worker in DB & local store so search finds them immediately!
      if (assignedRole === 'WORKER') {
        const finalCommunity = (communityName === 'CUSTOM' ? customCommunityName : communityName) || 'Shanti Heights Resident Society';
        const finalSquad = squadName.trim() || `${finalCommunity} Squad`;

        try {
          await fetch('/api/workers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fullName: userFullName,
              phone: data.user.phone,
              city: workerType === 'COMMUNITY' ? finalCommunity : 'Ahmedabad',
              skills: workerType === 'COMMUNITY' ? selectedWorkerTypes : ['Home Specialist', 'Electrician', 'Plumber'],
              hourlyRate: workerType === 'COMMUNITY' ? 450 : 350,
              bio: workerType === 'COMMUNITY' 
                ? `Authorized Representative & Lead for ${finalCommunity} (${crewSize}, Type: ${communityType})`
                : 'Verified professional home service partner on SahYog.',
            }),
          });
        } catch {}

        if (workerType === 'COMMUNITY') {
          const communityProfile = {
            communityName: finalCommunity,
            communityType,
            fullAddress,
            city,
            district,
            state: stateName,
            pincode,
            authorizedRepresentative: {
              name: repName || userFullName,
              designation: repDesignation,
              mobile: repMobile || data.user.phone,
              email: repEmail,
            },
            declaration: {
              statement: 'I declare that I am authorized to represent the above-mentioned community and that the information provided is true and correct.',
              signature: repSignature || userFullName,
              date: declarationDate,
              isAccepted: declarationAccepted,
            },
            supportingInfo: {
              registrationNumber,
              registrationAuthority,
              attachedProof: attachedProofs,
              representativeSignature: repSignature || userFullName,
              hasCommunitySeal,
            },
            availableWorkerTypes: selectedWorkerTypes,
            squadName: finalSquad,
            crewSize,
          };

          localStorage.setItem('sahyog_worker_mode', 'COMMUNITY');
          localStorage.setItem('sahyog_squad_name', finalSquad);
          localStorage.setItem('sahyog_society_name', finalCommunity);
          localStorage.setItem('sahyog_registered_community', JSON.stringify(communityProfile));
          router.push('/worker/community');
          return;
        } else {
          localStorage.removeItem('sahyog_worker_mode');
          router.push('/worker/dashboard');
          return;
        }
      }

      if (assignedRole === 'ADMIN') {
        router.push('/admin/overview');
      } else {
        router.push('/customer/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const clean = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = clean;
    setOtp(newOtp);

    if (clean && index < 3) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
    if (index === 3 && clean) {
      const fullCode = newOtp.join('');
      if (fullCode.length === 4) {
        setTimeout(() => handleVerifyOtp(fullCode), 200);
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
    <div className="min-h-screen bg-white md:bg-slate-900 flex items-center justify-center md:p-6 relative">
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

      <div className="w-full max-w-4xl bg-white md:rounded-3xl md:shadow-2xl overflow-hidden md:border md:border-slate-200 grid grid-cols-1 md:grid-cols-2 min-h-[580px]">
        {/* Left Hero & Security Banner */}
        <div className="bg-gradient-to-br from-[#042f2e] via-[#0d9488] to-[#042f2e] text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="SahYog" className="w-10 h-10 rounded-full object-cover shadow-md" />
                <div>
                  <h2 className="font-black text-lg tracking-tight text-white leading-none">SahYog</h2>
                  <span className="text-[10px] text-emerald-200 uppercase tracking-wider font-semibold">Neon Cloud Verified</span>
                </div>
              </div>

              <Link href="/welcome" className="text-xs text-emerald-200 hover:text-white font-semibold">
                ← Back
              </Link>
            </div>

            <div className="mt-8">
              <h1 className="text-2xl sm:text-3xl font-black leading-tight text-white">
                One-Time Password (OTP) Login
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
                Connect your account securely to our live cloud database. Your profile data syncs in real time across devices.
              </p>
            </div>

            <div className="mt-6 space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs bg-white/10 p-2.5 rounded-xl border border-white/10">
                <CheckCircle className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span>Instant 4-digit code directly to your phone</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs bg-white/10 p-2.5 rounded-xl border border-white/10">
                <Lock className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span>Encrypted live Neon PostgreSQL synchronization</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 mt-6 border-t border-white/15 flex justify-around text-center text-[10px] text-emerald-200 font-bold">
            <div><p className="text-white">VERIFIED</p><p className="text-emerald-300/80">Phone Auth</p></div>
            <div><p className="text-white">ENCRYPTED</p><p className="text-emerald-300/80">SSL 256-Bit</p></div>
            <div><p className="text-white">CLOUD DB</p><p className="text-emerald-300/80">Neon Postgres</p></div>
          </div>
        </div>

        {/* Right Interactive Form Card */}
        <div className="p-4 sm:p-7 flex flex-col justify-between bg-white max-h-[92vh] overflow-y-auto no-scrollbar">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                {otpSent ? 'Step 2: Enter 4-Digit Code' : 'Step 1: Your Details'}
              </span>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
                <Globe className="w-3.5 h-3.5 text-teal-700" />
                <span>India (+91)</span>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {otpSent ? 'Enter Verification Code' : 'Sign In / Register'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {otpSent
                ? `Enter the 4-digit code sent to +91 ${phone.slice(0, 5)} ${phone.slice(5)}`
                : 'Enter your name and 10-digit mobile number to access your account.'}
            </p>

            {/* Role Switcher Tabs */}
            {!otpSent && (
              <div className="mt-3.5 p-1 bg-slate-100 rounded-2xl flex border border-slate-200 shadow-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('CUSTOMER');
                    if (typeof window !== 'undefined') localStorage.setItem('sahyog-role', 'CUSTOMER');
                  }}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    selectedRole === 'CUSTOMER'
                      ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span>Customer (ग्राहक)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('WORKER');
                    if (typeof window !== 'undefined') localStorage.setItem('sahyog-role', 'WORKER');
                  }}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    selectedRole === 'WORKER'
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-amber-300" />
                  <span>Service Partner (कामगार)</span>
                </button>
              </div>
            )}

            {/* Worker Service Mode: Individual vs Community Squad */}
            {!otpSent && selectedRole === 'WORKER' && (
              <div className="mt-3 p-1 bg-slate-100/90 rounded-2xl flex border border-slate-200 gap-1 animate-in fade-in">
                <button
                  type="button"
                  onClick={() => setWorkerType('INDIVIDUAL')}
                  className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 ${
                    workerType === 'INDIVIDUAL'
                      ? 'bg-white text-teal-900 shadow-xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 text-teal-600" />
                  <span>Individual Partner</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWorkerType('COMMUNITY')}
                  className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 ${
                    workerType === 'COMMUNITY'
                      ? 'bg-amber-400 text-teal-950 shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-teal-950" />
                  <span>Community Squad</span>
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {!otpSent ? (
              <div className="mt-5 space-y-3.5">
                {/* Full Name Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {selectedRole === 'WORKER' && workerType === 'COMMUNITY'
                      ? 'Squad Leader / Supervisor Name (पर्यवेक्षक का नाम)'
                      : 'Your Full Name (आपका नाम / તમારું નામ)'}
                  </label>
                  <div className="flex items-center border-2 border-slate-200 focus-within:border-teal-600 rounded-2xl p-2.5 transition bg-slate-50/50">
                    <User className="w-4 h-4 text-slate-400 ml-1 mr-2 flex-shrink-0" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={selectedRole === 'WORKER' && workerType === 'COMMUNITY' ? 'e.g. Jaymeen Patel' : 'e.g. Jeel Patel'}
                      className="w-full bg-transparent outline-none text-sm font-semibold text-slate-900 placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Mobile Number Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mobile Number (मोबाइल नंबर)
                  </label>
                  <div className="flex items-center border-2 border-slate-200 focus-within:border-teal-600 rounded-2xl p-2.5 transition bg-slate-50/50">
                    <span className="font-bold text-slate-700 px-2 text-sm border-r border-slate-300 mr-2">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      maxLength={14}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter 10-digit number"
                      className="w-full bg-transparent outline-none text-sm font-semibold text-slate-900 tracking-wider placeholder-slate-400"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Example: 9876543210</p>
                </div>

                {/* Community Specific Details */}
                {selectedRole === 'WORKER' && workerType === 'COMMUNITY' && (
                  <div className="p-3 sm:p-4 bg-slate-50 rounded-2xl border-2 border-amber-300 space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                      <div className="flex items-center gap-1.5 text-teal-950 text-xs font-black">
                        <Building2 className="w-4 h-4 text-amber-600" />
                        <span>OFFICIAL COMMUNITY REGISTRATION</span>
                      </div>
                      <span className="text-[10px] bg-amber-400 text-teal-950 font-black px-2 py-0.5 rounded-md">
                        Authorized Portal
                      </span>
                    </div>

                    {/* SECTION 1: COMMUNITY DETAILS */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-teal-900 tracking-wider">
                        <Building2 className="w-3.5 h-3.5 text-teal-700" />
                        <span>COMMUNITY DETAILS</span>
                      </div>

                      {/* Community Name Selector */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Community Name:
                        </label>
                        <select
                          value={communityName}
                          onChange={(e) => handleSelectSociety(e.target.value)}
                          className="w-full border border-slate-300 bg-white rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600"
                        >
                          {registeredSocieties.map((s) => (
                            <option key={s.id} value={s.name}>
                              {s.name} ({s.locality}, {s.city})
                            </option>
                          ))}
                          <option value="CUSTOM">Other / Custom Community Name...</option>
                        </select>
                        {communityName === 'CUSTOM' && (
                          <input
                            type="text"
                            value={customCommunityName}
                            onChange={(e) => setCustomCommunityName(e.target.value)}
                            placeholder="Enter Community Name"
                            className="w-full mt-2 border border-slate-300 bg-white rounded-xl p-2 text-xs font-semibold text-slate-900 outline-none focus:border-teal-600"
                          />
                        )}
                      </div>

                      {/* Community Type */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Community Type:
                        </label>
                        <select
                          value={communityType}
                          onChange={(e) => setCommunityType(e.target.value)}
                          className="w-full border border-slate-300 bg-white rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600"
                        >
                          <option value="Cooperative Housing Society">Cooperative Housing Society</option>
                          <option value="Gated Residential Society">Gated Residential Society</option>
                          <option value="Apartment Owners Association (AOA)">Apartment Owners Association (AOA)</option>
                          <option value="Commercial Complex / Tech Park">Commercial Complex / Tech Park</option>
                          <option value="Township / Mixed Development">Township / Mixed Development</option>
                        </select>
                      </div>

                      {/* Full Address */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Full Address:
                        </label>
                        <input
                          type="text"
                          value={fullAddress}
                          onChange={(e) => setFullAddress(e.target.value)}
                          placeholder="Building, street, landmark"
                          className="w-full border border-slate-300 bg-white rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600"
                        />
                      </div>

                      {/* City & District */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            City:
                          </label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full border border-slate-300 bg-white rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            District:
                          </label>
                          <input
                            type="text"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="w-full border border-slate-300 bg-white rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600"
                          />
                        </div>
                      </div>

                      {/* State & PIN Code */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            State:
                          </label>
                          <input
                            type="text"
                            value={stateName}
                            onChange={(e) => setStateName(e.target.value)}
                            className="w-full border border-slate-300 bg-white rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            PIN Code:
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                            placeholder="e.g. 380009"
                            className="w-full border border-slate-300 bg-white rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: AUTHORIZED REPRESENTATIVE */}
                    <div className="space-y-2.5 pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-teal-900 tracking-wider">
                        <User className="w-3.5 h-3.5 text-teal-700" />
                        <span>AUTHORIZED REPRESENTATIVE</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Name:
                          </label>
                          <input
                            type="text"
                            value={repName}
                            onChange={(e) => setRepName(e.target.value)}
                            placeholder="Full name of representative"
                            className="w-full border border-slate-300 bg-white rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Designation/Role:
                          </label>
                          <input
                            type="text"
                            value={repDesignation}
                            onChange={(e) => setRepDesignation(e.target.value)}
                            placeholder="e.g. Chairman / Secretary / Estate Manager"
                            className="w-full border border-slate-300 bg-white rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Mobile Number:
                          </label>
                          <input
                            type="tel"
                            value={repMobile}
                            onChange={(e) => setRepMobile(e.target.value)}
                            placeholder="+91 98250 11223"
                            className="w-full border border-slate-300 bg-white rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Email:
                          </label>
                          <input
                            type="email"
                            value={repEmail}
                            onChange={(e) => setRepEmail(e.target.value)}
                            placeholder="representative@community.org"
                            className="w-full border border-slate-300 bg-white rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: WORKER TYPES IN COMMUNITY */}
                    <div className="space-y-2.5 pt-3 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-teal-900 tracking-wider">
                          <Wrench className="w-3.5 h-3.5 text-amber-600" />
                          <span>WORKER TYPES IN COMMUNITY</span>
                        </div>
                        <span className="text-[10px] font-bold text-teal-700">
                          {selectedWorkerTypes.length} Selected
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Select all worker specialties available in your community squad:
                      </p>

                      <div className="space-y-1.5">
                        {communityWorkerTypeOptions.map((typeOption) => {
                          const isSelected = selectedWorkerTypes.includes(typeOption);
                          return (
                            <button
                              key={typeOption}
                              type="button"
                              onClick={() => {
                                setSelectedWorkerTypes(prev =>
                                  isSelected ? prev.filter(t => t !== typeOption) : [...prev, typeOption]
                                );
                              }}
                              className={`w-full text-left p-2 rounded-xl text-xs font-medium border flex items-center gap-2.5 transition cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-50 border-amber-400 text-teal-950 font-bold shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-amber-600 flex-shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300 flex-shrink-0" />
                              )}
                              <span>{typeOption}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* SECTION 4: SUPPORTING INFORMATION */}
                    <div className="space-y-2.5 pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-teal-900 tracking-wider">
                        <FileText className="w-3.5 h-3.5 text-teal-700" />
                        <span>SUPPORTING INFORMATION</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Registration Number (if applicable):
                          </label>
                          <input
                            type="text"
                            value={registrationNumber}
                            onChange={(e) => setRegistrationNumber(e.target.value)}
                            placeholder="e.g. GUJ/AHM/2018/4891"
                            className="w-full border border-slate-300 bg-white rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Registration Authority (if applicable):
                          </label>
                          <input
                            type="text"
                            value={registrationAuthority}
                            onChange={(e) => setRegistrationAuthority(e.target.value)}
                            placeholder="e.g. Registrar of Co-op Societies"
                            className="w-full border border-slate-300 bg-white rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600"
                          />
                        </div>
                      </div>

                      {/* Attached Supporting Proof */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                          Attached Supporting Proof:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {[
                            'Registration Certificate',
                            'Society/Association Document',
                            'Cooperative Certificate',
                            'Local Authority Document',
                            'Other Official Document',
                            'Not Applicable'
                          ].map((proof) => {
                            const isChecked = attachedProofs.includes(proof);
                            return (
                              <button
                                key={proof}
                                type="button"
                                onClick={() => {
                                  if (proof === 'Not Applicable') {
                                    setAttachedProofs(['Not Applicable']);
                                    return;
                                  }
                                  setAttachedProofs(prev => {
                                    const filtered = prev.filter(p => p !== 'Not Applicable');
                                    return filtered.includes(proof)
                                      ? filtered.filter(p => p !== proof)
                                      : [...filtered, proof];
                                  });
                                }}
                                className={`text-left p-1.5 rounded-lg text-[11px] border flex items-center gap-1.5 transition cursor-pointer ${
                                  isChecked
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {isChecked ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                                )}
                                <span className="truncate">{proof}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Community Seal */}
                      <button
                        type="button"
                        onClick={() => setHasCommunitySeal(!hasCommunitySeal)}
                        className={`w-full text-left p-2 rounded-xl text-xs border flex items-center gap-2 transition cursor-pointer ${
                          hasCommunitySeal
                            ? 'bg-amber-50 border-amber-400 text-teal-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <Stamp className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>Community Seal (if available): {hasCommunitySeal ? '✓ Affixed / Verified' : 'None'}</span>
                      </button>
                    </div>

                    {/* SECTION 5: COMMUNITY DECLARATION */}
                    <div className="space-y-2.5 pt-3 border-t-2 border-amber-300 bg-amber-50/50 p-3 rounded-xl">
                      <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-amber-950 tracking-wider">
                        <PenTool className="w-3.5 h-3.5 text-amber-700" />
                        <span>COMMUNITY DECLARATION</span>
                      </div>

                      <blockquote className="text-[11px] italic text-slate-700 border-l-2 border-amber-500 pl-2 py-0.5 leading-relaxed bg-white/60 rounded-r-md">
                        &ldquo;I declare that I am authorized to represent the above-mentioned community and that the information provided is true and correct.&rdquo;
                      </blockquote>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Signature:
                          </label>
                          <input
                            type="text"
                            value={repSignature}
                            onChange={(e) => setRepSignature(e.target.value)}
                            placeholder="Type Representative Full Name"
                            className="w-full border border-amber-300 bg-white rounded-xl p-2 text-xs font-semibold text-slate-900 outline-none focus:border-teal-600 font-serif"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Date:
                          </label>
                          <input
                            type="date"
                            value={declarationDate}
                            onChange={(e) => setDeclarationDate(e.target.value)}
                            className="w-full border border-amber-300 bg-white rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setDeclarationAccepted(!declarationAccepted)}
                        className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer pt-1"
                      >
                        {declarationAccepted ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                        <span>I accept and affirm this Community Declaration</span>
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  disabled={phone.replace(/\D/g, '').length < 10 || loading}
                  onClick={handleSendOtp}
                  className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-900/20 transition text-sm cursor-pointer mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Enter 4-Digit Code
                  </label>
                  <div className="flex justify-between gap-2 sm:gap-3">
                    {otp.map((d, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !otp[i] && i > 0) {
                            document.getElementById(`otp-${i - 1}`)?.focus();
                          }
                        }}
                        className="w-14 h-14 sm:w-16 sm:h-16 text-center text-xl sm:text-2xl font-black text-teal-800 bg-slate-50 border-2 border-slate-200 focus:border-teal-600 focus:bg-white rounded-2xl outline-none shadow-xs transition"
                      />
                    ))}
                  </div>


                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp(['', '', '', '']);
                      setReceivedOtp(null);
                    }}
                    className="text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    ← Change Phone
                  </button>

                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-teal-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Resend Code
                    </button>
                  ) : (
                    <span className="text-slate-400 font-medium">
                      Resend in <b className="text-slate-600 font-mono">{countdown}s</b>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={otp.join('').length !== 4 || loading}
                  onClick={() => handleVerifyOtp()}
                  className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-900/20 transition text-sm cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Enter SahYog</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 text-center leading-normal">
              By proceeding, you agree to SahYog's{' '}
              <span className="text-teal-700 font-semibold underline cursor-pointer">Terms</span> and{' '}
              <span className="text-teal-700 font-semibold underline cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
