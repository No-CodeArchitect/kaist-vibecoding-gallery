// 유튜브 URL/ID 어느 쪽을 넣어도 11자리 ID만 뽑아낸다. (서버·클라이언트 공용)

export function extractYoutubeId(raw: string): string | null {
  if (!raw) return null;
  const s = raw.trim();
  const patterns = [
    /[?&]v=([\w-]{11})/, // youtube.com/watch?v=
    /youtu\.be\/([\w-]{11})/, // youtu.be/
    /embed\/([\w-]{11})/, // youtube.com/embed/
    /shorts\/([\w-]{11})/, // youtube.com/shorts/
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) return m[1];
  }
  if (/^[\w-]{11}$/.test(s)) return s; // 이미 ID
  return null;
}
