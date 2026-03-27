export const GENRES = [
  { id: "romance", label: "💕 로맨스", color: "#f472b6" },
  { id: "fantasy", label: "🧙 판타지", color: "#a78bfa" },
  { id: "modern_fantasy", label: "✨ 현대판타지", color: "#67e8f9" },
  { id: "murim", label: "⚔️ 무협", color: "#fcd34d" },
  { id: "thriller", label: "🔪 스릴러/호러", color: "#f87171" },
  { id: "mystery", label: "🔍 미스터리", color: "#fbbf24" },
  { id: "sf", label: "🚀 SF", color: "#38bdf8" },
  { id: "modern", label: "🏙️ 현대물", color: "#6ee7b7" },
  { id: "historical", label: "📜 역사", color: "#86efac" },
  { id: "bl", label: "💙 BL", color: "#818cf8" },
  { id: "gl", label: "💜 GL", color: "#c084fc" },
];

export const PRESET_TAGS = [
  "운명적 재회","기억상실","계약 연애","학교생활","직장 로맨스",
  "이세계","복수","금지된 사랑","삼각관계","첫사랑",
  "집착","츤데레","순정","비밀연애","신분차이",
  "용사와 마왕","오해와 화해","소꿉친구","재벌","빙의",
];

export const STYLES = [
  { id: "lyrical", label: "🌸 감성" },
  { id: "fast", label: "⚡ 빠른 전개" },
  { id: "dialogue", label: "💬 대화 위주" },
  { id: "descriptive", label: "🎨 묘사 위주" },
];

export const ENDINGS = [
  { id: "happy", label: "😊 해피" },
  { id: "sad", label: "😢 새드" },
  { id: "open", label: "🌫️ 열린 결말" },
];

export const RATINGS = [
  { id: "all", label: "전체가", desc: "순수" },
  { id: "teen", label: "15+", desc: "긴장감" },
  { id: "adult", label: "19+", desc: "성인 암시" },
];

export const POVS = [
  { id: "first", label: "1인칭", desc: "나는..." },
  { id: "third", label: "3인칭", desc: "그는..." },
];

export interface Character { id: number; name: string; desc: string; role: string; }

export interface Novel {
  id: string; title: string; content: string; genre: string; tags: string;
  is_public: boolean; created_at: string; views: number;
  series_id?: string; episode_number?: number; series_title?: string;
  is_favorited?: boolean;
  cover_image?: string;
  synopsis?: string;
  _episodes?: Novel[];
  _isMine?: boolean;
}

export interface Profile { id: string; nickname: string; }
export interface Comment { id: string; novel_id: string; user_id: string; nickname: string; content: string; created_at: string; }
