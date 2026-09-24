/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 교육생 배포 사이트 스크린샷은 Supabase Storage 등 원격에 저장됨.
    // 데모 단계에서는 외부 이미지 호스트를 허용해 둔다.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
