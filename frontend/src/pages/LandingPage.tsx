import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import LandingNavbar from '@/components/lightswind-pro/tubelight-navbar';
import HeroSandbox from '../components/landing/HeroSandbox';
import ScholarlyStats from '../components/landing/ScholarlyStats';
import MushafScrollytelling from '../components/landing/MushafScrollytelling';
import Scroll3DCarousel from '../components/landing/Scroll3DCarousel';
import TimelineWorkflow from '../components/landing/TimelineWorkflow';
import FaqSection from '../components/landing/FaqSection';
import ClosingCtaBanner from '../components/landing/ClosingCtaBanner';
import EditorialFooter from '../components/landing/EditorialFooter';
import ElegantCta from '../components/reactbits/ElegantCta';
import HeroBackground from '../components/reactbits/HeroBackground';

export default function LandingPage() {
  // Navigation items linking to in-page landing sections & developer page
  const navItems = [
    { name: 'Simulasi AI', url: '#simulasi' },
    { name: 'Pilar Fitur', url: '#fitur' },
    { name: 'Arsitektur', url: '#arsitektur' },
    { name: 'Alur', url: '#alur' },
    { name: 'FAQ', url: '#faq' },
    { name: 'Pengembang', url: '/developers' },
  ];

  const rightActions = (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Link
        to="/download"
        className="text-[13px] font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg transition-colors"
      >
        Unduh
      </Link>
      <Link
        to="/login"
        className="text-[13px] font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg transition-colors"
      >
        Masuk
      </Link>
      <Link
        to="/register"
        className="text-[13px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-xl transition-all shadow-xs"
      >
        Daftar Santri
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 scroll-smooth pt-16">
      {/* Editorial Navbar Header for Landing Page */}
      <LandingNavbar items={navItems} rightActions={rightActions} />

      {/* Hero Section & Live Simulation Sandbox with React Bits Symmetrical Blueprint Grid & Interactive Celestial Particles */}
      <section id="simulasi" className="relative scroll-mt-24">
        <HeroBackground className="pt-14 sm:pt-20 lg:pt-24 pb-20 sm:pb-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Clean, Balanced, Restrained Scholarly Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-7 text-left"
              >
                {/* Restrained Category Kicker with subtle live dot (Zero Badges) */}
                <div className="flex items-center space-x-2.5 text-xs font-bold tracking-widest text-emerald-800 uppercase font-sans">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                  <span>AI Voice &amp; Spaced Repetition • Tim FIFA</span>
                </div>

                {/* Symmetrical High-Impact Headline (Crisp Sans-Serif) */}
                <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-[1.12]">
                  Hafalan Lebih Kuat.{' '}
                  <span className="text-emerald-700 block mt-2">
                    Presisi Kata demi Kata.
                  </span>
                </h1>

                {/* Clear, Spacious Subtitle */}
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
                  Asisten AI cerdas yang menyimak tilawah secara real-time, mendeteksi keliru huruf dan harakat, serta menjadwalkan murojaah adaptif berbasis kurva lupa ilmiah.
                </p>

                {/* Action Buttons: React Bits Ultra-Elegant CTA (Strictly Zero Icons) */}
                <div className="pt-1 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <ElegantCta
                    to="/app"
                    variant="emerald"
                    size="md"
                  >
                    Mulai Murojaah Mandiri
                  </ElegantCta>

                  <ElegantCta
                    to="/app/tajwid"
                    variant="secondary"
                    size="md"
                  >
                    Tajwid Academy
                  </ElegantCta>
                </div>

                {/* Minimalist Trust Indicators Row with Subtle Divider */}
                <div className="pt-4 border-t border-slate-200/70 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 font-medium">
                  <span className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Standar Kemenag RI</span>
                  </span>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Tarteel QUL Mutasyabihat</span>
                  </span>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Privasi Suara Memory-Only</span>
                  </span>
                </div>
              </motion.div>

              {/* Right Column: Perfectly Balanced Interactive Recitation Sandbox */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-5 flex justify-center lg:justify-end relative w-full"
              >
                {/* Soft Symmetrical Ambient Glow behind sandbox */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-2 bg-gradient-to-r from-emerald-500/12 via-teal-500/10 to-emerald-500/12 rounded-[32px] blur-2xl pointer-events-none"
                />
                <div className="relative w-full flex justify-center lg:justify-end">
                  <HeroSandbox />
                </div>
              </motion.div>
            </div>
          </div>
        </HeroBackground>
      </section>

      {/* Scholarly Scientific Metrics Section */}
      <ScholarlyStats />

      {/* 3D Scroll-Driven Carousel Section ("Semua yang Kamu Butuhkan untuk Menjaga Hafalan") */}
      <div id="fitur" className="scroll-mt-24">
        <Scroll3DCarousel />
      </div>

      {/* Scroll Timeline Section ("Terus Gulir, Selami Arsitektur Evaluasi Hifzhly") */}
      <div id="arsitektur" className="scroll-mt-24">
        <MushafScrollytelling />
      </div>

      {/* Step-by-Step Interactive Workflow Timeline */}
      <div id="alur" className="scroll-mt-24">
        <TimelineWorkflow />
      </div>

      {/* Interactive FAQ Section */}
      <div id="faq" className="scroll-mt-24">
        <FaqSection />
      </div>

      {/* Closing Call to Action Banner (Moneta-style split layout with physical cards & zero icons) */}
      <ClosingCtaBanner />

      {/* Masterpiece Editorial Islamic Footer */}
      <EditorialFooter />
    </div>
  );
}
