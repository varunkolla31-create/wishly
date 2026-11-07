import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MemoryStudio } from "@/src/components/three-memory/memory-studio";
import { getMemoryTemplate } from "@/src/components/three-memory/catalog";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const template = getMemoryTemplate(id);
  return pageMetadata({
    title: template ? `${template.name} studio` : "3D memory studio",
    description: template
      ? `${template.tagline} Add 3–10 photos and download a 9:16 memory reel.`
      : "Make a native 3D memory reel from your photos.",
    path: template ? `/studio/${template.id}` : "/studio",
  });
}

export default async function MemoryStudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = getMemoryTemplate(id);
  if (!template) notFound();

  return <MemoryStudio template={template} />;
}
