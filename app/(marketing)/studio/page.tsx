import { redirect } from "next/navigation";

/**
 * Studio was a second name for the same feature. The workbench now lives on
 * the 3D reels page as a tab, so this route only exists to keep old links and
 * bookmarks working.
 */
export default function StudioIndexRedirect() {
  redirect("/templates?tab=workbench");
}
