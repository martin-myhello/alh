/** A screenshot attached to a note. */
export function Shot({ src, alt = "" }: { src: string; alt?: string }) {
  return (
    <span className="shot">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" draggable={false} />
    </span>
  );
}
