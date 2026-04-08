import { type MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://verdevale.example.com";
  const now = new Date().toISOString();

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/planos`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/cobertura`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contato`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${baseUrl}/status`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/suporte`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${baseUrl}/sobre`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/politica-de-privacidade`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/termos`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
