import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type {
  MemoryRigId,
  MemoryTemplate,
} from "@/src/components/three-memory/catalog";

function Photo({
  src,
  className,
  style,
}: {
  src: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`block overflow-hidden bg-black/20 ${className ?? ""}`}
      style={style}
    >
      <Image src={src} alt="" fill unoptimized sizes="160px" className="object-cover" />
    </span>
  );
}

function Peg({ accent }: { accent: string }) {
  return (
    <span
      className="absolute left-1/2 top-0 h-1.5 w-2.5 -translate-x-1/2 rounded-[2px]"
      style={{ backgroundColor: accent }}
    />
  );
}

function PolaroidClothesline({ photos, accent }: { photos: string[]; accent: string }) {
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 100 160" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d="M-4 38 Q50 58 104 38" fill="none" stroke={accent} strokeOpacity="0.4" strokeWidth="0.8" />
        <path d="M-4 92 Q50 112 104 92" fill="none" stroke={accent} strokeOpacity="0.35" strokeWidth="0.8" />
        {[6, 18, 30, 42, 54, 66, 78, 90].map((x, i) => (
          <circle key={`a${x}`} cx={x} cy={i % 2 === 0 ? 44 : 50} r="0.9" fill={accent} opacity="0.85" />
        ))}
        {[10, 24, 38, 52, 66, 80, 93].map((x, i) => (
          <circle key={`b${x}`} cx={x} cy={i % 2 === 0 ? 97 : 102} r="0.9" fill={accent} opacity="0.7" />
        ))}
      </svg>
      {[
        { left: "2%", top: "19%", rotate: -7, photo: photos[0] ?? "" },
        { left: "38%", top: "25%", rotate: 4, photo: photos[1] ?? "" },
        { left: "72%", top: "18%", rotate: 8, photo: photos[2] ?? "" },
      ].map((item, index) => (
        <div
          key={index}
          className="absolute w-[27%] bg-[#fdfaf4] p-1 pb-3 shadow-[0_10px_22px_rgba(0,0,0,0.45)]"
          style={{ left: item.left, top: item.top, transform: `rotate(${item.rotate}deg)` }}
        >
          <Peg accent={accent} />
          <Photo src={item.photo} className="relative aspect-[4/5] w-full rounded-[2px]" />
        </div>
      ))}
    </div>
  );
}

function VinylTurntable({ photos, accent }: { photos: string[]; accent: string }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute left-1/2 top-[54%] size-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0b0b0d] shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
        {[0.86, 0.72, 0.58, 0.44, 0.3].map((scale) => (
          <span
            key={scale}
            className="absolute left-1/2 top-1/2 rounded-full border border-white/10"
            style={{ width: `${scale * 100}%`, height: `${scale * 100}%`, transform: "translate(-50%,-50%)" }}
          />
        ))}
        <span
          className="absolute left-1/2 top-1/2 flex size-[30%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[7px] font-semibold uppercase tracking-widest text-black/60"
          style={{ background: `radial-gradient(circle at 35% 30%, #fff8e6, ${accent})` }}
        >
          33⅓
        </span>
        <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70" />
      </div>
      {[
        { left: "4%", top: "16%", rotate: -10 },
        { left: "68%", top: "12%", rotate: 9 },
        { left: "8%", top: "64%", rotate: 7 },
        { left: "66%", top: "66%", rotate: -6 },
      ].map((item, index) => (
        <Photo
          key={index}
          src={photos[index % Math.max(photos.length, 1)] ?? ""}
          className="absolute aspect-square w-[22%] rounded-[3px] border border-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.45)]"
          style={{ left: item.left, top: item.top, transform: `rotate(${item.rotate}deg)` }}
        />
      ))}
      <span
        className="absolute right-[16%] top-[30%] h-[34%] w-[2px] origin-top rotate-[24deg] rounded-full"
        style={{ backgroundColor: accent, opacity: 0.75 }}
      />
    </div>
  );
}

