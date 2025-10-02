// next-seo.config.ts
import { DefaultSeoProps } from "next-seo";

const defaultSEO: DefaultSeoProps = {
  title: "OLATINN | Olusola Adebayo Tech and Innovation Limited",
  description:
    "OLATINN Limited — Empowering businesses with innovative technology, scalable infrastructure, and defect-free digital solutions. We build without defects.",
  canonical: "https://www.olatinnlimited.com",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.olatinnlimited.com",
    siteName: "OLATINN Limited",
    images: [
      {
        url: "https://www.olatinnlimited.com/images/branding-cover.jpg", // replace with real OG image
        width: 1200,
        height: 630,
        alt: "OLATINN Branding",
      },
    ],
  },
  twitter: {
    handle: "@olatinn",
    site: "@olatinn",
    cardType: "summary_large_image",
  },
};

export default defaultSEO;
