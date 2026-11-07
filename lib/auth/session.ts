import "server-only";
import { HttpError } from "@/lib/api/respond";
import { env } from "@/lib/env";

export interface Sender {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string | null;
}

const DEV_SENDER: Sender = {
  userId: "dev_sender",
  firstName: "Dev",
  lastName: "Sender",
  email: "dev@wishly.local",
  imageUrl: null,
};

export function isDevAuthBypassEnabled(): boolean {
  const config = env();
  return config.AUTH_MODE === "dev" && config.DEV_AUTH_BYPASS;
}

async function getClerkSender(): Promise<Sender | null> {
  try {
    const { auth, currentUser } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!userId) return null;

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress ?? "";

    return {
      userId,
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email,
      imageUrl: user?.imageUrl ?? null,
    };
  } catch {
    return null;
  }
}

export async function getSender(): Promise<Sender | null> {
  if (isDevAuthBypassEnabled()) return DEV_SENDER;
  if (env().AUTH_MODE === "clerk") return getClerkSender();
  return null;
}

export async function requireSender(): Promise<Sender> {
  const sender = await getSender();
  if (!sender) {
    throw new HttpError(401, "unauthenticated", "Please sign in to continue.");
  }
  return sender;
}
