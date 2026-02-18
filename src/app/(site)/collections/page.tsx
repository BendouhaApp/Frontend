import type { Metadata } from "next";
import { Collections } from "@/views/Collections";
import { createPageMetadata } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = 300;

export const metadata: Metadata = createPageMetadata({
  title: "Collections d'eclairage et equipement electrique",
  description:
    "Explorez les collections Bendouha Electric par categories: spots, rails magnetiques, track slim, suspensions, appliques et accessoires electriques.",
  path: "/collections",
  keywords: [
    "collections eclairage",
    "categories luminaire",
    "collections Bendouha Electric",
    "rails magnetiques",
    "track slim",
  ],
});

export default function CollectionsPage() {
  return <Collections />;
}
