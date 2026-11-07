import {
  Baby,
  Briefcase,
  Cake,
  Droplets,
  Flower2,
  Gem,
  Gift,
  GraduationCap,
  Heart,
  HeartHandshake,
  HeartPulse,
  Moon,
  PartyPopper,
  Sparkles,
  Star,
  Sun,
  TreePine,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { OccasionIcon as OccasionIconName } from "@/lib/catalog/types";

const ICONS: Record<OccasionIconName, LucideIcon> = {
  cake: Cake,
  "heart-handshake": HeartHandshake,
  heart: Heart,
  gem: Gem,
  baby: Baby,
  "graduation-cap": GraduationCap,
  briefcase: Briefcase,
  "heart-pulse": HeartPulse,
  gift: Gift,
  flower: Flower2,
  users: Users,
  sparkles: Sparkles,
  sun: Sun,
  moon: Moon,
  tree: TreePine,
  droplets: Droplets,
  party: PartyPopper,
  star: Star,
};

export function OccasionIcon({
  icon,
  className,
}: {
  icon: OccasionIconName;
  className?: string;
}) {
  const Icon = ICONS[icon];
  return <Icon aria-hidden="true" className={className} />;
}
