import type { Metadata } from "next";
import { Simulator } from "@/views/Simulator";
import { createPageMetadata } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = createPageMetadata({
  title: "Simulateur d'eclairage",
  description:
    "Testez les produits d'eclairage Bendouha Electric dans des scenes 3D avec notre simulateur de luminosite.",
  path: "/simulator",
  keywords: [
    "simulateur eclairage",
    "simulation luminaire LED",
    "configurer eclairage interieur",
  ],
});

export default function SimulatorPage() {
  return <Simulator />;
}
