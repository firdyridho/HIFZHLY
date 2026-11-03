import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

export interface TubelightNavbarProps {
  items: NavItem[];
  className?: string;
  brand?: React.ReactNode;
  rightActions?: React.ReactNode;
}

export function TubelightNavbar({
  items,
  className,
  brand,
  rightActions,
}: TubelightNavbarProps) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(items[0]?.name || "");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isClickingRef = useRef(false);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rAFRef = useRef<number | null>(null);

  // Auto-close mobile menu on desktop viewport or Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Accurate, Throttled Scrollspy tracking for in-page hash links
  useEffect(() => {
    const hashItems = items.filter((item) => item.url.startsWith("#"));
    if (hashItems.length === 0) {
      const current = items.find((item) => item.url === location.pathname);
      if (current) setActiveTab(current.name);
      return;
    }

    const onScroll = () => {
      if (isClickingRef.current) return;

      if (rAFRef.current !== null) {
        cancelAnimationFrame(rAFRef.current);
      }

      rAFRef.current = requestAnimationFrame(() => {
        const scrollPosition = window.scrollY + 140;
        const windowHeight = window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight;

        // Activate last item if scrolled to near bottom
        if (window.scrollY + windowHeight >= fullHeight - 60) {
          const lastItem = hashItems[hashItems.length - 1];
          if (lastItem) {
            setActiveTab((prev) => (prev !== lastItem.name ? lastItem.name : prev));
            return;
          }
        }

        // Check sections from bottom to top using absolute document coordinates
        for (let i = hashItems.length - 1; i >= 0; i--) {
          const item = hashItems[i];
          const el = document.getElementById(item.url.slice(1));
          if (el) {
            const rect = el.getBoundingClientRect();
            const docTop = rect.top + window.scrollY;
            if (scrollPosition >= docTop - 40) {
              setActiveTab((prev) => (prev !== item.name ? item.name : prev));
              return;
            }
          }
        }

        // Default to first item if above all
        if (hashItems[0]) {
          setActiveTab((prev) => (prev !== hashItems[0].name ? hashItems[0].name : prev));
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rAFRef.current !== null) {
        cancelAnimationFrame(rAFRef.current);
      }
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, [items, location.pathname]);

  const handleNavClick = (e: React.MouseEvent, item: NavItem) => {
    if (item.url.startsWith("#")) {
      e.preventDefault();
      const targetId = item.url.slice(1);
      const targetEl = document.getElementById(targetId);

      setActiveTab(item.name);
      isClickingRef.current = true;
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = setTimeout(() => {
        isClickingRef.current = false;
      }, 700);

      if (targetEl) {
        const navHeight = 72;
        const targetTop = Math.max(0, targetEl.getBoundingClientRect().top + window.scrollY - navHeight);
        window.scrollTo({
          top: targetTop,
          behavior: "smooth",
        });
      }
    } else {
      setActiveTab(item.name);
    }
  };

  const handleBrandClick = (e: React.MouseEvent) => {
    if (location.pathname === "/" || location.pathname === "") {
      e.preventDefault();
      isClickingRef.current = true;
      setActiveTab(items[0]?.name || "");
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = setTimeout(() => {
        isClickingRef.current = false;
      }, 700);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all",
          className
        )}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 sm:h-18 flex items-center justify-between">
          {/* Brand / Logo */}
          {brand ? (
            brand
          ) : (
            <Link
              to="/"
              onClick={handleBrandClick}
              className="flex items-center space-x-2.5 sm:space-x-3 group cursor-pointer select-none"
            >
              <img
                src="/logo saja.png"
                alt="Hifzhly Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
              />
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                    Hifzhly
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden sm:block">
                  Platform Pendamping Murojaah Al-Qur'an
                </p>
              </div>
            </Link>
          )}

          {/* Desktop Tubelight Nav Items Container */}
          <nav className="hidden md:flex items-center bg-slate-100/90 border border-slate-200/90 backdrop-blur-lg p-1 rounded-full shadow-xs">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;

              return (
                <a
                  key={item.name}
                  href={item.url}
                  onClick={(e) => handleNavClick(e, item)}
                  className={cn(
                    "relative cursor-pointer text-xs font-semibold px-3 sm:px-4.5 py-2 rounded-full transition-colors flex items-center space-x-1.5 select-none",
                    "text-slate-600 hover:text-emerald-700",
                    isActive && "text-emerald-950 font-bold"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.name}</span>

                  {/* Tubelight Lamp Indicator with Glowing Beam */}
                  {isActive && (
                    <motion.div
                      layoutId="tubelight-lamp"
                      className="absolute inset-0 w-full bg-white rounded-full -z-10 shadow-xs border border-emerald-500/30"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    >
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-600 rounded-t-full">
                        <div className="absolute w-12 h-5 bg-emerald-500/25 rounded-full blur-md -top-2 -left-2" />
                        <div className="absolute w-8 h-4 bg-emerald-500/30 rounded-full blur-sm -top-1" />
                      </div>
                    </motion.div>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Desktop Right Actions (Login / Register Buttons) */}
          {rightActions && (
            <div className="hidden md:flex items-center space-x-2.5">
              {rightActions}
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-200/80 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label={isMobileMenuOpen ? "Tutup Navigasi" : "Buka Navigasi"}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-800" />
            ) : (
              <Menu className="w-5 h-5 text-slate-800" />
            )}
          </button>
        </div>

        {/* Mobile Animated Dropdown Drawer (Positioned absolute to avoid any page layout shift) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="md:hidden absolute top-full left-0 right-0 z-50 border-b border-slate-200/90 bg-white/98 backdrop-blur-xl px-4 py-4 shadow-xl space-y-3"
            >
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.name;

                  return (
                    <a
                      key={item.name}
                      href={item.url}
                      onClick={(e) => {
                        handleNavClick(e, item);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                        isActive
                          ? "bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <Icon className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{item.name}</span>
                    </a>
                  );
                })}
              </div>

              {/* Mobile Actions Container */}
              {rightActions && (
                <div
                  className="pt-3 border-t border-slate-100 flex flex-col gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {rightActions}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Backdrop Overlay (Click outside to close) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 top-16 sm:top-18 bg-slate-900/25 backdrop-blur-xs md:hidden z-40 transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export default TubelightNavbar;
