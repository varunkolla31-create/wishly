import { revalidatePath } from "next/cache";
import { ok, route } from "@/lib/api/respond";
import { getOwnedWish } from "@/lib/api/ownership";
import { toSenderWish } from "@/lib/repos/dto";
import { wishRepo } from "@/lib/repos/index";

export const runtime = "nodejs";

export function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return route(async () => {
    const { id } = await context.params;
    const { sender, wish } = await getOwnedWish(id);

    const copy = await wishRepo().create({
      ownerId: sender.userId,
      category: wish.category,
      templateId: wish.templateId,
      receiverName: wish.receiverName,
      title: wish.title ? `${wish.title} (copy)` : "",
    });

    const updated = await wishRepo().update(copy.wishId, {
      message: wish.message,
      bonusNote: wish.bonusNote,
      milestoneDate: wish.milestoneDate,
      milestoneLabel: wish.milestoneLabel,
      secretScratchMessage: wish.secretScratchMessage,
      giftVoucherCode: wish.giftVoucherCode,
      quizQuestion: wish.quizQuestion,
      quizOptions: wish.quizOptions,
      quizAnswerIndex: wish.quizAnswerIndex,
      quizWrongToast: wish.quizWrongToast,
      gateMode: wish.gateMode,
      reelTemplateId: wish.reelTemplateId,
      music: wish.music,
      musicId: wish.musicId,
      unlockAt: wish.unlockAt,
      passwordHint: wish.passwordHint,
    });

    revalidatePath("/dashboard");

    return ok(toSenderWish(updated ?? copy), 201);
  });
}
