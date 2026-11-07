"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function SeedButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function seed() {
    setPending(true);
    try {
      const response = await fetch("/api/dev/seed", { method: "POST" });
      if (!response.ok) throw new Error("seed_failed");
      toast.success("Demo wishes added");
      router.refresh();
    } catch {
      toast.error("Couldn't add demo wishes.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button variant="outline" onClick={seed} disabled={pending}>
      <Sparkles aria-hidden="true" className="size-4" />
      {pending ? "Adding…" : "Add demo wishes"}
    </Button>
  );
}
