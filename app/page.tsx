"use client";
import { useState, useEffect } from "react";
import { createClient } from "./lib/supabase";

const GENRES = [
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

const PRESET_TAGS = [
  "운명적 재회","기억상실","계약 연애","학교생활","직장 로맨스",
  "이세계","복수","금지된 사랑","삼각관계","첫사랑",
  "집착","츤데레","순정","비밀연애","신분차이",
  "용사와 마왕","오해와 화해","소꿉친구","재벌","빙의",
];

const STYLES = [
  { id: "lyrical", label: "🌸 감성" },
  { id: "fast", label: "⚡ 빠른 전개" },
  { id: "dialogue", label: "💬 대화 위주" },
  { id: "descriptive", label: "🎨 묘사 위주" },
];

const ENDINGS = [
  { id: "happy", label: "😊 해피" },
  { id: "sad", label: "😢 새드" },
  { id: "open", label: "🌫️ 열린 결말" },
];

const RATINGS = [
  { id: "all", label: "전체가", desc: "순수" },
  { id: "teen", label: "15+", desc: "긴장감" },
  { id: "adult", label: "19+", desc: "성인 암시" },
];

const POVS = [
  { id: "first", label: "1인칭", desc: "나는..." },
  { id: "third", label: "3인칭", desc: "그는..." },
];

interface Character { id: number; name: string; desc: string; role: string; }
interface Novel {
  id: string; title: string; content: string; genre: string; tags: string;
  is_public: boolean; created_at: string; views: number;
  like_count?: number; is_liked?: boolean;
  series_id?: string; episode_number?: number; series_title?: string;
}
interface Profile { id: string; nickname: string; }
interface Series { series_id: string; series_title: string; genre: string; tags: string; episode_count: number; latest: string; views: number; }

export default function Home() {
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authMode, setAuthMode] = useState<"login"|"signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [nicknameSaving, setNicknameSaving] = useState(false);

  const [myNovels, setMyNovels] = useState<Novel[]>([]);
  const [likedNovels, setLikedNovels] = useState<Novel[]>([]);
  const [publicNovels, setPublicNovels] = useState<Novel[]>([]);
  const [view, setView] = useState<"create"|"library"|"explore">("create");
  const [libraryTab, setLibraryTab] = useState<"my"|"liked">("my");
  const [exploreTab, setExploreTab] = useState<"latest"|"popular">("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [readingNovel, setReadingNovel] = useState<Novel|null>(null);
  const [readingSeries, setReadingSeries] = useState<Novel[]>([]);
  const [isMyNovel, setIsMyNovel] = useState(false);

  // 창작
  const [genre, setGenre] = useState<string|null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [style, setStyle] = useState<string|null>(null);
  const [ending, setEnding] = useState<string|null>(null);
  const [rating, setRating] = useState("all");
  const [pov, setPov] = useState("third");
  const [title, setTitle] = useState("");
  const [seriesTitle, setSeriesTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [characters, setCharacters] = useState<Character[]>([{ id: 1, name: "", desc: "", role: "주인공" }]);
  const [isPublic, setIsPublic] = useState(false);
  const [currentSeriesId, setCurrentSeriesId] = useState<string|null>(null);
  const [currentEpisode, setCurrentEpisode] = useState(1);

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
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id);
    });
    supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id);
    });
  }, []);

  useEffect(() => {
    if (view === "library" && user) { fetchMyNovels(); fetchLikedNovels(); }
    if (view === "explore") fetchPublicNovels();
  }, [view, user, exploreTab]);

  async function fetchProfile(userId: string) {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) { setProfile(data); setNicknameInput(data.nickname); }
  }

  async function saveNickname() {
    if (!user || !nicknameInput.trim()) return;
    setNicknameSaving(true);
    await supabase.from("profiles").upsert({ id: user.id, nickname: nicknameInput.trim() });
    await fetchProfile(user.id);
    setNicknameSaving(false);
    setShowProfile(false);
  }

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
    if (searchQuery.trim()) query = query.or(`title.ilike.%${searchQuery}%,tags.ilike.%${searchQuery}%,genre.ilike.%${searchQuery}%,series_title.ilike.%${searchQuery}%`);
    query = exploreTab === "popular" ? query.order("views", { ascending: false }) : query.order("created_at", { ascending: false });
    const { data } = await query.limit(50);
    if (!data) { setPublicNovels([]); return; }
    const { data: likeCounts } = await supabase.from("likes").select("novel_id");
    const countMap: Record<string, number> = {};
    (likeCounts || []).forEach((l: any) => { countMap[l.novel_id] = (countMap[l.novel_id] || 0) + 1; });
    if (user) {
      const { data: likeData } = await supabase.from("likes").select("novel_id").eq("user_id", user.id);
      const likedIds = new Set((likeData || []).map((l: any) => l.novel_id));
      setPublicNovels(data.map((n: Novel) => ({ ...n, is_liked: likedIds.has(n.id), like_count: countMap[n.id] || 0 })));
    } else {
      setPublicNovels(data.map((n: Novel) => ({ ...n, like_count: countMap[n.id] || 0 })));
    }
  }

  async function toggleLike(novelId: string, isLiked: boolean) {
    if (!user) { setShowAuth(true); return; }
    if (isLiked) await supabase.from("likes").delete().eq("user_id", user.id).eq("novel_id", novelId);
    else await supabase.from("likes").insert({ user_id: user.id, novel_id: novelId });
    fetchPublicNovels();
  }

  async function openNovel(n: Novel, mine = false) {
    await supabase.rpc("increment_views", { novel_id: n.id });
    setReadingNovel({ ...n, views: (n.views || 0) + 1 });
    setIsMyNovel(mine);
    // 시리즈면 전체 화 목록 가져오기
    if (n.series_id) {
      const { data } = await supabase.from("novels").select("*").eq("series_id", n.series_id).order("episode_number", { ascending: true });
      setReadingSeries(data || []);
    } else {
      setReadingSeries([]);
    }
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
    await supabase.auth.signOut(); setUser(null); setProfile(null); setView("create");
  }

  async function saveNovel() {
    if (!user) { setShowAuth(true); return; }
    setSaving(true); setSaveMsg("");
    const content = isEditing ? editedNovel : novel;
    const novelTitle = title || content.split("\n")[0] || "제목 없음";
    const sid = currentSeriesId || crypto.randomUUID();
    if (!currentSeriesId) setCurrentSeriesId(sid);
    const { error } = await supabase.from("novels").insert({
      user_id: user.id,
      title: novelTitle,
      content,
      genre: selectedGenre?.label || "",
      tags: selectedTags.join(", "),
      is_public: isPublic,
      views: 0,
      series_id: sid,
      episode_number: currentEpisode,
      series_title: seriesTitle || novelTitle,
    });
    if (!error) {
      setSaveMsg(`${currentEpisode}화 저장됐어요! ✅`);
      setCurrentEpisode(prev => prev + 1);
    } else {
      setSaveMsg("저장 실패 😢");
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function togglePublic(e: React.MouseEvent, id: string, current: boolean) {
    e.stopPropagation();
    e.preventDefault();
    await supabase.from("novels").update({ is_public: !current }).eq("id", id);
    fetchMyNovels();
  }

  async function deleteNovel(e: React.MouseEvent, id: string) {
    e.stopPropagation();
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

  function resetForm() {
    setStep("form"); setNovel(""); setEditedNovel(""); setIsEditing(false);
    setCurrentSeriesId(null); setCurrentEpisode(1); setSaveMsg("");
  }

  async function generateNovel() {
    setError(""); setLoading(true); setStep("result"); setNovel(""); setIsEditing(false); setSaveMsg("");
    const ratingLabel = rating === "all" ? "전체가" : rating === "teen" ? "15세 이상" : "성인 (암시 포함)";
    const styleLabel = STYLES.find(s => s.id === style)?.label || "자유";
    const endingLabel = ENDINGS.find(e => e.id === ending)?.label || "자유";
    const charDesc = characters.filter(c => c.name || c.desc).map(c => `- ${c.role} ${c.name || "이름없음"}: ${c.desc || "설정없음"}`).join("\n");
    const episodeInfo = currentEpisode > 1 ? `이전 내용을 이어서 ${currentEpisode}화를 써주세요.` : `1화를 써주세요.`;
    const prompt = `당신은 감성적이고 몰입감 있는 한국 소설 작가입니다. ${episodeInfo}
${seriesTitle ? `시리즈 제목: ${seriesTitle}` : ""}
${title ? `이번 화 제목: ${title}` : ""}
장르: ${selectedGenre?.label || "자유"}
태그: ${selectedTags.length > 0 ? selectedTags.join(", ") : "자유"}
문체: ${styleLabel}
결말 방향: ${endingLabel}
수위: ${ratingLabel}
시점: ${pov === "first" ? "1인칭" : "3인칭"}
${synopsis ? `줄거리/설정: ${synopsis}` : ""}
${charDesc ? `등장인물:\n${charDesc}` : ""}
분량: 500~800자
규칙: 제목을 먼저 쓰고 한 줄 띄우기. 생생한 묘사와 대화 포함. 마크다운 없이 순수 텍스트로.`;
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
    const prompt = `아래 소설을 자연스럽게 이어서 써주세요. 기존 문체와 분위기를 유지하고 300~500자 추가. 이어지는 내용만 출력하세요.\n\n${currentText}`;
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, tokens: 700 }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const cont = currentText + "\n\n" + data.text;
      setNovel(cont); setEditedNovel(cont);
    } catch (e: any) { alert("이어쓰기 오류: " + e.message); }
    finally { setContinuing(false); }
  }

  async function generateNextEpisode() {
    const currentText = isEditing ? editedNovel : novel;
    setCurrentEpisode(prev => prev + 1);
    setNovel(""); setEditedNovel(""); setIsEditing(false); setSaveMsg("");
    setLoading(true);
    const prompt = `아래는 소설의 이전 화 내용입니다. 이 내용을 바탕으로 자연스럽게 이어지는 다음 화를 써주세요. 500~800자, 마크다운 없이 순수 텍스트로.\n\n이전 화:\n${currentText}`;
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, tokens: 1000 }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setNovel(data.text); setEditedNovel(data.text);
    } catch (e: any) { setError("오류: " + e.message); }
    finally { setLoading(false); }
  }

  function saveAsText() {
    const content = isEditing ? editedNovel : novel;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${seriesTitle || title || "소설"}_${currentEpisode}화.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(isEditing ? editedNovel : novel).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  // 서재에서 이어쓰기
  function continueFromLibrary(n: Novel) {
    setNovel(n.content);
    setEditedNovel(n.content);
    setCurrentSeriesId(n.series_id || null);
    setCurrentEpisode((n.episode_number || 1) + 1);
    setSeriesTitle(n.series_title || "");
    setStep("result");
    setView("create");
    setReadingNovel(null);
  }

  // 서재에서 편집
  function editFromLibrary(n: Novel) {
    setNovel(n.content);
    setEditedNovel(n.content);
    setIsEditing(true);
    setCurrentSeriesId(n.series_id || null);
    setCurrentEpisode(n.episode_number || 1);
    setSeriesTitle(n.series_title || "");
    setStep("result");
    setView("create");
    setReadingNovel(null);
  }

  const NovelCard = ({ n, showActions = false }: { n: Novel; showActions?: boolean }) => (
    <div style={{ background: "#160f22", border: "1.5px solid #2d2040", borderRadius: 14, padding: "16px", marginBottom: 12, cursor: "pointer", transition: "border-color 0.2s" }}
      onMouseOver={(e) => (e.currentTarget.style.borderColor = "#4a3570")}
      onMouseOut={(e) => (e.currentTarget.style.borderColor = "#2d2040")}
      onClick={() => openNovel(n, showActions)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {n.series_title && n.series_title !== n.title && (
            <div style={{ fontSize: 11, color: "#7c3aed", marginBottom: 2 }}>📚 {n.series_title}</div>
          )}
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {n.episode_number && n.episode_number > 0 ? `${n.episode_number}화. ` : ""}{n.title}
          </div>
          <div style={{ fontSize: 11, color: "#5a4a6a" }}>{n.genre}{n.tags && ` · ${n.tags.split(",").slice(0, 2).join(", ")}`}</div>
        </div>
        {showActions && (
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
            <label style={{ position: "relative", width: 32, height: 18, cursor: "pointer" }} onClick={(e) => togglePublic(e, n.id, n.is_public)}>
              <span style={{ display: "block", width: 32, height: 18, background: n.is_public ? "#7c3aed" : "#2d2040", borderRadius: 18, transition: "0.3s", position: "relative" }}>
                <span style={{ position: "absolute", height: 12, width: 12, left: n.is_public ? 17 : 3, top: 3, background: "white", borderRadius: "50%", transition: "0.3s" }} />
              </span>
            </label>
            <button style={{ background: "transparent", border: "1px solid #3d1f1f", color: "#f87171", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 11, fontFamily: "'Noto Serif KR', serif" }}
              onClick={(e) => deleteNovel(e, n.id)}>삭제</button>
          </div>
        )}
      </div>
      <div style={{ fontSize: 13, color: "#9a8aaa", lineHeight: 1.7, maxHeight: 60, overflow: "hidden", WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent)", marginBottom: 10 }}>
        {n.content.split("\n").filter((l: string) => l.trim()).slice(1, 4).join(" ")}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "#5a4a6a" }} onClick={(e) => e.stopPropagation()}>
        <span>👁 {n.views || 0}</span>
        <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: n.is_liked ? "#f472b6" : "#5a4a6a", display: "flex", alignItems: "center", gap: 3, fontFamily: "'Noto Serif KR', serif", padding: 0 }}
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
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;600;700&family=Playfair+Display:wght@700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-size: 16px; }
        body { background: #0d0a14; min-height: 100vh; overflow-x: hidden; }
        .genre-btn { border: 1.5px solid #2d2040; background: #1a1228; color: #c4b8d8; border-radius: 10px; padding: 10px 6px; cursor: pointer; font-family: 'Noto Serif KR', serif; font-size: 12px; transition: all 0.2s; text-align: center; width: 100%; }
        .genre-btn:hover, .genre-btn.selected { background: #221738; color: #fff; }
        .tag-btn { border: 1.5px solid #2d2040; background: #1a1228; color: #9a8aaa; border-radius: 20px; padding: 5px 12px; cursor: pointer; font-family: 'Noto Serif KR', serif; font-size: 12px; transition: all 0.2s; white-space: nowrap; }
        .tag-btn:hover { border-color: #7c3aed; color: #e8e0f0; }
        .tag-btn.selected { background: #2d1f4e; border-color: #7c3aed; color: #c4b8ff; }
        .opt-btn { border: 1.5px solid #2d2040; background: #1a1228; color: #9a8aaa; border-radius: 10px; padding: 10px 8px; cursor: pointer; font-family: 'Noto Serif KR', serif; font-size: 13px; transition: all 0.2s; flex: 1; text-align: center; }
        .opt-btn:hover, .opt-btn.selected { background: #221738; color: #fff; }
        .input-field { width: 100%; background: #1a1228; border: 1.5px solid #2d2040; border-radius: 10px; padding: 12px 14px; color: #e8e0f0; font-family: 'Noto Serif KR', serif; font-size: 14px; outline: none; transition: border-color 0.2s; resize: vertical; -webkit-appearance: none; }
        .input-field:focus { border-color: #7c3aed; }
        .input-field::placeholder { color: #5a4a6a; }
        .char-card { background: #160f22; border: 1.5px solid #2d2040; border-radius: 12px; padding: 14px; margin-bottom: 10px; }
        .btn { border: none; border-radius: 10px; padding: 12px 16px; cursor: pointer; font-family: 'Noto Serif KR', serif; font-size: 14px; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; -webkit-tap-highlight-color: transparent; }
        .btn:active { transform: scale(0.97); }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-primary { background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff; }
        .btn-outline { background: transparent; border: 1.5px solid #2d2040; color: #9a8aaa; }
        .novel-editor { width: 100%; background: transparent; border: none; outline: none; color: #ddd4ee; font-family: 'Noto Serif KR', serif; font-size: 16px; line-height: 2.1; resize: none; font-weight: 300; min-height: 300px; }
        .nav-btn { background: transparent; border: none; color: #7a6a8a; font-family: 'Noto Serif KR', serif; font-size: 13px; cursor: pointer; padding: 10px 0; flex: 1; text-align: center; border-bottom: 2px solid transparent; transition: all 0.2s; -webkit-tap-highlight-color: transparent; }
        .nav-btn.active { color: #e8e0f0; border-bottom-color: #7c3aed; }
        .tab-btn { background: transparent; border: none; border-bottom: 2px solid transparent; color: #7a6a8a; font-family: 'Noto Serif KR', serif; font-size: 14px; cursor: pointer; padding: 10px 16px; transition: all 0.2s; }
        .tab-btn.active { border-bottom-color: #7c3aed; color: #e8e0f0; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 12px; font-weight: 600; color: #7a6a8a; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .shimmer-text { background: linear-gradient(90deg,#7c3aed,#f472b6,#a78bfa,#7c3aed); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:shimmer 3s linear infinite; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .spinner { display:inline-block; width:16px; height:16px; border:2px solid #ffffff44; border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; flex-shrink:0; }
        @media (max-width: 480px) { .genre-grid { grid-template-columns: repeat(3, 1fr) !important; } }
      `}</style>

      <div style={{ fontFamily: "'Noto Serif KR', serif", color: "#e8e0f0", minHeight: "100vh", maxWidth: 640, margin: "0 auto", width: "100%" }}>

        {/* 헤더 */}
        <header style={{ position: "sticky", top: 0, zIndex: 50, background: "#0d0a14cc", backdropFilter: "blur(12px)", borderBottom: "1px solid #2d2040", padding: "0 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 52 }}>
            <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }} onClick={() => { setView("create"); resetForm(); }}>
              <span style={{ fontSize: 20, fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                <span className="shimmer-text">Novella</span>
              </span>
              <span style={{ fontSize: 10, color: "#5a4a6a", letterSpacing: "0.15em" }}>노벨라</span>
            </div>
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "#c4b8d8", fontSize: 13, fontFamily: "'Noto Serif KR', serif" }}
                  onClick={() => { setShowProfile(true); setNicknameInput(profile?.nickname || ""); }}>
                  👤 {profile?.nickname || user.email?.split("@")[0]}
                </button>
                <button className="btn btn-outline" style={{ padding: "6px 10px", fontSize: 12 }} onClick={handleLogout}>로그아웃</button>
              </div>
            ) : (
              <button className="btn btn-primary" style={{ padding: "7px 16px", fontSize: 13 }} onClick={() => setShowAuth(true)}>로그인</button>
            )}
          </div>
        </header>

        {/* 네비게이션 */}
        <nav style={{ display: "flex", borderBottom: "1px solid #2d2040", background: "#0d0a14" }}>
          <button className={`nav-btn${view === "create" ? " active" : ""}`} onClick={() => { setView("create"); }}>✍️ 창작</button>
          <button className={`nav-btn${view === "explore" ? " active" : ""}`} onClick={() => setView("explore")}>🔍 둘러보기</button>
          <button className={`nav-btn${view === "library" ? " active" : ""}`} onClick={() => setView("library")}>📚 서재</button>
        </nav>

        {/* 로그인 모달 */}
        {showAuth && (
          <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
            onClick={() => setShowAuth(false)}>
            <div style={{ background: "#1a1228", borderRadius: "20px 20px 0 0", padding: "28px 20px 40px", width: "100%", maxWidth: 480 }}
              onClick={(e) => e.stopPropagation()}>
              <div style={{ width: 36, height: 4, background: "#2d2040", borderRadius: 2, margin: "0 auto 24px" }} />
              <h2 style={{ marginBottom: 20, fontSize: 18, fontWeight: 600, textAlign: "center" }}>{authMode === "login" ? "로그인" : "회원가입"}</h2>
              <input className="input-field" style={{ marginBottom: 10 }} type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="input-field" style={{ marginBottom: 16 }} type="password" placeholder="비밀번호 (6자 이상)" value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAuth(); }} />
              {authError && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{authError}</div>}
              <button className="btn btn-primary" style={{ width: "100%", padding: 14, fontSize: 15 }} onClick={handleAuth} disabled={authLoading}>
                {authLoading ? <><span className="spinner" /> 처리 중...</> : authMode === "login" ? "로그인" : "회원가입"}
              </button>
              <div style={{ textAlign: "center", fontSize: 13, color: "#7a6a8a", marginTop: 14 }}>
                {authMode === "login" ? "계정이 없으신가요? " : "이미 계정이 있으신가요? "}
                <span style={{ color: "#a78bfa", cursor: "pointer" }} onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthError(""); }}>
                  {authMode === "login" ? "회원가입" : "로그인"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 프로필 모달 */}
        {showProfile && (
          <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
            onClick={() => setShowProfile(false)}>
            <div style={{ background: "#1a1228", borderRadius: "20px 20px 0 0", padding: "28px 20px 40px", width: "100%", maxWidth: 480 }}
              onClick={(e) => e.stopPropagation()}>
              <div style={{ width: 36, height: 4, background: "#2d2040", borderRadius: 2, margin: "0 auto 24px" }} />
              <h2 style={{ marginBottom: 8, fontSize: 18, fontWeight: 600, textAlign: "center" }}>프로필</h2>
              <div style={{ fontSize: 12, color: "#5a4a6a", textAlign: "center", marginBottom: 20 }}>{user?.email}</div>
              <div style={{ fontSize: 12, color: "#7a6a8a", marginBottom: 8 }}>닉네임</div>
              <input className="input-field" style={{ marginBottom: 16 }} placeholder="닉네임 입력" value={nicknameInput} onChange={(e) => setNicknameInput(e.target.value)} />
              <button className="btn btn-primary" style={{ width: "100%", padding: 14, fontSize: 15 }} onClick={saveNickname} disabled={nicknameSaving}>
                {nicknameSaving ? <><span className="spinner" /> 저장 중...</> : "저장"}
              </button>
            </div>
          </div>
        )}

        {/* 소설 읽기 모달 */}
        {readingNovel && (
          <div style={{ position: "fixed", inset: 0, background: "#0d0a14", zIndex: 100, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
            <div style={{ maxWidth: 640, margin: "0 auto", paddingBottom: 120 }}>
              <div style={{ position: "sticky", top: 0, background: "#0d0a14cc", backdropFilter: "blur(12px)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2d2040", zIndex: 10 }}>
                <button style={{ background: "none", border: "none", color: "#9a8aaa", fontSize: 14, cursor: "pointer", fontFamily: "'Noto Serif KR', serif" }} onClick={() => setReadingNovel(null)}>← 뒤로</button>
                <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#5a4a6a" }}>
                  <span>👁 {readingNovel.views}</span>
                  <span>❤️ {readingNovel.like_count || 0}</span>
                </div>
              </div>

              {/* 시리즈 화 목록 */}
              {readingSeries.length > 1 && (
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #2d2040", display: "flex", gap: 8, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                  {readingSeries.map((ep) => (
                    <button key={ep.id}
                      style={{ flexShrink: 0, padding: "6px 12px", background: ep.id === readingNovel.id ? "#2d1f4e" : "#1a1228", border: `1px solid ${ep.id === readingNovel.id ? "#7c3aed" : "#2d2040"}`, borderRadius: 20, color: ep.id === readingNovel.id ? "#c4b8ff" : "#7a6a8a", fontSize: 12, cursor: "pointer", fontFamily: "'Noto Serif KR', serif" }}
                      onClick={() => openNovel(ep, isMyNovel)}>
                      {ep.episode_number}화
                    </button>
                  ))}
                </div>
              )}

              <div style={{ padding: "28px 20px" }}>
                {readingNovel.series_title && readingNovel.series_title !== readingNovel.title && (
                  <div style={{ fontSize: 12, color: "#7c3aed", marginBottom: 6 }}>📚 {readingNovel.series_title}</div>
                )}
                <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>
                  {readingNovel.episode_number ? `${readingNovel.episode_number}화. ` : ""}{readingNovel.title}
                </h1>
                <div style={{ fontSize: 12, color: "#5a4a6a", marginBottom: 28 }}>{readingNovel.genre}{readingNovel.tags && ` · ${readingNovel.tags}`}</div>
                <div style={{ lineHeight: 2.2, fontSize: 16, color: "#ddd4ee", whiteSpace: "pre-wrap", fontWeight: 300 }}>{readingNovel.content}</div>
              </div>
            </div>

            {/* 하단 버튼 */}
            <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 640, padding: "10px 16px 20px", background: "#0d0a14ee", borderTop: "1px solid #2d2040" }}>
              <button style={{ width: "100%", padding: "11px", background: readingNovel.is_liked ? "#2d1f4e" : "transparent", border: `1.5px solid ${readingNovel.is_liked ? "#7c3aed" : "#2d2040"}`, borderRadius: 12, color: readingNovel.is_liked ? "#c4b8ff" : "#7a6a8a", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 14, marginBottom: 8 }}
                onClick={() => { toggleLike(readingNovel.id, !!readingNovel.is_liked); setReadingNovel({ ...readingNovel, is_liked: !readingNovel.is_liked, like_count: (readingNovel.like_count || 0) + (readingNovel.is_liked ? -1 : 1) }); }}>
                {readingNovel.is_liked ? "❤️ 좋아요 취소" : "🤍 좋아요"} {readingNovel.like_count || 0}
              </button>
              {isMyNovel && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <button style={{ padding: "11px", background: "transparent", border: "1.5px solid #2d2040", borderRadius: 12, color: "#9a8aaa", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 13 }}
                    onClick={() => editFromLibrary(readingNovel)}>✏️ 편집</button>
                  <button style={{ padding: "11px", background: "transparent", border: "1.5px solid #7c3aed", borderRadius: 12, color: "#c4b8ff", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 13 }}
                    onClick={() => continueFromLibrary(readingNovel)}>📖 다음 화 쓰기</button>
                </div>
              )}
            </div>
          </div>
        )}

        <main style={{ padding: "16px 16px 100px" }}>

          {/* 창작 */}
          {view === "create" && (
            <>
              {step === "form" && (
                <div className="fade-in">
                  {/* 시리즈 정보 */}
                  {currentSeriesId && (
                    <div style={{ background: "#1a1228", border: "1px solid #7c3aed", borderRadius: 10, padding: "10px 14px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 11, color: "#7c3aed", marginBottom: 2 }}>연재 중</div>
                        <div style={{ fontSize: 14, color: "#c4b8d8" }}>{seriesTitle || "제목 없음"} — {currentEpisode}화 작성 중</div>
                      </div>
                      <button style={{ background: "none", border: "none", color: "#5a4a6a", cursor: "pointer", fontSize: 12, fontFamily: "'Noto Serif KR', serif" }} onClick={() => { setCurrentSeriesId(null); setCurrentEpisode(1); setSeriesTitle(""); }}>새 작품</button>
                    </div>
                  )}

                  <div className="section">
                    <div className="section-title">시리즈 제목 <span style={{ color: "#3a2a4a", fontWeight: 400 }}>(연재 시 입력)</span></div>
                    <input className="input-field" placeholder="예: 달빛 아래서 — 비워두면 1화 제목이 시리즈 제목이 돼요" value={seriesTitle} onChange={(e) => setSeriesTitle(e.target.value)} />
                  </div>

                  <div className="section">
                    <div className="section-title">장르</div>
                    <div className="genre-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                      {GENRES.map((g) => (
                        <button key={g.id} className={`genre-btn${genre === g.id ? " selected" : ""}`}
                          style={genre === g.id ? { borderColor: g.color, boxShadow: `0 0 12px ${g.color}33` } : {}}
                          onClick={() => setGenre(genre === g.id ? null : g.id)}>{g.label}</button>
                      ))}
                    </div>
                  </div>

                  <div className="section">
                    <div className="section-title">태그</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>
                      {PRESET_TAGS.map((tag) => (
                        <button key={tag} className={`tag-btn${selectedTags.includes(tag) ? " selected" : ""}`} onClick={() => toggleTag(tag)}>{tag}</button>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input className="input-field" style={{ resize: "none" }} placeholder="직접 입력 후 엔터" value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTag(); } }} />
                      <button className="btn btn-outline" onClick={addCustomTag} style={{ whiteSpace: "nowrap", flexShrink: 0 }}>추가</button>
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
                    <div className="section-title">문체</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {STYLES.map((s) => (
                        <button key={s.id} className={`opt-btn${style === s.id ? " selected" : ""}`}
                          style={{ ...(style === s.id ? { borderColor: accentColor } : {}), flex: "1 1 40%" }}
                          onClick={() => setStyle(style === s.id ? null : s.id)}>{s.label}</button>
                      ))}
                    </div>
                  </div>

                  <div className="section">
                    <div className="section-title">결말</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {ENDINGS.map((e) => (
                        <button key={e.id} className={`opt-btn${ending === e.id ? " selected" : ""}`}
                          style={ending === e.id ? { borderColor: accentColor } : {}}
                          onClick={() => setEnding(ending === e.id ? null : e.id)}>{e.label}</button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                    <div style={{ flex: 1 }}>
                      <div className="section-title">시점</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {POVS.map((p) => (
                          <button key={p.id} className={`opt-btn${pov === p.id ? " selected" : ""}`}
                            style={pov === p.id ? { borderColor: accentColor } : {}}
                            onClick={() => setPov(p.id)}>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{p.label}</div>
                            <div style={{ fontSize: 10, color: "#7a6a8a" }}>{p.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="section-title">수위</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {RATINGS.map((r) => (
                          <button key={r.id} className={`opt-btn${rating === r.id ? " selected" : ""}`}
                            style={rating === r.id ? { borderColor: r.id === "adult" ? "#f87171" : accentColor } : {}}
                            onClick={() => setRating(r.id)}>
                            <div style={{ fontWeight: 600, fontSize: 12, color: r.id === "adult" && rating === r.id ? "#fca5a5" : "inherit" }}>{r.label}</div>
                            <div style={{ fontSize: 10, color: "#7a6a8a" }}>{r.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="section">
                    <div className="section-title">이번 화 제목</div>
                    <input className="input-field" placeholder="비우면 AI가 정해요" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>

                  <div className="section">
                    <div className="section-title">줄거리 / 배경</div>
                    <textarea className="input-field" rows={3} placeholder="예: 기억을 잃고 낯선 도시에서 깨어난 남자의 이야기" value={synopsis} onChange={(e) => setSynopsis(e.target.value)} />
                  </div>

                  <div className="section">
                    <div className="section-title">등장인물</div>
                    {characters.map((char, idx) => (
                      <div key={char.id} className="char-card">
                        <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                          <span style={{ background: "#2d1f4e", border: "1px solid #7c3aed", borderRadius: 6, padding: "5px 10px", color: "#c4b8ff", fontFamily: "'Noto Serif KR', serif", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}
                            onClick={() => updateCharacter(char.id, "role", char.role === "주인공" ? "조연" : "주인공")}>{char.role} ↕</span>
                          <input className="input-field" style={{ flex: 1 }} placeholder="이름" value={char.name} onChange={(e) => updateCharacter(char.id, "name", e.target.value)} />
                          {idx > 0 && <button style={{ background: "transparent", border: "1px solid #3d1f1f", color: "#f87171", borderRadius: 6, padding: "5px 8px", cursor: "pointer", fontSize: 11, fontFamily: "'Noto Serif KR', serif", flexShrink: 0 }} onClick={() => removeCharacter(char.id)}>삭제</button>}
                        </div>
                        <textarea className="input-field" rows={2}
                          placeholder={genre === "bl" ? "예: 공, 냉정한 CEO" : genre === "gl" ? "예: 攻, 활발한 성격" : "예: 차갑지만 따뜻한 30대 형사"}
                          value={char.desc} onChange={(e) => updateCharacter(char.id, "desc", e.target.value)} />
                      </div>
                    ))}
                    {characters.length < 5 && (
                      <button className="btn btn-outline" onClick={addCharacter} style={{ width: "100%", marginTop: 4 }}>+ 캐릭터 추가</button>
                    )}
                  </div>

                  {error && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 16, textAlign: "center" }}>⚠️ {error}</div>}
                  <button className="btn btn-primary" style={{ width: "100%", padding: 16, fontSize: 16, borderRadius: 14 }} onClick={generateNovel} disabled={loading}>
                    {loading ? <><span className="spinner" /> 생성 중...</> : `✨ ${currentEpisode}화 생성하기`}
                  </button>
                </div>
              )}

              {step === "result" && (
                <div className="fade-in">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingTop: 8 }}>
                    <button className="btn btn-outline" style={{ padding: "8px 14px", fontSize: 13 }} onClick={resetForm}>← 처음으로</button>
                    <div style={{ fontSize: 13, color: "#7c3aed", fontWeight: 600 }}>{currentEpisode}화</div>
                    <button className="btn btn-outline" style={{ padding: "8px 14px", fontSize: 13, borderColor: isEditing ? accentColor : "#2d2040", color: isEditing ? accentColor : "#9a8aaa" }}
                      onClick={() => { setIsEditing(!isEditing); if (!isEditing) setEditedNovel(novel); }} disabled={loading}>
                      {isEditing ? "✅ 완료" : "✏️ 편집"}
                    </button>
                  </div>

                  <div style={{ background: "#160f22", border: `1.5px solid ${isEditing ? accentColor + "66" : "#2d2040"}`, borderRadius: 16, padding: "24px 20px", minHeight: 280 }}>
                    {loading && <div style={{ textAlign: "center", padding: "40px 0", color: "#5a4a6a" }}><div style={{ fontSize: 28, marginBottom: 12 }}>✍️</div><div>이야기를 쓰고 있어요...</div></div>}
                    {!loading && isEditing && <textarea className="novel-editor" value={editedNovel} onChange={(e) => setEditedNovel(e.target.value)} style={{ height: Math.max(300, (editedNovel.split("\n").length) * 36) }} />}
                    {!loading && !isEditing && novel && <div style={{ lineHeight: 2.2, fontSize: 16, color: "#ddd4ee", whiteSpace: "pre-wrap", fontWeight: 300 }}>{novel}</div>}
                  </div>

                  {!loading && novel && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0", padding: "12px 14px", background: "#160f22", borderRadius: 10, border: "1px solid #2d2040" }}>
                        <label style={{ position: "relative", width: 44, height: 24, cursor: "pointer", flexShrink: 0 }}>
                          <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                          <span style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: isPublic ? "#7c3aed" : "#2d2040", borderRadius: 24, transition: "0.3s" }}>
                            <span style={{ position: "absolute", height: 18, width: 18, left: isPublic ? 23 : 3, bottom: 3, background: "white", borderRadius: "50%", transition: "0.3s" }} />
                          </span>
                        </label>
                        <span style={{ fontSize: 13, color: "#c4b8d8" }}>{isPublic ? "🌍 공개" : "🔒 비공개"}</span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                        <button className="btn btn-outline" onClick={continueNovel} disabled={continuing} style={{ fontSize: 13 }}>
                          {continuing ? <><span className="spinner" /></> : "✍️ 이어쓰기"}
                        </button>
                        <button className="btn btn-primary" onClick={saveNovel} disabled={saving} style={{ fontSize: 13, background: saveMsg ? "linear-gradient(135deg,#065f46,#059669)" : undefined }}>
                          {saving ? <><span className="spinner" /></> : saveMsg || `💾 ${currentEpisode}화 저장`}
                        </button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <button className="btn btn-outline" onClick={generateNextEpisode} disabled={loading} style={{ fontSize: 13, borderColor: "#7c3aed", color: "#a78bfa" }}>
                          📖 다음 화 생성
                        </button>
                        <button className="btn btn-outline" onClick={copyToClipboard} style={{ fontSize: 13, borderColor: copied ? "#86efac" : "#2d2040", color: copied ? "#86efac" : "#9a8aaa" }}>
                          {copied ? "✅ 복사됨" : "📋 복사"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {/* 둘러보기 */}
          {view === "explore" && (
            <div className="fade-in">
              <div style={{ marginBottom: 12 }}>
                <input className="input-field" placeholder="🔍 제목, 장르, 태그 검색..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") fetchPublicNovels(); }} />
              </div>
              <div style={{ display: "flex", borderBottom: "1px solid #2d2040", marginBottom: 16 }}>
                <button className={`tab-btn${exploreTab === "latest" ? " active" : ""}`} onClick={() => setExploreTab("latest")}>🆕 최신</button>
                <button className={`tab-btn${exploreTab === "popular" ? " active" : ""}`} onClick={() => setExploreTab("popular")}>🔥 인기</button>
              </div>
              {publicNovels.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#5a4a6a" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <div>아직 공개된 소설이 없어요</div>
                </div>
              ) : publicNovels.map((n) => <NovelCard key={n.id} n={n} />)}
            </div>
          )}

          {/* 서재 */}
          {view === "library" && (
            <div className="fade-in">
              <div style={{ display: "flex", borderBottom: "1px solid #2d2040", marginBottom: 16 }}>
                <button className={`tab-btn${libraryTab === "my" ? " active" : ""}`} onClick={() => setLibraryTab("my")}>📝 내 작품</button>
                <button className={`tab-btn${libraryTab === "liked" ? " active" : ""}`} onClick={() => { setLibraryTab("liked"); if (user) fetchLikedNovels(); }}>❤️ 좋아한 작품</button>
              </div>
              {!user ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#5a4a6a" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
                  <div style={{ marginBottom: 20, fontSize: 15 }}>로그인하면 서재를 이용할 수 있어요</div>
                  <button className="btn btn-primary" style={{ padding: "12px 28px" }} onClick={() => setShowAuth(true)}>로그인하기</button>
                </div>
              ) : libraryTab === "my" ? (
                myNovels.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "#5a4a6a" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                    <div>아직 저장된 소설이 없어요</div>
                  </div>
                ) : myNovels.map((n) => <NovelCard key={n.id} n={n} showActions />)
              ) : (
                likedNovels.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "#5a4a6a" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🤍</div>
                    <div>좋아한 작품이 없어요</div>
                  </div>
                ) : likedNovels.map((n) => <NovelCard key={n.id} n={n} />)
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}