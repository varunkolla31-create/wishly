import type { Metadata } from "next";
import { GuestWizard } from "@/components/wizard/guest-wizard";
import { getSender } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Create a wish",
  description:
    "Start a wish page in the browser. Pick a look, write the words and set the password — sign in only when you publish.",
  path: "/create",
});

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; reel?: string; resume?: string }>;
}) {
  const [{ template, reel, resume }, sender] = await Promise.all([
    searchParams,
    getSender(),
  ]);

  return (
    <GuestWizard
      initialTemplateId={template ?? null}
      initialReelId={reel ?? null}
      authenticated={Boolean(sender)}
      authEnabled={env().AUTH_MODE === "clerk"}
      resuming={resume === "1"}
    />
  );
}
