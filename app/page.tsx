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
  cover_image?: string;
  synopsis?: string;
  _episodes?: Novel[];
}
interface Profile { id: string; nickname: string; }
interface Comment { id: string; novel_id: string; user_id: string; nickname: string; content: string; created_at: string; }

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
  const [exploreGenre, setExploreGenre] = useState<string>("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [readingNovel, setReadingNovel] = useState<Novel|null>(null);
  const [seriesDetail, setSeriesDetail] = useState<Novel|null>(null);
  const [showToc, setShowToc] = useState(true);
  const [readingSeries, setReadingSeries] = useState<Novel[]>([]);
  const [isMyNovel, setIsMyNovel] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<Novel|null>(null);

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
  const [autoSaveMsg, setAutoSaveMsg] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const selectedGenre = GENRES.find((g) => g.id === genre);
  const accentColor = selectedGenre?.color || "#a78bfa";

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id);
      else setProfile(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (view === "library" && user) { fetchMyNovels(); fetchLikedNovels(); }
    if (view === "explore") fetchPublicNovels();
  }, [view, user, exploreTab, exploreGenre]);

  // 자동저장: 타이핑 멈추면 2초 후 저장 (디바운스)
  // isEditing 여부와 관계없이 항상 최신 텍스트를 저장
  useEffect(() => {
    // 편집 중일 땐 editedNovel, 아닐 땐 novel 기준
    const currentText = isEditing ? editedNovel : novel;
    if (!user || !currentText.trim() || step !== "result" || loading) return;
    const timer = setTimeout(async () => {
      const novelTitle = title || currentText.split("\n")[0] || "제목 없음";
      // currentSeriesId는 클로저로 캡처되므로 로컬 변수로 처리
      let sid = currentSeriesId;
      if (!sid) {
        sid = crypto.randomUUID();
        setCurrentSeriesId(sid);
      }
      const { data: existing } = await supabase.from("novels").select("id").eq("series_id", sid).eq("episode_number", currentEpisode).maybeSingle();
      if (existing) {
        await supabase.from("novels").update({ content: currentText, title: novelTitle, is_public: isPublic, synopsis: synopsis || null }).eq("id", existing.id);
      } else {
        await supabase.from("novels").insert({
          user_id: user.id, title: novelTitle, content: currentText,
          genre: selectedGenre?.label || "", tags: selectedTags.join(", "),
          is_public: isPublic, views: 0, series_id: sid,
          episode_number: currentEpisode,
          series_title: seriesTitle || novelTitle,
          synopsis: synopsis || null,
          created_at: new Date().toISOString(),
        });
      }
      setAutoSaveMsg("자동저장됨 ✓");
      setTimeout(() => setAutoSaveMsg(""), 2000);
    }, 2000);
    return () => clearTimeout(timer);
  }, [novel, editedNovel, isEditing, user, step, loading, currentSeriesId, currentEpisode]);

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
    const { data } = await supabase.from("novels").select("*").eq("user_id", user.id).order("episode_number", { ascending: true });
    const seriesMap: Record<string, Novel[]> = {};
    const noSeries: Novel[] = [];
    (data || []).forEach((n: Novel) => {
      if (n.series_id) {
        if (!seriesMap[n.series_id]) seriesMap[n.series_id] = [];
        seriesMap[n.series_id].push(n);
      } else noSeries.push(n);
    });
    const grouped: Novel[] = [];
    Object.values(seriesMap).forEach((eps) => {
      grouped.push({ ...eps[0], _episodes: eps });
    });
    setMyNovels([...grouped, ...noSeries]);
  }

  async function fetchLikedNovels() {
    const { data: likeData } = await supabase.from("likes").select("novel_id").eq("user_id", user.id);
    if (!likeData || likeData.length === 0) { setLikedNovels([]); return; }
    const ids = likeData.map((l: any) => l.novel_id);
    const { data } = await supabase.from("novels").select("*").in("id", ids).order("created_at", { ascending: false });
    setLikedNovels(data || []);
  }

  async function fetchPublicNovels() {
    // 공개된 화 전체 가져오기
    let query = supabase.from("novels").select("*").eq("is_public", true);
    if (exploreGenre !== "전체") query = query.ilike("genre", `%${exploreGenre}%`);
    if (searchQuery.trim()) query = query.or(`title.ilike.%${searchQuery}%,tags.ilike.%${searchQuery}%,genre.ilike.%${searchQuery}%`);
    query = exploreTab === "popular" ? query.order("views", { ascending: false }) : query.order("created_at", { ascending: false });
    const { data } = await query.limit(100);
    if (!data) { setPublicNovels([]); return; }

    // 좋아요 카운트
    const { data: likeCounts } = await supabase.from("likes").select("novel_id");
    const countMap: Record<string, number> = {};
    (likeCounts || []).forEach((l: any) => { countMap[l.novel_id] = (countMap[l.novel_id] || 0) + 1; });

    // 내가 좋아요한 것
    let likedIds = new Set<string>();
    if (user) {
      const { data: likeData } = await supabase.from("likes").select("novel_id").eq("user_id", user.id);
      likedIds = new Set((likeData || []).map((l: any) => l.novel_id));
    }

    const withMeta = data.map((n: Novel) => ({
      ...n,
      is_liked: likedIds.has(n.id),
      like_count: countMap[n.id] || 0,
    }));

    // 시리즈 그룹핑: series_id 기준으로 묶기
    // 시리즈가 없는 단편은 그대로, 시리즈는 카드 1개로
    const seriesMap: Record<string, Novel[]> = {};
    const noSeries: Novel[] = [];

    withMeta.forEach((n: Novel) => {
      if (n.series_id) {
        if (!seriesMap[n.series_id]) seriesMap[n.series_id] = [];
        seriesMap[n.series_id].push(n);
      } else {
        noSeries.push(n);
      }
    });

    // 시리즈는 1화(가장 낮은 episode_number) 기준으로 대표 카드 생성
    // _episodes에는 공개된 화만 담음
    const seriesCards: Novel[] = Object.values(seriesMap).map((eps) => {
      const sorted = [...eps].sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));
      const totalLikes = sorted.reduce((sum, ep) => sum + (ep.like_count || 0), 0);
      const isLiked = sorted.some(ep => ep.is_liked);
      return {
        ...sorted[0],
        like_count: totalLikes,
        is_liked: isLiked,
        _episodes: sorted,
      };
    });

    // 정렬: 인기순이면 views 기준, 최신순이면 created_at 기준
    const allCards = [...seriesCards, ...noSeries];
    if (exploreTab === "popular") {
      allCards.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      allCards.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setPublicNovels(allCards);
  }

  async function toggleLike(novelId: string, isLiked: boolean) {
    if (!user) { setShowAuth(true); return; }
    try {
      if (isLiked) {
        await supabase.from("likes").delete().eq("user_id", user.id).eq("novel_id", novelId);
      } else {
        await supabase.from("likes").insert({ user_id: user.id, novel_id: novelId });
      }
    } catch (e) { console.error("like error:", e); }
    if (view === "explore") fetchPublicNovels();
    if (view === "library") { fetchMyNovels(); fetchLikedNovels(); }
  }

  async function toggleSeriesLike(sd: Novel) {
    if (!user) { setShowAuth(true); return; }
    const eps = (sd as any)._episodes || [sd];
    const firstEp = eps[0];
    const isLiked = !!(sd as any)._isLiked;

    if (isLiked) {
      const { error } = await supabase.from("likes").delete().eq("user_id", user.id).eq("novel_id", firstEp.id);
      if (error) { alert("좋아요 취소 오류: " + error.message); return; }
    } else {
      const { error } = await supabase.from("likes").upsert(
        { user_id: user.id, novel_id: firstEp.id },
        { onConflict: "user_id,novel_id" }
      );
      if (error) { alert("좋아요 오류: " + error.message); return; }
    }

    const newLiked = !isLiked;
    const newCount = ((sd as any)._likeCount || 0) + (isLiked ? -1 : 1);
    setSeriesDetail({ ...sd, _isLiked: newLiked, _likeCount: newCount } as any);
    if (view === "explore") fetchPublicNovels();
    if (view === "library") { fetchMyNovels(); fetchLikedNovels(); }
  }

  async function openNovel(n: Novel, mine = false) {
    await supabase.rpc("increment_views", { novel_id: n.id });
    setReadingNovel({ ...n, views: (n.views || 0) + 1 });
    setIsMyNovel(mine);
    setComments([]); setCommentText("");
    fetchComments(n.id);
    if (n.series_id) {
      let seriesQuery = supabase.from("novels").select("*").eq("series_id", n.series_id).order("episode_number", { ascending: true });
      if (!mine) seriesQuery = seriesQuery.eq("is_public", true);
      const { data } = await seriesQuery;
      setReadingSeries(data || []);
    } else setReadingSeries([]);
  }

  async function fetchComments(novelId: string) {
    const { data } = await supabase.from("comments").select("*").eq("novel_id", novelId).order("created_at", { ascending: true });
    setComments(data || []);
  }

  async function submitComment() {
    if (!user) { setShowAuth(true); return; }
    if (!commentText.trim() || !readingNovel) return;
    setCommentLoading(true);
    await supabase.from("comments").insert({
      novel_id: readingNovel.id,
      user_id: user.id,
      nickname: profile?.nickname || user.email?.split("@")[0] || "익명",
      content: commentText.trim(),
    });
    setCommentText("");
    await fetchComments(readingNovel.id);
    setCommentLoading(false);
  }

  async function deleteComment(commentId: string) {
    await supabase.from("comments").delete().eq("id", commentId);
    if (readingNovel) fetchComments(readingNovel.id);
  }

  async function handleKakaoLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: window.location.origin },
    });
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
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

    const { data: existing } = await supabase
      .from("novels")
      .select("id")
      .eq("series_id", sid)
      .eq("episode_number", currentEpisode)
      .maybeSingle();

    let saveError = null;
    if (existing) {
      const { error } = await supabase
        .from("novels")
        .update({ content, title: novelTitle, is_public: isPublic, synopsis: synopsis || null })
        .eq("id", existing.id);
      saveError = error;
    } else {
      const { error } = await supabase.from("novels").insert({
        user_id: user.id, title: novelTitle, content,
        genre: selectedGenre?.label || "", tags: selectedTags.join(", "),
        is_public: isPublic, views: 0, series_id: sid,
        episode_number: currentEpisode,
        series_title: seriesTitle || novelTitle,
        cover_image: coverImage || null,
        synopsis: synopsis || null,
        created_at: new Date().toISOString(),
      });
      saveError = error;
    }

    setSaveMsg(saveError ? "저장 실패 😢" : `${currentEpisode}화 저장됐어요! ✅`);
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  // 화별 공개 토글
  async function toggleEpisodePublic(e: React.MouseEvent, id: string, current: boolean) {
    e.stopPropagation(); e.preventDefault();
    await supabase.from("novels").update({ is_public: !current }).eq("id", id);
    fetchMyNovels();
    // 읽기 화면에서도 업데이트
    if (readingNovel?.id === id) {
      setReadingNovel({ ...readingNovel, is_public: !current });
    }
    // readingSeries도 업데이트
    setReadingSeries(prev => prev.map(ep => ep.id === id ? { ...ep, is_public: !current } : ep));
  }

  async function deleteEpisode(id: string) {
    await supabase.from("novels").delete().eq("id", id);
    fetchMyNovels();
    setShowDeleteModal(null);
    if (readingNovel?.id === id) setReadingNovel(null);
    setSeriesDetail(null);
  }

  async function deleteSeries(seriesId: string) {
    await supabase.from("novels").delete().eq("series_id", seriesId);
    fetchMyNovels();
    setShowDeleteModal(null);
    setReadingNovel(null);
    setSeriesDetail(null);
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
    setTitle(""); setSynopsis(""); setCoverImage(null);
  }

  async function uploadCover(file: File, seriesId: string, novelId?: string) {
    setCoverUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${seriesId}/cover.${ext}`;
    const { error } = await supabase.storage.from("novel-covers").upload(path, file, { upsert: true });
    if (error) { console.error("upload error:", error); setCoverUploading(false); return null; }
    const { data } = supabase.storage.from("novel-covers").getPublicUrl(path);
    // 캐시 버스팅으로 이미지 즉시 갱신
    const url = data.publicUrl + "?t=" + Date.now();
    setCoverImage(url);
    // 시리즈 전체 화 업데이트
    await supabase.from("novels").update({ cover_image: url }).eq("series_id", seriesId);
    // novelId가 있으면 단편도 업데이트
    if (novelId) await supabase.from("novels").update({ cover_image: url }).eq("id", novelId);
    // 서재 즉시 갱신
    setMyNovels(prev => prev.map(n => {
      if (n.series_id === seriesId || n.id === seriesId || n.id === novelId) {
        const updatedEps = n._episodes?.map(ep => ({ ...ep, cover_image: url }));
        return { ...n, cover_image: url, _episodes: updatedEps };
      }
      return n;
    }));
    setCoverUploading(false);
    return url;
  }

  async function generateNovel() {
    setError(""); setLoading(true); setStep("result"); setNovel(""); setIsEditing(false); setSaveMsg("");
    const ratingLabel = rating === "all" ? "전체가" : rating === "teen" ? "15세 이상" : "성인 (암시 포함)";
    const styleLabel = STYLES.find(s => s.id === style)?.label || "자유";
    const endingLabel = ENDINGS.find(e => e.id === ending)?.label || "자유";
    const charDesc = characters.filter(c => c.name || c.desc).map(c => `- ${c.role} ${c.name || "이름없음"}: ${c.desc || "설정없음"}`).join("\n");
    const prompt = `당신은 감성적이고 몰입감 있는 한국 소설 작가입니다. 아래 설정으로 ${currentEpisode}화 소설을 한국어로 써주세요.
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
분량: 1500자 이상, 반드시 완성된 문장으로 끝낼 것
규칙: 제목을 먼저 쓰고 한 줄 띄우기. 생생한 묘사와 대화 포함. 마크다운 없이 순수 텍스트로.`;
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, tokens: 3000 }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setNovel(data.text); setEditedNovel(data.text);

      // 작품소개 자동 생성: synopsis가 없으면 소설 내용 기반으로 생성
      if (!synopsis.trim()) {
        const synopsisPrompt = `아래 소설의 작품소개를 2~3문장으로 써주세요. 독자의 호기심을 자극하되 스포일러는 피하고, 감성적인 한국어로. 소개글만 출력하고 다른 말은 하지 마세요.

${data.text.slice(0, 800)}`;
        const synRes = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: synopsisPrompt, tokens: 300 }) });
        const synData = await synRes.json();
        if (!synData.error) setSynopsis(synData.text.trim());
      }
    } catch (e: any) { setError("오류: " + e.message); setStep("form"); }
    finally { setLoading(false); }
  }

  // 현재 화에 내용 이어쓰기 (같은 화 안에서 분량 늘리기)
  async function continueNovel() {
    setContinuing(true);
    const currentText = isEditing ? editedNovel : novel;
    const prompt = `아래 소설을 자연스럽게 이어서 써주세요. 기존 문체와 분위기를 유지하고 500자 이상 추가. 이어지는 내용만 출력하고 반드시 완성된 문장으로 끝낼 것.\n\n${currentText}`;
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, tokens: 3000 }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setNovel(currentText + "\n\n" + data.text);
      setEditedNovel(currentText + "\n\n" + data.text);
    } catch (e: any) { alert("이어쓰기 오류: " + e.message); }
    finally { setContinuing(false); }
  }

  // 다음 화 새로 생성 (창작 화면에서) - 현재 화 먼저 자동저장
  async function generateNextEpisode() {
    const currentText = isEditing ? editedNovel : novel;
    // 현재 화 먼저 저장
    if (user && currentText.trim()) {
      const novelTitle = title || currentText.split("\n")[0] || "제목 없음";
      const sid = currentSeriesId || crypto.randomUUID();
      if (!currentSeriesId) setCurrentSeriesId(sid);
      const { data: existing } = await supabase.from("novels").select("id").eq("series_id", sid).eq("episode_number", currentEpisode).maybeSingle();
      if (existing) {
        await supabase.from("novels").update({ content: currentText, title: novelTitle, is_public: isPublic, synopsis: synopsis || null }).eq("id", existing.id);
      } else {
        await supabase.from("novels").insert({
          user_id: user.id, title: novelTitle, content: currentText,
          genre: selectedGenre?.label || "", tags: selectedTags.join(", "),
          is_public: isPublic, views: 0, series_id: sid,
          episode_number: currentEpisode,
          series_title: seriesTitle || novelTitle,
          synopsis: synopsis || null,
          created_at: new Date().toISOString(),
        });
      }
    }
    const nextEp = currentEpisode + 1;
    setCurrentEpisode(nextEp);
    setNovel(""); setEditedNovel(""); setIsEditing(false); setSaveMsg("");
    setLoading(true);
    const prompt = `당신은 한국 소설 작가입니다. 아래는 ${currentEpisode}화 내용입니다. 이 내용과 자연스럽게 이어지는 ${nextEp}화를 써주세요. 1500자 이상, 반드시 완성된 문장으로 끝낼 것. 이전 내용을 반복하지 말고 새로운 장면으로 시작. 마크다운 없이 순수 텍스트로.\n\n이전 화:\n${currentText}`;
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, tokens: 3000 }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setNovel(data.text); setEditedNovel(data.text);
    } catch (e: any) { setError("오류: " + e.message); }
    finally { setLoading(false); }
  }

  // 서재에서 "다음 화 쓰기" — 이미 있으면 이동, 없으면 AI로 새로 생성
  async function continueFromLibrary(n: Novel) {
    if (n.series_id) {
      const nextEpNum = (n.episode_number || 1) + 1;
      const { data: nextEp } = await supabase
        .from("novels")
        .select("*")
        .eq("series_id", n.series_id)
        .eq("episode_number", nextEpNum)
        .maybeSingle();

      if (nextEp) {
        // 이미 존재하는 화면 → 그냥 이동
        openNovel(nextEp, true);
        return;
      }
    }
    // 없으면 이전 화 내용 기반으로 AI가 다음 화 생성
    const prevContent = n.content;
    const nextEp = (n.episode_number || 1) + 1;
    setCurrentSeriesId(n.series_id || null);
    setCurrentEpisode(nextEp);
    setSeriesTitle(n.series_title || "");
    setNovel(""); setEditedNovel(""); setIsEditing(false); setSaveMsg("");
    setStep("result"); setView("create"); setReadingNovel(null);
    setLoading(true);
    const prompt = `당신은 한국 소설 작가입니다. 아래는 ${n.episode_number || 1}화 내용입니다. 이 내용과 자연스럽게 이어지는 ${nextEp}화를 써주세요. 1500자 이상, 반드시 완성된 문장으로 끝낼 것. 이전 내용을 반복하지 말고 새로운 장면으로 시작. 마크다운 없이 순수 텍스트로.

이전 화:
${prevContent}`;
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, tokens: 3000 }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setNovel(data.text); setEditedNovel(data.text);
    } catch (e: any) { setError("오류: " + e.message); }
    finally { setLoading(false); }
  }

  function editFromLibrary(n: Novel) {
    setNovel(n.content); setEditedNovel(n.content);
    setIsEditing(true);
    setCurrentSeriesId(n.series_id || null);
    setCurrentEpisode(n.episode_number || 1);
    setSeriesTitle(n.series_title || "");
    setStep("result"); setView("create"); setReadingNovel(null);
  }

  function saveAsText() {
    const content = isEditing ? editedNovel : novel;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `${seriesTitle || title || "소설"}_${currentEpisode}화.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(isEditing ? editedNovel : novel).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  // 에피소드 토글 버튼 컴포넌트
  const PublicToggle = ({ ep, stopProp = true }: { ep: Novel; stopProp?: boolean }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 11, color: ep.is_public ? "#7c3aed" : "#5a4a6a" }}>
        {ep.is_public ? "공개" : "비공개"}
      </span>
      <label
        style={{ position: "relative", width: 32, height: 18, cursor: "pointer", flexShrink: 0 }}
        onClick={(e) => { if (stopProp) { e.stopPropagation(); e.preventDefault(); } toggleEpisodePublic(e, ep.id, ep.is_public); }}
      >
        <span style={{
          display: "block", width: 32, height: 18,
          background: ep.is_public ? "#7c3aed" : "#2d2040",
          borderRadius: 18, transition: "0.3s", position: "relative"
        }}>
          <span style={{
            position: "absolute", height: 12, width: 12,
            left: ep.is_public ? 17 : 3, top: 3,
            background: "white", borderRadius: "50%", transition: "0.3s"
          }} />
        </span>
      </label>
    </div>
  );

  const NovelCard = ({ n, showActions = false }: { n: Novel; showActions?: boolean }) => {
    const episodes = n._episodes || [];
    const displayTitle = n.series_title && n.series_title !== n.title ? n.series_title : n.title;
    const coverImg = n.cover_image || (episodes[0]?.cover_image);
    const synopsisText = n.synopsis || (n._episodes?.[0]?.synopsis) || "";
    const fallback = n.content.split("\n").filter((l: string) => l.trim()).slice(1, 4).join(" ");
    const rawPreview = synopsisText || fallback;
    const preview = rawPreview.length > 120 ? rawPreview.slice(0, 120) + "…" : rawPreview;

    const handleClick = async () => {
      if (showActions) {
        setSeriesDetail({ ...n, _episodes: episodes.length > 0 ? episodes : [n], _isMine: true, _isLiked: false, _likeCount: 0 } as any);
        setShowToc(true);
        // 좋아요 정보 로드
        if (user) {
          const firstId = (episodes[0] || n).id;
          const { data: likeData } = await supabase.from("likes").select("id").eq("user_id", user.id).eq("novel_id", firstId).maybeSingle();
          const { count } = await supabase.from("likes").select("id", { count: "exact", head: true }).eq("novel_id", firstId);
          setSeriesDetail(prev => prev ? { ...prev, _isLiked: !!likeData, _likeCount: count || 0 } as any : prev);
        }
      } else if (episodes.length > 0) {
        setSeriesDetail({ ...n, _episodes: episodes, _isMine: false, _isLiked: false, _likeCount: 0 } as any);
        setShowToc(true);
        if (user) {
          const firstId = (episodes[0] || n).id;
          const { data: likeData } = await supabase.from("likes").select("id").eq("user_id", user.id).eq("novel_id", firstId).maybeSingle();
          const { count } = await supabase.from("likes").select("id", { count: "exact", head: true }).eq("novel_id", firstId);
          setSeriesDetail(prev => prev ? { ...prev, _isLiked: !!likeData, _likeCount: count || 0 } as any : prev);
        }
      } else {
        openNovel(n, false);
      }
    };

    // 서재 카드: 커버 상단 + 제목/줄거리만 (심플)
    if (showActions) {
      return (
        <div style={{ background: "#160f22", border: "1.5px solid #2d2040", borderRadius: 14, marginBottom: 12, cursor: "pointer", transition: "border-color 0.2s", overflow: "hidden" }}
          onMouseOver={(e) => (e.currentTarget.style.borderColor = "#4a3570")}
          onMouseOut={(e) => (e.currentTarget.style.borderColor = "#2d2040")}
          onClick={handleClick}>
          {coverImg ? (
            <div style={{ width: "100%", background: "#0d0a14", display: "flex", justifyContent: "center" }}>
              <img src={coverImg} alt={displayTitle} style={{ width: "100%", maxHeight: 200, objectFit: "contain" }} />
            </div>
          ) : (
            <div style={{ height: 80, background: "#1a1228", borderBottom: "1px dashed #2d2040", display: "flex", alignItems: "center", justifyContent: "center", color: "#3a2a4a", fontSize: 28 }}>📖</div>
          )}
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayTitle}</div>
            <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
              {n.genre && <span style={{ fontSize: 10, background: "#2d1f4e", color: "#a78bfa", borderRadius: 20, padding: "2px 8px" }}>{n.genre}</span>}
              {episodes.length > 0 && <span style={{ fontSize: 10, background: "#1a2d1f", color: "#6ee7b7", borderRadius: 20, padding: "2px 8px" }}>총 {episodes.length}화</span>}
            </div>
            <div style={{ fontSize: 13, color: "#9a8aaa", lineHeight: 1.7 }}>{preview}</div>
          </div>
        </div>
      );
    }

    // 둘러보기 카드: 사진 왼쪽 + 내용 오른쪽
    return (
      <div style={{ background: "#160f22", border: "1.5px solid #2d2040", borderRadius: 14, marginBottom: 12, cursor: "pointer", transition: "border-color 0.2s", overflow: "hidden", display: "flex", gap: 0 }}
        onMouseOver={(e) => (e.currentTarget.style.borderColor = "#4a3570")}
        onMouseOut={(e) => (e.currentTarget.style.borderColor = "#2d2040")}
        onClick={handleClick}>

        {/* 왼쪽 커버 */}
        <div style={{ width: 110, flexShrink: 0, background: "#0d0a14", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {coverImg ? (
            <img src={coverImg} alt={displayTitle} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ color: "#3a2a4a", fontSize: 32 }}>📖</div>
          )}
        </div>

        {/* 오른쪽 내용 */}
        <div style={{ flex: 1, padding: "14px 14px", minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayTitle}</div>
            <div style={{ display: "flex", gap: 4, marginBottom: 7, flexWrap: "wrap" }}>
              {n.genre && <span style={{ fontSize: 10, background: "#2d1f4e", color: "#a78bfa", borderRadius: 20, padding: "2px 7px" }}>{n.genre}</span>}
              {episodes.length > 0 && <span style={{ fontSize: 10, background: "#1a2d1f", color: "#6ee7b7", borderRadius: 20, padding: "2px 7px" }}>총 {episodes.length}화</span>}
            </div>
            <div style={{ fontSize: 12, color: "#9a8aaa", lineHeight: 1.7, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {preview}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "#5a4a6a", marginTop: 8 }} onClick={(e) => e.stopPropagation()}>
            <span>👁 {n.views || 0}</span>
<span style={{ color: "#5a4a6a", fontSize: 12 }}>🤍 {n.like_count || 0}</span>
            <span style={{ marginLeft: "auto" }}>{new Date(n.created_at).toLocaleDateString("ko-KR")}</span>
          </div>
        </div>
      </div>
    );
  };

  // 읽기 화면에서 현재 화가 마지막 화인지 판단
  const isLastEpisode = readingSeries.length === 0 ||
    (readingNovel?.episode_number ?? 0) >= Math.max(...readingSeries.map(e => e.episode_number || 0));

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
        .nav-btn { background: transparent; border: none; color: #7a6a8a; font-family: 'Noto Serif KR', serif; font-size: 13px; cursor: pointer; padding: 10px 0; flex: 1; text-align: center; border-bottom: 2px solid transparent; transition: all 0.2s; }
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

        <header style={{ position: "sticky", top: 0, zIndex: 50, background: "#0d0a14cc", backdropFilter: "blur(12px)", borderBottom: "1px solid #2d2040", padding: "0 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 52 }}>
            <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }} onClick={() => { setView("create"); resetForm(); }}>
              <span style={{ fontSize: 20, fontFamily: "'Playfair Display', serif", fontWeight: 700 }}><span className="shimmer-text">Novella</span></span>
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

        <nav style={{ display: "flex", borderBottom: "1px solid #2d2040", background: "#0d0a14" }}>
          <button className={`nav-btn${view === "create" ? " active" : ""}`} onClick={() => setView("create")}>✍️ 글쓰기</button>
          <button className={`nav-btn${view === "explore" ? " active" : ""}`} onClick={() => setView("explore")}>🔍 둘러보기</button>
          <button className={`nav-btn${view === "library" ? " active" : ""}`} onClick={() => setView("library")}>📚 서재</button>
        </nav>

        {/* 로그인 모달 */}
        {showAuth && (
          <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowAuth(false)}>
            <div style={{ background: "#1a1228", borderRadius: "20px 20px 0 0", padding: "28px 20px 40px", width: "100%", maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ width: 36, height: 4, background: "#2d2040", borderRadius: 2, margin: "0 auto 24px" }} />
              <h2 style={{ marginBottom: 20, fontSize: 18, fontWeight: 600, textAlign: "center" }}>{authMode === "login" ? "로그인" : "회원가입"}</h2>

              {/* 소셜 로그인 */}
              <button style={{ width: "100%", padding: "13px", background: "#FEE500", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 15, fontWeight: 700, color: "#000", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                onClick={handleKakaoLogin}>
                💬 카카오로 시작하기
              </button>
              <button style={{ width: "100%", padding: "13px", background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: 10, cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 15, fontWeight: 600, color: "#333", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                onClick={handleGoogleLogin}>
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Google로 시작하기
              </button>

              {/* 구분선 */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 1, background: "#2d2040" }} />
                <span style={{ fontSize: 12, color: "#5a4a6a" }}>또는 이메일로</span>
                <div style={{ flex: 1, height: 1, background: "#2d2040" }} />
              </div>

              <input className="input-field" style={{ marginBottom: 10 }} type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="input-field" style={{ marginBottom: 16 }} type="password" placeholder="비밀번호 (6자 이상)" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleAuth(); }} />
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
          <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowProfile(false)}>
            <div style={{ background: "#1a1228", borderRadius: "20px 20px 0 0", padding: "28px 20px 40px", width: "100%", maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ width: 36, height: 4, background: "#2d2040", borderRadius: 2, margin: "0 auto 24px" }} />
              <h2 style={{ marginBottom: 8, fontSize: 18, fontWeight: 600, textAlign: "center" }}>프로필</h2>
              <div style={{ fontSize: 12, color: "#5a4a6a", textAlign: "center", marginBottom: 20 }}>{user?.email}</div>
              <input className="input-field" style={{ marginBottom: 16 }} placeholder="닉네임" value={nicknameInput} onChange={(e) => setNicknameInput(e.target.value)} />
              <button className="btn btn-primary" style={{ width: "100%", padding: 14 }} onClick={saveNickname} disabled={nicknameSaving}>
                {nicknameSaving ? <><span className="spinner" /> 저장 중...</> : "저장"}
              </button>
            </div>
          </div>
        )}

        {/* 삭제 모달 */}
        {showDeleteModal && (
          <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowDeleteModal(null)}>
            <div style={{ background: "#1a1228", borderRadius: 16, padding: 24, width: "100%", maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ marginBottom: 8, fontSize: 16, fontWeight: 600 }}>삭제 선택</h3>
              <p style={{ fontSize: 13, color: "#7a6a8a", marginBottom: 20 }}>"{showDeleteModal.series_title || showDeleteModal.title}" 를 어떻게 삭제할까요?</p>
              {showDeleteModal._episodes && showDeleteModal._episodes.length > 1 && (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 13, color: "#c4b8d8", marginBottom: 8 }}>특정 화만 삭제:</p>
                    {showDeleteModal._episodes.map((ep) => (
                      <button key={ep.id} style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "1px solid #2d2040", borderRadius: 8, padding: "8px 12px", color: "#9a8aaa", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 13, marginBottom: 6 }}
                        onClick={() => { if (confirm(`${ep.episode_number}화를 삭제할까요?`)) deleteEpisode(ep.id); }}>
                        {ep.episode_number}화. {ep.title}
                      </button>
                    ))}
                  </div>
                  <button style={{ width: "100%", padding: "10px", background: "#3d1f1f", border: "1px solid #f87171", borderRadius: 10, color: "#f87171", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 14, marginBottom: 8 }}
                    onClick={() => { if (confirm("시리즈 전체를 삭제할까요?")) deleteSeries(showDeleteModal.series_id!); }}>
                    🗑️ 시리즈 전체 삭제
                  </button>
                </>
              )}
              {(!showDeleteModal._episodes || showDeleteModal._episodes.length <= 1) && (
                <button style={{ width: "100%", padding: "10px", background: "#3d1f1f", border: "1px solid #f87171", borderRadius: 10, color: "#f87171", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 14, marginBottom: 8 }}
                  onClick={() => deleteEpisode(showDeleteModal.id)}>
                  🗑️ 삭제
                </button>
              )}
              <button style={{ width: "100%", padding: "10px", background: "transparent", border: "1px solid #2d2040", borderRadius: 10, color: "#7a6a8a", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 14 }}
                onClick={() => setShowDeleteModal(null)}>취소</button>
            </div>
          </div>
        )}

        {/* 시리즈 상세 화면 */}
        {seriesDetail && !readingNovel && (
          <div style={{ position: "fixed", inset: 0, background: "#0d0a14", zIndex: 100, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
            <div style={{ maxWidth: 640, margin: "0 auto", paddingBottom: 40 }}>
              {/* 헤더 */}
              <div style={{ position: "sticky", top: 0, background: "#0d0a14cc", backdropFilter: "blur(12px)", padding: "12px 16px", display: "flex", alignItems: "center", borderBottom: "1px solid #2d2040", zIndex: 10 }}>
                <button style={{ background: "none", border: "none", color: "#9a8aaa", fontSize: 14, cursor: "pointer", fontFamily: "'Noto Serif KR', serif" }}
                  onClick={() => setSeriesDetail(null)}>← 뒤로</button>
              </div>

              {/* 커버 이미지 */}
              {seriesDetail.cover_image && (
                <div style={{ width: "100%", background: "#0d0a14", display: "flex", justifyContent: "center", position: "relative" }}>
                  <img src={seriesDetail.cover_image} alt={seriesDetail.series_title || seriesDetail.title}
                    style={{ width: "100%", maxHeight: 400, objectFit: "contain" }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to bottom, transparent, #0d0a14)" }} />
                </div>
              )}

              <div style={{ padding: "24px 20px" }}>
                {/* 제목 */}
                <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{seriesDetail.series_title || seriesDetail.title}</h1>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {seriesDetail.genre && <span style={{ fontSize: 11, background: "#2d1f4e", color: "#a78bfa", borderRadius: 20, padding: "3px 10px" }}>{seriesDetail.genre}</span>}
                  <span style={{ fontSize: 11, background: "#1a2d1f", color: "#6ee7b7", borderRadius: 20, padding: "3px 10px" }}>총 {(seriesDetail._episodes || []).length}화</span>
                  {seriesDetail.tags && seriesDetail.tags.split(",").slice(0, 3).map((t: string) => (
                    <span key={t} style={{ fontSize: 11, background: "#1a1228", color: "#7a6a8a", borderRadius: 20, padding: "3px 10px", border: "1px solid #2d2040" }}>#{t.trim()}</span>
                  ))}
                </div>
                {/* 좋아요 버튼 */}
                <button
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: (seriesDetail as any)._isLiked ? "#2d1f4e" : "transparent", border: `1.5px solid ${(seriesDetail as any)._isLiked ? "#7c3aed" : "#2d2040"}`, borderRadius: 24, color: (seriesDetail as any)._isLiked ? "#c4b8ff" : "#7a6a8a", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 14, marginBottom: 20, transition: "all 0.2s" }}
                  onClick={() => toggleSeriesLike(seriesDetail)}>
                  {(seriesDetail as any)._isLiked ? "❤️" : "🤍"}
                  <span>{(seriesDetail as any)._isLiked ? "좋아요 취소" : "좋아요"}</span>
                  {(seriesDetail as any)._likeCount > 0 && <span style={{ fontSize: 12, color: "#7a6a8a" }}>{(seriesDetail as any)._likeCount}</span>}
                </button>

                {/* 작품소개 */}
                {seriesDetail.synopsis && (
                  <div style={{ background: "#160f22", borderRadius: 12, padding: "16px", marginBottom: 24, border: "1px solid #2d2040" }}>
                    <div style={{ fontSize: 12, color: "#7a6a8a", marginBottom: 8, fontWeight: 600 }}>작품 소개</div>
                    <div style={{ fontSize: 14, color: "#c4b8d8", lineHeight: 1.9 }}>{seriesDetail.synopsis}</div>
                  </div>
                )}

                {/* 서재 전용: 커버변경 + 다음화쓰기 + 삭제 */}
                {(seriesDetail as any)._isMine && (() => {
                  const eps = seriesDetail._episodes || [];
                  const lastEp = eps[eps.length - 1];
                  return (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                        <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px", background: "transparent", border: "1.5px solid #2d2040", borderRadius: 12, color: "#9a8aaa", cursor: "pointer", fontSize: 13, fontFamily: "'Noto Serif KR', serif" }}>
                          <input type="file" accept="image/*" style={{ display: "none" }}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              const sid = seriesDetail.series_id || seriesDetail.id;
                              if (!file || !sid) return;
                              const url = await uploadCover(file, sid, seriesDetail.series_id ? undefined : seriesDetail.id);
                              if (url) setSeriesDetail({ ...seriesDetail, cover_image: url } as any);
                              fetchMyNovels();
                            }} />
                          {coverUploading ? "업로드 중..." : "🖼️ 커버 변경"}
                        </label>
                        {lastEp && (
                          <button style={{ padding: "11px", background: "transparent", border: "1.5px solid #7c3aed", borderRadius: 12, color: "#c4b8ff", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 13 }}
                            onClick={() => { setSeriesDetail(null); continueFromLibrary(lastEp); }}>
                            📖 다음 화 쓰기
                          </button>
                        )}
                      </div>
                      <button style={{ width: "100%", padding: "10px", background: "transparent", border: "1px solid #3d1f1f", borderRadius: 10, color: "#f87171", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 13, marginBottom: 20 }}
                        onClick={() => { setShowDeleteModal(seriesDetail); }}>
                        🗑️ 삭제
                      </button>
                    </>
                  );
                })()}

                {/* 목차 - 기본 접힘 */}
                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#160f22", borderRadius: showToc ? "12px 12px 0 0" : 12, border: "1px solid #2d2040", cursor: "pointer", marginBottom: showToc ? 0 : 0 }}
                  onClick={() => setShowToc(!showToc)}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#c4b8d8" }}>
                    📋 목차 <span style={{ color: "#7c3aed", marginLeft: 4 }}>{(seriesDetail._episodes || []).length}화</span>
                  </span>
                  <span style={{ fontSize: 13, color: "#5a4a6a", transition: "transform 0.2s", display: "inline-block", transform: showToc ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
                </div>
                {showToc && (
                  <div style={{ border: "1px solid #2d2040", borderTop: "none", borderRadius: "0 0 12px 12px", overflow: "hidden", marginBottom: 8 }}>
                    {(seriesDetail._episodes || []).map((ep, idx) => (
                      <div key={ep.id}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#160f22", borderTop: idx > 0 ? "1px solid #2d2040" : "none", cursor: "pointer", transition: "background 0.15s" }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "#1a1228")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "#160f22")}
                        onClick={() => openNovel(ep, !!(seriesDetail as any)._isMine)}>
                        <div style={{ width: 32, height: 32, borderRadius: 6, background: "#2d1f4e", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#a78bfa", fontWeight: 600 }}>{ep.episode_number}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#e8e0f0", marginBottom: 2 }}>{ep.episode_number}화. {ep.title}</div>
                          <div style={{ fontSize: 11, color: "#5a4a6a" }}>{new Date(ep.created_at).toLocaleDateString("ko-KR")}</div>
                        </div>
                        {(seriesDetail as any)._isMine && (
                          <button style={{ background: "transparent", border: "1px solid #2d2040", borderRadius: 8, padding: "4px 10px", color: "#7a6a8a", cursor: "pointer", fontSize: 11, fontFamily: "'Noto Serif KR', serif", flexShrink: 0 }}
                            onClick={(e) => { e.stopPropagation(); editFromLibrary(ep); setSeriesDetail(null); }}>
                            편집
                          </button>
                        )}
                        <span style={{ fontSize: 18, color: "#4a3570", flexShrink: 0 }}>›</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* 소설 읽기 */}
        {readingNovel && (
          <div style={{ position: "fixed", inset: 0, background: "#0d0a14", zIndex: 100, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
            <div style={{ maxWidth: 640, margin: "0 auto", paddingBottom: 160 }}>
              <div style={{ position: "sticky", top: 0, background: "#0d0a14cc", backdropFilter: "blur(12px)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2d2040", zIndex: 10 }}>
                <button style={{ background: "none", border: "none", color: "#9a8aaa", fontSize: 14, cursor: "pointer", fontFamily: "'Noto Serif KR', serif" }} onClick={() => { setReadingNovel(null); }}>← 뒤로</button>
                <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#5a4a6a" }}>
                  <span>👁 {readingNovel.views}</span>
                  <span>❤️ {readingNovel.like_count || 0}</span>
                </div>
              </div>
              {readingSeries.length > 1 && (
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #2d2040", display: "flex", gap: 8, overflowX: "auto" }}>
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
                {readingNovel.cover_image ? (
                  <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 20, position: "relative" }}>
                    <img src={readingNovel.cover_image} alt="cover" style={{ width: "100%", height: 200, objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, #0d0a14)" }} />

                  </div>
                ) : null}
                {readingNovel.series_title && <div style={{ fontSize: 12, color: "#7c3aed", marginBottom: 6 }}>📚 {readingNovel.series_title}</div>}
                <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>
                  {readingNovel.episode_number ? `${readingNovel.episode_number}화. ` : ""}{readingNovel.title}
                </h1>
                <div style={{ fontSize: 12, color: "#5a4a6a", marginBottom: 28 }}>{readingNovel.genre}{readingNovel.tags && ` · ${readingNovel.tags}`}</div>
                <div style={{ lineHeight: 2.2, fontSize: 16, color: "#ddd4ee", whiteSpace: "pre-wrap", fontWeight: 300 }}>{readingNovel.content}</div>

                {/* 댓글 섹션 */}
                <div style={{ marginTop: 48, borderTop: "1px solid #2d2040", paddingTop: 28 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#c4b8d8", marginBottom: 20 }}>
                    💬 댓글 {comments.length > 0 ? `${comments.length}개` : ""}
                  </div>

                  {/* 댓글 입력 */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                    <textarea
                      style={{ flex: 1, background: "#1a1228", border: "1.5px solid #2d2040", borderRadius: 10, padding: "10px 12px", color: "#e8e0f0", fontFamily: "'Noto Serif KR', serif", fontSize: 14, outline: "none", resize: "none", minHeight: 72 }}
                      placeholder={user ? "댓글을 남겨보세요..." : "로그인 후 댓글을 남길 수 있어요"}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onFocus={() => { if (!user) setShowAuth(true); }}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(); } }}
                    />
                    <button
                      style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", border: "none", borderRadius: 10, padding: "0 16px", color: "#fff", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 13, flexShrink: 0, opacity: commentText.trim() ? 1 : 0.4 }}
                      onClick={submitComment}
                      disabled={commentLoading || !commentText.trim()}>
                      {commentLoading ? "..." : "등록"}
                    </button>
                  </div>

                  {/* 댓글 목록 */}
                  {comments.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "24px 0", color: "#5a4a6a", fontSize: 13 }}>첫 댓글을 남겨보세요 🌙</div>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} style={{ marginBottom: 16, padding: "12px 14px", background: "#160f22", borderRadius: 10, border: "1px solid #2d2040" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#a78bfa" }}>{c.nickname}</span>
                            <span style={{ fontSize: 11, color: "#5a4a6a" }}>{new Date(c.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          {user?.id === c.user_id && (
                            <button style={{ background: "none", border: "none", color: "#5a4a6a", cursor: "pointer", fontSize: 11, fontFamily: "'Noto Serif KR', serif" }}
                              onClick={() => { if (confirm("댓글을 삭제할까요?")) deleteComment(c.id); }}>삭제</button>
                          )}
                        </div>
                        <div style={{ fontSize: 14, color: "#c4b8d8", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{c.content}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 640, padding: "10px 16px 20px", background: "#0d0a14ee", borderTop: "1px solid #2d2040" }}>

              {isMyNovel && (
                <>
                  {/* 현재 화 공개 토글 */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#160f22", borderRadius: 10, border: "1px solid #2d2040", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "#c4b8d8" }}>
                      {readingNovel.episode_number ? `${readingNovel.episode_number}화 ` : ""}공개 설정
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: readingNovel.is_public ? "#7c3aed" : "#5a4a6a" }}>
                        {readingNovel.is_public ? "🌍 공개 중" : "🔒 비공개"}
                      </span>
                      <label style={{ position: "relative", width: 44, height: 24, cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleEpisodePublic(e, readingNovel.id, readingNovel.is_public);
                        }}>
                        <span style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: readingNovel.is_public ? "#7c3aed" : "#2d2040", borderRadius: 24, transition: "0.3s" }}>
                          <span style={{ position: "absolute", height: 18, width: 18, left: readingNovel.is_public ? 23 : 3, bottom: 3, background: "white", borderRadius: "50%", transition: "0.3s" }} />
                        </span>
                      </label>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isLastEpisode ? "1fr 1fr" : "1fr", gap: 8 }}>
                    <button style={{ padding: "11px", background: "transparent", border: "1.5px solid #2d2040", borderRadius: 12, color: "#9a8aaa", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 13 }}
                      onClick={() => editFromLibrary(readingNovel)}>✏️ 편집</button>
                    {isLastEpisode && (
                      <button style={{ padding: "11px", background: "transparent", border: "1.5px solid #7c3aed", borderRadius: 12, color: "#c4b8ff", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 13 }}
                        onClick={() => continueFromLibrary(readingNovel)}>📖 다음 화 쓰기</button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <main style={{ padding: "16px 16px 100px" }}>
          {view === "create" && (
            <>
              {step === "form" && (
                <div className="fade-in">
                  {currentSeriesId && (
                    <div style={{ background: "#1a1228", border: "1px solid #7c3aed", borderRadius: 10, padding: "10px 14px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 11, color: "#7c3aed", marginBottom: 2 }}>연재 중</div>
                        <div style={{ fontSize: 14, color: "#c4b8d8" }}>{seriesTitle || "제목 없음"} — {currentEpisode}화 작성 중</div>
                      </div>
                      <button style={{ background: "none", border: "none", color: "#5a4a6a", cursor: "pointer", fontSize: 12, fontFamily: "'Noto Serif KR', serif" }} onClick={resetForm}>새 작품</button>
                    </div>
                  )}

                  <div className="section">
                    <div className="section-title">시리즈 제목</div>
                    <input className="input-field" placeholder="연재 시 입력 (비우면 1화 제목 사용)" value={seriesTitle} onChange={(e) => setSeriesTitle(e.target.value)} />
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
                        <textarea className="input-field" rows={2} placeholder="캐릭터 특징" value={char.desc} onChange={(e) => updateCharacter(char.id, "desc", e.target.value)} />
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
                      onClick={() => {
                          if (isEditing) {
                            // 완료 누르면 novel도 editedNovel로 동기화
                            setNovel(editedNovel);
                          } else {
                            setEditedNovel(novel);
                          }
                          setIsEditing(!isEditing);
                        }} disabled={loading}>
                      {isEditing ? "✅ 완료" : "✏️ 편집"}
                    </button>
                  </div>

                  <div style={{ background: "#160f22", border: `1.5px solid ${isEditing ? accentColor + "66" : "#2d2040"}`, borderRadius: 16, padding: "24px 20px" }}>
                    {loading && <div style={{ textAlign: "center", padding: "40px 0", color: "#5a4a6a" }}><div style={{ fontSize: 28, marginBottom: 12 }}>✍️</div><div>이야기를 쓰고 있어요...</div></div>}
                    {!loading && isEditing && <textarea className="novel-editor" value={editedNovel} onChange={(e) => setEditedNovel(e.target.value)} style={{ height: Math.max(300, editedNovel.split("\n").length * 36) }} />}
                    {!loading && !isEditing && novel && <div style={{ lineHeight: 2.2, fontSize: 16, color: "#ddd4ee", whiteSpace: "pre-wrap", fontWeight: 300 }}>{novel}</div>}
                  </div>

                  {!loading && novel && (
                    <>
                      {/* 커버 이미지 업로드 */}
                      <div style={{ margin: "14px 0", padding: "12px 14px", background: "#160f22", borderRadius: 10, border: "1px solid #2d2040" }}>
                        <div style={{ fontSize: 12, color: "#7a6a8a", marginBottom: 8 }}>🖼️ 시리즈 커버 이미지</div>
                        {coverImage ? (
                          <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
                            <img src={coverImage} alt="cover" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8 }} />
                            <button
                              style={{ position: "absolute", top: 6, right: 6, background: "#0d0a14cc", border: "1px solid #2d2040", borderRadius: 6, color: "#f87171", fontSize: 11, padding: "3px 8px", cursor: "pointer", fontFamily: "'Noto Serif KR', serif" }}
                              onClick={() => setCoverImage(null)}>삭제</button>
                          </div>
                        ) : (
                          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "10px", border: "1.5px dashed #2d2040", borderRadius: 8, color: "#5a4a6a", fontSize: 13 }}>
                            <input type="file" accept="image/*" style={{ display: "none" }}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file || !user) return;
                                const sid = currentSeriesId || crypto.randomUUID();
                                if (!currentSeriesId) setCurrentSeriesId(sid);
                                await uploadCover(file, sid);
                              }} />
                            {coverUploading ? "업로드 중..." : "📁 이미지 선택 (jpg, png)"}
                          </label>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, padding: "12px 14px", background: "#160f22", borderRadius: 10, border: "1px solid #2d2040" }}>
                        <label style={{ position: "relative", width: 44, height: 24, cursor: "pointer", flexShrink: 0 }}>
                          <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                          <span style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: isPublic ? "#7c3aed" : "#2d2040", borderRadius: 24, transition: "0.3s" }}>
                            <span style={{ position: "absolute", height: 18, width: 18, left: isPublic ? 23 : 3, bottom: 3, background: "white", borderRadius: "50%", transition: "0.3s" }} />
                          </span>
                        </label>
                        <span style={{ fontSize: 13, color: "#c4b8d8" }}>{isPublic ? "🌍 이 화 공개" : "🔒 이 화 비공개"}</span>
                      </div>
                      {/* 자동저장 표시 */}
                      {autoSaveMsg && (
                        <div style={{ textAlign: "right", fontSize: 11, color: "#6ee7b7", marginBottom: 6 }}>{autoSaveMsg}</div>
                      )}
                      {/* 버튼: 다음 화 쓰기 + 저장 */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                        <button className="btn btn-outline" onClick={generateNextEpisode} disabled={loading} style={{ fontSize: 13, borderColor: "#7c3aed", color: "#a78bfa" }}>
                          {loading ? <><span className="spinner" /></> : "📖 다음 화 쓰기"}
                        </button>
                        <button className="btn btn-primary" onClick={saveNovel} disabled={saving} style={{ fontSize: 13 }}>
                          {saving ? <><span className="spinner" /></> : saveMsg || `💾 ${currentEpisode}화 저장`}
                        </button>
                      </div>
                      {/* txt, 복사 */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <button className="btn btn-outline" onClick={saveAsText} style={{ fontSize: 13 }}>📄 txt</button>
                        <button className="btn btn-outline" onClick={copyToClipboard} style={{ fontSize: 13, borderColor: copied ? "#86efac" : "#2d2040", color: copied ? "#86efac" : "#9a8aaa" }}>
                          {copied ? "✅" : "📋 복사"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {view === "explore" && (
            <div className="fade-in">
              {/* 검색 */}
              <div style={{ marginBottom: 12 }}>
                <input className="input-field" placeholder="🔍 제목, 장르, 태그 검색..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") fetchPublicNovels(); }} />
              </div>

              {/* 장르 필터 탭 */}
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 12, scrollbarWidth: "none" }}>
                {["전체", "💕 로맨스", "🧙 판타지", "✨ 현대판타지", "⚔️ 무협", "🔪 스릴러/호러", "🔍 미스터리", "🚀 SF", "🏙️ 현대물", "📜 역사", "💙 BL", "💜 GL"].map((g) => (
                  <button key={g}
                    style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${exploreGenre === g ? "#7c3aed" : "#2d2040"}`, background: exploreGenre === g ? "#2d1f4e" : "#1a1228", color: exploreGenre === g ? "#c4b8ff" : "#7a6a8a", fontSize: 12, cursor: "pointer", fontFamily: "'Noto Serif KR', serif", transition: "all 0.2s", whiteSpace: "nowrap" }}
                    onClick={() => setExploreGenre(g)}>
                    {g}
                  </button>
                ))}
              </div>

              {/* 최신/인기 + 결과 */}
              <div style={{ display: "flex", borderBottom: "1px solid #2d2040", marginBottom: 16 }}>
                <button className={`tab-btn${exploreTab === "latest" ? " active" : ""}`} onClick={() => setExploreTab("latest")}>🆕 최신</button>
                <button className={`tab-btn${exploreTab === "popular" ? " active" : ""}`} onClick={() => setExploreTab("popular")}>🔥 인기</button>
              </div>
              {publicNovels.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#5a4a6a" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <div>{exploreGenre !== "전체" ? `${exploreGenre} 장르의 소설이 없어요` : "아직 공개된 소설이 없어요"}</div>
                </div>
              ) : publicNovels.map((n) => <NovelCard key={n.id} n={n} />)}
            </div>
          )}

          {view === "library" && (
            <div className="fade-in">
              <div style={{ display: "flex", borderBottom: "1px solid #2d2040", marginBottom: 16 }}>
                <button className={`tab-btn${libraryTab === "my" ? " active" : ""}`} onClick={() => setLibraryTab("my")}>📝 내 작품</button>
                <button className={`tab-btn${libraryTab === "liked" ? " active" : ""}`} onClick={() => { setLibraryTab("liked"); if (user) fetchLikedNovels(); }}>❤️ 좋아한 작품</button>
              </div>
              {!user ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#5a4a6a" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
                  <div style={{ marginBottom: 20 }}>로그인하면 서재를 이용할 수 있어요</div>
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
