"use client";
import { useState, useEffect } from "react";
import { createClient } from "./lib/supabase";

const GENRES = [
  { id: "romance", label: "💕 로맨스", color: "#f472b6" },
  { id: "bl", label: "💙 BL", color: "#818cf8" },
  { id: "gl", label: "💜 GL", color: "#c084fc" },
  { id: "fantasy", label: "🧙 판타지", color: "#a78bfa" },
  { id: "modern_fantasy", label: "✨ 현대판타지", color: "#67e8f9" },
  { id: "murim", label: "⚔️ 무협", color: "#fcd34d" },
  { id: "thriller", label: "🔪 스릴러", color: "#f87171" },
  { id: "mystery", label: "🔍 미스터리", color: "#fbbf24" },
  { id: "sf", label: "🚀 SF", color: "#38bdf8" },
  { id: "horror", label: "👻 호러", color: "#a3a3a3" },
  { id: "modern", label: "🏙️ 현대물", color: "#6ee7b7" },
  { id: "historical", label: "📜 역사", color: "#86efac" },
];

const PRESET_TAGS = [
  "운명적 재회","기억상실","계약 연애","학교생활","직장 로맨스",
  "이세계","복수","금지된 사랑","삼각관계","첫사랑",
  "집착","츤데레","순정","비밀연애","신분차이",
  "용사와 마왕","오해와 화해","소꿉친구","재벌","빙의",
];

const STYLES = [
  { id: "lyrical", label: "🌸 감성/서정적" },
  { id: "fast", label: "⚡ 빠른 전개" },
  { id: "dialogue", label: "💬 대화 위주" },
  { id: "descriptive", label: "🎨 묘사 위주" },
];

const ENDINGS = [
  { id: "happy", label: "😊 해피엔딩" },
  { id: "sad", label: "😢 새드엔딩" },
  { id: "open", label: "🌫️ 열린 결말" },
];

const RATINGS = [
  { id: "all", label: "전체가", desc: "순수한 이야기" },
  { id: "teen", label: "15+", desc: "약간의 긴장감" },
  { id: "adult", label: "19+", desc: "성인 암시 포함" },
];

const POVS = [
  { id: "first", label: "1인칭", desc: "나는..." },
  { id: "third", label: "3인칭", desc: "그는..." },
];

interface Character { id: number; name: string; desc: string; role: string; }
interface Novel { id: string; title: string; content: string; genre: string; tags: string; is_public: boolean; created_at: string; views: number; like_count?: number; is_liked?: boolean; }

