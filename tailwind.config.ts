import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 공개 사이트: BIFF 참고 — 딥 그래파이트(완전 블랙 아님) + 앰버·골드 강조
        night: {
          DEFAULT: "#1c1d22", // 페이지 베이스 (살짝 따뜻한 차콜)
          soft: "#24262d", // 섹션 밴드
        },
        coal: {
          DEFAULT: "#2a2c34", // 카드/서피스 (베이스와 명확히 분리)
          soft: "#33363f", // 살짝 밝은 서피스
        },
        gold: {
          DEFAULT: "#d9a441", // 강조(앰버/골드)
          soft: "#f0b450", // 하이라이트
          deep: "#b9852b",
        },
        // accent = 골드로 통합 (기존 text-accent/bg-accent 가 자동으로 골드가 됨)
        accent: {
          DEFAULT: "#d9a441",
          soft: "#f0b450",
        },
        ink: {
          DEFAULT: "#16181d",
          soft: "#3a3f4a",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,16,0.04), 0 8px 24px -12px rgba(16,24,16,0.12)",
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
