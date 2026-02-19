"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { useLocation } from "@/lib/router";
import { gsap } from "gsap";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function MainLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  // Keep transitions on path changes only; query updates should not remount the page.
  const pageKey = location.pathname;
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!pageRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const pageElement = pageRef.current;
      if (!pageElement) return;

      const directChildren = Array.from(pageElement.children).slice(0, 6);

      gsap.fromTo(
        pageElement,
        { autoAlpha: 0, y: 14 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
        },
      );

      if (directChildren.length > 1) {
        gsap.fromTo(
          directChildren,
          { autoAlpha: 0, y: 12 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
            ease: "power2.out",
            stagger: 0.06,
            delay: 0.06,
          },
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, [pageKey]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Skip to content link for keyboard users */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <Header />

      <main id="main-content" className="flex-1" tabIndex={-1}>
        <div key={pageKey} ref={pageRef}>
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}


