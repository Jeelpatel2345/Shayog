'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Play, Pause, Download, Video, Sparkles, 
  CheckCircle2, Smartphone, Globe, ShieldCheck, Share2 
} from 'lucide-react';

export default function VideoDemoPage() {
  const [activeVideo, setActiveVideo] = useState<'APP' | 'WEBSITE'>('APP');

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-6">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/welcome"
            className="flex items-center gap-2 text-xs font-bold text-teal-300 hover:text-white bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to App</span>
          </Link>
          <span className="text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Official 1:30 Min Video Demos</span>
          </span>
        </div>

        {/* Header Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            SahYog Platform Video Showcase
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Comprehensive 90-second video walkthroughs explaining all features, triple-dashboard isolation, 
            real-time dispatch, and the marketing website ecosystem.
          </p>
        </div>

        {/* Video Selector Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
            <button
              onClick={() => setActiveVideo('APP')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer ${
                activeVideo === 'APP'
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Video 1: Mobile App Walkthrough (1:30 min)</span>
            </button>
            <button
              onClick={() => setActiveVideo('WEBSITE')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer ${
                activeVideo === 'WEBSITE'
                  ? 'bg-amber-500 text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Video 2: Website Tour (1:30 min)</span>
            </button>
          </div>
        </div>

        {/* Video Player Card */}
        <div className="bg-slate-800/90 rounded-3xl border border-slate-700 p-4 sm:p-6 shadow-2xl space-y-4">
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-700/80 relative shadow-inner">
            <video
              key={activeVideo}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
              src={activeVideo === 'APP' ? '/sahyog_app_demo.mp4' : '/sahyog_website_demo.mp4'}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{activeVideo === 'APP' ? 'SahYog Mobile Application Demonstration' : 'SahYog Marketing Website & Platform Tour'}</span>
                <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full">
                  1080p Full HD
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {activeVideo === 'APP' 
                  ? 'Walkthrough covering Customer Booking, Worker Audio Alerts, Gate OTPs, Community Squad Console & Admin Room.'
                  : 'Walkthrough covering Dual-Mode Discovery, Transparent Pricing, Partner Directory & Direct Android APK Download.'}
              </p>
            </div>

            <a
              href={activeVideo === 'APP' ? '/sahyog_app_demo.mp4' : '/sahyog_website_demo.mp4'}
              download={activeVideo === 'APP' ? 'sahyog_app_demo.mp4' : 'sahyog_website_demo.mp4'}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download MP4 File</span>
            </a>
          </div>
        </div>

        {/* Key Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1">
            <span className="text-xs font-bold text-teal-400 block">Duration & Format</span>
            <p className="text-sm font-black text-white">90 Seconds • 30 FPS MP4</p>
            <p className="text-xs text-slate-400">Broadcast standard 1920x1080 resolution.</p>
          </div>
          <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1">
            <span className="text-xs font-bold text-amber-400 block">Voiceover Narration</span>
            <p className="text-sm font-black text-white">Clear Speech & Subtitles</p>
            <p className="text-xs text-slate-400">Synchronized lower-third subtitle bar.</p>
          </div>
          <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1">
            <span className="text-xs font-bold text-emerald-400 block">Platform Coverage</span>
            <p className="text-sm font-black text-white">100% Feature Complete</p>
            <p className="text-xs text-slate-400">Every route, portal & security system explained.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
