import { Logo } from "@/components/marketing/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-sand px-4 py-12">
      <Logo />
      <div className="mt-8 w-full max-w-md">{children}</div>
    </div>
  );
}
