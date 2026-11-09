import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic,
  Layers,
  Workflow,
  Route,
  HelpCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import TubelightNavbar from '@/components/lightswind-pro/tubelight-navbar';
import HeroSandbox from '../components/landing/HeroSandbox';
import ScholarlyStats from '../components/landing/ScholarlyStats';
import MushafScrollytelling from '../components/landing/MushafScrollytelling';
import Scroll3DCarousel from '../components/landing/Scroll3DCarousel';
import TimelineWorkflow from '../components/landing/TimelineWorkflow';
import FaqSection from '../components/landing/FaqSection';
import ClosingCtaBanner from '../components/landing/ClosingCtaBanner';
import ElegantCta from '../components/reactbits/ElegantCta';
import StarBorder from '../components/reactbits/StarBorder';
import HeroBackground from '../components/reactbits/HeroBackground';

export default function LandingPage() {
  // Navigation items strictly linking to in-page landing sections
  const navItems = [
    { name: 'Simulasi AI', url: '#simulasi', icon: Mic },
    { name: 'Pilar Fitur', url: '#fitur', icon: Layers },
    { name: 'Arsitektur', url: '#arsitektur', icon: Workflow },
    { name: 'Alur', url: '#alur', icon: Route },
    { name: 'FAQ', url: '#faq', icon: HelpCircle },
  ];

  const rightActions = (
    <>
      <Link
        to="/download"
        className="text-xs font-semibold text-slate-700 hover:text-emerald-700 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all text-center"
      >
        Download App
      </Link>
      <Link
        to="/login"
        className="text-xs font-semibold text-slate-700 hover:text-emerald-700 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all text-center"
      >
        Masuk
      </Link>
      <StarBorder
        as={Link}
        to="/register"
        color="#34d399"
        speed="5s"
        className="text-xs font-semibold"
      >
        <span className="px-3.5 py-1.5 rounded-[14px] bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition-colors">
          Daftar Santri
        </span>
      </StarBorder>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 scroll-smooth">
      {/* Tubelight Navbar Header for Landing Page */}
      <TubelightNavbar items={navItems} rightActions={rightActions} />

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

      {/* Academic & Islamic Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <img src="/hafizhly_panjang.png" alt="Hifzhly" className="h-6 w-auto object-contain" />
            <span className="text-slate-300">|</span>
            <Link to="/download" className="hover:text-emerald-700 hover:underline">
              Download Aplikasi (Desktop &amp; Mobile)
            </Link>
            <span className="text-slate-300">|</span>
            <Link to="/terms" className="hover:text-emerald-700 hover:underline">
              Ketentuan Layanan &amp; Privasi Suara
            </Link>
            <span className="text-slate-300">|</span>
            <Link to="/login?role=admin" className="hover:text-emerald-700 hover:underline">
              Portal Admin / Musyrif
            </Link>
          </div>
          <p className="text-center sm:text-right">
            © 2026 Tim FIFA (Firdy Ridho Fillah &amp; Faeyza Ardellein Yaradhitya).
          </p>
        </div>
      </footer>
    </div>
  );
}
