import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Award, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';
import HeroSandbox from '../components/landing/HeroSandbox';
import ScholarlyStats from '../components/landing/ScholarlyStats';
import MushafScrollytelling from '../components/landing/MushafScrollytelling';
import Scroll3DCarousel from '../components/landing/Scroll3DCarousel';
import TimelineWorkflow from '../components/landing/TimelineWorkflow';
import FaqSection from '../components/landing/FaqSection';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Sticky Header Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-6xl mx-auto px-4 h-18 flex items-center justify-between">
          {/* Logo & Platform Name */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src="/logo saja.png"
              alt="Hifzhly Logo"
              className="w-10 h-10 object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">Hifzhly</span>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  AI &amp; SRS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Platform Pendamping Murojaah Al-Qur'an</p>
            </div>
          </Link>

          {/* Quick Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
            <Link to="/app" className="hover:text-emerald-700 transition-colors">
              Murojaah
            </Link>
            <Link to="/app/mushaf" className="hover:text-emerald-700 transition-colors">
              Mushaf
            </Link>
            <Link to="/app/tajwid" className="hover:text-emerald-700 transition-colors">
              Tajwid Academy
            </Link>
            <Link to="/app/mutabaah" className="hover:text-emerald-700 transition-colors">
              Mutabaah
            </Link>
          </nav>

          {/* Auth Action Buttons */}
          <div className="flex items-center space-x-2.5">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-700 hover:text-emerald-700 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-all"
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-xl shadow-xs shadow-emerald-600/20 transition-all active:scale-95"
            >
              Daftar Santri
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-14 pb-20 bg-gradient-to-b from-white via-emerald-50/20 to-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Simple & Punchy Hero Proposition */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 space-y-5 text-left"
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-md text-[11px] font-semibold text-emerald-800">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Voice &amp; Spaced Repetition • Tim FIFA</span>
              </div>

              {/* Simple, Punchy, Impactful Headline */}
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Hafalan Lebih Kuat.{' '}
                <span className="text-emerald-700 block mt-1">
                  Presisi Kata demi Kata.
                </span>
              </h1>

              {/* Simple, Clear Subtitle */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg">
                Asisten AI cerdas yang menyimak bacaanmu secara real-time, menyorot huruf yang keliru, dan menjadwalkan review berdasarkan kurva lupa ilmiah.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  to="/app"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <Mic className="w-4 h-4" />
                  <span>Mulai Murojaah Mandiri</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/app/tajwid"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200 shadow-xs transition-all"
                >
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Tajwid Academy</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Standar Kemenag RI</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Tarteel QUL Mutasyabihat</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Privasi Suara Memory-Only</span>
                </span>
              </div>
            </motion.div>

            {/* Right Column: Interactive Recitation Sandbox */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 flex justify-center"
            >
              <HeroSandbox />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Scholarly Scientific Metrics Section */}
      <ScholarlyStats />

      {/* 3D Scroll-Driven Carousel Section ("Semua yang Kamu Butuhkan untuk Menjaga Hafalan") */}
      <Scroll3DCarousel />

      {/* Scroll Timeline Section ("Terus Gulir, Selami Arsitektur Evaluasi Hifzhly") */}
      <MushafScrollytelling />

      {/* Step-by-Step Interactive Workflow Timeline */}
      <TimelineWorkflow />

      {/* Interactive FAQ Section */}
      <FaqSection />

      {/* Closing Call to Action Banner */}
      <section className="max-w-5xl mx-auto px-4 w-full pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="p-8 sm:p-14 rounded-3xl bg-emerald-900 text-white shadow-xl shadow-emerald-950/20 text-center space-y-5 border border-emerald-800/80"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-800/80 border border-emerald-700 flex items-center justify-center text-emerald-300 mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Siap Menjaga Hafalan Al-Qur'anmu Hari Ini?
          </h2>

          <p className="text-emerald-100 text-sm max-w-xl mx-auto leading-relaxed">
            Bergabunglah bersama santri dan penghafal mandiri dalam merawat kalamullah dengan bimbingan teknologi modern dan ilmiah.
          </p>

          <div className="pt-3">
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <span>Daftar Akun Santri Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Academic & Islamic Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <img src="/hafizhly_panjang.png" alt="Hifzhly" className="h-6 w-auto object-contain" />
            <span className="text-slate-300">|</span>
            <Link to="/terms" className="hover:text-emerald-700 hover:underline">
              Ketentuan Layanan &amp; Privasi Suara
            </Link>
            <span className="text-slate-300">|</span>
            <Link to="/login" className="hover:text-emerald-700 hover:underline">
              Portal Admin / Musyrif
            </Link>
          </div>
          <p className="text-center sm:text-right">
            © 2026 Tim FIFA - Universitas Sultan Ageng Tirtayasa. Hackathon 24 Jam.
          </p>
        </div>
      </footer>
    </div>
  );
}