function SkyLanterns({ photos, accent }: { photos: string[]; accent: string }) {
  const stars = [
    [12, 12], [28, 8], [45, 18], [66, 10], [82, 16], [20, 30], [73, 28], [88, 36], [38, 6], [57, 4],
  ];
  return (
    <div className="absolute inset-0">
      {stars.map(([left, top], index) => (
        <span
          key={index}
          className="absolute size-[2px] rounded-full bg-white/70"
          style={{ left: `${left}%`, top: `${top}%`, opacity: 0.35 + (index % 3) * 0.2 }}
        />
      ))}
      {[
        { left: "8%", top: "30%", w: 26 },
        { left: "38%", top: "44%", w: 30 },
        { left: "66%", top: "24%", w: 24 },
      ].map((item, index) => (
        <div
          key={index}
          className="absolute"
          style={{ left: item.left, top: item.top, width: `${item.w}%` }}
        >
          <div
            className="relative overflow-hidden shadow-[0_0_30px_rgba(255,190,90,0.35)]"
            style={{
              clipPath: "polygon(16% 0, 84% 0, 100% 100%, 0 100%)",
              background: `linear-gradient(180deg, ${accent}, rgba(0,0,0,0.55))`,
              aspectRatio: "3 / 4",
            }}
          >
            <Photo
              src={photos[index % Math.max(photos.length, 1)] ?? ""}
              className="absolute inset-x-[16%] top-[12%] h-[58%] w-[68%] rounded-[2px] opacity-90"
            />
            <span className="absolute inset-x-[30%] bottom-[8%] h-1 rounded-full bg-orange-200/80 blur-[1px]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MuseumCorridor({ photos, accent }: { photos: string[]; accent: string }) {
  return (
    <div className="absolute inset-0">
      <span className="absolute inset-0" style={{ background: `radial-gradient(60% 45% at 50% 60%, ${accent}33, transparent 70%)` }} />
      {[0, 1, 2, 3].map((index) => {
        const scale = 1 - index * 0.2;
        return (
          <span
            key={index}
            className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 rounded-t-full border border-white/15"
            style={{
              width: `${62 * scale}%`,
              height: `${74 * scale}%`,
              opacity: 0.9 - index * 0.16,
            }}
          />
        );
      })}
      {[
        { left: "10%", top: "34%", rotate: -3 },
        { left: "63%", top: "30%", rotate: 3 },
        { left: "35%", top: "48%", rotate: 0 },
      ].map((item, index) => (
        <div
          key={index}
          className="absolute w-[27%] border-[3px] border-[#b9935f]/70 bg-[#0d0b09] p-1 shadow-[0_12px_28px_rgba(0,0,0,0.55)]"
          style={{ left: item.left, top: item.top, transform: `rotate(${item.rotate}deg)` }}
        >
          <Photo src={photos[index % Math.max(photos.length, 1)] ?? ""} className="relative aspect-[4/5] w-full" />
          <span className="absolute inset-0 -z-10" style={{ boxShadow: `0 0 28px ${accent}44` }} />
        </div>
      ))}
    </div>
  );
}

function GiftBox({ photos, accent }: { photos: string[]; accent: string }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-[16%] bottom-[8%] h-[30%]">
        <div className="absolute inset-0 rounded-[6px]" style={{ background: `linear-gradient(160deg, ${accent}, rgba(0,0,0,0.55))` }} />
        <span className="absolute left-1/2 top-0 h-full w-[14%] -translate-x-1/2 bg-black/25" />
        <span className="absolute inset-x-0 top-1/2 h-[14%] -translate-y-1/2 bg-black/20" />
        <span className="absolute left-1/2 top-[-45%] size-[34%] -translate-x-1/2 rotate-45 rounded-[3px] border-2 border-black/10" style={{ backgroundColor: accent }} />
      </div>
      {[
        { left: "6%", top: "20%", rotate: -9 },
        { left: "36%", top: "10%", rotate: 2 },
        { left: "66%", top: "22%", rotate: 10 },
      ].map((item, index) => (
        <Photo
          key={index}
          src={photos[index % Math.max(photos.length, 1)] ?? ""}
          className="absolute w-[26%] rounded-[3px] border-2 border-white/70 shadow-[0_12px_28px_rgba(0,0,0,0.45)]"
          style={{ left: item.left, top: item.top, transform: `rotate(${item.rotate}deg)`, aspectRatio: "4 / 5" }}
        />
      ))}
      {[0, 1, 2, 3, 4].map((index) => (
        <span
          key={index}
          className="absolute size-1 rounded-full opacity-70"
          style={{ left: `${12 + index * 17}%`, top: `${8 + (index % 2) * 8}%`, backgroundColor: accent }}
        />
      ))}
    </div>
  );
}

function FilmProjector({ photos, accent }: { photos: string[]; accent: string }) {
  return (
    <div className="absolute inset-0">
      <span
        className="absolute left-[12%] top-[18%] h-[46%] w-[80%] origin-left"
        style={{ background: `linear-gradient(100deg, ${accent}55, transparent 70%)`, clipPath: "polygon(0 42%, 100% 0, 100% 100%, 0 58%)" }}
      />
      <div className="absolute left-[12%] top-[16%] flex gap-[3px]">
        {[0, 1, 2].map((index) => (
          <Photo
            key={index}
            src={photos[index % Math.max(photos.length, 1)] ?? ""}
            className="relative w-[19%] border border-white/10"
            style={{ aspectRatio: "4 / 5", transform: `rotate(${(index - 1) * 3}deg)` }}
          />
        ))}
      </div>
      <div
        className="absolute bottom-[6%] left-1/2 h-[34%] w-[78%] -translate-x-1/2 rotate-[-6deg] rounded-[3px] border-y-4 border-black/60"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, ${accent}22 0 6px, transparent 6px 22px)`,
        }}
      >
        <div className="flex h-full items-center gap-1 px-2">
          {photos.slice(0, 3).map((src, index) => (
            <Photo key={index} src={src} className="relative h-[78%] flex-1 rounded-[2px] border border-white/15" />
          ))}
        </div>
        <span className="absolute inset-x-0 top-0 h-1 bg-[radial-gradient(circle,#000_0_2px,transparent_2px)] bg-[length:10px_4px] opacity-70" />
        <span className="absolute inset-x-0 bottom-0 h-1 bg-[radial-gradient(circle,#000_0_2px,transparent_2px)] bg-[length:10px_4px] opacity-70" />
      </div>
    </div>
  );
}

function Scrapbook({ photos, accent }: { photos: string[]; accent: string }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-[7%] bottom-[8%] top-[14%] rotate-[-1.5deg] rounded-[4px] bg-[#f4ead6] shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
        <span className="absolute inset-y-0 left-1/2 w-px bg-black/10" />
        <span className="absolute left-[6%] top-[7%] h-[2px] w-[32%] rounded-full bg-black/15" />
        <span className="absolute left-[6%] top-[12%] h-[2px] w-[24%] rounded-full bg-black/10" />
        <span className="absolute right-[6%] top-[7%] h-[2px] w-[28%] rounded-full bg-black/15" />
      </div>
      {[
        { left: "11%", top: "20%", rotate: -8, tape: true },
        { left: "48%", top: "27%", rotate: 6, tape: true },
        { left: "20%", top: "55%", rotate: 4, tape: false },
      ].map((item, index) => (
        <div
          key={index}
          className="absolute w-[38%] bg-white p-1 pb-3 shadow-[0_10px_22px_rgba(0,0,0,0.35)]"
          style={{ left: item.left, top: item.top, transform: `rotate(${item.rotate}deg)` }}
        >
          {item.tape ? (
            <span className="absolute -top-2 left-1/2 h-3 w-10 -translate-x-1/2 rotate-[-3deg] bg-[#e7c98f]/70" />
          ) : null}
          <Photo src={photos[index % Math.max(photos.length, 1)] ?? ""} className="relative aspect-[4/5] w-full" />
          <span className="mt-1 block h-[2px] w-[70%] rounded-full" style={{ backgroundColor: accent, opacity: 0.5 }} />
        </div>
      ))}
      <span className="absolute bottom-[14%] right-[12%] h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
    </div>
  );
}

function CandleSanctuary({ photos, accent }: { photos: string[]; accent: string }) {
  return (
    <div className="absolute inset-0">
      <span className="absolute inset-0" style={{ background: `radial-gradient(55% 40% at 50% 66%, ${accent}22, transparent 70%)` }} />
      <div className="absolute left-1/2 top-[16%] w-[56%] -translate-x-1/2">
        <Photo
          src={photos[0] ?? ""}
          className="relative aspect-[4/5] w-full rounded-[3px] border border-white/15 shadow-[0_24px_50px_rgba(0,0,0,0.5)]"
        />
        <Photo
          src={photos[0] ?? ""}
          className="relative mx-auto mt-3 aspect-[4/5] w-full scale-y-[-1] rounded-[3px] opacity-15 blur-[1px]"
          style={{ maskImage: "linear-gradient(to bottom, black, transparent 60%)" }}
        />
      </div>
      <div className="absolute bottom-[12%] left-1/2 flex -translate-x-1/2 flex-col items-center">
        <span className="mb-1 h-5 w-2.5 rounded-full bg-[#ffd27a] shadow-[0_0_26px_rgba(255,190,90,0.8)]" />
        <span className="h-12 w-3 rounded-[2px] bg-[#f4ead6]/90 shadow-[0_8px_20px_rgba(0,0,0,0.4)]" />
      </div>
      <span className="absolute inset-x-0 bottom-[8%] h-px bg-white/20" />
    </div>
  );
}

const ART: Record<MemoryRigId, (props: { photos: string[]; accent: string }) => ReactNode> = {
  "3d-polaroid-clothesline": PolaroidClothesline,
  "3d-vinyl-turntable": VinylTurntable,
  "3d-sky-lanterns": SkyLanterns,
  "3d-museum-corridor": MuseumCorridor,
  "3d-gift-box-explosion": GiftBox,
  "3d-film-reel-projector": FilmProjector,
  "3d-scrapbook-flipbook": Scrapbook,
  "3d-candle-sanctuary": CandleSanctuary,
};

export function MemoryCardArt({
  template,
  photos,
}: {
  template: MemoryTemplate;
  photos?: string[];
}) {
  const sources = (
    photos && photos.length > 0 ? photos : template.samplePhotos
  ).slice(0, 4);
  const Art = ART[template.rig];

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

      <Art photos={sources} accent={template.accent} />

      <span className="absolute left-3 top-3 z-10 rounded-full bg-black/30 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/85 backdrop-blur">
        3D reel
      </span>
      <span className="absolute inset-x-3 bottom-3 z-10 truncate rounded-full bg-black/40 px-3 py-1.5 text-center text-[10px] font-medium text-white/90 backdrop-blur">
        {template.rig
          .replace("3d-", "")
          .replaceAll("-", " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase())}
      </span>
    </div>
  );
}
