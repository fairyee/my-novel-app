export const GENRES = [
  { id: "romance",  label: "💕 로맨스",   color: "#f472b6" },
  { id: "bl",       label: "💙 BL",       color: "#818cf8" },
  { id: "gl",       label: "💜 GL",       color: "#c084fc" },
  { id: "fantasy",  label: "🧙 판타지/SF", color: "#a78bfa" },
  { id: "action",   label: "⚔️ 액션/무협", color: "#fcd34d" },
  { id: "thriller", label: "🔪 공포/추리", color: "#f87171" },
  { id: "drama",    label: "🏙️ 드라마",   color: "#6ee7b7" },
];

// 나이대
export const AGE_OPTIONS = ["10대", "20대", "30대+", "나이 불명"];

// 성별
export const GENDER_OPTIONS = ["남성", "여성", "중성/불명"];

// 캐릭터 관계
export const RELATIONSHIP_OPTIONS = [
  { id: "romance", label: "❤️ 로맨스" },
  { id: "hate",    label: "💔 애증" },
  { id: "rival",   label: "⚔️ 적대" },
  { id: "ally",    label: "🤝 협력" },
];

// 장르별 태그 프리셋
export const GENRE_TAGS: Record<string, string[]> = {
  romance: ["운명적 재회","계약 연애","소꿉친구","첫사랑","재벌×평민","신분차이","삼각관계","집착","츤데레","비밀연애","오해와 화해","직장 로맨스","학교생활","순정","빙의"],
  bl:      ["연상공","연하공","집착공","츤데레공","순정수","강수","오메가버스","알파×오메가","학원물","직장동료","소꿉친구","재벌×평민","운명의 짝","계약관계","숨겨진 정체"],
  gl:      ["운명적 만남","소꿉친구","직장동료","학원물","집착","계약관계","신분차이","첫사랑","삼각관계","비밀연애"],
  fantasy: ["이세계","회귀","빙의","용사와 마왕","마법학교","신분 위장","운명의 짝","예언","마계","SF·우주","포스트아포칼립스","타임루프"],
  action:  ["복수","무림","협객","검사","암살자","구원","배신","전쟁","숨겨진 과거","최강자"],
  thriller:["살인미스터리","연쇄범인","밀실","기억상실","반전","심리전","귀신","저주","탈출","음모"],
  drama:   ["가족갈등","성장","우정","직업드라마","재벌가","일상","힐링","청춘","사회고발"],
};

// BL 공수 옵션
export const BL_ROLES = [
  { id: "gong",    label: "공 (공격)" },
  { id: "su",      label: "수 (수용)" },
  { id: "howan",   label: "호환 (양방)" },
  { id: "secret",  label: "비밀 (반전)" },
];

// GL 역할 옵션
export const GL_ROLES = [
  { id: "strong",  label: "강인한 쪽" },
  { id: "soft",    label: "부드러운 쪽" },
  { id: "howan",   label: "대등 (호환)" },
];

// 배경 태그
export const BACKGROUNDS: Record<string, string[]> = {
  romance:  ["현대","캠퍼스","오피스","재벌가","궁정","이세계","역사"],
  bl:       ["현대","캠퍼스","오피스","연예계","군대","판타지","역사","오메가버스세계"],
  gl:       ["현대","캠퍼스","오피스","판타지","역사"],
  fantasy:  ["정통판타지","이세계","마법왕국","SF·우주","현대판타지","역사배경","포스트아포칼립스"],
  action:   ["무림","현대","전쟁터","암흑가","판타지"],
  thriller: ["현대도시","밀실","외딴곳","병원","학교"],
  drama:    ["현대","직장","학교","가족","해외"],
};

export const STYLES = [
  { id: "emotional",  label: "💔 감정 몰입",    desc: "눈물나는 스타일" },
  { id: "fast",       label: "🔥 자극적 전개",   desc: "몰아치는 전개" },
  { id: "dialogue",   label: "💬 대사 중심",     desc: "웹소설 스타일" },
  { id: "cinematic",  label: "🎬 드라마 느낌",   desc: "영상처럼 읽힘" },
  { id: "webnovel",   label: "📱 웹소설 정통",   desc: "짧은 문장·몰입형" },
  { id: "descriptive",label: "🎨 묘사 중심",     desc: "장면이 생생함" },
];

export const ENDINGS = [
  { id: "happy", label: "😊 해피" },
  { id: "sad",   label: "😢 새드" },
  { id: "open",  label: "🌫️ 열린 결말" },
];

export const RATINGS = [
  { id: "all",   label: "전체",  desc: "순애" },
  { id: "teen",  label: "15+",  desc: "긴장감" },
  { id: "adult", label: "19+",  desc: "성인 암시" },
];

export const POVS = [
  { id: "first", label: "1인칭", desc: "나는..." },
  { id: "third", label: "3인칭", desc: "그는..." },
];

export interface Character { id: number; name: string; desc: string; role: string; age: string; gender: string; relationship: string; }

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
