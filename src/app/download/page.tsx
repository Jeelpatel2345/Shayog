'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Download, ShieldCheck, CheckCircle2, ArrowLeft, 
  Smartphone, Share2, Copy, Check, ExternalLink, Sparkles 
} from 'lucide-react';

export default function DownloadAppPage() {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const appUrl = 'https://shayog-rb55.vercel.app/download';
  const shareText = 'Download the SahYog App (Android APK) for reliable home services: https://shayog-rb55.vercel.app/download';

  const handleDownload = () => {
    setDownloading(true);
    localStorage.setItem('sahyog_apk_downloaded', 'true');
    const link = document.createElement('a');
    link.href = '/sahyog.apk';
    link.download = 'sahyog.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloading(false);
    }, 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-900">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl flex flex-col items-center text-center">
        
        {/* Top bar */}
        <div className="w-full flex items-center justify-between mb-4">
          <Link 
            href="/welcome" 
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full">
            Official Android APK
          </span>
        </div>

        {/* App Icon */}
        <div className="w-20 h-20 mb-3 flex items-center justify-center drop-shadow-xl">
          <img src="/logo.png" alt="SahYog App Icon" className="w-full h-full object-contain" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight">SahYog App</h1>
        <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider mt-0.5">
          Version 2.4.0 • Android (5.4 MB)
        </p>

        <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
          Install the official SahYog native app directly onto your phone. Opens without browser bars, with real-time OTP and quick access!
        </p>

        {/* Feature badges */}
        <div className="w-full my-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-left space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>Native phone home screen app (App Drawer icon)</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>Faster loading & offline-capable interface</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>100% Virus-Free & Aadhaar-verified workers</span>
          </div>
        </div>

        {/* Download Action Button */}
        <button
          onClick={handleDownload}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl text-sm shadow-lg shadow-teal-700/25 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
        >
          <Download className="w-5 h-5 animate-bounce" />
          <span>{downloading ? 'Starting Download...' : 'Download APK (5.4 MB)'}</span>
        </button>

        <p className="text-[11px] text-slate-400 mt-2">
          File: <span className="font-mono font-medium text-slate-600">sahyog.apk</span> (Verified Package)
        </p>

        {/* Share with Friends */}
        <div className="w-full mt-6 pt-5 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-800 mb-2.5 flex items-center justify-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Share App With Friends</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="py-2.5 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition border border-slate-200 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* 3 Step Installation Instructions */}
        <div className="mt-5 pt-4 border-t border-slate-100 w-full text-left">
          <p className="text-xs font-bold text-slate-800 mb-2">How to install on your phone:</p>
          <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside">
            <li>Tap <b>Download APK</b> above to get <b>sahyog.apk</b>.</li>
            <li>When download completes, tap <b>Open</b> in the notification.</li>
            <li>Tap <b>Install</b> (if prompted, tap <i>Settings</i> → allow <i>Install unknown apps</i>).</li>
          </ol>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 w-full text-center">
          <Link href="/welcome" className="text-[11px] hover:text-teal-700 font-medium text-slate-400">
            Open in Web Browser →
          </Link>
        </div>
      </div>
    </div>
  );
}
