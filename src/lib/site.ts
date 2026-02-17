import type { Metadata } from "next";

export const SITE_NAME = "Bendouha Electric";
export const DEFAULT_SITE_URL = "https://bendouha.com";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
export const SITE_OG_IMAGE = "/shop-logo.svg";

export const SUPPORT_PHONE_DISPLAY = "0549 15 37 51";
export const SUPPORT_PHONE_RAW = "0549153751";
export const SUPPORT_EMAIL = "bendouha.elec@gmail.com";
export const STORE_ADDRESS = "Boulevard des 20 metres, Blida, Algerie";

export const SITE_DESCRIPTION =
  "Bendouha Electric est une boutique specialisee en eclairage LED et equipement electrique en Algerie: spots, rails magnetiques, suspensions, appliques, projecteurs, transformateurs et accessoires electriques.";

const ELECTRICAL_CORE_KEYWORDS = [
  "Bendouha Electric",
  "eclairage",
  "eclairage LED",
  "equipement electrique",
  "materiel electrique",
  "boutique electrique Algerie",
  "luminaires",
  "luminaire LED",
  "magasin eclairage Algerie",
  "vente materiel electrique",
  "electrique Algerie",
  "produits electriques",
];

const ELECTRICAL_PRODUCT_KEYWORDS = [
  "spot LED",
  "projecteur LED",
  "downlight LED",
  "track light",
  "rail magnetique",
  "track slim",
  "suspension LED",
  "applique murale",
  "plafonnier LED",
  "ruban LED",
  "transformateur LED",
  "driver LED",
  "interrupteur",
  "prise electrique",
  "disjoncteur",
  "tableau electrique",
  "cable electrique",
  "accessoires electriques",
];

const ELECTRICAL_CATEGORY_TAGS = [
  "spots",
  "rails",
  "track slim 2eme modeles",
  "suspensions",
  "appliques",
  "lampes",
  "luminaires interieurs",
  "eclairage exterieur",
  "eclairage residentiel",
  "eclairage professionnel",
];

const LOCATION_KEYWORDS = [
  "Algerie",
  "Alger",
  "Blida",
  "Oran",
  "Constantine",
  "Setif",
  "Bejaia",
  "Tizi Ouzou",
  "livraison Algerie",
];

export const SEO_KEYWORDS = Array.from(
  new Set([
    ...ELECTRICAL_CORE_KEYWORDS,
    ...ELECTRICAL_PRODUCT_KEYWORDS,
    ...ELECTRICAL_CATEGORY_TAGS,
    ...LOCATION_KEYWORDS,
  ]),
);

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
};

export const createPageMetadata = ({
  title,
  description,
  path,
  keywords = [],
}: PageMetadataInput): Metadata => ({
  title,
  description,
  keywords: Array.from(new Set([...keywords, ...SEO_KEYWORDS])),
  alternates: {
    canonical: path,
  },
  openGraph: {
    title,
    description,
    url: path,
    siteName: SITE_NAME,
    type: "website",
    locale: "fr_DZ",
    images: [
      {
        url: SITE_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [SITE_OG_IMAGE],
  },
});
