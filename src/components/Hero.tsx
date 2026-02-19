"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, type Variants } from '@/lib/gsap-motion';
import { gsap } from "gsap";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { DURATION, EASE } from "@/lib/motion";

// Animation variants for staggered entrance
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: "easeOut",
    },
  },
};

interface HeroProps {
  /** Main headline text */
  headline?: string;
  /** Emphasized word in headline (optional) */
  highlightWord?: string;
  /** Subtitle/description text */
  subtitle?: string;
  /** CTA button text */
  ctaText?: string;
  /** CTA button link */
  ctaHref?: string;
  /** Optional background image URL */
  backgroundImage?: string;
  /** Whether to show the decorative elements */
  showDecorative?: boolean;
  /** Target element id for scroll indicator action */
  scrollTargetId?: string;
}

export function Hero({
  headline,
  highlightWord,
  subtitle,
  ctaText,
  ctaHref = "/shop",
  backgroundImage,
  showDecorative = true,
  scrollTargetId = "home-discover",
}: HeroProps) {
  const { t } = useTranslation();
  const [contentReady, setContentReady] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const primaryOrbRef = useRef<HTMLDivElement | null>(null);
  const secondaryOrbRef = useRef<HTMLDivElement | null>(null);
  const goldOrbRef = useRef<HTMLDivElement | null>(null);
  const subtitleLeadRef = useRef<HTMLSpanElement | null>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement | null>(null);
  const scrollLabelRef = useRef<HTMLSpanElement | null>(null);
  const scrollLineRef = useRef<HTMLDivElement | null>(null);
  const statsWrapperRef = useRef<HTMLDivElement | null>(null);
  const statsTrackRef = useRef<HTMLDivElement | null>(null);

  // Use translations as defaults
  const displayHeadline = headline ?? t("hero.headline");
  const displayHighlight = highlightWord ?? t("hero.highlightWord");
  const displaySubtitle = subtitle ?? t("hero.subtitle");
  const displayCta = ctaText ?? t("hero.cta");
  const isExternalCta = /^https?:\/\//.test(ctaHref);
  const hasHighlight = displayHighlight.trim().length > 0;
  const subtitleMatch = displaySubtitle.match(/^(.+?[.!?])\s*(.*)$/);
  const displaySubtitleLead = subtitleMatch?.[1] ?? displaySubtitle;
  const displaySubtitleRest = subtitleMatch?.[2] ?? "";
  const heroStats = useMemo(
    () => [
      { key: "customers", value: "+20K", label: t("hero.stats.customers") },
      { key: "pieces", value: "500+", label: t("hero.stats.pieces") },
      { key: "quality", value: "100%", label: t("hero.stats.quality") },
      { key: "coverage", value: "69", label: t("hero.stats.coverage") },
      { key: "support", value: "7j/7", label: t("hero.stats.support") },
      { key: "delivery", value: "24h", label: t("hero.stats.delivery") },
      { key: "returns", value: "30j", label: t("hero.stats.returns") },
      { key: "references", value: "1200+", label: t("hero.stats.references") },
      { key: "rating", value: "4.9/5", label: t("hero.stats.rating") },
      { key: "warranty", value: "2 ans", label: t("hero.stats.warranty") },
    ],
    [t],
  );
  const marqueeStats = [...heroStats, ...heroStats, ...heroStats];

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      setContentReady(true);
    });

    return () => window.cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    if (!heroRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (scrollIndicatorRef.current) {
        gsap.set(scrollIndicatorRef.current, { autoAlpha: 1, y: 0 });
      }
      if (scrollLabelRef.current) {
        gsap.set(scrollLabelRef.current, { opacity: 1 });
      }
      if (scrollLineRef.current) {
        gsap.set(scrollLineRef.current, { scaleY: 1, opacity: 1 });
      }
      if (statsTrackRef.current && statsWrapperRef.current) {
        const singleSetWidth = statsTrackRef.current.scrollWidth / 3;
        const centeredStart =
          -singleSetWidth +
          (statsWrapperRef.current.clientWidth - singleSetWidth) / 2;
        gsap.set(statsTrackRef.current, { x: centeredStart });
      }
      return;
    }

    const cleanupFns: Array<() => void> = [];
    const ctx = gsap.context(() => {
      if (showDecorative) {
        const orbs = [
          primaryOrbRef.current,
          secondaryOrbRef.current,
          goldOrbRef.current,
        ].filter((orb): orb is HTMLDivElement => orb !== null);

        orbs.forEach((orb, index) => {
          gsap.to(orb, {
            y: index % 2 === 0 ? -18 : 18,
            x: index === 1 ? 12 : -10,
            duration: 6 + index * 1.4,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        });
      }

      if (subtitleLeadRef.current) {
        gsap.fromTo(
          subtitleLeadRef.current,
          { backgroundPosition: "0% 50%" },
          {
            backgroundPosition: "100% 50%",
            duration: 7,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          },
        );
      }

      if (scrollIndicatorRef.current) {
        gsap.fromTo(
          scrollIndicatorRef.current,
          { autoAlpha: 0, y: -6 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            delay: 1.2,
          },
        );

        gsap.to(scrollIndicatorRef.current, {
          y: 8,
          duration: 1.25,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      if (scrollLineRef.current) {
        gsap.fromTo(
          scrollLineRef.current,
          { scaleY: 0.35, opacity: 0.5, transformOrigin: "top center" },
          {
            scaleY: 1,
            opacity: 1,
            duration: 1.2,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          },
        );
      }

      if (scrollLabelRef.current) {
        gsap.to(scrollLabelRef.current, {
          opacity: 0.45,
          duration: 1.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      if (statsTrackRef.current && statsWrapperRef.current) {
        const track = statsTrackRef.current;
        const wrapper = statsWrapperRef.current;
        let statsTween: gsap.core.Tween | null = null;

        const setupStatsMarquee = () => {
          const singleSetWidth = track.scrollWidth / 3;
          const centeredStart =
            -singleSetWidth + (wrapper.clientWidth - singleSetWidth) / 2;
          const centeredEnd = centeredStart - singleSetWidth;

          statsTween?.kill();
          gsap.set(track, { x: centeredStart });
          statsTween = gsap.to(track, {
            x: centeredEnd,
            duration: 32,
            ease: "none",
            repeat: -1,
          });
        };

        setupStatsMarquee();

        const handleMouseEnter = () => statsTween?.pause();
        const handleMouseLeave = () => statsTween?.play();
        const handleResize = () => setupStatsMarquee();

        wrapper.addEventListener("mouseenter", handleMouseEnter);
        wrapper.addEventListener("mouseleave", handleMouseLeave);
        window.addEventListener("resize", handleResize);

        cleanupFns.push(() => {
          wrapper.removeEventListener("mouseenter", handleMouseEnter);
          wrapper.removeEventListener("mouseleave", handleMouseLeave);
          window.removeEventListener("resize", handleResize);
          statsTween?.kill();
        });
      }
    }, heroRef);

    return () => {
      cleanupFns.forEach((fn) => fn());
      ctx.revert();
    };
  }, [heroStats, showDecorative]);

  const scrollToNextSection = () => {
    const target = document.getElementById(scrollTargetId);
    if (target) {
      const targetTop =
        target.getBoundingClientRect().top + window.scrollY - 16;
      window.scrollTo({ top: targetTop, behavior: "smooth" });
      return;
    }

    window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-[calc(100vh-5rem)] overflow-hidden"
    >
      {/* Background Layer */}
      <div className="absolute inset-0">
        {backgroundImage ? (
          // Image Background
          <motion.div
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            className="absolute inset-0"
          >
            <img
              src={backgroundImage}
              alt=""
              className="h-full w-full object-cover"
            />
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-linear-to-r from-navy/95 via-navy/70 to-navy/40" />
          </motion.div>
        ) : (
          // Premium gradient background with brand colors
          <div className="absolute inset-0 bg-linear-to-br from-navy via-navy-800 to-navy-900" />
        )}

        {/* Decorative Elements */}
        {showDecorative && (
          <>
            {/* Primary blue orb */}
            <motion.div
              ref={primaryOrbRef}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="absolute -right-1/4 top-1/4 h-150 w-150 rounded-full bg-linear-to-br from-primary/20 to-transparent blur-3xl"
            />
            {/* Cyan accent orb */}
            <motion.div
              ref={secondaryOrbRef}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.7 }}
              className="absolute -left-1/4 bottom-1/4 h-125 w-125 rounded-full bg-linear-to-tr from-cyan/10 to-transparent blur-3xl"
            />
            {/* Gold accent */}
            <motion.div
              ref={goldOrbRef}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.9 }}
              className="absolute right-1/4 bottom-1/3 h-75 w-75 rounded-full bg-linear-to-tr from-gold/10 to-transparent blur-3xl"
            />
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            {/* Eyebrow/Label */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={contentReady ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.2 }}
              className="my-6 inline-block text-sm font-medium uppercase tracking-widest text-gold"
            >
              {t("hero.eyebrow")}
            </motion.span>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={
                contentReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={{
                delay: 0.3,
                duration: DURATION.slow,
                ease: EASE.out,
              }}
              className="font-display text-[clamp(3.4rem,14vw,7rem)] font-light leading-[1.05] tracking-tight text-white md:whitespace-nowrap"
            >
              {displayHeadline}
              {hasHighlight && (
                <>
                  {" "}
                  <span className="bg-linear-to-r from-primary via-cyan to-cyan-300 bg-clip-text font-normal text-transparent">
                    {displayHighlight}
                  </span>
                </>
              )}
            </motion.h1>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={
                contentReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={{
                delay: 0.4,
                duration: DURATION.slow,
                ease: EASE.out,
              }}
              className="mt-8 max-w-3xl"
            >
              <p className="font-display text-[clamp(1.5rem,5.8vw,3rem)] font-light leading-[1.08] tracking-tight">
                <span
                  ref={subtitleLeadRef}
                  className="bg-linear-to-r from-primary via-cyan to-cyan-300 bg-clip-text text-transparent"
                  style={{ backgroundSize: "200% 100%", backgroundPosition: "0% 50%" }}
                >
                  {displaySubtitleLead}
                </span>
              </p>
              {displaySubtitleRest && (
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-navy-200 md:text-lg">
                  {displaySubtitleRest}
                </p>
              )}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={
                contentReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={{
                delay: 0.5,
                duration: DURATION.slow,
                ease: EASE.out,
              }}
              className="mt-10"
            >
              <Button
                size="lg"
                className="group h-14 rounded-full bg-primary px-8 text-base text-white hover:bg-primary-600"
                asChild
              >
                {isExternalCta ? (
                  <a href={ctaHref}>
                    {displayCta}
                    <ArrowRight className="ms-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                  </a>
                ) : (
                  <Link to={ctaHref}>
                    {displayCta}
                    <ArrowRight className="ms-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                  </Link>
                )}
              </Button>
            </motion.div>
          </div>

          {/* Optional: Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={
              contentReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
            }
            transition={{
              delay: 0.6,
              duration: DURATION.slow,
              ease: EASE.out,
            }}
            className="mt-16 border-t border-navy-600 pt-8"
          >
            <div
              ref={statsWrapperRef}
              className="mx-auto w-[min(95vw,1200px)] overflow-hidden rounded-2xl border border-navy-600/80 bg-navy-900/30 p-3 backdrop-blur-sm"
            >
              <div ref={statsTrackRef} className="flex w-max gap-4 sm:gap-5">
                {marqueeStats.map((stat, index) => (
                  <div
                    key={`${stat.key}-${index}`}
                    className="min-w-[168px] rounded-xl border border-navy-600/70 bg-navy-800/45 px-4 py-3 sm:min-w-[196px]"
                  >
                    <p className="text-xl font-light text-white sm:text-2xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-navy-300 sm:text-sm">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        ref={scrollIndicatorRef}
        className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0"
      >
        <a
          href={`#${scrollTargetId}`}
          onClick={(event) => {
            event.preventDefault();
            scrollToNextSection();
          }}
          className="group flex flex-col items-center gap-2 focus:outline-none"
        >
          <span
            ref={scrollLabelRef}
            className="text-xs font-medium uppercase tracking-wider text-navy-400 transition-colors duration-300 group-hover:text-cyan"
          >
            {t("hero.scroll")}
          </span>
          <div
            ref={scrollLineRef}
            className="h-12 w-px bg-linear-to-b from-cyan via-cyan-300 to-transparent"
          />
        </a>
      </div>
    </section>
  );
}

// Alternative: Centered Hero variant
export function HeroCentered({
  headline,
  highlightWord,
  subtitle,
  ctaText,
  ctaHref = "/shop",
}: Omit<HeroProps, "backgroundImage" | "showDecorative">) {
  const { t } = useTranslation();

  const displayHeadline = headline ?? t("hero.headline");
  const displayHighlight = highlightWord ?? t("hero.highlightWord");
  const displaySubtitle = subtitle ?? t("hero.subtitle");
  const displayCta = ctaText ?? t("hero.cta");
  const isExternalCta = /^https?:\/\//.test(ctaHref);
  const hasHighlight = displayHighlight.trim().length > 0;

  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-navy">
      {/* Subtle texture */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Decorative orbs */}
      <div className="absolute -right-1/4 top-1/4 h-100 w-100 rounded-full bg-linear-to-br from-primary/15 to-transparent blur-3xl" />
      <div className="absolute -left-1/4 bottom-1/4 h-75 w-75 rounded-full bg-linear-to-tr from-cyan/10 to-transparent blur-3xl" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl text-center"
        >
          {/* Decorative line */}
          <motion.div
            variants={itemVariants}
            className="mx-auto mb-8 h-px w-16 bg-gold"
          />

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="font-display text-[clamp(3.2rem,13vw,7rem)] font-light leading-[1.05] tracking-tight text-white md:whitespace-nowrap"
          >
            {displayHeadline}
            {hasHighlight && (
              <>
                {" "}
                <span className="bg-linear-to-r from-primary via-cyan to-cyan-300 bg-clip-text font-normal italic text-transparent">
                  {displayHighlight}
                </span>
              </>
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-navy-200 md:text-lg"
          >
            {displaySubtitle}
          </motion.p>

          {/* CTA */}
          <motion.div variants={itemVariants} className="mt-12">
            <Button
              variant="outline"
              size="lg"
              className="group h-14 rounded-full border-2 border-cyan px-10 text-base text-white hover:bg-cyan hover:text-navy"
              asChild
            >
              {isExternalCta ? (
                <a href={ctaHref}>
                  {displayCta}
                  <ArrowRight className="ms-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </a>
              ) : (
                <Link to={ctaHref}>
                  {displayCta}
                  <ArrowRight className="ms-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </Link>
              )}
            </Button>
          </motion.div>

          {/* Decorative line */}
          <motion.div
            variants={itemVariants}
            className="mx-auto mt-12 h-px w-16 bg-gold"
          />
        </motion.div>
      </div>
    </section>
  );
}
