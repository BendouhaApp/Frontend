import type { Metadata } from "next";
import { Account } from "@/views/Account";
import { createPageMetadata } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Compte client",
    description: "Accedez a votre espace client Bendouha Electric.",
    path: "/account",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountPage() {
  return <Account />;
}
