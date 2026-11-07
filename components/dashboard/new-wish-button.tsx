"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function NewWishButton({
  size = "md",
  label = "New wish",
  className,
}: {
  size?: "md" | "lg";
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function create() {
    setPending(true);
    try {
      const response = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        data?: { wishId?: string };
      };
      const wishId = payload.data?.wishId;
      if (!response.ok || !wishId) throw new Error("create_failed");
      router.push(`/dashboard/wishes/${wishId}/edit`);
    } catch {
      toast.error("Couldn't start a new wish.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button onClick={create} disabled={pending} size={size} className={className}>
      <Plus aria-hidden="true" className="size-4" />
      {pending ? "Creating…" : label}
    </Button>
  );
}
