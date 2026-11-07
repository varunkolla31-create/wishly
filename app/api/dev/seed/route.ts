import { revalidatePath } from "next/cache";
import { fail, ok, route } from "@/lib/api/respond";
import { isDevAuthBypassEnabled, requireSender } from "@/lib/auth/session";
import { replyRepo, wishRepo } from "@/lib/repos/index";
import type { WishStatus } from "@/lib/repos/types";
import { hashPassword } from "@/lib/security/password";

export const runtime = "nodejs";

interface DemoWish {
  category: string;
  templateId: string;
  receiverName: string;
  title: string;
  message: string;
  musicId: string;
  passwordHint: string;
  status: WishStatus;
  views: number;
}

const DEMO_WISHES: DemoWish[] = [
  {
    category: "birthday",
    templateId: "confetti-pop",
    receiverName: "Amma",
    title: "Happy birthday, Amma",
    message:
      "Amma, every good thing I know how to do started with watching you. I hope this year is slow and kind to you. Open the photos when you have a minute — there are a few you have not seen.",
    musicId: "warm-glow",
    passwordHint: "Your favourite sweet",
    status: "published",
    views: 32,
  },
  {
    category: "anniversary",
    templateId: "golden-hour",
    receiverName: "Arun",
    title: "Ten years of us",
    message:
      "Ten years of ordinary Tuesdays, which turned out to be the whole point. Thank you for the coffee, the patience, and the terrible jokes. Here's to ten more.",
    musicId: "gentle-morning",
    passwordHint: "Where we first met",
    status: "published",
    views: 12,
  },
  {
    category: "thank-you",
    templateId: "clean-white",
    receiverName: "Meera",
    title: "For everything, Meera",
    message:
      "You showed up when it was inconvenient, and you never made it a thing. I am still working out how to say thank you properly. This is a start.",
    musicId: "soft-bells",
    passwordHint: "The day we met",
    status: "draft",
    views: 0,
  },
];

export function POST() {
  return route(async () => {
    if (process.env.NODE_ENV === "production" || !isDevAuthBypassEnabled()) {
      return fail(404, "not_found", "Not found.");
    }

    const sender = await requireSender();
    const existing = await wishRepo().listByOwner(sender.userId);

    if (existing.length > 0) {
      return ok({ created: 0 });
    }

    const passwordHash = await hashPassword("wishly");
    const repo = wishRepo();
    const created: { wishId: string; views: number; status: WishStatus }[] = [];

    for (const demo of DEMO_WISHES) {
      const wish = await repo.create({
        ownerId: sender.userId,
        category: demo.category,
        templateId: demo.templateId,
        receiverName: demo.receiverName,
        title: demo.title,
      });

      await repo.update(wish.wishId, {
        message: demo.message,
        musicId: demo.musicId,
        passwordHint: demo.passwordHint,
        passwordHash,
        passwordVersion: 1,
        status: demo.status,
      });

      created.push({
        wishId: wish.wishId,
        views: demo.views,
        status: demo.status,
      });
    }

    const published = created.find((item) => item.status === "published");
    for (const item of created) {
      if (item.views > 0) {
        await repo.incrementViews(item.wishId, item.views);
      }
    }

    if (published) {
      await replyRepo().create({
        wishId: published.wishId,
        ownerId: sender.userId,
        message: "This made my whole week. I cried at the photo with the red shirt.",
        emoji: "🥹",
      });
      await replyRepo().create({
        wishId: published.wishId,
        ownerId: sender.userId,
        message: "Thank you for remembering the little things.",
        emoji: "💛",
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/replies");

    return ok({ created: created.length });
  });
}
