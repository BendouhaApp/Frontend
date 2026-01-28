import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, User, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LanguageSwitcher,
  LanguageSwitcherMobile,
} from "@/components/LanguageSwitcher";
import { CartDrawer } from "@/components/CartDrawer";
import { cn } from "@/lib/utils";
import { BendouhaLogo } from "@/components/logo/BrandLogo";

export function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: t("nav.shop"), href: "/shop" },
    { name: t("nav.collections"), href: "/collections" },
    { name: t("nav.about"), href: "/about" },
    { name: t("nav.contact"), href: "/contact" },
  ];

  // Handle scroll effect for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change - using cleanup function to avoid cascading renders
  useEffect(() => {
    return () => {
      // Only set to false when location changes, not on mount
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
  }, [location.pathname, isMobileMenuOpen]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      role="banner"
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        isScrolled
          ? "border-navy-200 bg-white/95 shadow-sm backdrop-blur-md"
          : "border-transparent bg-white/80 backdrop-blur-sm",
      )}
    >
      <div className="container mx-auto">
        <div className="flex h-20 items-center justify-between px-4 sm:h-24 md:px-6">
          {/* Logo */}
          <Link
            to="/"
            className="relative z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
            aria-label="Bendouha - Home"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <BendouhaLogo className="h-8 w-auto sm:h-10 md:h-12 lg:h-14" />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
            aria-label="Main navigation"
          >
            <ul className="flex items-baseline gap-6 xl:gap-8" role="list">
              {navLinks.map((link) => (
                <li key={link.href} className="flex">
                  <NavigationLink
                    href={link.href}
                    isActive={location.pathname === link.href}
                  >
                    {link.name}
                  </NavigationLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Language Switcher - Desktop */}
            <LanguageSwitcher className="hidden md:block" />

            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="hidden h-10 w-10 items-center justify-center rounded-full text-navy-600 transition-colors hover:bg-navy-50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:flex"
              aria-label={t("common.search")}
              type="button"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </motion.button>

            {/* Account Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="hidden h-10 w-10 items-center justify-center rounded-full text-navy-600 transition-colors hover:bg-navy-50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:flex"
              aria-label={t("common.account")}
              type="button"
            >
              <User className="h-5 w-5" aria-hidden="true" />
            </motion.button>

            {/* Cart Drawer */}
            <CartDrawer />

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-navy-600 transition-colors hover:bg-navy-50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:hidden"
                  aria-label={
                    isMobileMenuOpen ? t("common.close") : t("common.menu")
                  }
                  aria-expanded={isMobileMenuOpen}
                  type="button"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </motion.button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-100">
                <SheetHeader>
                  <SheetTitle className="font-display text-2xl font-light tracking-tight">
                    {t("common.menu")}
                  </SheetTitle>
                </SheetHeader>
                <MobileNavigation
                  navLinks={navLinks}
                  currentPath={location.pathname}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

// Navigation Link Component with hover animation
function NavigationLink({
  href,
  children,
  isActive,
}: {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={href}
      className={cn(
        "relative inline-flex h-8 items-center rounded-sm px-1 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isActive ? "text-navy" : "text-navy-600 hover:text-primary",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
      <motion.span
        className="absolute -bottom-0.5 start-0 h-0.5 w-full bg-primary"
        initial={{ scaleX: isActive ? 1 : 0 }}
        animate={{ scaleX: isHovered || isActive ? 1 : 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{ originX: 0 }}
        aria-hidden="true"
      />
    </Link>
  );
}

// Mobile Navigation Component
interface MobileNavigationProps {
  navLinks: { name: string; href: string }[];
  currentPath: string;
}

function MobileNavigation({ navLinks, currentPath }: MobileNavigationProps) {
  const { t } = useTranslation();

  return (
    <nav className="mt-8" aria-label="Mobile navigation">
      <ul className="space-y-1" role="list">
        {navLinks.map((link, index) => {
          const isActive = currentPath === link.href;
          return (
            <motion.li
              key={link.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <Link
                to={link.href}
                className={cn(
                  "block rounded-lg px-4 py-3 text-lg font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isActive
                    ? "bg-primary-50 text-primary"
                    : "text-navy-700 hover:bg-navy-50 hover:text-primary",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {link.name}
              </Link>
            </motion.li>
          );
        })}
      </ul>

      {/* Mobile Actions */}
      <div className="mt-8 space-y-2 border-t border-navy-200 pt-6">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-navy-700 transition-colors hover:bg-navy-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
          <span className="font-medium">{t("common.search")}</span>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-navy-700 transition-colors hover:bg-navy-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <User className="h-5 w-5" aria-hidden="true" />
          <span className="font-medium">{t("common.account")}</span>
        </motion.button>
      </div>

      {/* Language Switcher - Mobile */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="mt-6 border-t border-navy-200 pt-6"
      >
        <LanguageSwitcherMobile />
      </motion.div>
    </nav>
  );
}
