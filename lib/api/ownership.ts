import "server-only";
import { HttpError } from "@/lib/api/respond";
import { requireSender, type Sender } from "@/lib/auth/session";
import { wishRepo } from "@/lib/repos/index";
import type { Wish } from "@/lib/repos/types";

export interface OwnedWish {
  sender: Sender;
  wish: Wish;
}

export async function getOwnedWish(wishId: string): Promise<OwnedWish> {
  const sender = await requireSender();
  const wish = await wishRepo().getById(wishId);

  if (!wish || wish.ownerId !== sender.userId) {
    throw new HttpError(404, "not_found", "That wish could not be found.");
  }

  return { sender, wish };
}
