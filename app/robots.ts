import type { MetadataRoute } from "next";

/** Préversion : aucun robot tant que la mise en ligne n'est pas décidée (hypothèse H3, docs/BIBLE.md). */
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", disallow: "/" }] };
}
