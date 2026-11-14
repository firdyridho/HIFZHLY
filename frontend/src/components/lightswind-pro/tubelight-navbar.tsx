/**
 * LandingNavbar — editorial minimal header for the landing page.
 * Scrollspy, mobile drawer, logo + nav links + login/register.
 * No icon pills, no gradient bars, no tubelight lamp glows.
 * Active state: simple underline or bold text weight change.
 */
import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  name: string;
  url: string;
  icon?: LucideIcon;
}

export interface LandingNavbarProps {
  items: NavItem[];
  className?: string;
  brand?: React.ReactNode;
  rightActions?: React.ReactNode;
}

export function LandingNavbar({
  items,
  className,
  brand,
  rightActions,
}: LandingNavbarProps) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(items[0]?.name || "");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isClickingRef = useRef(false);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rAFRef = useRef<number | null>(null);

  // Scroll-aware background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-close mobile on resize/Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Scrollspy for hash links on "/"
  useEffect(() => {
    if (location.pathname !== "/" && location.pathname !== "") return;
    const hashItems = items.filter((item) => item.url.startsWith("#"));
    if (hashItems.length === 0) return;

    const onScroll = () => {
      if (isClickingRef.current) return;
      if (rAFRef.current !== null) cancelAnimationFrame(rAFRef.current);

      rAFRef.current = requestAnimationFrame(() => {
        const scrollPos = window.scrollY + 120;
        const winH = window.innerHeight;
        const docH = document.documentElement.scrollHeight;

        if (window.scrollY + winH >= docH - 60) {
          const last = hashItems[hashItems.length - 1];
          if (last) setActiveTab((p) => (p !== last.name ? last.name : p));
          return;
        }

        for (let i = hashItems.length - 1; i >= 0; i--) {
          const item = hashItems[i];
          const el = document.getElementById(item.url.slice(1));
          if (el) {
            const docTop = el.getBoundingClientRect().top + window.scrollY;
            if (scrollPos >= docTop - 40) {
              setActiveTab((p) => (p !== item.name ? item.name : p));
              return;
            }
          }
        }
        if (hashItems[0]) setActiveTab((p) => (p !== hashItems[0].name ? hashItems[0].name : p));
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rAFRef.current !== null) cancelAnimationFrame(rAFRef.current);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, [items, location.pathname]);

  // Route-based active tab
  useEffect(() => {
    if (location.pathname !== "/" && location.pathname !== "") {
      const matched = items.find((item) => item.url === location.pathname);
      if (matched) setActiveTab(matched.name);
    }
  }, [location.pathname, items]);

  const handleNavClick = (e: React.MouseEvent, item: NavItem) => {
    if (item.url.startsWith("#")) {
      e.preventDefault();
      const targetEl = document.getElementById(item.url.slice(1));
      setActiveTab(item.name);
      isClickingRef.current = true;
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = setTimeout(() => { isClickingRef.current = false; }, 800);
      if (targetEl) {
        const top = Math.max(0, targetEl.getBoundingClientRect().top + window.scrollY - 70);
        window.scrollTo({ top, behavior: "smooth" });
      }
    } else {
      setActiveTab(item.name);
    }
    setIsMobileMenuOpen(false);
  };

  const handleBrandClick = (e: React.MouseEvent) => {
    if (location.pathname === "/" || location.pathname === "") {
      e.preventDefault();
      isClickingRef.current = true;
      setActiveTab(items[0]?.name || "");
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = setTimeout(() => { isClickingRef.current = false; }, 800);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_12px_rgba(0,0,0,0.04)]"
            : "bg-transparent",
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">

          {/* Brand */}
          {brand ? brand : (
            <Link
              to="/"
              onClick={handleBrandClick}
              className="flex items-center gap-2.5 select-none shrink-0 group"
            >
              <img
                src="/logo saja.png"
                alt="Hifzhly"
                className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-black text-base tracking-tight text-slate-900">
                Hifzhly
              </span>
            </Link>
          )}

          {/* Desktop Nav — plain text links, active = emerald + weight */}
          <nav className="hidden lg:flex items-center gap-1">
            {items.map((item) => {
              const isActive = activeTab === item.name;
              const isRoute = !item.url.startsWith("#");

              const cls = cn(
                "relative px-3 py-1.5 text-[13px] font-semibold transition-colors duration-150 rounded-md",
                isActive
                  ? "text-emerald-700"
                  : "text-slate-500 hover:text-slate-900"
              );

              const inner = (
                <>
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-emerald-500 rounded-full" />
                  )}
                </>
              );

              return isRoute ? (
                <Link
                  key={item.name}
                  to={item.url}
                  onClick={() => setActiveTab(item.name)}
                  className={cls}
                >
                  {inner}
                </Link>
              ) : (
                <a
                  key={item.name}
                  href={item.url}
                  onClick={(e) => handleNavClick(e, item)}
                  className={cls}
                >
                  {inner}
                </a>
              );
            })}
          </nav>

          {/* Desktop right actions */}
          {rightActions && (
            <div className="hidden md:flex items-center gap-3 shrink-0">
              {rightActions}
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-slate-900 transition-colors"
            aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
          >
            {isMobileMenuOpen
              ? <X className="w-5 h-5" />
              : <Menu className="w-5 h-5" />
            }
          </button>
        </div>

        {/* Mobile drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white/98 backdrop-blur-xl px-5 py-5 shadow-xl">
            <div className="space-y-1">
              {items.map((item) => {
                const isActive = activeTab === item.name;
                const isRoute = !item.url.startsWith("#");
                const cls = cn(
                  "block px-4 py-3 text-sm font-semibold rounded-lg transition-colors",
                  isActive
                    ? "text-emerald-700 bg-emerald-50"
                    : "text-slate-700 hover:bg-slate-50"
                );
                return isRoute ? (
                  <Link
                    key={item.name}
                    to={item.url}
                    onClick={() => { setActiveTab(item.name); setIsMobileMenuOpen(false); }}
                    className={cls}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <a
                    key={item.name}
                    href={item.url}
                    onClick={(e) => handleNavClick(e, item)}
                    className={cls}
                  >
                    {item.name}
                  </a>
                );
              })}
            </div>
            {rightActions && (
              <div
                className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {rightActions}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export default LandingNavbar;
