import type { MediaItem } from "@/lib/media-items";

// 유튜브 / 업로드 영상 / 이미지를 같은 16:9 카드로 렌더링한다.
export default function MediaEmbed({
  item,
  className = "",
}: {
  item: MediaItem;
  className?: string;
}) {
  const frame = `aspect-video w-full ${className}`;

  if (item.kind === "youtube" && item.youtubeId) {
    return (
      <iframe
        className={frame}
        src={`https://www.youtube.com/embed/${item.youtubeId}?rel=0`}
        title={item.title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  if (item.kind === "video" && item.url) {
    return (
      <video
        className={`${frame} bg-black object-contain`}
        src={item.url}
        controls
        playsInline
        preload="metadata"
      />
    );
  }

  if (item.kind === "image" && item.url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={`${frame} object-cover`}
        src={item.url}
        alt={item.title}
        loading="lazy"
      />
    );
  }

  return null;
}
