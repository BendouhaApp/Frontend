import { Link } from "@/lib/router";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { BendouhaLogo } from "@/components/logo/BrandLogo";

function SocialLink({
  href,
  icon: Icon,
  ariaLabel,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  ariaLabel: string;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full bg-navy-100 text-navy-600 transition-colors",
        "hover:bg-primary hover:text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label={ariaLabel}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </motion.a>
  );
}

function FooterLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        to={to}
        className={cn(
          "group inline-flex items-center gap-1 py-1 text-sm text-navy-200 transition-colors",
          "hover:text-cyan",
          "focus-visible:outline-none focus-visible:text-cyan focus-visible:underline",
        )}
      >
        <span>{children}</span>
        <ArrowRight
          className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}

export function Footer() {
  const { t } = useTranslation();

  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { to: "/shop", label: t("footer.shop") },
    { to: "/collections", label: t("footer.collections") },
    { to: "/about", label: t("footer.aboutUs") },
    { to: "/contact", label: t("footer.contact") },
  ];

  const supportLinks = [
    { to: "/faq", label: t("footer.faq") },
    { to: "/shipping", label: t("footer.shippingInfo") },
    { to: "/returns", label: t("footer.returns") },
  ];

  const socialLinks = [
    {
      href: "https://www.tiktok.com/@bendou95",
      icon: SiTiktok,
      label: "Tiktok",
    },
    {
      href: "https://www.instagram.com/electricity.bendo",
      icon: Instagram,
      label: "Instagram",
    },
    {
      href: "https://www.facebook.com/bendouha.elec",
      icon: Facebook,
      label: "Facebook",
    },
  ];

  return (
    <footer className="border-t border-navy-800 bg-navy" role="contentinfo">
      <div className="container mx-auto px-4 py-12 sm:py-16 md:px-6 md:py-20">
        <div className="grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div>
            <Link to="/" className="inline-block">
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <BendouhaLogo className="h-20 w-auto text-white" />
              </motion.div>
            </Link>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-navy-300">
              {t("footer.brandDescription")}
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm text-navy-300">
                <MapPin className="h-4 w-4 shrink-0 text-cyan" />
                <a
                  className="text-inherit focus:outline-none"
                  href="https://maps.app.goo.gl/t5aMCSCskGvYFuAQ6"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>Boulevard des 20 metres, Blida, Algerie</span>
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-navy-300">
                <Phone className="h-4 w-4 shrink-0 text-cyan" />
                <span>+213 555 123 456</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-navy-300">
                <Mail className="h-4 w-4 shrink-0 text-cyan" />
                <span>bonjour@bendouha.com</span>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">
                {t("footer.followUs")}
              </h3>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <SocialLink
                    key={social.label}
                    href={social.href}
                    icon={social.icon}
                    ariaLabel={`${t("footer.followUs")}: ${social.label}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="mb-5 text-sm font-medium uppercase tracking-wider text-gold">
                {t("footer.quickLinks")}
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <FooterLink key={link.to} to={link.to}>
                    {link.label}
                  </FooterLink>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-5 text-sm font-medium uppercase tracking-wider text-gold">
                {t("footer.support")}
              </h3>
              <ul className="space-y-3">
                {supportLinks.map((link) => (
                  <FooterLink key={link.to} to={link.to}>
                    {link.label}
                  </FooterLink>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-navy-800 bg-navy-900">
        <div className="container mx-auto px-4 py-6 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-navy-300">
              {t("footer.copyright", { year: currentYear })}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link
                to="/privacy"
                className="text-sm text-navy-200 transition-colors hover:text-cyan"
              >
                {t("footer.privacyPolicy")}
              </Link>
              <Link
                to="/terms"
                className="text-sm text-navy-200 transition-colors hover:text-cyan"
              >
                {t("footer.termsOfService")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


