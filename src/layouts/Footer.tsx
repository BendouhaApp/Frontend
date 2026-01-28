import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BendouhaLogo } from "@/components/logo/BrandLogo";

// Social link component with hover animation
function SocialLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
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
      aria-label={`Suivez-nous sur ${label}`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </motion.a>
  );
}

// Footer link component
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
          "group inline-flex items-center gap-1 py-1 text-sm text-navy-300 transition-colors",
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
  const [email, setEmail] = useState("");

  const currentYear = new Date().getFullYear();

  // Quick links
  const quickLinks = [
    { to: "/shop", label: "Boutique" },
    { to: "/collections", label: "Collections" },
    { to: "/about", label: "À propos" },
    { to: "/contact", label: "Contact" },
  ];

  // Support links
  const supportLinks = [
    { to: "/faq", label: "FAQ" },
    { to: "/shipping", label: "Livraison" },
    { to: "/returns", label: "Retours" },
  ];

  // Social links - Only Instagram and Facebook
  const socialLinks = [
    {
      href: "https://instagram.com/bendouha",
      icon: Instagram,
      label: "Instagram",
    },
    {
      href: "https://facebook.com/bendouha",
      icon: Facebook,
      label: "Facebook",
    },
  ];

  // Newsletter submit handler (UI only)
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Inscription newsletter:", email);
    setEmail("");
  };

  return (
    <footer className="border-t border-navy-800 bg-navy" role="contentinfo">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 sm:py-16 md:px-6 md:py-20">
        <div className="grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-3 lg:gap-16">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <BendouhaLogo className="h-20 w-auto text-white" />
              </motion.div>
            </Link>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-navy-300">
              Votre destination pour des équipements électriques de qualité
              supérieure.
            </p>

            {/* Contact Info */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm text-navy-300">
                <MapPin className="h-4 w-4 shrink-0 text-cyan" />
                <span>123 rue Design, Alger, Algérie</span>
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

            {/* Social Links */}
            <div className="mt-8">
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">
                Suivez-nous
              </h3>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <SocialLink key={social.label} {...social} />
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-1">
            {/* Quick Links */}
            <div>
              <h3 className="mb-5 text-sm font-medium uppercase tracking-wider text-gold">
                Liens Rapides
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <FooterLink key={link.to} to={link.to}>
                    {link.label}
                  </FooterLink>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="mb-5 text-sm font-medium uppercase tracking-wider text-gold">
                Support
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

          {/* Newsletter Section */}
          <div className="lg:col-span-1">
            <h3 className="mb-5 text-sm font-medium uppercase tracking-wider text-gold">
              Newsletter
            </h3>
            <p className="mb-4 text-sm text-navy-300">
              Inscrivez-vous pour recevoir nos offres exclusives et nouveautés.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  className={cn(
                    "w-full rounded-full border border-navy-600 bg-navy-800 px-4 py-3 text-sm text-white",
                    "placeholder:text-navy-400",
                    "focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20",
                  )}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-full bg-primary hover:bg-primary-600"
              >
                S'inscrire
                <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
              </Button>
            </form>
            <p className="mt-3 text-xs text-navy-400">
              En vous inscrivant, vous acceptez notre politique de
              confidentialité.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-navy-800 bg-navy-900">
        <div className="container mx-auto px-4 py-6 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Copyright */}
            <p className="text-sm text-navy-400">
              © {currentYear} Bendouha. Tous droits réservés.
            </p>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link
                to="/privacy"
                className="text-sm text-navy-400 transition-colors hover:text-cyan"
              >
                Confidentialité
              </Link>
              <Link
                to="/terms"
                className="text-sm text-navy-400 transition-colors hover:text-cyan"
              >
                Conditions d'utilisation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
