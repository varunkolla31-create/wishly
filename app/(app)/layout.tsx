import type { Metadata } from "next";
import { AppHeader } from "@/components/app/app-header";
import { requirePageSender } from "@/lib/auth/page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function SenderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sender = await requirePageSender();

  return (
    <div className="min-h-dvh bg-sand">
      <AppHeader sender={sender} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        {children}
      </main>
    </div>
  );
}
