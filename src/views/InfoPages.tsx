"use client";

import { motion } from '@/lib/gsap-motion';
import { ArrowLeft } from "lucide-react";
import { Link } from "@/lib/router";

interface ContentSection {
  title: string;
  body: string;
}

interface InfoPageShellProps {
  title: string;
  subtitle: string;
  sections: ContentSection[];
}

function InfoPageShell({ title, subtitle, sections }: InfoPageShellProps) {
  return (
    <div className="min-h-screen bg-white">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="border-b border-neutral-200 bg-neutral-50/60"
      >
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            Retour à l'accueil
          </Link>
          <h1 className="font-display text-4xl font-light tracking-tight text-neutral-900 md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-neutral-600">{subtitle}</p>
        </div>
      </motion.section>

      <section className="container mx-auto px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto max-w-4xl space-y-8">
          {sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-medium text-neutral-900">{section.title}</h2>
              <p className="mt-3 leading-relaxed text-neutral-600">{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function FaqPage() {
  return (
    <InfoPageShell
      title="FAQ"
      subtitle="Retrouvez les réponses aux questions les plus fréquentes sur les commandes, le paiement et la livraison."
      sections={[
        {
          title: "Comment passer une commande ?",
          body: "Ajoutez vos produits au panier, renseignez vos informations de livraison puis validez votre commande depuis la page de paiement.",
        },
        {
          title: "Quels moyens de paiement sont disponibles ?",
          body: "Le mode de paiement dépend de la zone de livraison et des options activées. Vous verrez les méthodes disponibles lors de la validation.",
        },
        {
          title: "Puis-je suivre ma commande ?",
          body: "Après confirmation, notre équipe vous contacte pour le suivi et la livraison selon la wilaya et le mode choisi.",
        },
      ]}
    />
  );
}

export function ShippingInfoPage() {
  return (
    <InfoPageShell
      title="Informations de livraison"
      subtitle="Les frais et délais varient selon la wilaya et le type de livraison sélectionné."
      sections={[
        {
          title: "Zones couvertes",
          body: "Nous livrons dans les wilayas disponibles lors du passage en caisse. Les tarifs sont calculés automatiquement selon votre sélection.",
        },
        {
          title: "Délais estimés",
          body: "Les commandes sont généralement traitées rapidement après confirmation. Les délais exacts vous sont communiqués pendant le suivi.",
        },
        {
          title: "Frais de livraison",
          body: "Certaines zones peuvent bénéficier de la livraison gratuite. Le montant final est affiché clairement avant la validation de la commande.",
        },
      ]}
    />
  );
}

export function ReturnsPage() {
  return (
    <InfoPageShell
      title="Retours"
      subtitle="Si un produit ne vous convient pas, nous vous accompagnons pour une solution rapide."
      sections={[
        {
          title: "Conditions de retour",
          body: "Les retours sont acceptés pour les produits non utilisés et en bon état. Contactez-nous dès réception si vous constatez un problème.",
        },
        {
          title: "Procédure",
          body: "Envoyez votre demande via la page Contact avec votre numéro de commande. Notre équipe vous indiquera les étapes à suivre.",
        },
        {
          title: "Remboursement ou échange",
          body: "Selon le cas, nous proposons un échange, un avoir ou un remboursement conformément à nos conditions commerciales.",
        },
      ]}
    />
  );
}

export function PrivacyPolicyPage() {
  return (
    <InfoPageShell
      title="Politique de confidentialité"
      subtitle="Nous protégeons vos données personnelles et les utilisons uniquement pour traiter vos commandes et améliorer votre expérience."
      sections={[
        {
          title: "Données collectées",
          body: "Nous collectons les informations nécessaires à la commande : identité, contact, adresse et détails logistiques.",
        },
        {
          title: "Utilisation des données",
          body: "Vos données servent à la gestion des commandes, au support client et à l'amélioration des services. Elles ne sont pas vendues.",
        },
        {
          title: "Sécurité",
          body: "Nous mettons en place des mesures de sécurité techniques et organisationnelles pour protéger vos informations.",
        },
      ]}
    />
  );
}

export function TermsPage() {
  return (
    <InfoPageShell
      title="Conditions d'utilisation"
      subtitle="En utilisant ce site, vous acceptez les règles qui encadrent la navigation, les commandes et l'utilisation des contenus."
      sections={[
        {
          title: "Commandes",
          body: "Toute commande validée implique l'acceptation des prix, des délais et des conditions de livraison indiqués au moment du paiement.",
        },
        {
          title: "Disponibilité des produits",
          body: "La disponibilité peut évoluer. En cas d'indisponibilité après commande, nous vous proposerons une alternative adaptée.",
        },
        {
          title: "Propriété du contenu",
          body: "Les textes, images et éléments visuels du site restent la propriété de Bendouha et ne peuvent être réutilisés sans autorisation.",
        },
      ]}
    />
  );
}

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center md:px-6">
        <p className="text-sm uppercase tracking-[0.16em] text-neutral-500">404</p>
        <h1 className="mt-3 font-display text-4xl font-light tracking-tight text-neutral-900 md:text-5xl">
          Page introuvable
        </h1>
        <p className="mt-4 max-w-xl text-neutral-600">
          La page demandée n'existe pas ou a été déplacée. Utilisez le menu principal pour continuer votre navigation.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-600"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}


