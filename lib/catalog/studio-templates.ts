import { getCanvaVideoTemplate } from "@/lib/catalog/canva-videos";
import { getTemplate } from "@/lib/catalog/templates";

export type StudioAspectRatio = "16:9" | "9:16" | "1:1";

export interface StudioPalette {
  from: string;
  to: string;
  accent: string;
}

export interface StudioTemplate {
  id: string;
  title: string;
  categoryName: string;
  category?: string;
  aspect_ratio: StudioAspectRatio;
  plan_tier: "FREE" | "PRO";
  /** Canva-hosted preview; absent for Wishly page looks. */
  thumb?: string;
  /** Present for Wishly page looks, absent for Canva templates (extracted from the thumb). */
  palette?: StudioPalette;
}

/**
 * One id namespace for the studio: Canva video template ids and the Wishly page
 * template ids do not collide. Wishly looks get their palette directly instead
 * of sampling a preview image.
 */
export function getStudioTemplate(id: string): StudioTemplate | null {
  const canva = getCanvaVideoTemplate(id);
  if (canva) {
    return {
      id: canva.id,
      title: canva.title,
      categoryName: canva.categoryName,
      category: canva.category,
      aspect_ratio: canva.aspect_ratio,
      plan_tier: canva.plan_tier,
      thumb: canva.thumb,
    };
  }

  const page = getTemplate(id);
  if (!page) return null;

  return {
    id: page.id,
    title: page.name,
    categoryName: "Wishly",
    aspect_ratio: "16:9",
    plan_tier: "FREE",
    palette: {
      from: page.preview.from,
      to: page.preview.to,
      accent: page.palette.accent,
    },
  };
}
