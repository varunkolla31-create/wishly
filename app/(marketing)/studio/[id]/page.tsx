import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VideoStudio } from "@/components/studio/video-studio";
import { getStudioTemplate } from "@/lib/catalog/studio-templates";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const template = getStudioTemplate(id);
  if (!template) {
    return pageMetadata({
      title: "Video studio",
      description:
        "Make a short occasion video inside Wishly — edit the words, add a photo and download it.",
      path: "/templates",
    });
  }

  return pageMetadata({
    title: "Video studio",
    description: `Make your own video with the "${template.title}" look in Wishly. Add your words and a photo, preview it, then download the video.`,
    path: `/studio/${template.id}`,
  });
}

export default async function StudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = getStudioTemplate(id);
  if (!template) notFound();

  return <VideoStudio template={template} />;
}
