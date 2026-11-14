import React, { useEffect, useState, useRef } from "react";
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

  // Set active tab based on route if not on root
  useEffect(() => {
    if (location.pathname !== "/" && location.pathname !== "") {
      const matched = items.find((item) => item.url === location.pathname);
      if (matched) {
        setActiveTab(matched.name);
      }
    }
  }, [location.pathname, items]);

  // Accurate, Throttled Scrollspy tracking for in-page hash links on "/"
  useEffect(() => {
    if (location.pathname !== "/" && location.pathname !== "") {
      return;
    }

    const hashItems = items.filter((item) => item.url.startsWith("#"));
    if (hashItems.length === 0) return;

    const onScroll = () => {
      if (isClickingRef.current) return;

      if (rAFRef.current !== null) {
        cancelAnimationFrame(rAFRef.current);
      }

      rAFRef.current = requestAnimationFrame(() => {
        const scrollPosition = window.scrollY + 140;
        const windowHeight = window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight;

        // Activate last hash item if scrolled near the bottom
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
          "sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-[0_4px_24px_-8px_rgba(0,0,0,0.04)]",
          className
        )}
      >
        {/* Subtle Scholarly Top Hairline Gradient */}
        <div className="h-[2px] w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500/80" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          {/* Brand / Logo */}
          {brand ? (
            brand
          ) : (
            <Link
              to="/"
              onClick={handleBrandClick}
              className="flex items-center space-x-2.5 sm:space-x-3 group cursor-pointer select-none"
            >
              <div className="relative">
                <img
                  src="/logo saja.png"
                  alt="Hifzhly Logo"
                  className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                    Hifzhly
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-emerald-800 font-semibold tracking-wide hidden sm:block">
                  AI Tahfizh &amp; Murojaah Ecosystem
                </p>
              </div>
            </Link>
          )}

          {/* Desktop Nav Items Container - Sleek Tubelight Floating Pill */}
          <nav className="hidden lg:flex items-center bg-slate-100/90 border border-slate-200/90 p-1 rounded-full shadow-inner gap-0.5 relative">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              const isExternalOrRoute = !item.url.startsWith("#");

              const content = (
                <>
                  {/* Tubelight Glowing Lamp Element on Active */}
                  {isActive && (
                    <>
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-500 rounded-full shadow-[0_0_12px_2px_rgba(16,185,129,0.8)]" />
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full opacity-90" />
                    </>
                  )}
                  <Icon
                    className={cn(
                      "w-3.5 h-3.5 shrink-0 transition-colors",
                      isActive ? "text-emerald-100" : "text-slate-400 group-hover:text-emerald-700"
                    )}
                  />
                  <span>{item.name}</span>
                </>
              );

              const linkClasses = cn(
                "relative cursor-pointer text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center space-x-1.5 select-none group",
                isActive
                  ? "bg-emerald-700 text-white font-bold shadow-xs shadow-emerald-800/30"
                  : "text-slate-600 hover:text-emerald-800 hover:bg-slate-200/60"
              );

              if (isExternalOrRoute) {
                return (
                  <Link
                    key={item.name}
                    to={item.url}
                    onClick={() => setActiveTab(item.name)}
                    className={linkClasses}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <a
                  key={item.name}
                  href={item.url}
                  onClick={(e) => handleNavClick(e, item)}
                  className={linkClasses}
                >
                  {content}
                </a>
              );
            })}
          </nav>

          {/* Desktop Right Actions (Download / Login / Register) */}
          {rightActions && (
            <div className="hidden md:flex items-center space-x-2.5">
              {rightActions}
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-slate-200/90 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label={isMobileMenuOpen ? "Tutup Navigasi" : "Buka Navigasi"}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-800" />
            ) : (
              <Menu className="w-5 h-5 text-slate-800" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 z-50 border-b border-slate-200 bg-white/98 backdrop-blur-xl px-4 py-4 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.name;
                const isExternalOrRoute = !item.url.startsWith("#");

                const itemContent = (
                  <>
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0",
                        isActive ? "text-emerald-100" : "text-emerald-700"
                      )}
                    />
                    <span>{item.name}</span>
                  </>
                );

                const mobileClasses = cn(
                  "flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                  isActive
                    ? "bg-emerald-700 text-white font-bold shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                );

                if (isExternalOrRoute) {
                  return (
                    <Link
                      key={item.name}
                      to={item.url}
                      onClick={() => {
                        setActiveTab(item.name);
                        setIsMobileMenuOpen(false);
                      }}
                      className={mobileClasses}
                    >
                      {itemContent}
                    </Link>
                  );
                }

                return (
                  <a
                    key={item.name}
                    href={item.url}
                    onClick={(e) => {
                      handleNavClick(e, item);
                      setIsMobileMenuOpen(false);
                    }}
                    className={mobileClasses}
                  >
                    {itemContent}
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
          </div>
        )}
      </header>

      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 top-16 sm:top-18 bg-slate-900/30 backdrop-blur-xs lg:hidden z-40 transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export default TubelightNavbar;