export default function Home() {
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<"login"|"signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const [myNovels, setMyNovels] = useState<Novel[]>([]);
  const [likedNovels, setLikedNovels] = useState<Novel[]>([]);
  const [publicNovels, setPublicNovels] = useState<Novel[]>([]);
  const [view, setView] = useState<"create"|"library"|"explore">("create");
  const [libraryTab, setLibraryTab] = useState<"my"|"liked">("my");
  const [exploreTab, setExploreTab] = useState<"latest"|"popular">("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [readingNovel, setReadingNovel] = useState<Novel|null>(null);

  const [genre, setGenre] = useState<string|null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [style, setStyle] = useState<string|null>(null);
  const [ending, setEnding] = useState<string|null>(null);
  const [rating, setRating] = useState("all");
  const [pov, setPov] = useState("third");
  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [characters, setCharacters] = useState<Character[]>([{ id: 1, name: "", desc: "", role: "주인공" }]);
  const [isPublic, setIsPublic] = useState(false);

  const [novel, setNovel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("form");
  const [isEditing, setIsEditing] = useState(false);
  const [editedNovel, setEditedNovel] = useState("");
  const [copied, setCopied] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const selectedGenre = GENRES.find((g) => g.id === genre);
  const accentColor = selectedGenre?.color || "#a78bfa";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
  }, []);

  useEffect(() => {
    if (view === "library" && user) { fetchMyNovels(); fetchLikedNovels(); }
    if (view === "explore") fetchPublicNovels();
  }, [view, user, exploreTab]);

  async function fetchMyNovels() {
    const { data } = await supabase.from("novels").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setMyNovels(data || []);
  }

  async function fetchLikedNovels() {
    const { data: likeData } = await supabase.from("likes").select("novel_id").eq("user_id", user.id);
    if (!likeData || likeData.length === 0) { setLikedNovels([]); return; }
    const ids = likeData.map((l: any) => l.novel_id);
    const { data } = await supabase.from("novels").select("*").in("id", ids).order("created_at", { ascending: false });
    setLikedNovels(data || []);
  }

  async function fetchPublicNovels() {
    let query = supabase.from("novels").select("*").eq("is_public", true);
    if (searchQuery.trim()) {
      query = query.or(`title.ilike.%${searchQuery}%,tags.ilike.%${searchQuery}%,genre.ilike.%${searchQuery}%`);
    }
    if (exploreTab === "popular") {
      query = query.order("views", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }
    const { data } = await query.limit(50);
    if (!data) { setPublicNovels([]); return; }
    if (user) {
      const { data: likeData } = await supabase.from("likes").select("novel_id").eq("user_id", user.id);
      const likedIds = new Set((likeData || []).map((l: any) => l.novel_id));
      const { data: likeCounts } = await supabase.from("likes").select("novel_id");
      const countMap: Record<string, number> = {};
      (likeCounts || []).forEach((l: any) => { countMap[l.novel_id] = (countMap[l.novel_id] || 0) + 1; });
      setPublicNovels(data.map((n: Novel) => ({ ...n, is_liked: likedIds.has(n.id), like_count: countMap[n.id] || 0 })));
    } else {
      const { data: likeCounts } = await supabase.from("likes").select("novel_id");
      const countMap: Record<string, number> = {};
      (likeCounts || []).forEach((l: any) => { countMap[l.novel_id] = (countMap[l.novel_id] || 0) + 1; });
      setPublicNovels(data.map((n: Novel) => ({ ...n, like_count: countMap[n.id] || 0 })));
    }
  }

  async function toggleLike(novelId: string, isLiked: boolean) {
    if (!user) { setShowAuth(true); return; }
    if (isLiked) {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("novel_id", novelId);
    } else {
      await supabase.from("likes").insert({ user_id: user.id, novel_id: novelId });
    }
    fetchPublicNovels();
  }

  async function openNovel(n: Novel) {
    await supabase.rpc("increment_views", { novel_id: n.id });
    setReadingNovel({ ...n, views: n.views + 1 });
  }

  async function handleAuth() {
    setAuthLoading(true); setAuthError("");
    const { error } = authMode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (error) setAuthError(error.message);
    else { setShowAuth(false); setEmail(""); setPassword(""); }
    setAuthLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null); setView("create");
  }

  async function saveNovel() {
    if (!user) { setShowAuth(true); return; }
    setSaving(true); setSaveMsg("");
    const content = isEditing ? editedNovel : novel;
    const lines = content.split("\n");
    const novelTitle = title || lines[0] || "제목 없음";
    const { error } = await supabase.from("novels").insert({
      user_id: user.id, title: novelTitle, content,
      genre: selectedGenre?.label || "", tags: selectedTags.join(", "),
      is_public: isPublic, views: 0,
    });
    if (error) setSaveMsg("저장 실패 😢");
    else setSaveMsg("저장됐어요! ✅");
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function togglePublic(id: string, current: boolean) {
    await supabase.from("novels").update({ is_public: !current }).eq("id", id);
    fetchMyNovels();
  }

  async function deleteNovel(id: string) {
    if (!confirm("정말 삭제할까요?")) return;
    await supabase.from("novels").delete().eq("id", id);
    fetchMyNovels();
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  function addCustomTag() {
    const t = customTag.trim();
    if (t && !selectedTags.includes(t)) setSelectedTags((prev) => [...prev, t]);
    setCustomTag("");
  }

  function addCharacter() {
    if (characters.length >= 5) return;
    setCharacters((prev) => [...prev, { id: Date.now(), name: "", desc: "", role: "조연" }]);
  }

  function removeCharacter(id: number) { setCharacters((prev) => prev.filter((c) => c.id !== id)); }
  function updateCharacter(id: number, field: keyof Character, value: string) {
    setCharacters((prev) => prev.map((c) => c.id === id ? { ...c, [field]: value } : c));
  }

  async function generateNovel() {
    setError(""); setLoading(true); setStep("result"); setNovel(""); setIsEditing(false); setSaveMsg("");
    const ratingLabel = rating === "all" ? "전체가" : rating === "teen" ? "15세 이상" : "성인 (암시 포함)";
    const povLabel = pov === "first" ? "1인칭" : "3인칭";
    const styleLabel = STYLES.find(s => s.id === style)?.label || "자유";
    const endingLabel = ENDINGS.find(e => e.id === ending)?.label || "자유";
    const charDesc = characters.filter(c => c.name || c.desc).map(c => `- ${c.role} ${c.name || "이름없음"}: ${c.desc || "설정없음"}`).join("\n");
    const prompt = `당신은 감성적이고 몰입감 있는 한국 소설 작가입니다. 아래 설정으로 소설을 한국어로 써주세요.
${title ? `작품 제목: ${title}` : ""}
장르: ${selectedGenre?.label || "자유"}
태그: ${selectedTags.length > 0 ? selectedTags.join(", ") : "자유"}
문체: ${styleLabel}
결말 방향: ${endingLabel}
수위: ${ratingLabel}
시점: ${povLabel}
${synopsis ? `줄거리/설정: ${synopsis}` : ""}
${charDesc ? `등장인물:\n${charDesc}` : ""}
분량: 500~800자
규칙: ${title ? `제목은 "${title}"로 고정.` : "제목을 먼저 쓰고"} 한 줄 띄우기. 생생한 묘사와 대화 포함. 마크다운 없이 순수 텍스트로.`;
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, tokens: 1000 }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setNovel(data.text); setEditedNovel(data.text);
    } catch (e: any) { setError("오류: " + e.message); setStep("form"); }
    finally { setLoading(false); }
  }

  async function continueNovel() {
    setContinuing(true);
    const currentText = isEditing ? editedNovel : novel;
    const prompt = `아래 소설을 자연스럽게 이어서 써주세요. 기존 문체와 분위기를 유지하고 300~500자 정도 추가해주세요. 이어지는 내용만 출력하세요.\n\n${currentText}`;
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, tokens: 700 }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const cont = currentText + "\n\n" + data.text;
      setNovel(cont); setEditedNovel(cont);
    } catch (e: any) { alert("이어쓰기 오류: " + e.message); }
    finally { setContinuing(false); }
  }

  function saveAsText() {
    const content = isEditing ? editedNovel : novel;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${title || "소설"}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(isEditing ? editedNovel : novel).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  const NovelCard = ({ n, showActions = false }: { n: Novel; showActions?: boolean }) => (
    <div style={{ background: "#160f22", border: "1.5px solid #2d2040", borderRadius: 12, padding: 20, marginBottom: 12, cursor: "pointer" }}
      onClick={() => openNovel(n)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{n.title}</div>
          <div style={{ fontSize: 12, color: "#5a4a6a" }}>{n.genre} {n.tags && `· ${n.tags.split(",").slice(0, 2).join(", ")}`}</div>
        </div>
        {showActions && (
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: 8 }} onClick={(e) => e.stopPropagation()}>
            <label style={{ position: "relative", width: 36, height: 20, cursor: "pointer" }}>
              <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} checked={n.is_public} onChange={() => togglePublic(n.id, n.is_public)} />
              <span style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: n.is_public ? "#7c3aed" : "#2d2040", borderRadius: 20, transition: "0.3s" }}>
                <span style={{ position: "absolute", height: 14, width: 14, left: n.is_public ? 19 : 3, bottom: 3, background: "white", borderRadius: "50%", transition: "0.3s" }} />
              </span>
            </label>
            <span style={{ fontSize: 10, color: "#7a6a8a" }}>{n.is_public ? "공개" : "비공개"}</span>
            <button style={{ background: "transparent", border: "1px solid #3d1f1f", color: "#f87171", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 11, fontFamily: "'Noto Serif KR', serif" }}
              onClick={() => deleteNovel(n.id)}>삭제</button>
          </div>
        )}
      </div>
      <div style={{ fontSize: 13, color: "#c4b8d8", lineHeight: 1.8, maxHeight: 80, overflow: "hidden", WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent)", marginBottom: 10 }}>
        {n.content.split("\n").slice(1).join(" ").slice(0, 150)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "#5a4a6a" }} onClick={(e) => e.stopPropagation()}>
        <span>👁 {n.views || 0}</span>
        <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: n.is_liked ? "#f472b6" : "#5a4a6a", display: "flex", alignItems: "center", gap: 4, fontFamily: "'Noto Serif KR', serif", padding: 0 }}
          onClick={() => toggleLike(n.id, !!n.is_liked)}>
          {n.is_liked ? "❤️" : "🤍"} {n.like_count || 0}
        </button>
        <span style={{ marginLeft: "auto" }}>{new Date(n.created_at).toLocaleDateString("ko-KR")}</span>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: linear-gradient(135deg, #0f0c1a 0%, #1a1228 50%, #0d1117 100%); min-height: 100vh; }
        .genre-btn { border: 1.5px solid #2d2040; background: #1a1228; color: #c4b8d8; border-radius: 12px; padding: 10px 8px; cursor: pointer; font-family: 'Noto Serif KR', serif; font-size: 13px; transition: all 0.2s; text-align: center; width: 100%; }
        .genre-btn:hover, .genre-btn.selected { background: #221738; color: #fff; transform: translateY(-2px); }
        .tag-btn { border: 1.5px solid #2d2040; background: #1a1228; color: #9a8aaa; border-radius: 20px; padding: 6px 14px; cursor: pointer; font-family: 'Noto Serif KR', serif; font-size: 13px; transition: all 0.2s; }
        .tag-btn:hover { border-color: #7c3aed; color: #e8e0f0; }
        .tag-btn.selected { background: #2d1f4e; border-color: #7c3aed; color: #c4b8ff; }
        .opt-btn { border: 1.5px solid #2d2040; background: #1a1228; color: #9a8aaa; border-radius: 10px; padding: 8px 14px; cursor: pointer; font-family: 'Noto Serif KR', serif; font-size: 13px; transition: all 0.2s; flex: 1; text-align: center; }
        .opt-btn:hover, .opt-btn.selected { background: #221738; color: #fff; }
        .input-field { width: 100%; background: #1a1228; border: 1.5px solid #2d2040; border-radius: 10px; padding: 12px 16px; color: #e8e0f0; font-family: 'Noto Serif KR', serif; font-size: 14px; outline: none; transition: border-color 0.2s; resize: vertical; }
        .input-field:focus { border-color: #7c3aed; }
        .input-field::placeholder { color: #5a4a6a; }
        .char-card { background: #160f22; border: 1.5px solid #2d2040; border-radius: 12px; padding: 16px; margin-bottom: 10px; }
        .char-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
        .role-badge { background: #2d1f4e; border: 1px solid #7c3aed; border-radius: 6px; padding: 6px 12px; color: #c4b8ff; font-family: 'Noto Serif KR', serif; font-size: 12px; white-space: nowrap; cursor: pointer; }
        .btn { border: none; border-radius: 10px; padding: 10px 18px; cursor: pointer; font-family: 'Noto Serif KR', serif; font-size: 14px; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-primary { background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff; }
        .btn-outline { background: transparent; border: 1.5px solid #2d2040; color: #9a8aaa; }
        .btn-outline:hover { border-color: #7c3aed !important; color: #e8e0f0 !important; }
        .novel-editor { width: 100%; background: transparent; border: none; outline: none; color: #ddd4ee; font-family: 'Noto Serif KR', serif; font-size: 16px; line-height: 2.1; resize: none; font-weight: 300; min-height: 400px; }
        .nav-btn { background: transparent; border: none; color: #7a6a8a; font-family: 'Noto Serif KR', serif; font-size: 14px; cursor: pointer; padding: 8px 16px; border-radius: 8px; transition: all 0.2s; }
        .nav-btn:hover, .nav-btn.active { background: #221738; color: #e8e0f0; }
        .tab-btn { background: transparent; border: none; border-bottom: 2px solid transparent; color: #7a6a8a; font-family: 'Noto Serif KR', serif; font-size: 14px; cursor: pointer; padding: 8px 16px; transition: all 0.2s; }
        .tab-btn.active { border-bottom-color: #7c3aed; color: #e8e0f0; }
        .section-title { font-size: 13px; font-weight: 600; color: #c4b8d8; margin-bottom: 12px; }
        .section { margin-bottom: 28px; }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .shimmer-text { background: linear-gradient(90deg,#7c3aed,#f472b6,#a78bfa,#7c3aed); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:shimmer 3s linear infinite; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fadeIn 0.5s ease forwards; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .spinner { display:inline-block; width:16px; height:16px; border:2px solid #ffffff44; border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; }
      `}</style>

      <div style={{ fontFamily: "'Noto Serif KR', serif", color: "#e8e0f0", minHeight: "100vh" }}>

        {/* 헤더 */}
        <div style={{ borderBottom: "1px solid #2d2040", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 680, margin: "0 auto" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, cursor: "pointer" }} onClick={() => { setView("create"); setStep("form"); }}>
            <span className="shimmer-text">노벨라</span>
          </h1>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {user ? (
              <>
                <span style={{ fontSize: 12, color: "#7a6a8a", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</span>
                <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 12 }} onClick={handleLogout}>로그아웃</button>
              </>
            ) : (
              <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setShowAuth(true)}>로그인</button>
            )}
          </div>
        </div>

        {/* 네비게이션 */}
        <div style={{ display: "flex", justifyContent: "center", gap: 4, padding: "12px 20px", borderBottom: "1px solid #2d2040", maxWidth: 680, margin: "0 auto" }}>
          <button className={`nav-btn${view === "create" ? " active" : ""}`} onClick={() => { setView("create"); setStep("form"); }}>✍️ 창작</button>
          <button className={`nav-btn${view === "library" ? " active" : ""}`} onClick={() => setView("library")}>📚 서재</button>
          <button className={`nav-btn${view === "explore" ? " active" : ""}`} onClick={() => setView("explore")}>🔍 둘러보기</button>
        </div>

        {/* 로그인 모달 */}
        {showAuth && (
          <div style={{ position: "fixed", inset: 0, background: "#0009", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => setShowAuth(false)}>
            <div style={{ background: "#1a1228", border: "1px solid #2d2040", borderRadius: 16, padding: 32, width: 360, maxWidth: "90vw" }}
              onClick={(e) => e.stopPropagation()}>
              <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 600 }}>{authMode === "login" ? "로그인" : "회원가입"}</h2>
              <input className="input-field" style={{ marginBottom: 10 }} type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="input-field" style={{ marginBottom: 16 }} type="password" placeholder="비밀번호 (6자 이상)" value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAuth(); }} />
              {authError && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{authError}</div>}
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: 12 }} onClick={handleAuth} disabled={authLoading}>
                {authLoading ? <><span className="spinner" /> 처리 중...</> : authMode === "login" ? "로그인" : "회원가입"}
              </button>
              <div style={{ textAlign: "center", fontSize: 13, color: "#7a6a8a" }}>
                {authMode === "login" ? "계정이 없으신가요? " : "이미 계정이 있으신가요? "}
                <span style={{ color: "#a78bfa", cursor: "pointer" }} onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthError(""); }}>
                  {authMode === "login" ? "회원가입" : "로그인"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 소설 읽기 모달 */}
        {readingNovel && (
          <div style={{ position: "fixed", inset: 0, background: "#0009", zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "40px 20px" }}
            onClick={() => setReadingNovel(null)}>
            <div style={{ background: "#1a1228", border: "1px solid #2d2040", borderRadius: 16, padding: 36, width: "100%", maxWidth: 640 }}
              onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>{readingNovel.title}</div>
                  <div style={{ fontSize: 12, color: "#5a4a6a" }}>{readingNovel.genre} · 👁 {readingNovel.views} · ❤️ {readingNovel.like_count || 0}</div>
                </div>
                <button style={{ background: "none", border: "none", color: "#7a6a8a", fontSize: 20, cursor: "pointer" }} onClick={() => setReadingNovel(null)}>✕</button>
              </div>
              <div style={{ lineHeight: 2.1, fontSize: 16, color: "#ddd4ee", whiteSpace: "pre-wrap", fontWeight: 300 }}>{readingNovel.content}</div>
              <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
                <button style={{ background: "none", border: "1px solid #2d2040", borderRadius: 20, padding: "8px 20px", color: readingNovel.is_liked ? "#f472b6" : "#7a6a8a", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 14 }}
                  onClick={() => { toggleLike(readingNovel.id, !!readingNovel.is_liked); setReadingNovel({ ...readingNovel, is_liked: !readingNovel.is_liked, like_count: (readingNovel.like_count || 0) + (readingNovel.is_liked ? -1 : 1) }); }}>
                  {readingNovel.is_liked ? "❤️ 좋아요 취소" : "🤍 좋아요"} {readingNovel.like_count || 0}
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px 80px" }}>

          {/* 창작 */}
          {view === "create" && (
            <>
              {step === "form" && (
                <div className="fade-in" style={{ paddingTop: 24 }}>
                  <div className="section">
                    <div className="section-title">01. 장르 <span style={{ fontSize: 10, color: "#5a4a6a" }}>선택</span></div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                      {GENRES.map((g) => (
                        <button key={g.id} className={`genre-btn${genre === g.id ? " selected" : ""}`}
                          style={genre === g.id ? { borderColor: g.color, boxShadow: `0 0 16px ${g.color}33` } : {}}
                          onClick={() => setGenre(genre === g.id ? null : g.id)}>{g.label}</button>
                      ))}
                    </div>
                  </div>

                  <div className="section">
                    <div className="section-title">02. 태그 <span style={{ fontSize: 10, color: "#5a4a6a" }}>선택</span></div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                      {PRESET_TAGS.map((tag) => (
                        <button key={tag} className={`tag-btn${selectedTags.includes(tag) ? " selected" : ""}`} onClick={() => toggleTag(tag)}>{tag}</button>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input className="input-field" style={{ resize: "none" }} placeholder="직접 태그 입력 후 엔터" value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTag(); } }} />
                      <button className="btn btn-outline" onClick={addCustomTag} style={{ whiteSpace: "nowrap" }}>+ 추가</button>
                    </div>
                    {selectedTags.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                        {selectedTags.map((tag) => (
                          <span key={tag} onClick={() => toggleTag(tag)} style={{ background: "#2d1f4e", border: "1px solid #7c3aed", borderRadius: 20, padding: "4px 10px", fontSize: 12, color: "#c4b8ff", cursor: "pointer" }}>{tag} ✕</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="section">
                    <div className="section-title">03. 문체 <span style={{ fontSize: 10, color: "#5a4a6a" }}>선택</span></div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {STYLES.map((s) => (
                        <button key={s.id} className={`opt-btn${style === s.id ? " selected" : ""}`}
                          style={{ ...(style === s.id ? { borderColor: accentColor } : {}), flex: "1 1 40%" }}
                          onClick={() => setStyle(style === s.id ? null : s.id)}>{s.label}</button>
                      ))}
                    </div>
                  </div>

                  <div className="section">
                    <div className="section-title">04. 결말 방향 <span style={{ fontSize: 10, color: "#5a4a6a" }}>선택</span></div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {ENDINGS.map((e) => (
                        <button key={e.id} className={`opt-btn${ending === e.id ? " selected" : ""}`}
                          style={ending === e.id ? { borderColor: accentColor } : {}}
                          onClick={() => setEnding(ending === e.id ? null : e.id)}>{e.label}</button>
                      ))}
                    </div>
                  </div>

                  <div className="section">
                    <div className="section-title">05. 시점 <span style={{ fontSize: 10, color: "#5a4a6a" }}>선택</span></div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {POVS.map((p) => (
                        <button key={p.id} className={`opt-btn${pov === p.id ? " selected" : ""}`}
                          style={pov === p.id ? { borderColor: accentColor } : {}}
                          onClick={() => setPov(p.id)}>
                          <div style={{ fontWeight: 600 }}>{p.label}</div>
                          <div style={{ fontSize: 11, color: "#7a6a8a", marginTop: 2 }}>{p.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="section">
                    <div className="section-title">06. 수위 <span style={{ fontSize: 10, color: "#5a4a6a" }}>선택</span></div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {RATINGS.map((r) => (
                        <button key={r.id} className={`opt-btn${rating === r.id ? " selected" : ""}`}
                          style={rating === r.id ? { borderColor: r.id === "adult" ? "#f87171" : accentColor } : {}}
                          onClick={() => setRating(r.id)}>
                          <div style={{ fontWeight: 600, color: r.id === "adult" && rating === r.id ? "#fca5a5" : "inherit" }}>{r.label}</div>
                          <div style={{ fontSize: 11, color: "#7a6a8a", marginTop: 2 }}>{r.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="section">
                    <div className="section-title">07. 작품 제목 <span style={{ fontSize: 10, color: "#5a4a6a" }}>선택</span></div>
                    <input className="input-field" placeholder="비우면 AI가 정해요" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>

                  <div className="section">
                    <div className="section-title">08. 줄거리 / 배경 설정 <span style={{ fontSize: 10, color: "#5a4a6a" }}>선택</span></div>
                    <textarea className="input-field" rows={3} placeholder="예: 기억을 잃고 낯선 도시에서 깨어난 남자가 자신의 과거를 추적하는 이야기." value={synopsis} onChange={(e) => setSynopsis(e.target.value)} />
                  </div>

                  <div className="section">
                    <div className="section-title">09. 등장인물 <span style={{ fontSize: 10, color: "#5a4a6a" }}>선택</span></div>
                    {characters.map((char, idx) => (
                      <div key={char.id} className="char-card">
                        <div className="char-row">
                          <span className="role-badge" onClick={() => updateCharacter(char.id, "role", char.role === "주인공" ? "조연" : "주인공")}>{char.role} ↕</span>
                          <input className="input-field" style={{ flex: 1 }} placeholder="이름" value={char.name} onChange={(e) => updateCharacter(char.id, "name", e.target.value)} />
                          {idx > 0 && <button style={{ background: "transparent", border: "1px solid #3d1f1f", color: "#f87171", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12, fontFamily: "'Noto Serif KR', serif" }} onClick={() => removeCharacter(char.id)}>삭제</button>}
                        </div>
                        <textarea className="input-field" rows={2}
                          placeholder={genre === "bl" ? "예: 공, 냉정한 CEO, 집착형" : genre === "gl" ? "예: 攻, 활발한 성격" : "예: 차갑지만 따뜻한 마음을 숨기고 있는 30대 형사"}
                          value={char.desc} onChange={(e) => updateCharacter(char.id, "desc", e.target.value)} />
                      </div>
                    ))}
                    {characters.length < 5 && (
                      <button className="btn btn-outline" onClick={addCharacter} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>+ 캐릭터 추가</button>
                    )}
                  </div>

                  {error && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 16, textAlign: "center" }}>⚠️ {error}</div>}
                  <button className="btn btn-primary" style={{ width: "100%", padding: 16, fontSize: 16, borderRadius: 12, justifyContent: "center" }} onClick={generateNovel} disabled={loading}>
                    {loading ? <><span className="spinner" /> 생성 중...</> : "✨ 소설 생성하기"}
                  </button>
                </div>
              )}

              {step === "result" && (
                <div className="fade-in" style={{ paddingTop: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <button className="btn btn-outline" onClick={() => { setStep("form"); setNovel(""); setIsEditing(false); }}>← 다시 만들기</button>
                    <button className="btn btn-outline" style={{ borderColor: isEditing ? accentColor : "#2d2040", color: isEditing ? accentColor : "#9a8aaa" }}
                      onClick={() => { setIsEditing(!isEditing); setEditedNovel(novel); }} disabled={loading}>
                      {isEditing ? "✅ 편집 완료" : "✏️ 편집"}
                    </button>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                    {[selectedGenre?.label, ...selectedTags, STYLES.find(s => s.id === style)?.label, RATINGS.find(r => r.id === rating)?.label].filter(Boolean).map((tag, i) => (
                      <span key={i} style={{ background: "#1a1228", border: "1px solid #2d2040", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#9a8aaa" }}>{tag}</span>
                    ))}
                  </div>

                  <div style={{ background: "linear-gradient(180deg,#1a1228 0%,#160f22 100%)", border: `1px solid ${isEditing ? accentColor + "66" : "#2d2040"}`, borderRadius: 16, padding: "36px 32px", minHeight: 300, boxShadow: "0 8px 48px #0007" }}>
                    {loading && <div style={{ textAlign: "center", padding: "48px 0", color: "#5a4a6a" }}><div style={{ fontSize: 32, marginBottom: 16 }}>✍️</div><div>이야기를 쓰고 있어요...</div></div>}
                    {!loading && isEditing && <textarea className="novel-editor" value={editedNovel} onChange={(e) => setEditedNovel(e.target.value)} />}
                    {!loading && !isEditing && novel && <div style={{ lineHeight: 2.1, fontSize: 16, color: "#ddd4ee", whiteSpace: "pre-wrap", fontWeight: 300 }}>{novel}</div>}
                  </div>

                  {!loading && novel && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0", padding: "12px 16px", background: "#160f22", borderRadius: 10, border: "1px solid #2d2040" }}>
                        <label style={{ position: "relative", width: 44, height: 24, cursor: "pointer", flexShrink: 0 }}>
                          <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                          <span style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: isPublic ? "#7c3aed" : "#2d2040", borderRadius: 24, transition: "0.3s" }}>
                            <span style={{ position: "absolute", height: 18, width: 18, left: isPublic ? 23 : 3, bottom: 3, background: "white", borderRadius: "50%", transition: "0.3s" }} />
                          </span>
                        </label>
                        <div>
                          <div style={{ fontSize: 14, color: "#c4b8d8" }}>{isPublic ? "🌍 공개 — 둘러보기에 표시됩니다" : "🔒 비공개 — 나만 볼 수 있어요"}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                        <button className="btn btn-primary" onClick={continueNovel} disabled={continuing} style={{ flex: "1 1 140px", justifyContent: "center" }}>
                          {continuing ? <><span className="spinner" /> 이어쓰는 중...</> : "📖 이어쓰기"}
                        </button>
                        <button className="btn btn-outline" onClick={saveNovel} disabled={saving} style={{ flex: "1 1 110px", justifyContent: "center", borderColor: saveMsg ? "#86efac" : "#2d2040", color: saveMsg ? "#86efac" : "#9a8aaa" }}>
                          {saving ? <><span className="spinner" /></> : saveMsg || "💾 서재 저장"}
                        </button>
                        <button className="btn btn-outline" onClick={generateNovel} disabled={loading} style={{ flex: "1 1 90px", justifyContent: "center" }}>🔄 재생성</button>
                        <button className="btn btn-outline" onClick={saveAsText} style={{ flex: "1 1 90px", justifyContent: "center" }}>📄 txt</button>
                        <button className="btn btn-outline" onClick={copyToClipboard} style={{ flex: "1 1 90px", justifyContent: "center", borderColor: copied ? "#86efac" : "#2d2040", color: copied ? "#86efac" : "#9a8aaa" }}>
                          {copied ? "✅" : "📋 복사"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {/* 서재 */}
          {view === "library" && (
            <div className="fade-in" style={{ paddingTop: 16 }}>
              <div style={{ display: "flex", borderBottom: "1px solid #2d2040", marginBottom: 20 }}>
                <button className={`tab-btn${libraryTab === "my" ? " active" : ""}`} onClick={() => setLibraryTab("my")}>📝 내 작품</button>
                <button className={`tab-btn${libraryTab === "liked" ? " active" : ""}`} onClick={() => { setLibraryTab("liked"); if (user) fetchLikedNovels(); }}>❤️ 좋아한 작품</button>
              </div>
              {!user ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: "#5a4a6a" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
                  <div style={{ marginBottom: 16 }}>로그인하면 서재를 이용할 수 있어요</div>
                  <button className="btn btn-primary" onClick={() => setShowAuth(true)}>로그인하기</button>
                </div>
              ) : libraryTab === "my" ? (
                myNovels.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 0", color: "#5a4a6a" }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
                    <div>아직 저장된 소설이 없어요</div>
                  </div>
                ) : myNovels.map((n) => <NovelCard key={n.id} n={n} showActions />)
              ) : (
                likedNovels.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 0", color: "#5a4a6a" }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🤍</div>
                    <div>좋아한 작품이 없어요</div>
                  </div>
                ) : likedNovels.map((n) => <NovelCard key={n.id} n={n} />)
              )}
            </div>
          )}

          {/* 둘러보기 */}
          {view === "explore" && (
            <div className="fade-in" style={{ paddingTop: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <input className="input-field" placeholder="🔍 제목, 장르, 태그로 검색..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") fetchPublicNovels(); }} />
              </div>
              <div style={{ display: "flex", borderBottom: "1px solid #2d2040", marginBottom: 20 }}>
                <button className={`tab-btn${exploreTab === "latest" ? " active" : ""}`} onClick={() => setExploreTab("latest")}>🆕 최신</button>
                <button className={`tab-btn${exploreTab === "popular" ? " active" : ""}`} onClick={() => setExploreTab("popular")}>🔥 인기</button>
              </div>
              {publicNovels.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: "#5a4a6a" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
                  <div>아직 공개된 소설이 없어요</div>
                </div>
              ) : publicNovels.map((n) => <NovelCard key={n.id} n={n} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}