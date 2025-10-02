"use client";

import { DefaultSeo } from "next-seo";
import defaultSEO from "../app/next-seo.config"; // adjust path

export default function SEOProvider() {
  return <DefaultSeo {...defaultSEO} />;
}
