// Generated grayscale cover used when a book has no cover_image_url.
// Deterministic pattern from the title so each book looks distinct —
// still strictly black & white.
export default function BookCover({ title, author, url, className = '' }) {
  if (url) {
    return (
      <img
        src={url}
        alt={`Cover of ${title}`}
        className={`h-full w-full object-cover ${className}`}
        loading="lazy"
      />
    );
  }

  const seed = [...(title || '')].reduce((a, c) => a + c.charCodeAt(0), 0);
  const shade = ['#1A1A1A', '#2E2E2E', '#4D4D4D', '#6B6B6B'][seed % 4];
  const angle = (seed % 6) * 30;

  return (
    <div
      className={`flex h-full w-full flex-col justify-between p-4 ${className}`}
      style={{
        background: `linear-gradient(${angle}deg, ${shade} 0%, #0A0A0A 100%)`,
      }}
      aria-label={`Cover of ${title}`}
    >
      <span className="text-[10px] uppercase tracking-[0.2em] text-paper-pure/60">
        The Reading Room
      </span>
      <div>
        <p className="font-serif text-lg leading-tight text-paper-pure line-clamp-4">{title}</p>
        <p className="mt-2 text-xs text-paper-pure/70">{author}</p>
      </div>
    </div>
  );
}
