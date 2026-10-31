import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./card";
import { Calendar } from "lucide-react";

export interface TimelineEvent {
  id?: string;
  year: string;
  title: string;
  subtitle?: string;
  description: string;
  icon?: React.ReactNode;
  color?: string;
  customContent?: React.ReactNode;
}

export interface ScrollTimelineProps {
  events?: TimelineEvent[];
  title?: string;
  subtitle?: string;
  animationOrder?: "sequential" | "staggered" | "simultaneous";
  cardAlignment?: "alternating" | "left" | "right";
  lineColor?: string;
  activeColor?: string;
  progressIndicator?: boolean;
  cardVariant?: "default" | "elevated" | "outlined" | "filled";
  cardEffect?: "none" | "glow" | "shadow" | "bounce";
  parallaxIntensity?: number;
  progressLineWidth?: number;
  progressLineCap?: "round" | "square";
  dateFormat?: "text" | "badge";
  className?: string;
  revealAnimation?: "fade" | "slide" | "scale" | "flip" | "none";
  connectorStyle?: "dots" | "line" | "dashed";
  perspective?: boolean;
  darkMode?: boolean;
  smoothScroll?: boolean;
}

const DEFAULT_EVENTS: TimelineEvent[] = [
  {
    year: "Fase 1",
    title: "Penyejajaran Levenshtein Kata demi Kata",
    subtitle: "Mendeteksi Substitusi, Delesi, dan Insersi",
    description: "Evaluasi suara pelafalan kata Arab mandiri secara presisi matematis.",
  },
  {
    year: "Fase 2",
    title: "Peringatan Dini Ayat Mutasyabihat",
    subtitle: "Standar Tarteel QUL",
    description: "Mencegah tertukarnya ayat serupa di Juz 30 dengan pembanding visual.",
  },
  {
    year: "Fase 3",
    title: "Jadwal Murojaah Adaptif",
    subtitle: "Algoritma SuperMemo-2",
    description: "Pengulangan berjarak ilmiah yang menghambat kurva lupa ingatan santri.",
  },
];

export const ScrollTimeline = ({
  events = DEFAULT_EVENTS,
  title,
  subtitle,
  cardAlignment = "alternating",
  lineColor = "bg-slate-200",
  activeColor = "bg-emerald-600",
  progressIndicator = true,
  progressLineWidth = 2,
  dateFormat = "badge",
  revealAnimation = "slide",
  className = "",
}: ScrollTimelineProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const timelineRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start center", "end center"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  const progressHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      const newIndex = Math.min(events.length - 1, Math.floor(v * events.length));
      if (newIndex !== activeIndex && newIndex >= 0) {
        setActiveIndex(newIndex);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, events.length, activeIndex]);

  const getCardVariants = (index: number) => {
    const baseDelay = index * 0.15;
    const isEven = index % 2 === 0;

    const initialStates = {
      fade: { opacity: 0, y: 30 },
      slide: {
        x: cardAlignment === "left" ? -60 : cardAlignment === "right" ? 60 : isEven ? -60 : 60,
        opacity: 0,
      },
      scale: { scale: 0.85, opacity: 0 },
      flip: { rotateY: 45, opacity: 0 },
      none: { opacity: 1 },
    };

    return {
      initial: initialStates[revealAnimation] || initialStates.slide,
      whileInView: {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        rotateY: 0,
        transition: {
          duration: 0.6,
          delay: baseDelay,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
      },
      viewport: { once: true, margin: "-80px" },
    };
  };

  return (
    <div className={cn("w-full py-16", className)}>
      {(title || subtitle) && (
        <div className="text-center max-w-2xl mx-auto mb-16 px-4">
          {title && (
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div ref={scrollRef} className="relative max-w-5xl mx-auto px-4">
        {/* Central Vertical Timeline Track Line */}
        <div
          className={cn(
            "absolute top-0 bottom-0 z-0",
            lineColor,
            cardAlignment === "left"
              ? "left-8"
              : cardAlignment === "right"
              ? "right-8"
              : "left-8 lg:left-1/2 -translate-x-1/2"
          )}
          style={{ width: `${progressLineWidth}px` }}
        >
          {progressIndicator && (
            <motion.div
              className={cn("w-full origin-top", activeColor)}
              style={{
                height: progressHeight,
              }}
            />
          )}
        </div>

        {/* Timeline Events List */}
        <div className="relative z-10 space-y-16">
          {events.map((event, index) => {
            const isLeft = cardAlignment === "left" || (cardAlignment === "alternating" && index % 2 === 0);
            const isEventActive = index <= activeIndex;

            return (
              <div
                key={event.id || index}
                ref={(el) => {
                  timelineRefs.current[index] = el;
                }}
                className={cn(
                  "relative flex items-center",
                  "flex-col lg:flex-row",
                  cardAlignment === "alternating"
                    ? isLeft
                      ? "lg:justify-start"
                      : "lg:flex-row-reverse lg:justify-start"
                    : cardAlignment === "left"
                    ? "lg:justify-start"
                    : "lg:flex-row-reverse lg:justify-start"
                )}
              >
                {/* Center Node Indicator */}
                <div
                  className={cn(
                    "absolute top-8 lg:top-1/2 -translate-y-1/2 z-20",
                    cardAlignment === "left"
                      ? "left-8 -translate-x-1/2"
                      : cardAlignment === "right"
                      ? "right-8 translate-x-1/2"
                      : "left-8 lg:left-1/2 -translate-x-1/2"
                  )}
                >
                  <motion.div
                    className={cn(
                      "w-6 h-6 rounded-full border-4 bg-white flex items-center justify-center transition-colors duration-300",
                      isEventActive
                        ? "border-emerald-600 bg-emerald-600 shadow-md shadow-emerald-600/30 ring-4 ring-emerald-100"
                        : "border-slate-300 bg-white"
                    )}
                    animate={
                      isEventActive
                        ? {
                            scale: [1, 1.15, 1],
                          }
                        : {}
                    }
                    transition={{
                      duration: 0.6,
                      ease: "easeInOut",
                    }}
                  />
                </div>

                {/* Event Card Container */}
                <motion.div
                  className={cn(
                    "w-full lg:w-[calc(50%-2.5rem)] ml-16 lg:ml-0",
                    isLeft ? "lg:mr-auto" : "lg:ml-auto"
                  )}
                  variants={getCardVariants(index)}
                  initial="initial"
                  whileInView="whileInView"
                  viewport={{ once: true, margin: "-60px" }}
                >
                  <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all rounded-3xl overflow-hidden">
                    <CardContent className="p-6 sm:p-7">
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                        {dateFormat === "badge" ? (
                          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                            {event.icon || <Calendar className="w-3.5 h-3.5 text-emerald-600" />}
                            <span>{event.year}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-emerald-700 font-mono">
                            {event.year}
                          </span>
                        )}

                        {event.subtitle && (
                          <span className="text-[11px] font-medium text-slate-500">
                            {event.subtitle}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                        {event.title}
                      </h3>

                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                        {event.description}
                      </p>

                      {/* Custom Content slot (e.g., Quran diff, comparative cards) */}
                      {event.customContent && (
                        <div className="pt-3 border-t border-slate-100 mt-2">
                          {event.customContent}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
