"use client";
import Image from "next/image";
import { useState } from "react";
import type { City, Photo } from "@/data/cities";
import { useI18n } from "@/lib/i18n";
/** The city's photo, or undefined when it has none or it failed to load (then the gradient is shown). */
export function useCityPhoto(city: City | undefined): [Photo | undefined, () => void] {
  const [failedSrc, setFailedSrc] = useState<string>(); const p = city?.photo;
  return [p && p.src !== failedSrc ? p : undefined, () => setFailedSrc(p?.src)];
}
// Neutral placeholder while loading; the hue gradient appears only when there is no usable photo.
export default function CityPhoto({ city, photo, onError, sizes, priority, className = "" }: { city: City; photo?: Photo; onError: () => void; sizes: string; priority?: boolean; className?: string }) {
  const { L } = useI18n();
  const bg = photo ? "#cbd5e1" : `linear-gradient(135deg,hsl(${city.hue} 80% 65%),hsl(${city.hue + 40} 70% 35%))`;
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: bg }} data-photo={photo ? "photo" : "fallback"}>
      {photo && <Image src={photo.src} alt={L(photo.alt)} fill sizes={sizes} priority={priority} className={`object-cover ${className}`} onError={onError} />}
    </div>
  );
}
/** "Photo: author / license" with links to the source page and license text. */
export function PhotoCredit({ photo, className = "" }: { photo?: Photo; className?: string }) {
  const { t } = useI18n(); if (!photo) return null;
  return <p className={className}>{t("photo")}: <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">{photo.author}</a> / <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">{photo.license}</a></p>;
}
