"use client";

import { motion } from "framer-motion";
import { Link } from "@/lib/router";
import { ShieldCheck, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Account() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="border-b border-neutral-200 bg-neutral-50/60"
      >
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <p className="text-sm uppercase tracking-[0.14em] text-neutral-500">
            {t("accountPage.eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-4xl font-light tracking-tight text-neutral-900 md:text-5xl">
            {t("accountPage.title")}
          </h1>
          <p className="mt-4 max-w-3xl text-neutral-600">
            {t("accountPage.subtitle")}
          </p>
        </div>
      </motion.section>

      <section className="container mx-auto px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="inline-flex rounded-xl bg-primary-50 p-3 text-primary">
              <UserRound className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-medium text-neutral-900">
              {t("accountPage.loginCard.title")}
            </h2>
            <p className="mt-2 text-neutral-600">
              {t("accountPage.loginCard.description")}
            </p>
          </article>

          <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="inline-flex rounded-xl bg-primary-50 p-3 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-medium text-neutral-900">
              {t("accountPage.supportCard.title")}
            </h2>
            <p className="mt-2 text-neutral-600">
              {t("accountPage.supportCard.description")}
            </p>
            <Link
              to="/contact"
              className="mt-4 inline-flex items-center rounded-full border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
            >
              {t("accountPage.supportCard.cta")}
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
}


