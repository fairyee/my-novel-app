import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Novella - AI 웹소설 생성기",
  description: "AI가 대신 써주는 나만의 웹소설. 장르, 캐릭터, 태그만 고르면 바로 완성. BL, 로맨스, 판타지 등 원하는 장르로 무료 생성.",
  keywords: ["AI 웹소설", "소설 생성", "AI 소설", "웹소설 생성기", "BL 소설", "로맨스 소설", "판타지 소설", "자동 소설"],
  authors: [{ name: "Novella" }],
  verification: {
    google: "W7-hf9aHSK_uBpsABsS8vZ4Dj9vaM1Vi8oKGDlO4HH0",
  },
  openGraph: {
    title: "Novella - AI 웹소설 생성기",
    description: "장르, 캐릭터, 태그만 고르면 AI가 웹소설을 써드려요. 무료로 시작해보세요.",
    url: "https://my-novel-app-omega.vercel.app",
    siteName: "Novella",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Novella - AI 웹소설 생성기",
    description: "AI가 대신 써주는 웹소설. BL·로맨스·판타지 무료 생성",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
