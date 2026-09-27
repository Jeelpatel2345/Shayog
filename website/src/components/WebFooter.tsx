import Link from 'next/link';
import { ShieldCheck, Heart, Smartphone, MapPin, Mail, Phone } from 'lucide-react';

export default function WebFooter() {
  return (
    <footer className="bg-[#021f1e] text-emerald-200/80 border-t border-emerald-950 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-emerald-900/40">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="SahYog" className="w-10 h-10 rounded-full object-cover shadow-md" />
              <span className="font-black text-2xl tracking-tight text-white">SahYog</span>
            </div>
            <p className="text-sm leading-relaxed text-emerald-200/70 max-w-sm">
              SahYog connects trusted local home professionals with households across Gujarat and India. 
              100% background-verified, transparent pricing, and instant real-time booking.
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-emerald-300 pt-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Police Cleared</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Aadhaar Verified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>UPI Protected</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              All 6 Services
            </h3>
            <ul className="space-y-2.5 text-xs font-medium">
              <li><Link href="/services?category=Cleaning" className="hover:text-amber-300 transition">Home Cleaning (18)</Link></li>
              <li><Link href="/services?category=Plumbing" className="hover:text-amber-300 transition">Plumbing & Pipes (17)</Link></li>
              <li><Link href="/services?category=Electrician" className="hover:text-amber-300 transition">Electrician & Wiring (17)</Link></li>
              <li><Link href="/services?category=Appliance Repair" className="hover:text-amber-300 transition">Appliance Repair (16)</Link></li>
              <li><Link href="/services?category=Carpentry" className="hover:text-amber-300 transition">Carpentry & Woodwork (16)</Link></li>
              <li><Link href="/services?category=Painting" className="hover:text-amber-300 transition">Painting & Waterproofing (16)</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs font-medium">
              <li><Link href="/" className="hover:text-amber-300 transition">Home</Link></li>
              <li><Link href="/services" className="hover:text-amber-300 transition">Browse 100 Workers</Link></li>
              <li><Link href="/dashboard" className="hover:text-amber-300 transition">Customer Dashboard</Link></li>
              <li><Link href="/bookings" className="hover:text-amber-300 transition">My Service Bookings</Link></li>
              <li><Link href="/login" className="hover:text-amber-300 transition">Partner / Worker Login</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Mobile Experience
            </h3>
            <p className="text-xs text-emerald-200/70 mb-4 leading-relaxed">
              Book on the go with the SahYog Native Android App. Real-time GPS tracker & fast OTP.
            </p>
            <a
              href="https://shayog-rb55.vercel.app/download"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/60 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm group"
            >
              <Smartphone className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
              <div className="text-left">
                <div className="text-[10px] text-emerald-300 uppercase leading-none">Download APK</div>
                <div className="text-xs font-bold leading-tight">Android App (5.4 MB)</div>
              </div>
            </a>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-300/60">
          <p>© 2026 SahYog Platform. Built with pride in Gujarat, India.</p>
          <div className="flex items-center gap-6">
            <span>Ahmedabad</span>
            <span>Surat</span>
            <span>Vadodara</span>
            <span>Rajkot</span>
            <span>Pan-India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
