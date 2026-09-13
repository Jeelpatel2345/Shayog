'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Globe, User, Briefcase, ChevronRight, Users, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const [role, setRole] = useState<'CUSTOMER' | 'WORKER'>('CUSTOMER');
  const [scope, setScope] = useState<'INDIVIDUAL' | 'COMMUNITY'>('INDIVIDUAL');
  const [step, setStep] = useState<'ROLE' | 'SCOPE'>('ROLE');
  const [lang, setLang] = useState<'English' | 'हिन्दी' | 'ગુજરાતી'>('English');
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('sahyog-logged-in') === 'true';
      const role = localStorage.getItem('sahyog-role');
      if (isLoggedIn) {
        if (role === 'WORKER') {
          router.replace('/worker/dashboard');
          return;
        } else if (role === 'ADMIN') {
          router.replace('/admin/overview');
          return;
        } else {
          router.replace('/customer/dashboard');
          return;
        }
      }

      const ua = navigator.userAgent;
      const isInsideApp = 
        ua.includes('SahYogApp') || 
        ua.includes('wv') || 
        localStorage.getItem('sahyog_apk_downloaded') === 'true' ||
        window.matchMedia('(display-mode: standalone)').matches;
      if (!isInsideApp) setShowDownload(true);
    }
  }, [router]);

  const handleNextStep = () => {
    setStep('SCOPE');
  };

  const handleFinish = () => {
    localStorage.setItem('sahyog-role', role);
    localStorage.setItem('sahyog-service-scope', scope);
    localStorage.setItem('sahyog-lang', lang);
    router.push(`/login?role=${role.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-white md:bg-slate-900 flex items-center justify-center md:p-6">
      <div className="w-full max-w-4xl bg-white md:rounded-3xl md:shadow-2xl overflow-hidden md:border md:border-slate-200 grid grid-cols-1 md:grid-cols-2 min-h-[580px]">
        {/* Top Header / Left Brand Showcase */}
        <div className="bg-gradient-to-br from-[#042f2e] via-[#0d9488] to-[#042f2e] text-white p-5 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            {/* Top Brand Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="SahYog" className="w-10 h-10 rounded-full object-cover shadow-md" />
                <div>
                  <h2 className="font-black text-lg tracking-tight text-white leading-none">SahYog</h2>
                  <span className="text-[10px] text-emerald-200 uppercase tracking-wider font-semibold">Community Hub</span>
                </div>
              </div>
              <span className="text-xs bg-white/15 border border-white/25 rounded-full px-3 py-1 font-bold text-amber-300">
                Verified Platform
              </span>
            </div>

            <div className="mt-6 md:mt-10">
              <h1 className="text-2xl sm:text-3xl font-black leading-tight text-white">
                Connecting Communities, Empowering Skills.
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
                Reliable household & society services with 300+ background-verified professionals across Gujarat.
              </p>
            </div>

            <div className="mt-5 space-y-2.5">
              {[
                { title: '100% Background Verified', desc: 'Aadhaar biometric inspected partners' },
                { title: 'Individual & Society Coverage', desc: 'Private homes & residential apartments' },
                { title: 'Local Languages Supported', desc: 'English, हिन्दी (Hindi), ગુજરાતી (Gujarati)' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-amber-300 flex-shrink-0" />
                  <span className="text-emerald-50 font-medium">
                    <b className="text-white">{item.title}</b> — {item.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-4 mt-4 border-t border-white/15 flex items-center justify-between text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-300" />
              <span><b>10,000+</b> trusted households & societies</span>
            </div>
          </div>
        </div>

        {/* Form Selection Card */}
        <div className="p-5 sm:p-8 flex flex-col justify-between bg-white">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                {step === 'ROLE' ? 'Step 1 of 2: Account Type' : 'Step 2 of 2: Service Preference'}
              </span>
              {step === 'SCOPE' && (
                <button
                  type="button"
                  onClick={() => setStep('ROLE')}
                  className="text-xs text-slate-500 hover:text-teal-700 font-bold"
                >
                  ← Back
                </button>
              )}
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {step === 'ROLE' ? 'Welcome to SahYog' : 'Select Service Scope'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {step === 'ROLE' 
                  ? 'Select your preferred language and role to begin.' 
                  : role === 'CUSTOMER' 
                    ? 'Are you booking for your private residence or a residential society?' 
                    : 'Do you offer individual household services or society contract work?'}
              </p>
            </div>

            {/* STEP 1: LANGUAGE & ROLE */}
            {step === 'ROLE' && (
              <>
                {/* Language Selector */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Select Language / ભાષા / भाषा
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['English', 'हिन्दी', 'ગુજરાતી'] as const).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLang(l)}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border-2 transition ${
                          lang === l
                            ? 'border-teal-600 bg-teal-50 text-teal-800 shadow-xs'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Role Cards */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Choose Your Role
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Customer Role */}
                    <button
                      type="button"
                      onClick={() => setRole('CUSTOMER')}
                      className={`p-3.5 rounded-2xl border-2 text-left transition flex items-start gap-3 ${
                        role === 'CUSTOMER'
                          ? 'border-teal-600 bg-teal-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          role === 'CUSTOMER'
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-900 block">I Need Services</span>
                        <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                          Book certified electricians, plumbers, cleaners
                        </span>
                      </div>
                    </button>

                    {/* Worker Role */}
                    <button
                      type="button"
                      onClick={() => setRole('WORKER')}
                      className={`p-3.5 rounded-2xl border-2 text-left transition flex items-start gap-3 ${
                        role === 'WORKER'
                          ? 'border-teal-600 bg-teal-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          role === 'WORKER'
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-900 block">I Provide Services</span>
                        <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                          Earn with flexible orders & instant payouts
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* STEP 2: SERVICE SCOPE (INDIVIDUAL VS COMMUNITY) */}
            {step === 'SCOPE' && (
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Select Scope of Work / સેવા વ્યાપ
                </label>

                {/* Individual Option */}
                <button
                  type="button"
                  onClick={() => setScope('INDIVIDUAL')}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition flex items-start gap-3.5 ${
                    scope === 'INDIVIDUAL'
                      ? 'border-teal-600 bg-teal-50/60 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      scope === 'INDIVIDUAL'
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">Individual Service (વ્યક્તિગત સેવા)</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">Personal Home</span>
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-1">
                      {role === 'CUSTOMER'
                        ? 'For private residence, single flat/bungalow, doorstep individual repairs and home visits.'
                        : 'Freelance technician for individual household calls and doorstep home maintenance.'}
                    </span>
                  </div>
                </button>

                {/* Community Option */}
                <button
                  type="button"
                  onClick={() => setScope('COMMUNITY')}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition flex items-start gap-3.5 ${
                    scope === 'COMMUNITY'
                      ? 'border-teal-600 bg-teal-50/60 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      scope === 'COMMUNITY'
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">Community Service (સોસાયટી સેવા)</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">Apartments & Society</span>
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-1">
                      {role === 'CUSTOMER'
                        ? 'For housing societies, apartment complexes, commercial buildings, bulk water tank cleaning & AMCs.'
                        : 'Contractor or team partner equipped for society tenders, bulk maintenance and building care.'}
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 mt-3 border-t border-slate-100 space-y-2.5">
            {step === 'ROLE' ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-900/20 transition text-sm cursor-pointer"
              >
                <span>Get Started</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-900/20 transition text-sm cursor-pointer"
              >
                <span>Proceed to Sign In ({scope === 'COMMUNITY' ? 'Community' : 'Individual'})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <p className="text-[11px] text-slate-400 text-center">
              By continuing, you agree to SahYog's Terms and Privacy Policy.
            </p>

            {showDownload && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <Link href="/download" className="text-teal-700 hover:underline font-bold flex items-center gap-1">
                  <span>📲 Download Android APK (5.4 MB)</span>
                </Link>
                <span className="text-slate-400">v2.4.0 Native</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
