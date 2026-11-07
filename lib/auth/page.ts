import "server-only";
import { redirect } from "next/navigation";
import { getSender, type Sender } from "@/lib/auth/session";

export async function requirePageSender(): Promise<Sender> {
  const sender = await getSender();
  if (!sender) redirect("/sign-in");
  return sender;
}
