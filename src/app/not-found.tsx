import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center md:px-6">
        <p className="text-sm uppercase tracking-[0.16em] text-neutral-500">
          404
        </p>
        <h1 className="mt-3 font-display text-4xl font-light tracking-tight text-neutral-900 md:text-5xl">
          Page introuvable
        </h1>
        <p className="mt-4 max-w-xl text-neutral-600">
          La page demandee n&apos;existe pas ou a ete deplacee.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-600"
        >
          Retour a l&apos;accueil
        </Link>
      </div>
    </div>
  );
}

