import type { Metadata } from "next";
import HomeClient from "./home-client";
import {
  createPageMetadata,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  STORE_ADDRESS,
  SUPPORT_EMAIL,
  SUPPORT_PHONE_DISPLAY,
} from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Eclairage et equipement electrique en Algerie",
  description: SITE_DESCRIPTION,
  path: "/",
  keywords: [
    "boutique eclairage Algerie",
    "materiel electrique Algerie",
    "luminaire LED Algerie",
    "rails magnetiques",
    "track slim",
    "spots LED",
    "suspensions LED",
    "appliques murales",
  ],
});

const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  email: SUPPORT_EMAIL,
  telephone: SUPPORT_PHONE_DISPLAY,
  address: {
    "@type": "PostalAddress",
    streetAddress: STORE_ADDRESS,
    addressCountry: "DZ",
  },
};

const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL.replace(/\/$/, "")}/shop?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const storeStructuredData = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  email: SUPPORT_EMAIL,
  telephone: SUPPORT_PHONE_DISPLAY,
  address: {
    "@type": "PostalAddress",
    streetAddress: STORE_ADDRESS,
    addressCountry: "DZ",
  },
  areaServed: "DZ",
};

export default function LandingPage() {
  return (
    <>
      <HomeClient />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(storeStructuredData),
        }}
      />
    </>
  );
}
