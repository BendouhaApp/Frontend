import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShieldCheck, UserRound } from "lucide-react";

export function Account() {
  return (
    <div className="min-h-screen bg-white">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="border-b border-neutral-200 bg-neutral-50/60"
      >
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <p className="text-sm uppercase tracking-[0.14em] text-neutral-500">Compte</p>
          <h1 className="mt-3 font-display text-4xl font-light tracking-tight text-neutral-900 md:text-5xl">
            Espace client
          </h1>
          <p className="mt-4 max-w-3xl text-neutral-600">
            Cette section sera bientôt connectée à votre profil client. En attendant, vous pouvez continuer vos achats depuis la boutique.
          </p>
        </div>
      </motion.section>

      <section className="container mx-auto px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="inline-flex rounded-xl bg-primary-50 p-3 text-primary">
              <UserRound className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-medium text-neutral-900">Connexion client</h2>
            <p className="mt-2 text-neutral-600">
              Un espace de connexion dédié sera disponible prochainement pour suivre vos commandes et vos favoris.
            </p>
          </article>

          <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="inline-flex rounded-xl bg-primary-50 p-3 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-medium text-neutral-900">Besoin d'aide ?</h2>
            <p className="mt-2 text-neutral-600">
              Pour toute question sur une commande, contactez-nous directement depuis la page support.
            </p>
            <Link
              to="/contact"
              className="mt-4 inline-flex items-center rounded-full border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
            >
              Contacter le support
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
}
