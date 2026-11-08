import Image from "next/image";
import type { MemoryTemplate } from "@/src/components/three-memory/catalog";

export function MemoryCardArt({
  template,
  photos,
}: {
  template: MemoryTemplate;
  photos?: string[];
}) {
  const sources = (
    photos && photos.length > 0 ? photos : template.samplePhotos
  ).slice(0, 3);

  return (
    <div
      className="relative aspect-[9/16] w-full overflow-hidden rounded-card"
      style={{
        background: `radial-gradient(120% 75% at 50% 18%, ${template.accent}55 0%, ${template.background} 68%)`,
      }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1/2"
        style={{
          background: `radial-gradient(60% 100% at 50% 0%, ${template.accent}33, transparent 70%)`,
        }}
      />

      {sources.map((src, index) => (
        <Image
          key={`${src}-${index}`}
          src={src}
          alt=""
          width={220}
          height={300}
          unoptimized
          loading="lazy"
          className="absolute left-1/2 top-1/2 h-[42%] w-[54%] rounded-md border border-white/20 object-cover shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
          style={{
            transform: `translate(-50%, -50%) translate(${(index - 1) * 24}px, ${index === 1 ? -12 : 30}px) rotate(${(index - 1) * 8}deg)`,
            zIndex: index === 1 ? 3 : index === 0 ? 2 : 1,
          }}
        />
      ))}

      <span className="absolute left-3 top-3 rounded-full bg-black/30 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/85 backdrop-blur">
        3D reel
      </span>
      <span className="absolute inset-x-3 bottom-3 truncate rounded-full bg-black/40 px-3 py-1.5 text-center text-[10px] font-medium capitalize text-white/90 backdrop-blur">
        {template.rig.replace("3d-", "").replaceAll("-", " ")}
      </span>
    </div>
  );
}
