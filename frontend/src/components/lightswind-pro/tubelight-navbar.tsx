import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
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

  // Intersection & Scrollspy tracking for in-page hash links
  useEffect(() => {
    const hashItems = items.filter((item) => item.url.startsWith("#"));
    if (hashItems.length === 0) {
      const current = items.find((item) => item.url === location.pathname);
      if (current) setActiveTab(current.name);
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140; // offset for sticky navbar
      for (let i = hashItems.length - 1; i >= 0; i--) {
        const item = hashItems[i];
        const el = document.getElementById(item.url.slice(1));
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveTab(item.name);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items, location.pathname]);

  const handleNavClick = (e: React.MouseEvent, item: NavItem) => {
    setActiveTab(item.name);
    if (item.url.startsWith("#")) {
      e.preventDefault();
      const targetId = item.url.slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        const navHeight = 76;
        const targetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({
          top: targetTop,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <header className={cn("sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all", className)}>
      <div className="max-w-6xl mx-auto px-4 h-18 flex items-center justify-between">
        {/* Brand / Logo */}
        {brand ? (
          brand
        ) : (
          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src="/logo saja.png"
              alt="Hifzhly Logo"
              className="w-10 h-10 object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">Hifzhly</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Platform Pendamping Murojaah Al-Qur'an</p>
            </div>
          </Link>
        )}

        {/* Tubelight Nav Items Container */}
        <nav className="flex items-center bg-slate-100/90 border border-slate-200/90 backdrop-blur-lg p-1 rounded-full shadow-xs">
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
                <span className="hidden md:inline">{item.name}</span>

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

        {/* Right Actions (e.g. Login / Register Buttons) */}
        {rightActions && (
          <div className="flex items-center space-x-2.5">
            {rightActions}
          </div>
        )}
      </div>
    </header>
  );
}

export default TubelightNavbar;
