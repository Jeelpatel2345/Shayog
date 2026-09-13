'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('sahyog-logged-in') === 'true';
      const role = localStorage.getItem('sahyog-role');

      if (isLoggedIn && role) {
        if (role === 'WORKER') {
          router.replace('/worker/dashboard');
          return;
        } else if (role === 'ADMIN') {
          router.replace('/admin/overview');
          return;
        } else if (role === 'CUSTOMER') {
          router.replace('/customer/dashboard');
          return;
        }
      }
    }

    // Animate splash loading progress for fresh visitors only
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 25;
      });
    }, 180);

    const redirectTimer = setTimeout(() => {
      router.replace('/welcome');
    }, 900);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#042f2e] via-[#064e3b] to-[#042f2e] flex flex-col items-center justify-between text-white p-6 select-none">
      {/* Top Tag */}
      <div className="pt-8 flex items-center gap-1.5 text-xs font-bold text-emerald-300/80 tracking-widest uppercase">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
        <span>SahYog Platform</span>
      </div>

      {/* Center Brand Identity */}
      <div className="flex flex-col items-center text-center max-w-xs -mt-10">
        <div className="relative mb-5">
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400/40 flex items-center justify-center shadow-2xl animate-pulse">
            <img 
              src="/logo.png" 
              alt="SahYog" 
              className="w-20 h-20 rounded-full object-cover shadow-inner" 
            />
          </div>
          <span className="absolute bottom-0 right-0 w-6 h-6 bg-amber-400 text-emerald-950 rounded-full flex items-center justify-center font-black text-xs border-2 border-[#042f2e] shadow-md">
            ✓
          </span>
        </div>

        <h1 className="text-4xl font-black tracking-tight text-white leading-none">
          SahYog
        </h1>
        <p className="text-xs text-amber-300 font-bold tracking-wider uppercase mt-1.5">
          सहयोग • સંગઠન • સેવા
        </p>
        <p className="text-xs text-emerald-100/80 mt-2 font-medium leading-relaxed">
          Connecting Communities, Empowering Skills.
        </p>

        {/* Progress indicator */}
        <div className="w-48 bg-emerald-950/80 rounded-full h-1.5 mt-8 overflow-hidden border border-emerald-700/50">
          <div 
            className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] text-emerald-300/70 font-semibold tracking-wider mt-2 uppercase">
          Initializing Secure Session...
        </span>
      </div>

      {/* Footer Assurance */}
      <div className="pb-6 flex items-center gap-2 text-[11px] text-emerald-200/70">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>100% Verified Local Professionals • v2.4.0</span>
      </div>
    </div>
  );
}
