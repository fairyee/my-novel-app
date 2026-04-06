"use client";
import { useState, useEffect } from "react";
import { createClient } from "./lib/supabase";
import { Novel, Profile, Comment, Character, GENRES, GENRE_TAGS, BACKGROUNDS, BL_ROLES, GL_ROLES, AGE_OPTIONS, GENDER_OPTIONS, RELATIONSHIP_OPTIONS, STYLES, ENDINGS, RATINGS, POVS } from "./types";
import AuthModal from "./components/AuthModal";
import NovelCard from "./components/NovelCard";
import SeriesDetail from "./components/SeriesDetail";
import ReadingView from "./components/ReadingView";
import PaymentModal from "./components/PaymentModal";

export default function Home() {
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [nicknameSaving, setNicknameSaving] = useState(false);

  const [view, setView] = useState<"create" | "library" | "explore">("create");
  const [libraryTab, setLibraryTab] = useState<"my" | "favorites">("my");
  const [exploreTab, setExploreTab] = useState<"latest" | "popular">("latest");
  const [exploreGenre, setExploreGenre] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  const [myNovels, setMyNovels] = useState<Novel[]>([]);
  const [favoriteNovels, setFavoriteNovels] = useState<Novel[]>([]);
  const [publicNovels, setPublicNovels] = useState<Novel[]>([]);

  const [readingNovel, setReadingNovel] = useState<Novel | null>(null);
  const [seriesDetail, setSeriesDetail] = useState<Novel | null>(null);
  const [showToc, setShowToc] = useState(true);
  const [readingSeries, setReadingSeries] = useState<Novel[]>([]);
  const [isMyNovel, setIsMyNovel] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<Novel | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const [formStep, setFormStep] = useState(1);
  const [genre, setGenre] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [blRole, setBlRole] = useState<string | null>(null);
  const [glRole, setGlRole] = useState<string | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [ending, setEnding] = useState<string | null>(null);
  const [rating, setRating] = useState("all");
  const [pov, setPov] = useState("third");
  const [title, setTitle] = useState("");
  const [seriesTitle, setSeriesTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [generatedSynopsis, setGeneratedSynopsis] = useState("");
  const [editingSynopsis, setEditingSynopsis] = useState(false);
  const [customBackground, setCustomBackground] = useState("");
  const [characters, setCharacters] = useState<Character[]>([{ id: 1, name: "", desc: "", role: "주인공", age: "", gender: "", relationship: "", tone: "" }]);
  const [isPublic, setIsPublic] = useState(false);
  const [currentSeriesId, setCurrentSeriesId] = useState<string | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState(1);

  const [novel, setNovel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("form");
  const [isEditing, setIsEditing] = useState(false);
  const [editedNovel, setEditedNovel] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [autoSaveMsg, setAutoSaveMsg] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);

  const selectedGenre = GENRES.find((g) => g.id === genre);
  const accentColor = selectedGenre?.color || "#a78bfa";

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id);
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id);
      else setProfile(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (view === "library" && user) { fetchMyNovels(); fetchFavoriteNovels(); }
    if (view === "explore") fetchPublicNovels();
  }, [view, user, exploreTab, exploreGenre]);

  useEffect(() => {
    const currentText = isEditing ? editedNovel : novel;
    if (!user || !currentText.trim() || step !== "result" || loading) return;
    const timer = setTimeout(async () => {
      const novelTitle = title || currentText.split("\n")[0] || "제목 없음";
      let sid = currentSeriesId;
      if (!sid) { sid = crypto.randomUUID(); setCurrentSeriesId(sid); }
      const saveSynopsis = generatedSynopsis || null;
      const { data: existing } = await supabase.from("novels").select("id").eq("series_id", sid).eq("episode_number", currentEpisode).maybeSingle();
      if (existing) {
        await supabase.from("novels").update({ content: currentText, title: novelTitle, is_public: isPublic, synopsis: saveSynopsis }).eq("id", existing.id);
      } else {
        await supabase.from("novels").insert({ user_id: user.id, title: novelTitle, content: currentText, genre: selectedGenre?.label || "", tags: selectedTags.join(", "), is_public: isPublic, views: 0, series_id: sid, episode_number: currentEpisode, series_title: seriesTitle || novelTitle, synopsis: saveSynopsis, created_at: new Date().toISOString() });
      }
      setAutoSaveMsg("자동저장됨 ✓");
      setTimeout(() => setAutoSaveMsg(""), 2000);
    }, 2000);
    return () => clearTimeout(timer);
  }, [novel, editedNovel, isEditing, user, step, loading, currentSeriesId, currentEpisode, generatedSynopsis]);

  async function fetchProfile(userId: string) {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) { setProfile(data); setNicknameInput(data.nickname); }
  }

  async function fetchMyNovels() {
    const { data } = await supabase.from("novels").select("*").eq("user_id", user.id).order("episode_number", { ascending: true });
    const seriesMap: Record<string, Novel[]> = {};
    const noSeries: Novel[] = [];
    (data || []).forEach((n: Novel) => {
      if (n.series_id) { if (!seriesMap[n.series_id]) seriesMap[n.series_id] = []; seriesMap[n.series_id].push(n); }
      else noSeries.push(n);
    });
    const grouped = Object.values(seriesMap).map((eps) => ({ ...eps[0], _episodes: eps }));
    const withCount = await Promise.all([...grouped, ...noSeries].map(async (n) => {
      const saveId = n.series_id || n.id;
      const { count } = await supabase.from("likes").select("*", { count: "exact", head: true }).eq("novel_id", saveId);
      return { ...n, likes_count: count || 0 };
    }));
    setMyNovels(withCount);
  }

  async function fetchFavoriteNovels() {
    const { data: favData } = await supabase.from("likes").select("novel_id").eq("user_id", user.id);
    if (!favData || favData.length === 0) { setFavoriteNovels([]); return; }
    const likedIds = favData.map((l: any) => l.novel_id);
    const { data: directMatches } = await supabase.from("novels").select("*").in("id", likedIds);
    const { data: seriesMatches } = await supabase.from("novels").select("*").in("series_id", likedIds).order("episode_number", { ascending: true });
    const allData = [...(directMatches || []), ...(seriesMatches || [])];
    if (allData.length === 0) { setFavoriteNovels([]); return; }
    const seen = new Set<string>();
    const deduped = allData.filter(n => { if (seen.has(n.id)) return false; seen.add(n.id); return true; });
    const seriesMap: Record<string, Novel[]> = {};
    const noSeries: Novel[] = [];
    deduped.forEach((n: Novel) => {
      if (n.series_id) { if (!seriesMap[n.series_id]) seriesMap[n.series_id] = []; seriesMap[n.series_id].push(n); }
      else noSeries.push(n);
    });
    const grouped = Object.values(seriesMap).map((eps) => {
      const sorted = [...eps].sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));
      return { ...sorted[0], is_favorited: true, _episodes: sorted.map(ep => ({ ...ep, is_favorited: true })) };
    });
    const noSeriesWithFav = noSeries.map(n => ({ ...n, is_favorited: true }));
    setFavoriteNovels([...grouped, ...noSeriesWithFav]);
  }

  async function fetchPublicNovels() {
    let query = supabase.from("novels").select("*").eq("is_public", true);
    if (exploreGenre !== "전체") query = query.ilike("genre", `%${exploreGenre}%`);
    if (searchQuery.trim()) query = query.or(`title.ilike.%${searchQuery}%,tags.ilike.%${searchQuery}%,genre.ilike.%${searchQuery}%`);
    query = exploreTab === "popular" ? query.order("views", { ascending: false }) : query.order("created_at", { ascending: false });
    const { data } = await query.limit(100);
    if (!data) { setPublicNovels([]); return; }
    let favIds = new Set<string>();
    if (user) {
      const { data: favData } = await supabase.from("likes").select("novel_id").eq("user_id", user.id);
      favIds = new Set((favData || []).map((l: any) => l.novel_id));
    }
    const withMeta = await Promise.all(data.map(async (n: Novel) => {
      const saveId = n.series_id || n.id;
      const { count } = await supabase.from("likes").select("*", { count: "exact", head: true }).eq("novel_id", saveId);
      return { ...n, is_favorited: favIds.has(n.id) || (n.series_id ? favIds.has(n.series_id) : false), likes_count: count || 0 };
    }));
    const seriesMap: Record<string, Novel[]> = {};
    const noSeries: Novel[] = [];
    withMeta.forEach((n: Novel) => {
      if (n.series_id) { if (!seriesMap[n.series_id]) seriesMap[n.series_id] = []; seriesMap[n.series_id].push(n); }
      else noSeries.push(n);
    });
    const seriesCards = Object.values(seriesMap).map((eps) => {
      const sorted = [...eps].sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));
      return { ...sorted[0], is_favorited: sorted.some(ep => ep.is_favorited), _episodes: sorted };
    });
    const all = [...seriesCards, ...noSeries];
    all.sort(exploreTab === "popular"
      ? (a, b) => (b.views || 0) - (a.views || 0)
      : (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setPublicNovels(all);
  }

  async function toggleFavorite(target: Novel) {
    if (!user) { setShowAuth(true); return; }
    const saveId = target.series_id || target.id;
    const nextFav = !target.is_favorited;
    setPublicNovels(prev => prev.map(item => {
      const itemKey = item.series_id || item.id;
      return itemKey === saveId ? { ...item, is_favorited: nextFav } : item;
    }));
    if (seriesDetail) {
      const sdKey = seriesDetail.series_id || seriesDetail.id;
      if (sdKey === saveId) setSeriesDetail({ ...seriesDetail, is_favorited: nextFav });
    }
    if (nextFav) {
      if (target.series_id) {
        const { data: eps } = await supabase.from("novels").select("id").eq("series_id", target.series_id);
        if (eps && eps.length > 0) await supabase.from("likes").delete().eq("user_id", user.id).in("novel_id", eps.map((e: any) => e.id));
      }
      await supabase.from("likes").insert({ user_id: user.id, novel_id: saveId });
    } else {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("novel_id", saveId);
      if (target.series_id) {
        const { data: eps } = await supabase.from("novels").select("id").eq("series_id", target.series_id);
        if (eps && eps.length > 0) await supabase.from("likes").delete().eq("user_id", user.id).in("novel_id", eps.map((e: any) => e.id));
      }
    }
    await fetchFavoriteNovels();
    await fetchPublicNovels();
  }

  async function openNovel(n: Novel, mine = false) {
    await supabase.rpc("increment_views", { novel_id: n.id });
    setIsMyNovel(mine);
    setReadingNovel(n);
    setComments([]); setCommentText("");
    fetchComments(n.id);
    if (n.series_id) {
      let q = supabase.from("novels").select("*").eq("series_id", n.series_id).order("episode_number", { ascending: true });
      if (!mine) q = q.eq("is_public", true);
      const { data } = await q;
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
    await supabase.from("comments").insert({ novel_id: readingNovel.id, user_id: user.id, nickname: profile?.nickname || user.email?.split("@")[0] || "익명", content: commentText.trim() });
    setCommentText("");
    await fetchComments(readingNovel.id);
    setCommentLoading(false);
  }

  async function deleteComment(id: string) {
    await supabase.from("comments").delete().eq("id", id);
    if (readingNovel) fetchComments(readingNovel.id);
  }

  async function handleGoogleLogin() {
    setAuthError("");
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin, queryParams: { access_type: "offline", prompt: "consent" } } });
    if (error) setAuthError(error.message);
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

  async function saveNickname() {
    if (!user || !nicknameInput.trim()) return;
    setNicknameSaving(true);
    await supabase.from("profiles").upsert({ id: user.id, nickname: nicknameInput.trim() });
    await fetchProfile(user.id);
    setNicknameSaving(false);
    setShowProfile(false);
  }

  async function saveNovel() {
    if (!user) { setShowAuth(true); return; }
    setSaving(true); setSaveMsg("");
    const content = isEditing ? editedNovel : novel;
    const novelTitle = title || content.split("\n")[0] || "제목 없음";
    const sid = currentSeriesId || crypto.randomUUID();
    if (!currentSeriesId) setCurrentSeriesId(sid);
    const saveSynopsis = generatedSynopsis || synopsis || null;
    const { data: existing } = await supabase.from("novels").select("id").eq("series_id", sid).eq("episode_number", currentEpisode).maybeSingle();
    let err = null;
    if (existing) {
      const { error } = await supabase.from("novels").update({ content, title: novelTitle, is_public: isPublic, synopsis: saveSynopsis }).eq("id", existing.id);
      err = error;
    } else {
      const { error } = await supabase.from("novels").insert({ user_id: user.id, title: novelTitle, content, genre: selectedGenre?.label || "", tags: selectedTags.join(", "), is_public: isPublic, views: 0, series_id: sid, episode_number: currentEpisode, series_title: seriesTitle || novelTitle, cover_image: coverImage || null, synopsis: saveSynopsis, created_at: new Date().toISOString() });
      err = error;
    }
    setSaveMsg(err ? "저장 실패 😢" : `${currentEpisode}화 저장됐어요! ✅`);
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  function getStyleGuide() {
    const styleMap: Record<string, string> = {
      emotional:   "- 감정의 밀도를 높여라. 인물의 내면을 행동과 감각으로만 보여줄 것\n- 침묵, 망설임, 시선 회피, 손끝 떨림으로 감정을 전달\n- 독자가 같이 아파하거나 설레게 만들 것\n- 감정이 고조될수록 문장을 더 짧게",
      fast:        "- 장면 전환을 빠르게, 문장을 짧게 끊어\n- 매 단락 끝에 반드시 긴장 또는 궁금증을 남길 것\n- 사건이 연속으로 터지는 구조로. 설명 최소화",
      dialogue:    "- 대사가 장면을 이끌게 할 것. 서술은 대사 사이 최소한으로\n- 대사로 감정, 갈등, 관계 변화를 직접 보여줄 것\n- 인물마다 말투와 어휘를 확실히 구분할 것",
      cinematic:   "- 장면을 카메라로 촬영하듯 구체적으로 묘사\n- 클로즈업(표정, 손, 입술)과 풀샷(공간, 날씨) 번갈아 사용\n- 소리, 빛, 온도로 분위기 강화",
      lyrical:     "- 감정을 비유와 감각 이미지로 표현\n- 문장의 리듬과 여백을 의식하며 쓸 것\n- 사소한 디테일 하나에 큰 감정을 압축할 것",
      descriptive: "- 공간, 소리, 냄새, 온도, 질감을 풍부하게 묘사\n- 인물의 표정과 몸짓을 세밀하게\n- 독자가 장면 속에 직접 있는 느낌이 들게",
    };
    const selectedStyleGuides = selectedStyles.map(s => styleMap[s]).filter(Boolean).join("\n");
    const ratingGuide = rating === "adult"
      ? "\n[수위 지침 - 성인]\n- 두 인물 사이의 긴장감과 욕망을 감각적으로 표현할 것\n- 신체 묘사는 직접적이지 않되 독자가 상상하게 유도\n- 열기, 숨소리, 촉감, 거리감으로 분위기를 만들 것\n- 포르노그라피식 직접 묘사는 하지 말 것"
      : "";
    const base = `
[문체 방향]
${selectedStyleGuides || "- 자연스럽고 읽기 좋은 한국 웹소설 문체"}

[대사/말투 필수 규칙 - 매우 중요]
- 캐릭터마다 말투를 처음부터 끝까지 일관되게 유지할 것
- 존댓말과 반말을 섞으면 절대 안 됨. 캐릭터 관계와 성격에 맞는 말투 하나를 선택하고 끝까지 유지
- 대사는 그 인물이 실제로 할 법한 말이어야 함. 작가의 설명이 대사 속에 들어가면 안 됨
- 유치하거나 인위적인 대사 금지: "나는 너를 사랑해", "당신은 특별해요" 같은 직접적 감정 선언 금지
- 대사는 짧고 날카롭게. 현실에서 사람이 하는 말처럼
- 대사 뒤에 감정 해설 붙이지 말 것 ("그가 말했다, 그의 목소리엔 슬픔이 묻어났다" → 금지)

[절대 금지]
- "숨이 멎을 듯했다", "눈물이 차올랐다", "가슴이 두근거렸다" 등 상투적 표현
- 감정 직접 해설 ("그녀는 슬펐다", "그는 설레었다")
- "헉!", "어머?!" 같은 만화체
- "그렇게 시간이 흘렀다" 같은 요약 전개
- 마크다운, 소제목, 별표, 번호 매기기

[반드시 지킬 것]
- 첫 문장부터 장면 한복판으로 바로 들어갈 것
- 각 장면은 목적 + 장애물 구조로
- 문장은 짧고 선명하게. 단락마다 리듬감
- 이름 없는 캐릭터는 어울리는 이름을 직접 정해서 쓸 것${ratingGuide}`;
    const genreGuides: Record<string, string> = {
      "로맨스": "\n[로맨스]\n- 두 인물 사이 긴장은 거리, 시선, 침묵, 손끝으로\n- 설레임은 절제할수록 강해짐\n- 오해나 엇갈림이 있어야 더 재밌음\n- 고백은 최대한 늦게. 그 전까지 쌓아야 함",
      "BL":     "\n[BL]\n- 공수 관계의 심리적 긴장을 섬세하게\n- 감정 변화는 행동과 시선으로만. 직접 고백은 마지막에\n- 두 남자 사이 특유의 자존심, 견제, 끌림을 살릴 것\n- BL 특유의 감성: 집착, 독점욕, 절제된 애정",
      "GL":     "\n[GL]\n- 두 여성 사이 감정선을 섬세하게\n- 일상 속 작은 순간들에서 감정이 쌓이게\n- 직접 고백보다 눈빛과 행동으로 표현",
      "판타지": "\n[판타지]\n- 세계관은 장면 속에 자연스럽게 녹일 것. 설명하면 안 됨\n- 마법/능력은 보여줄 것. 설명 금지\n- 이세계 감각(냄새, 색깔, 소리)을 구체적으로",
      "액션":   "\n[액션/무협]\n- 전투는 심리전 먼저. 기술 나열 금지\n- 타격감은 짧은 문장으로\n- 의리, 복수, 명예를 행동으로",
      "공포":   "\n[공포/추리]\n- 공포는 암시와 여운으로. 직접 묘사 금지\n- 정보 비대칭이 긴장을 만듦\n- 평범한 것의 이상함을 포착",
      "드라마": "\n[드라마]\n- 인물 간 관계 변화가 핵심\n- 현실감 있는 대사와 갈등\n- 감정 폭발 전 절제로 쌓아갈 것",
    };
    const genreLabel = selectedGenre?.label || "";
    const genreExtra = Object.entries(genreGuides).find(([k]) => genreLabel.includes(k))?.[1] || "";
    return base + genreExtra;
  }

  function checkAndIncrementCount(): boolean {
    if (user) return true;
    const today = new Date().toDateString();
    const stored = localStorage.getItem("novella_gen");
    const data = stored ? JSON.parse(stored) : { date: today, count: 0 };
    if (data.date !== today) { data.date = today; data.count = 0; }
    if (data.count >= 3) return false;
    data.count += 1;
    localStorage.setItem("novella_gen", JSON.stringify(data));
    return true;
  }

  async function generateNovel() {
    if (!checkAndIncrementCount()) {
      setError("무료 체험은 하루 3회예요. 로그인하면 무제한으로 쓸 수 있어요!");
      setShowAuth(true);
      return;
    }
    setError(""); setLoading(true); setStep("result"); setNovel(""); setIsEditing(false); setSaveMsg("");

    const ratingLabel = rating === "all" ? "전체 (순애, 자극적 표현 없음)" : "성인 (19+, 암시적 표현 허용)";
    const styleGuide = getStyleGuide();
    const charDesc = characters.filter(c => c.name || c.desc || c.age || c.gender || c.role).map(c => {
      const ageGender = [c.age, c.gender].filter(Boolean).join("/");
      const rel = c.relationship ? ` [주인공과의 관계: ${RELATIONSHIP_OPTIONS.find(r => r.id === c.relationship)?.label || c.relationship}]` : "";
      const tone = c.tone ? ` [말투: ${c.tone}]` : "";
      return `- [${c.role}]${ageGender ? ` (${ageGender})` : ""}${rel}${tone} 이름: ${c.name || "AI가 정할 것"} / 특징: ${c.desc || "없음"}`;
    }).join("\n");
    const blGlInfo = genre === "bl" && blRole ? `BL 공수 설정: ${BL_ROLES.find(r => r.id === blRole)?.label || ""}` :
                     genre === "gl" && glRole ? `GL 관계 설정: ${GL_ROLES.find(r => r.id === glRole)?.label || ""}` : "";
    const backgroundInfo = [selectedBackground, customBackground].filter(Boolean).join(", ");
    const povLabel = pov === "first" ? "1인칭 (나는...)" : "3인칭 제한 시점 (그는/그녀는...)";
    const endingLabel = ENDINGS.find(e => e.id === ending)?.label || "";

    try {
      const planPrompt = `너는 한국 장르소설 회차 설계 전문가다.

<작품정보>
장르: ${selectedGenre?.label || "자유"}
${seriesTitle ? `시리즈 제목: ${seriesTitle}` : ""}
${title ? `이번 화 제목 힌트: ${title}` : ""}
태그/클리셰: ${selectedTags.length > 0 ? selectedTags.join(", ") : "없음"}
${backgroundInfo ? `배경: ${backgroundInfo}` : ""}
${blGlInfo}
결말 방향: ${endingLabel || "자유"}
수위: ${ratingLabel}
시점: ${povLabel}
${synopsis ? `작가 메모 (줄거리): ${synopsis}` : ""}
${charDesc ? `등장인물 (말투와 관계를 설계에 반영할 것):\n${charDesc}` : ""}
</작품정보>

위 정보를 바탕으로 이번 화를 설계해라. 아래 형식으로만 출력:

1. 핵심 감정 목표: (독자가 이 화를 읽고 느껴야 할 감정 1가지)
2. 오프닝 훅: (첫 문단을 어떻게 시작할지 — 배경 설명 없이 바로 장면/대사로)
3. 장면 구성:
   - 장면1: [장소] [상황] [원하는 것] [방해 요소] [시작 문장 아이디어]
   - 장면2: [장소] [상황] [원하는 것] [방해 요소] [시작 문장 아이디어]
   - 장면3: [감정 클라이맥스 장면]
4. 캐릭터 말투 확정 (이후 집필에서 절대 바꾸지 말 것):
   - 각 주요 캐릭터: 말투 특징 / 절대 쓰지 않는 표현 / 대표 예시 대사 1줄
   - 두 인물 사이 대화 톤 (긴장/부드러움/적대감 등)
   - 감정이 격해져도 말투 자체는 바뀌지 않음. 말투가 아니라 내용으로 감정 표현
5. 감정 흐름: 시작 → 전환점 → 끝
6. 마지막 문장 아이디어: (다음 화가 보고 싶어지는 훅)
7. 절대 쓰면 안 되는 전개 2가지`;

      const planRes = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: planPrompt, tokens: 800 }) });
      const planData = await planRes.json();
      if (planData.error) throw new Error(planData.error);
      const episodePlan = planData.text;

      const writePrompt = `너는 한국 장르소설 전문 작가다. 독자를 사로잡는 웹소설을 써라.

<회차설계>
${episodePlan}
</회차설계>

<작품정보>
장르: ${selectedGenre?.label || "자유"}
${seriesTitle ? `시리즈: ${seriesTitle}` : ""}
태그: ${selectedTags.length > 0 ? selectedTags.join(", ") : "없음"}
${backgroundInfo ? `배경: ${backgroundInfo}` : ""}
시점: ${povLabel}
수위: ${ratingLabel}
${synopsis ? `작가 메모: ${synopsis}` : ""}
${charDesc ? `등장인물:\n${charDesc}` : ""}
</작품정보>

<문체규칙>
${styleGuide}
</문체규칙>

<캐릭터말투규칙 — 최우선>
위 회차설계의 4번 말투 확정을 반드시 따를 것.
- 한 캐릭터의 말투는 첫 대사부터 마지막 대사까지 100% 동일하게 유지
- 존댓말/반말 혼용 절대 금지
- 감정이 격해져도 말투 자체는 유지. 내용으로만 감정 표현
- 캐릭터가 절대 하지 않을 말은 쓰지 말 것
</캐릭터말투규칙>

<출력규칙>
- 제목을 첫 줄에 써라. 제목에 #, *, -, 번호 등 기호 절대 금지
- 제목 한 줄 → 빈 줄 → 본문 시작
- 분량: 최소 6000자. 장면이 부족하면 새 장면을 추가해서 채워라. 절대 요약하지 말 것
- 오프닝: 행동이나 대사로 바로 시작. 배경 설명으로 시작 금지
- 이름이 없는 캐릭터는 AI가 직접 이름을 정해서 쓸 것
- 반드시 완성된 문장으로 끝낼 것
- 소설 본문만 출력. 메모, 설명, 해설 절대 금지
</출력규칙>`;

      const writeRes = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: writePrompt, tokens: 4000 }) });
      const writeData = await writeRes.json();
      if (writeData.error) throw new Error(writeData.error);
      setNovel(writeData.text); setEditedNovel(writeData.text);

      const synopsisPrompt = `너는 웹소설 편집자다. 아래 소설을 읽고 독자를 사로잡는 작품소개를 써라.
규칙: 2~3문장, 스포일러 없이 분위기와 감정선만 암시, "읽고 싶다"는 느낌, 상투적 표현 금지, 소개글만 출력.
소설: ${writeData.text.slice(0, 1000)}`;
      const synRes = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: synopsisPrompt, tokens: 300 }) });
      const synData = await synRes.json();
      if (!synData.error) setGeneratedSynopsis(synData.text.trim());

      if (!seriesTitle.trim()) {
        const titlePrompt = `웹소설 제목 전문가로서, 아래 소설에 어울리는 세련된 시리즈 제목을 지어라.
규칙: 5~15자, 감성적이고 여운이 남는 한국어, 좋은예("그날 밤 우리가 선택한 것","봄이 오면 당신을 잊겠습니다"), 나쁜예("로맨스1화","사랑이야기"), 제목만 한 줄 출력.
소설: ${writeData.text.slice(0, 400)}`;
        const titleRes = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: titlePrompt, tokens: 50 }) });
        const titleData = await titleRes.json();
        if (!titleData.error) setSeriesTitle(titleData.text.trim().replace(/["'「」『』]/g, ""));
      }
    } catch (e: any) { setError("오류: " + e.message); setStep("form"); }
    finally { setLoading(false); }
  }

  async function generateNextEpisode() {
    const currentText = isEditing ? editedNovel : novel;
    if (user && currentText.trim()) {
      const novelTitle = title || currentText.split("\n")[0] || "제목 없음";
      const sid = currentSeriesId || crypto.randomUUID();
      if (!currentSeriesId) setCurrentSeriesId(sid);
      const { data: existing } = await supabase.from("novels").select("id").eq("series_id", sid).eq("episode_number", currentEpisode).maybeSingle();
      if (existing) { await supabase.from("novels").update({ content: currentText, title: novelTitle, is_public: isPublic, synopsis: synopsis || null }).eq("id", existing.id); }
      else { await supabase.from("novels").insert({ user_id: user.id, title: novelTitle, content: currentText, genre: selectedGenre?.label || "", tags: selectedTags.join(", "), is_public: isPublic, views: 0, series_id: sid, episode_number: currentEpisode, series_title: seriesTitle || novelTitle, synopsis: synopsis || null, created_at: new Date().toISOString() }); }
    }
    const nextEp = currentEpisode + 1;
    setCurrentEpisode(nextEp); setNovel(""); setEditedNovel(""); setIsEditing(false); setSaveMsg(""); setLoading(true);

    const styleGuide = getStyleGuide();
    const prevSummary = (isEditing ? editedNovel : novel).slice(-800);

    try {
      const planPrompt = `너는 연재 장르소설 회차 설계 전문가다.

<이전화내용(마지막부분)>
${prevSummary}
</이전화내용>

<작품정보>
장르: ${selectedGenre?.label || "자유"}
태그: ${selectedTags.join(", ") || "없음"}
시리즈: ${seriesTitle || ""}
</작품정보>

위 내용에서 자연스럽게 이어지는 ${nextEp}화 설계를 해라.
1. 이번 화 핵심 목표 (이전 화에서 이어지는 감정/사건)
2. 장면 구성 3~4개 (새로운 장면으로 시작, 이전 내용 반복 금지)
3. 감정 흐름
4. 캐릭터 말투 확정 (이후 집필에서 절대 바꾸지 말 것):
   - 각 주요 캐릭터: 말투 특징 / 절대 쓰지 않는 표현 / 대표 예시 대사 1줄
   - 두 인물 사이 대화 톤 (긴장/부드러움/적대감 등)
   - 감정이 격해져도 말투 자체는 바뀌지 않음. 말투가 아니라 내용으로 감정 표현
5. 마지막 훅 한 줄
6. 절대 쓰면 안 되는 전개 2가지`;

      const planRes = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: planPrompt, tokens: 500 }) });
      const planData = await planRes.json();
      if (planData.error) throw new Error(planData.error);

      const writePrompt = `너는 한국 장르소설 전문 작가다.

<이전화내용(마지막부분)>
${prevSummary}
</이전화내용>

<${nextEp}화설계>
${planData.text}
</${nextEp}화설계>

<문체규칙>
${styleGuide}
</문체규칙>

<캐릭터말투규칙 — 최우선>
위 회차설계의 4번 말투 확정을 반드시 따를 것.
- 한 캐릭터의 말투는 첫 대사부터 마지막 대사까지 100% 동일하게 유지
- 존댓말/반말 혼용 절대 금지
- 감정이 격해져도 말투 자체는 유지. 내용으로만 감정 표현
- 캐릭터가 절대 하지 않을 말은 쓰지 말 것
</캐릭터말투규칙>

<출력규칙>
- 이전 화 내용을 반복하지 말고 새로운 장면으로 시작
- 제목을 첫 줄에 써라. 제목에 #, *, -, 번호 등 기호 절대 금지
- 제목 한 줄 → 빈 줄 → 본문 시작
- 분량: 최소 5000자. 장면이 부족하면 새 장면을 추가해서 채워라. 절대 요약하지 말 것
- 반드시 완성된 문장으로 끝낼 것
- 소설 본문만 출력
</출력규칙>`;

      const writeRes = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: writePrompt, tokens: 4000 }) });
      const writeData = await writeRes.json();
      if (writeData.error) throw new Error(writeData.error);
      setNovel(writeData.text); setEditedNovel(writeData.text);
    } catch (e: any) { setError("오류: " + e.message); }
    finally { setLoading(false); }
  }

  async function continueFromLibrary(n: Novel) {
    if (n.series_id) {
      const nextEpNum = (n.episode_number || 1) + 1;
      const { data: nextEp } = await supabase.from("novels").select("*").eq("series_id", n.series_id).eq("episode_number", nextEpNum).maybeSingle();
      if (nextEp) { openNovel(nextEp, true); return; }
    }
    const prevContent = n.content;
    const nextEp = (n.episode_number || 1) + 1;
    setCurrentSeriesId(n.series_id || null); setCurrentEpisode(nextEp); setSeriesTitle(n.series_title || "");
    setNovel(""); setEditedNovel(""); setIsEditing(false); setSaveMsg("");
    setStep("result"); setView("create"); setReadingNovel(null); setLoading(true);

    const prevSummary = prevContent.slice(-800);
    const genreLabel = n.genre || "자유";

    try {
      const planPrompt = `너는 연재 장르소설 회차 설계 전문가다.

<이전화내용(마지막부분)>
${prevSummary}
</이전화내용>

<작품정보>
장르: ${genreLabel}
시리즈: ${n.series_title || ""}
태그: ${n.tags || "없음"}
</작품정보>

위 내용에서 자연스럽게 이어지는 ${nextEp}화 설계:
1. 이번 화 핵심 목표
2. 장면 구성 3~4개
3. 감정 흐름
4. 캐릭터 말투 확정 (이후 집필에서 절대 바꾸지 말 것):
   - 각 주요 캐릭터: 말투 특징 / 절대 쓰지 않는 표현 / 대표 예시 대사 1줄
   - 두 인물 사이 대화 톤 (긴장/부드러움/적대감 등)
   - 감정이 격해져도 말투 자체는 바뀌지 않음. 말투가 아니라 내용으로 감정 표현
5. 마지막 훅 한 줄
6. 절대 쓰면 안 되는 전개 2가지`;

      const planRes = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: planPrompt, tokens: 500 }) });
      const planData = await planRes.json();
      if (planData.error) throw new Error(planData.error);

      const styleGuide = getStyleGuide();
      const writePrompt = `너는 한국 장르소설 전문 작가다.

<이전화내용(마지막부분)>
${prevSummary}
</이전화내용>

<${nextEp}화설계>
${planData.text}
</${nextEp}화설계>

<문체규칙>
${styleGuide}
</문체규칙>

<캐릭터말투규칙 — 최우선>
위 회차설계의 4번 말투 확정을 반드시 따를 것.
- 한 캐릭터의 말투는 첫 대사부터 마지막 대사까지 100% 동일하게 유지
- 존댓말/반말 혼용 절대 금지
- 감정이 격해져도 말투 자체는 유지. 내용으로만 감정 표현
- 캐릭터가 절대 하지 않을 말은 쓰지 말 것
</캐릭터말투규칙>

<출력규칙>
- 이전 화 내용을 반복하지 말고 새로운 장면으로 시작
- 제목을 첫 줄에 써라. 제목에 #, *, -, 번호 등 기호 절대 금지
- 제목 한 줄 → 빈 줄 → 본문 시작
- 분량: 최소 5000자. 장면이 부족하면 새 장면을 추가해서 채워라. 절대 요약하지 말 것
- 반드시 완성된 문장으로 끝낼 것
- 소설 본문만 출력
</출력규칙>`;

      const writeRes = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: writePrompt, tokens: 4000 }) });
      const writeData = await writeRes.json();
      if (writeData.error) throw new Error(writeData.error);
      setNovel(writeData.text); setEditedNovel(writeData.text);
    } catch (e: any) { setError("오류: " + e.message); }
    finally { setLoading(false); }
  }

  function editFromLibrary(n: Novel) {
    setNovel(n.content); setEditedNovel(n.content); setIsEditing(true);
    setCurrentSeriesId(n.series_id || null); setCurrentEpisode(n.episode_number || 1);
    setSeriesTitle(n.series_title || "");
    setStep("result"); setView("create"); setReadingNovel(null); setSeriesDetail(null);
  }

  async function toggleSeriesPublic(seriesId: string, novelId: string, makePublic: boolean) {
    setSeriesDetail(prev => {
      if (!prev) return prev;
      return { ...prev, _episodes: (prev._episodes || []).map(ep => ({ ...ep, is_public: makePublic })), is_public: makePublic };
    });
    if (seriesId) await supabase.from("novels").update({ is_public: makePublic }).eq("series_id", seriesId);
    else await supabase.from("novels").update({ is_public: makePublic }).eq("id", novelId);
    fetchMyNovels();
  }

  async function toggleEpisodePublic(e: React.MouseEvent, id: string, current: boolean) {
    e.stopPropagation(); e.preventDefault();
    await supabase.from("novels").update({ is_public: !current }).eq("id", id);
    fetchMyNovels();
    if (readingNovel?.id === id) setReadingNovel({ ...readingNovel, is_public: !current });
    setReadingSeries(prev => prev.map(ep => ep.id === id ? { ...ep, is_public: !current } : ep));
  }

  async function deleteEpisode(id: string) {
    await supabase.from("novels").delete().eq("id", id);
    fetchMyNovels(); setShowDeleteModal(null);
    if (readingNovel?.id === id) setReadingNovel(null);
    setSeriesDetail(null);
  }

  async function deleteSeries(seriesId: string) {
    await supabase.from("novels").delete().eq("series_id", seriesId);
    fetchMyNovels(); setShowDeleteModal(null); setReadingNovel(null); setSeriesDetail(null);
  }

  async function uploadCover(file: File, seriesId: string, novelId?: string) {
    setCoverUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${seriesId}/cover.${ext}`;
    const { error } = await supabase.storage.from("novel-covers").upload(path, file, { upsert: true });
    if (error) { setCoverUploading(false); return null; }
    const { data } = supabase.storage.from("novel-covers").getPublicUrl(path);
    const url = data.publicUrl + "?t=" + Date.now();
    setCoverImage(url);
    await supabase.from("novels").update({ cover_image: url }).eq("series_id", seriesId);
    if (novelId) await supabase.from("novels").update({ cover_image: url }).eq("id", novelId);
    setMyNovels(prev => prev.map(n => {
      if (n.series_id === seriesId || n.id === novelId) return { ...n, cover_image: url, _episodes: n._episodes?.map(ep => ({ ...ep, cover_image: url })) };
      return n;
    }));
    setCoverUploading(false);
    return url;
  }

  function resetForm() {
    setStep("form"); setFormStep(1); setNovel(""); setEditedNovel(""); setIsEditing(false);
    setCurrentSeriesId(null); setCurrentEpisode(1); setSaveMsg("");
    setTitle(""); setSynopsis(""); setGeneratedSynopsis(""); setEditingSynopsis(false);
    setCoverImage(null); setCustomBackground("");
    setGenre(null); setSelectedBackground(null); setSelectedTags([]);
    setBlRole(null); setGlRole(null); setSelectedStyles([]); setEnding(null);
  }

  function toggleTag(tag: string) { setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]); }
  function addCustomTag() { const t = customTag.trim(); if (t && !selectedTags.includes(t)) setSelectedTags(prev => [...prev, t]); setCustomTag(""); }
  function addCharacter() { if (characters.length < 5) setCharacters(prev => [...prev, { id: Date.now(), name: "", desc: "", role: "조연", age: "", gender: "", relationship: "", tone: "" }]); }
  function removeCharacter(id: number) { setCharacters(prev => prev.filter(c => c.id !== id)); }
  function updateCharacter(id: number, field: keyof Character, value: string) { setCharacters(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c)); }
  function saveAsText() { const content = isEditing ? editedNovel : novel; const blob = new Blob([content], { type: "text/plain;charset=utf-8" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${seriesTitle || title || "소설"}_${currentEpisode}화.txt`; a.click(); URL.revokeObjectURL(url); }
  function copyToClipboard() { navigator.clipboard.writeText(isEditing ? editedNovel : novel).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }

  const isLastEpisode = readingSeries.length === 0 || (readingNovel?.episode_number ?? 0) >= Math.max(...readingSeries.map(e => e.episode_number || 0));

  return (
    <>
      <head>
        <meta name="google-site-verification" content="W7-hf9aHSK_uBpsABsS8vZ4Dj9vaM1Vi8oKGDlO4HH0" />
        <title>Novella - AI 웹소설 생성기</title>
        <meta name="description" content="AI가 대신 써주는 웹소설. BL, 로맨스, 판타지 무료 생성." />
      </head>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #120e1e; min-height: 100vh; overflow-x: hidden; }
        body::before {
          content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 80% 50% at 15% 0%, rgba(109,40,217,0.22) 0%, transparent 55%),
            radial-gradient(ellipse 60% 45% at 88% 100%, rgba(219,39,119,0.14) 0%, transparent 55%),
            radial-gradient(ellipse 45% 40% at 75% 20%, rgba(139,92,246,0.10) 0%, transparent 50%),
            linear-gradient(160deg, #1c1432 0%, #120e1e 50%, #0e0b1a 100%);
        }
        #app-root { position: relative; z-index: 1; }
        .page-shell { width: 100%; max-width: 480px; margin: 0 auto; }
        .fullscreen-overlay { position: fixed; inset: 0; z-index: 100; overflow-y: auto; -webkit-overflow-scrolling: touch; background: #120e1e; }
        .fullscreen-inner { max-width: 480px; margin: 0 auto; padding-bottom: 40px; }
        :root {
          --bg-base: #120e1e; --bg-input: #1e1830; --border: #332860; --border-hover: #6d4fc2;
          --text-primary: #f0ecfc; --text-secondary: #cdc5e8; --text-muted: #8878b0;
          --accent: #9b6dff; --accent-light: #d4bfff; --pink: #f472b6;
        }
        .section-title { font-size: 11px; font-weight: 700; color: var(--accent-light); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.12em; }
        .btn { border: none; border-radius: 12px; padding: 12px 16px; cursor: pointer; font-family: 'Noto Serif KR', serif; font-size: 14px; font-weight: 600; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; -webkit-tap-highlight-color: transparent; }
        .btn:active { transform: scale(0.97); }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-primary { background: linear-gradient(135deg, #7c3aed, #b06aff); color: #fff; box-shadow: 0 4px 24px rgba(124,58,237,0.4); }
        .btn-primary:hover { box-shadow: 0 6px 32px rgba(124,58,237,0.55); }
        .btn-outline { background: rgba(255,255,255,0.05); border: 1.5px solid var(--border); color: var(--text-secondary); }
        .btn-outline:hover { border-color: var(--border-hover); color: var(--text-primary); background: rgba(255,255,255,0.08); }
        .input-field { width: 100%; background: var(--bg-input); border: 1.5px solid var(--border); border-radius: 12px; padding: 12px 14px; color: var(--text-primary); font-family: 'Noto Serif KR', serif; font-size: 14px; outline: none; transition: all 0.2s; resize: vertical; -webkit-appearance: none; }
        .input-field:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(155,109,255,0.18); }
        .input-field::placeholder { color: var(--text-muted); }
        .tag-btn { border: 1.5px solid var(--border); background: rgba(255,255,255,0.04); color: var(--text-secondary); border-radius: 20px; padding: 5px 13px; cursor: pointer; font-family: 'Noto Serif KR', serif; font-size: 12px; transition: all 0.2s; white-space: nowrap; }
        .tag-btn:hover { border-color: var(--accent); color: var(--text-primary); background: rgba(155,109,255,0.12); }
        .tag-btn.selected { background: rgba(155,109,255,0.22); border-color: var(--accent); color: var(--accent-light); }
        .opt-btn { border: 1.5px solid var(--border); background: rgba(255,255,255,0.04); color: var(--text-secondary); border-radius: 12px; padding: 10px 8px; cursor: pointer; font-family: 'Noto Serif KR', serif; font-size: 13px; transition: all 0.2s; flex: 1; text-align: center; }
        .opt-btn:hover { border-color: var(--border-hover); color: var(--text-primary); background: rgba(255,255,255,0.07); }
        .opt-btn.selected { background: rgba(155,109,255,0.2); border-color: var(--accent); color: var(--accent-light); }
        .genre-btn { border: 1.5px solid var(--border); background: rgba(255,255,255,0.04); color: var(--text-secondary); border-radius: 12px; padding: 10px 6px; cursor: pointer; font-family: 'Noto Serif KR', serif; font-size: 13px; transition: all 0.2s; text-align: center; width: 100%; }
        .genre-btn:hover { border-color: var(--border-hover); color: var(--text-primary); background: rgba(255,255,255,0.07); }
        .genre-btn.selected { background: rgba(155,109,255,0.2); color: #fff; }
        .char-card { background: rgba(255,255,255,0.04); border: 1.5px solid var(--border); border-radius: 14px; padding: 14px; margin-bottom: 10px; }
        .nav-btn { background: transparent; border: none; color: var(--text-muted); font-family: 'Noto Serif KR', serif; font-size: 13px; cursor: pointer; padding: 10px 0; flex: 1; text-align: center; border-bottom: 2px solid transparent; transition: all 0.2s; }
        .nav-btn.active { color: var(--text-primary); border-bottom-color: var(--accent); }
        .tab-btn { background: transparent; border: none; border-bottom: 2px solid transparent; color: var(--text-muted); font-family: 'Noto Serif KR', serif; font-size: 14px; cursor: pointer; padding: 10px 16px; transition: all 0.2s; }
        .tab-btn.active { border-bottom-color: var(--accent); color: var(--text-primary); }
        .novel-editor { width: 100%; background: transparent; border: none; outline: none; color: var(--text-primary); font-family: 'Noto Serif KR', serif; font-size: 16px; line-height: 2.2; resize: none; font-weight: 300; min-height: 300px; }
        .section { margin-bottom: 24px; }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .shimmer-text { background: linear-gradient(90deg, #9b6dff, #f472b6, #d4bfff, #9b6dff); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 3s linear infinite; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fadeIn 0.35s ease forwards; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.25); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
        @media (max-width: 480px) { .genre-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>

      <div id="app-root" style={{ fontFamily: "'Noto Serif KR', serif", color: "#f0ecfc", minHeight: "100vh", maxWidth: 480, margin: "0 auto", width: "100%" }}>

        <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(18,14,30,0.88)", backdropFilter: "blur(18px)", borderBottom: "1px solid rgba(155,109,255,0.18)", padding: "0 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 54 }}>
            <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }} onClick={() => { setView("create"); resetForm(); }}>
              <span style={{ fontSize: 22, fontFamily: "'Playfair Display', serif", fontWeight: 700 }}><span className="shimmer-text">Novella</span></span>
              <span style={{ fontSize: 10, color: "#8878b0", letterSpacing: "0.2em" }}>노벨라</span>
            </div>
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "#cdc5e8", fontSize: 13, fontFamily: "'Noto Serif KR', serif" }} onClick={() => { setShowProfile(true); setNicknameInput(profile?.nickname || ""); }}>
                  👤 {profile?.nickname || user.email?.split("@")[0]}
                </button>
                <button className="btn btn-outline" style={{ padding: "6px 10px", fontSize: 12 }} onClick={handleLogout}>로그아웃</button>
              </div>
            ) : (
              <button className="btn btn-primary" style={{ padding: "7px 16px", fontSize: 13 }} onClick={() => setShowAuth(true)}>로그인</button>
            )}
          </div>
        </header>

        <nav style={{ display: "flex", borderBottom: "1px solid rgba(139,92,246,0.12)", background: "rgba(10,8,18,0.6)", backdropFilter: "blur(8px)" }}>
          <button className={`nav-btn${view === "create" ? " active" : ""}`} onClick={() => setView("create")}>✍️ 글쓰기</button>
          <button className={`nav-btn${view === "explore" ? " active" : ""}`} onClick={() => setView("explore")}>🔍 둘러보기</button>
          <button className={`nav-btn${view === "library" ? " active" : ""}`} onClick={() => setView("library")}>📚 서재</button>
        </nav>

        {showAuth && (
          <AuthModal
            authMode={authMode} setAuthMode={setAuthMode}
            email={email} setEmail={setEmail}
            password={password} setPassword={setPassword}
            authError={authError} authLoading={authLoading}
            onClose={() => setShowAuth(false)}
            onAuth={handleAuth}
            onGoogleLogin={handleGoogleLogin}
          />
        )}

        {showPayment && (
          <PaymentModal
            plan="day"
            onClose={() => setShowPayment(false)}
            onSuccess={() => {
              setShowPayment(false);
              const today = new Date().toDateString();
              localStorage.setItem("novella_gen", JSON.stringify({ date: today, count: 0 }));
            }}
          />
        )}

        {showProfile && (
          <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowProfile(false)}>
            <div style={{ background: "rgba(28,21,48,0.9)", borderRadius: "20px 20px 0 0", padding: "28px 20px 40px", width: "100%", maxWidth: 480 }} onClick={e => e.stopPropagation()}>
              <div style={{ width: 36, height: 4, background: "#2e2048", borderRadius: 2, margin: "0 auto 24px" }} />
              <h2 style={{ marginBottom: 8, fontSize: 18, fontWeight: 600, textAlign: "center" }}>프로필</h2>
              <div style={{ fontSize: 12, color: "#6a5a8a", textAlign: "center", marginBottom: 20 }}>{user?.email}</div>
              <input className="input-field" style={{ marginBottom: 16 }} placeholder="닉네임" value={nicknameInput} onChange={e => setNicknameInput(e.target.value)} />
              <button className="btn btn-primary" style={{ width: "100%", padding: 14 }} onClick={saveNickname} disabled={nicknameSaving}>
                {nicknameSaving ? <><span className="spinner" /> 저장 중...</> : "저장"}
              </button>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowDeleteModal(null)}>
            <div style={{ background: "rgba(28,21,48,0.9)", borderRadius: 16, padding: 24, width: "100%", maxWidth: 360 }} onClick={e => e.stopPropagation()}>
              <h3 style={{ marginBottom: 8, fontSize: 16, fontWeight: 600 }}>삭제 선택</h3>
              <p style={{ fontSize: 13, color: "#7a6a9a", marginBottom: 20 }}>"{showDeleteModal.series_title || showDeleteModal.title}"를 어떻게 삭제할까요?</p>
              {showDeleteModal._episodes && showDeleteModal._episodes.length > 1 && (
                <>
                  <p style={{ fontSize: 13, color: "#b8aed0", marginBottom: 8 }}>특정 화만 삭제:</p>
                  {showDeleteModal._episodes.map(ep => (
                    <button key={ep.id} style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "1px solid #2e2048", borderRadius: 8, padding: "8px 12px", color: "#a89ec0", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 13, marginBottom: 6 }}
                      onClick={() => { if (confirm(`${ep.episode_number}화를 삭제할까요?`)) deleteEpisode(ep.id); }}>
                      {ep.episode_number}화. {ep.title}
                    </button>
                  ))}
                  <button style={{ width: "100%", padding: "10px", background: "#3d1f1f", border: "1px solid #f87171", borderRadius: 10, color: "#f87171", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 14, marginBottom: 8 }}
                    onClick={() => { if (confirm("시리즈 전체를 삭제할까요?")) deleteSeries(showDeleteModal.series_id!); }}>
                    🗑️ 시리즈 전체 삭제
                  </button>
                </>
              )}
              {(!showDeleteModal._episodes || showDeleteModal._episodes.length <= 1) && (
                <button style={{ width: "100%", padding: "10px", background: "#3d1f1f", border: "1px solid #f87171", borderRadius: 10, color: "#f87171", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 14, marginBottom: 8 }}
                  onClick={() => deleteEpisode(showDeleteModal.id)}>🗑️ 삭제</button>
              )}
              <button style={{ width: "100%", padding: "10px", background: "transparent", border: "1px solid #2e2048", borderRadius: 10, color: "#7a6a9a", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 14 }}
                onClick={() => setShowDeleteModal(null)}>취소</button>
            </div>
          </div>
        )}

        {seriesDetail && !readingNovel && (
          <SeriesDetail
            seriesDetail={seriesDetail}
            showToc={showToc} setShowToc={setShowToc}
            coverUploading={coverUploading}
            onBack={() => setSeriesDetail(null)}
            onOpenEpisode={openNovel}
            onToggleFavorite={toggleFavorite}
            onToggleSeriesPublic={toggleSeriesPublic}
            onUploadCover={uploadCover}
            onContinueFromLibrary={continueFromLibrary}
            onEditFromLibrary={editFromLibrary}
            onShowDeleteModal={setShowDeleteModal}
            setSeriesDetail={setSeriesDetail}
          />
        )}

        {readingNovel && (
          <ReadingView
            readingNovel={readingNovel}
            readingSeries={readingSeries}
            isMyNovel={isMyNovel}
            isLastEpisode={isLastEpisode}
            comments={comments}
            commentText={commentText} setCommentText={setCommentText}
            commentLoading={commentLoading}
            user={user}
            onBack={() => setReadingNovel(null)}
            onOpenEpisode={openNovel}
            onSubmitComment={submitComment}
            onDeleteComment={deleteComment}
            onEdit={(n) => { editFromLibrary(n); setSeriesDetail(null); }}
            onContinue={continueFromLibrary}
            onShowAuth={() => setShowAuth(true)}
          />
        )}

        <main style={{ padding: "16px 16px 100px" }}>
          {view === "create" && (
            <>
              {step === "form" && (
                <div className="fade-in">
                  {currentSeriesId && (
                    <div style={{ background: "rgba(28,21,48,0.9)", border: "1px solid #7c3aed", borderRadius: 10, padding: "10px 14px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 11, color: "#7c3aed", marginBottom: 2 }}>연재 중</div>
                        <div style={{ fontSize: 14, color: "#b8aed0" }}>{seriesTitle || "제목 없음"} — {currentEpisode}화 작성 중</div>
                      </div>
                      <button style={{ background: "none", border: "none", color: "#6a5a8a", cursor: "pointer", fontSize: 12, fontFamily: "'Noto Serif KR', serif" }} onClick={resetForm}>새 작품</button>
                    </div>
                  )}

                  <div style={{ display: "flex", marginBottom: 24, gap: 0, borderRadius: 12, overflow: "hidden", border: "1px solid #2e2048" }}>
                    {[{ n: 1, label: "장르 설정" }, { n: 2, label: "캐릭터" }, { n: 3, label: "문체·줄거리" }].map(({ n, label }) => (
                      <button key={n}
                        style={{ flex: 1, padding: "10px 4px", background: formStep === n ? "#2d1f4e" : "rgba(19,16,32,0.8)", border: "none", borderRight: n < 3 ? "1px solid #2e2048" : "none", color: formStep === n ? "#c4b8ff" : "#6a5a8a", fontSize: 12, cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontWeight: formStep === n ? 600 : 400, transition: "all 0.2s" }}
                        onClick={() => setFormStep(n)}>
                        <div style={{ fontSize: 10, marginBottom: 2, color: formStep === n ? "#7c3aed" : "#3a2a4a" }}>{n}단계</div>
                        {label}
                      </button>
                    ))}
                  </div>

                  {formStep === 1 && (
                    <div>
                      <div className="section">
                        <div className="section-title">시리즈 제목</div>
                        <input className="input-field" placeholder="비우면 AI가 정해요" value={seriesTitle} onChange={e => setSeriesTitle(e.target.value)} />
                      </div>
                      <div className="section">
                        <div className="section-title">장르 (필수)</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                          {GENRES.map(g => (
                            <button key={g.id}
                              style={{ border: `1.5px solid ${genre === g.id ? g.color : "#2e2048"}`, background: genre === g.id ? "#221738" : "rgba(28,21,48,0.9)", color: genre === g.id ? "#fff" : "#b8aed0", borderRadius: 12, padding: "12px 8px", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 14, transition: "all 0.2s", boxShadow: genre === g.id ? `0 0 12px ${g.color}44` : "none" }}
                              onClick={() => {
                                const newGenre = genre === g.id ? null : g.id;
                                setGenre(newGenre);
                                setSelectedTags([]); setSelectedBackground(null); setBlRole(null); setGlRole(null);
                                if (newGenre === "bl") {
                                  setCharacters([
                                    { id: 1, name: "", desc: "", role: "공", age: "", gender: "", relationship: "", tone: "" },
                                    { id: 2, name: "", desc: "", role: "수", age: "", gender: "", relationship: "", tone: "" },
                                  ]);
                                } else if (newGenre === "romance") {
                                  setCharacters([
                                    { id: 1, name: "", desc: "", role: "여주", age: "", gender: "여성", relationship: "", tone: "" },
                                    { id: 2, name: "", desc: "", role: "남주", age: "", gender: "남성", relationship: "", tone: "" },
                                  ]);
                                } else if (newGenre === "gl") {
                                  setCharacters([
                                    { id: 1, name: "", desc: "", role: "주인공1", age: "", gender: "", relationship: "", tone: "" },
                                    { id: 2, name: "", desc: "", role: "주인공2", age: "", gender: "", relationship: "", tone: "" },
                                  ]);
                                } else if (newGenre) {
                                  setCharacters([{ id: 1, name: "", desc: "", role: "주인공", age: "", gender: "", relationship: "", tone: "" }]);
                                }
                              }}>
                              {g.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {genre && BACKGROUNDS[genre] && (
                        <div className="section">
                          <div className="section-title">배경</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 8 }}>
                            {BACKGROUNDS[genre].map(bg => (
                              <button key={bg} className={`tag-btn${selectedBackground === bg ? " selected" : ""}`} onClick={() => setSelectedBackground(selectedBackground === bg ? null : bg)}>{bg}</button>
                            ))}
                          </div>
                          <input className="input-field" style={{ resize: "none", fontSize: 13 }} placeholder="직접 입력 (예: 조선시대 궁궐, 미래 도시)" value={customBackground} onChange={e => setCustomBackground(e.target.value)} />
                        </div>
                      )}

                      {genre && GENRE_TAGS[genre] && (
                        <div className="section">
                          <div className="section-title">클리셰 / 태그</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>
                            {GENRE_TAGS[genre].map(tag => (
                              <button key={tag} className={`tag-btn${selectedTags.includes(tag) ? " selected" : ""}`} onClick={() => toggleTag(tag)}>{tag}</button>
                            ))}
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <input className="input-field" style={{ resize: "none" }} placeholder="직접 입력 후 엔터" value={customTag} onChange={e => setCustomTag(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomTag(); } }} />
                            <button className="btn btn-outline" onClick={addCustomTag} style={{ whiteSpace: "nowrap", flexShrink: 0 }}>추가</button>
                          </div>
                          {selectedTags.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                              {selectedTags.map(tag => (
                                <span key={tag} onClick={() => toggleTag(tag)} style={{ background: "rgba(45,31,78,0.9)", border: "1px solid #7c3aed", borderRadius: 20, padding: "4px 10px", fontSize: 12, color: "#c4b8ff", cursor: "pointer" }}>{tag} ✕</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <button className="btn btn-primary" style={{ width: "100%", padding: 14, fontSize: 15, borderRadius: 12 }} onClick={() => setFormStep(2)} disabled={!genre}>
                        다음 → 캐릭터 설정
                      </button>
                    </div>
                  )}

                  {formStep === 2 && (
                    <div>
                      <div className="section">
                        <div className="section-title">
                          {genre === "bl" ? "등장인물 (공/수 역할 지정)" : genre === "gl" ? "등장인물 (두 주인공)" : "등장인물"}
                        </div>
                        {characters.map((char, idx) => (
                          <div key={char.id} className="char-card">
                            <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                              {genre === "bl" ? (
                                <select value={char.role} onChange={e => updateCharacter(char.id, "role", e.target.value)}
                                  style={{ background: "rgba(45,31,78,0.9)", border: "1px solid #818cf8", borderRadius: 6, padding: "5px 8px", color: "#c4b8ff", fontFamily: "'Noto Serif KR', serif", fontSize: 12, flexShrink: 0 }}>
                                  <option value="공">공</option>
                                  <option value="수">수</option>
                                  <option value="조연">조연</option>
                                </select>
                              ) : genre === "gl" ? (
                                <select value={char.role} onChange={e => updateCharacter(char.id, "role", e.target.value)}
                                  style={{ background: "rgba(45,31,78,0.9)", border: "1px solid #c084fc", borderRadius: 6, padding: "5px 8px", color: "#e9d5ff", fontFamily: "'Noto Serif KR', serif", fontSize: 12, flexShrink: 0 }}>
                                  <option value="주인공1">주인공1</option>
                                  <option value="주인공2">주인공2</option>
                                  <option value="조연">조연</option>
                                </select>
                              ) : (
                                <span style={{ background: "rgba(45,31,78,0.9)", border: "1px solid #7c3aed", borderRadius: 6, padding: "5px 10px", color: "#c4b8ff", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Noto Serif KR', serif" }}
                                  onClick={() => updateCharacter(char.id, "role", char.role === "주인공" ? "조연" : "주인공")}>{char.role} ↕</span>
                              )}
                              <input className="input-field" style={{ flex: 1 }} placeholder="이름 (비우면 AI가 정해요)" value={char.name} onChange={e => updateCharacter(char.id, "name", e.target.value)} />
                              {idx > 0 && <button style={{ background: "transparent", border: "1px solid #3d1f1f", color: "#f87171", borderRadius: 6, padding: "5px 8px", cursor: "pointer", fontSize: 11, fontFamily: "'Noto Serif KR', serif", flexShrink: 0 }} onClick={() => removeCharacter(char.id)}>삭제</button>}
                            </div>

                            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                              {AGE_OPTIONS.map(a => (
                                <button key={a}
                                  style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${char.age === a ? accentColor : "#2e2048"}`, background: char.age === a ? "#2d1f4e" : "rgba(28,21,48,0.9)", color: char.age === a ? "#c4b8ff" : "#7a6a9a", fontSize: 11, cursor: "pointer", fontFamily: "'Noto Serif KR', serif", transition: "all 0.15s" }}
                                  onClick={() => updateCharacter(char.id, "age", char.age === a ? "" : a)}>{a}</button>
                              ))}
                              <span style={{ width: "100%", height: 0 }} />
                              {GENDER_OPTIONS.map(g => (
                                <button key={g}
                                  style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${char.gender === g ? accentColor : "#2e2048"}`, background: char.gender === g ? "#2d1f4e" : "rgba(28,21,48,0.9)", color: char.gender === g ? "#c4b8ff" : "#7a6a9a", fontSize: 11, cursor: "pointer", fontFamily: "'Noto Serif KR', serif", transition: "all 0.15s" }}
                                  onClick={() => updateCharacter(char.id, "gender", char.gender === g ? "" : g)}>{g}</button>
                              ))}
                            </div>

                            {idx > 0 && (
                              <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                                <div style={{ width: "100%", fontSize: 10, color: "#8878b0", marginBottom: 2 }}>주인공과의 관계</div>
                                {RELATIONSHIP_OPTIONS.map(r => (
                                  <button key={r.id}
                                    style={{ padding: "4px 12px", borderRadius: 20, border: `1px solid ${char.relationship === r.id ? accentColor : "#2e2048"}`, background: char.relationship === r.id ? "#2d1f4e" : "rgba(28,21,48,0.9)", color: char.relationship === r.id ? "#c4b8ff" : "#7a6a9a", fontSize: 11, cursor: "pointer", fontFamily: "'Noto Serif KR', serif", transition: "all 0.15s" }}
                                    onClick={() => updateCharacter(char.id, "relationship", char.relationship === r.id ? "" : r.id)}>{r.label}</button>
                                ))}
                              </div>
                            )}

                            {/* 말투 */}
                            <input
                              className="input-field"
                              style={{ marginBottom: 8 }}
                              placeholder="말투 (예: 냉소적이고 짧게 말함, 존댓말 유지, 빈정대는 어투)"
                              value={char.tone}
                              onChange={e => updateCharacter(char.id, "tone", e.target.value)}
                            />

                            {/* 특징 */}
                            <textarea className="input-field" rows={2}
                              placeholder={genre === "bl" ? "성격, 외모, 특징 (예: 차갑고 도도한 재벌 3세)" : "성격, 외모, 특징"}
                              value={char.desc} onChange={e => updateCharacter(char.id, "desc", e.target.value)} />
                          </div>
                        ))}
                        {characters.length < 5 && <button className="btn btn-outline" onClick={addCharacter} style={{ width: "100%", marginTop: 4 }}>+ 캐릭터 추가</button>}
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-outline" style={{ flex: 1, padding: 14 }} onClick={() => setFormStep(1)}>← 이전</button>
                        <button className="btn btn-primary" style={{ flex: 2, padding: 14, fontSize: 15 }} onClick={() => setFormStep(3)}>다음 → 문체·줄거리</button>
                      </div>
                    </div>
                  )}

                  {formStep === 3 && (
                    <div>
                      <div className="section">
                        <div className="section-title">이번 화 제목</div>
                        <input className="input-field" placeholder="비우면 AI가 정해요" value={title} onChange={e => setTitle(e.target.value)} />
                      </div>
                      <div className="section">
                        <div className="section-title">줄거리 / 배경 설명</div>
                        <textarea className="input-field" rows={4} placeholder={
                          genre === "bl" ? "예: 차갑고 오만한 선배와 매일 부딪히던 후배가 어느 날 학교 옥상에서 비를 피하게 되고..." :
                          genre === "gl" ? "예: 전직 형사인 그녀와 용의자인 그녀가 같은 셰어하우스에 살게 되면서..." :
                          "예: 기억을 잃고 낯선 도시에서 깨어난 그녀, 유일한 단서는 낯선 이름이 적힌 열쇠뿐이었다"
                        } value={synopsis} onChange={e => setSynopsis(e.target.value)} />
                      </div>
                      <div className="section">
                        <div className="section-title">문체 (최대 2개 선택)</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {STYLES.map(s => {
                            const selected = selectedStyles.includes(s.id);
                            return (
                              <button key={s.id}
                                style={{ flex: "1 1 40%", border: `1.5px solid ${selected ? accentColor : "#332860"}`, background: selected ? "rgba(155,109,255,0.18)" : "rgba(255,255,255,0.04)", color: selected ? "#d4bfff" : "#cdc5e8", borderRadius: 12, padding: "10px 8px", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 13, transition: "all 0.2s", textAlign: "center" }}
                                onClick={() => {
                                  if (selected) setSelectedStyles(prev => prev.filter(id => id !== s.id));
                                  else if (selectedStyles.length < 2) setSelectedStyles(prev => [...prev, s.id]);
                                }}>
                                <div>{s.label}</div>
                                <div style={{ fontSize: 10, color: selected ? "#a78bfa" : "#8878b0", marginTop: 2 }}>{s.desc}</div>
                              </button>
                            );
                          })}
                        </div>
                        {selectedStyles.length >= 2 && <div style={{ fontSize: 11, color: "#8878b0", marginTop: 6, textAlign: "center" }}>최대 2개까지 선택 가능해요</div>}
                      </div>
                      <div className="section">
                        <div className="section-title">결말 방향</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          {ENDINGS.map(e => (
                            <button key={e.id} className={`opt-btn${ending === e.id ? " selected" : ""}`} style={ending === e.id ? { borderColor: accentColor } : {}} onClick={() => setEnding(ending === e.id ? null : e.id)}>{e.label}</button>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                        <div style={{ flex: 1 }}>
                          <div className="section-title">시점</div>
                          <div style={{ display: "flex", gap: 8 }}>
                            {POVS.map(p => (
                              <button key={p.id} className={`opt-btn${pov === p.id ? " selected" : ""}`} style={pov === p.id ? { borderColor: accentColor } : {}} onClick={() => setPov(p.id)}>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>{p.label}</div>
                                <div style={{ fontSize: 10, color: "#7a6a9a" }}>{p.desc}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="section-title">수위</div>
                          <div style={{ display: "flex", gap: 8 }}>
                            {RATINGS.map(r => (
                              <button key={r.id} className={`opt-btn${rating === r.id ? " selected" : ""}`} style={rating === r.id ? { borderColor: r.id === "adult" ? "#f87171" : accentColor } : {}} onClick={() => setRating(r.id)}>
                                <div style={{ fontWeight: 600, fontSize: 12, color: r.id === "adult" && rating === r.id ? "#fca5a5" : "inherit" }}>{r.label}</div>
                                <div style={{ fontSize: 10, color: "#7a6a9a" }}>{r.desc}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      {error && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 16, textAlign: "center" }}>⚠️ {error}</div>}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-outline" style={{ flex: 1, padding: 14 }} onClick={() => setFormStep(2)}>← 이전</button>
                        <button className="btn btn-primary" style={{ flex: 2, padding: 16, fontSize: 16, borderRadius: 14 }} onClick={generateNovel} disabled={loading || !genre}>
                          {loading ? <><span className="spinner" /> 생성 중...</> : `✨ ${currentEpisode}화 생성하기`}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === "result" && (
                <div className="fade-in">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingTop: 8 }}>
                    <button className="btn btn-outline" style={{ padding: "8px 14px", fontSize: 13 }} onClick={resetForm}>← 처음으로</button>
                    <div style={{ fontSize: 13, color: "#7c3aed", fontWeight: 600 }}>{currentEpisode}화</div>
                    <button className="btn btn-outline" style={{ padding: "8px 14px", fontSize: 13, borderColor: isEditing ? accentColor : "#2e2048", color: isEditing ? accentColor : "#a89ec0" }}
                      onClick={() => { if (isEditing) setNovel(editedNovel); else setEditedNovel(novel); setIsEditing(!isEditing); }} disabled={loading}>
                      {isEditing ? "✅ 완료" : "✏️ 편집"}
                    </button>
                  </div>
                  <div style={{ background: "rgba(19,16,32,0.8)", border: `1.5px solid ${isEditing ? accentColor + "66" : "#2e2048"}`, borderRadius: 16, padding: "24px 20px" }}>
                    {loading && <div style={{ textAlign: "center", padding: "40px 0", color: "#6a5a8a" }}>
                      <div style={{ fontSize: 28, marginBottom: 12 }}>✍️</div>
                      <div style={{ marginBottom: 8 }}>이야기를 구성하고 있어요...</div>
                      <div style={{ fontSize: 12, color: "#3a2a4a" }}>설계 → 집필 2단계로 더 좋은 글을 써드릴게요</div>
                    </div>}
                    {!loading && isEditing && <textarea className="novel-editor" value={editedNovel} onChange={e => setEditedNovel(e.target.value)} style={{ height: Math.max(300, editedNovel.split("\n").length * 36) }} />}
                    {!loading && !isEditing && novel && <div style={{ lineHeight: 2.2, fontSize: 16, color: "#e8e2f5", whiteSpace: "pre-wrap", fontWeight: 300 }}>{novel}</div>}
                  </div>

                  {!loading && novel && (
                    <>
                      {generatedSynopsis && (
                        <div style={{ margin: "14px 0", padding: "14px", background: "rgba(19,16,32,0.8)", borderRadius: 12, border: "1px solid #332860" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <div style={{ fontSize: 11, color: "#d4bfff", fontWeight: 700, letterSpacing: "0.1em" }}>✨ 작품 소개</div>
                            <button style={{ background: "none", border: "none", color: "#8878b0", fontSize: 11, cursor: "pointer", fontFamily: "'Noto Serif KR', serif" }} onClick={() => setEditingSynopsis(!editingSynopsis)}>
                              {editingSynopsis ? "완료" : "✏️ 수정"}
                            </button>
                          </div>
                          {editingSynopsis ? (
                            <textarea className="input-field" rows={3} value={generatedSynopsis} onChange={e => setGeneratedSynopsis(e.target.value)} style={{ fontSize: 13 }} />
                          ) : (
                            <div style={{ fontSize: 13, color: "#cdc5e8", lineHeight: 1.9 }}>{generatedSynopsis}</div>
                          )}
                        </div>
                      )}
                      <div style={{ margin: "14px 0", padding: "12px 14px", background: "rgba(19,16,32,0.8)", borderRadius: 10, border: "1px solid #2e2048" }}>
                        <div style={{ fontSize: 12, color: "#7a6a9a", marginBottom: 8 }}>🖼️ 시리즈 커버 이미지</div>
                        {coverImage ? (
                          <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
                            <img src={coverImage} alt="cover" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8 }} />
                            <button style={{ position: "absolute", top: 6, right: 6, background: "rgba(10,8,18,0.85)", border: "1px solid #2e2048", borderRadius: 6, color: "#f87171", fontSize: 11, padding: "3px 8px", cursor: "pointer", fontFamily: "'Noto Serif KR', serif" }} onClick={() => setCoverImage(null)}>삭제</button>
                          </div>
                        ) : (
                          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "10px", border: "1.5px dashed #2e2048", borderRadius: 8, color: "#6a5a8a", fontSize: 13 }}>
                            <input type="file" accept="image/*" style={{ display: "none" }}
                              onChange={async e => {
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
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, padding: "12px 14px", background: "rgba(19,16,32,0.8)", borderRadius: 10, border: "1px solid #2e2048" }}>
                        <label style={{ position: "relative", width: 44, height: 24, cursor: "pointer", flexShrink: 0 }}>
                          <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                          <span style={{ position: "absolute", inset: 0, background: isPublic ? "#7c3aed" : "#2e2048", borderRadius: 24, transition: "0.3s" }}>
                            <span style={{ position: "absolute", height: 18, width: 18, left: isPublic ? 23 : 3, bottom: 3, background: "white", borderRadius: "50%", transition: "0.3s" }} />
                          </span>
                        </label>
                        <span style={{ fontSize: 13, color: "#b8aed0" }}>{isPublic ? "🌍 이 화 공개" : "🔒 이 화 비공개"}</span>
                      </div>
                      {autoSaveMsg && <div style={{ textAlign: "right", fontSize: 11, color: "#6ee7b7", marginBottom: 6 }}>{autoSaveMsg}</div>}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                        <button className="btn btn-outline" onClick={generateNextEpisode} disabled={loading} style={{ fontSize: 13, borderColor: "#7c3aed", color: "#a78bfa" }}>
                          {loading ? <><span className="spinner" /></> : "📖 다음 화 쓰기"}
                        </button>
                        <button className="btn btn-primary" onClick={saveNovel} disabled={saving} style={{ fontSize: 13 }}>
                          {saving ? <><span className="spinner" /></> : saveMsg || `💾 ${currentEpisode}화 저장`}
                        </button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <button className="btn btn-outline" onClick={saveAsText} style={{ fontSize: 13 }}>📄 txt</button>
                        <button className="btn btn-outline" onClick={copyToClipboard} style={{ fontSize: 13, borderColor: copied ? "#86efac" : "#2e2048", color: copied ? "#86efac" : "#a89ec0" }}>
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
              <div style={{ marginBottom: 12 }}>
                <input className="input-field" placeholder="🔍 제목, 장르, 태그 검색..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter") fetchPublicNovels(); }} />
              </div>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 12, scrollbarWidth: "none" }}>
                {["전체", "💕 로맨스", "🧙 판타지", "✨ 현대판타지", "⚔️ 무협", "🔪 스릴러/호러", "🔍 미스터리", "🚀 SF", "🏙️ 현대물", "📜 역사", "💙 BL", "💜 GL"].map(g => (
                  <button key={g}
                    style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${exploreGenre === g ? "#7c3aed" : "#2e2048"}`, background: exploreGenre === g ? "#2d1f4e" : "rgba(28,21,48,0.9)", color: exploreGenre === g ? "#c4b8ff" : "#7a6a9a", fontSize: 12, cursor: "pointer", fontFamily: "'Noto Serif KR', serif", transition: "all 0.2s", whiteSpace: "nowrap" }}
                    onClick={() => setExploreGenre(g)}>{g}</button>
                ))}
              </div>
              <div style={{ display: "flex", borderBottom: "1px solid #2e2048", marginBottom: 16 }}>
                <button className={`tab-btn${exploreTab === "latest" ? " active" : ""}`} onClick={() => setExploreTab("latest")}>🆕 최신</button>
                <button className={`tab-btn${exploreTab === "popular" ? " active" : ""}`} onClick={() => setExploreTab("popular")}>🔥 인기</button>
              </div>
              {publicNovels.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#6a5a8a" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <div>{exploreGenre !== "전체" ? `${exploreGenre} 장르의 소설이 없어요` : "아직 공개된 소설이 없어요"}</div>
                </div>
              ) : publicNovels.map(n => (
                <NovelCard key={n.id} n={n} user={user} onOpen={openNovel} onSeriesDetail={(n) => { setSeriesDetail(n); setShowToc(true); }} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          )}

          {view === "library" && (
            <div className="fade-in">
              <div style={{ display: "flex", borderBottom: "1px solid #2e2048", marginBottom: 16 }}>
                <button className={`tab-btn${libraryTab === "my" ? " active" : ""}`} onClick={() => setLibraryTab("my")}>📝 내 작품</button>
                <button className={`tab-btn${libraryTab === "favorites" ? " active" : ""}`} onClick={() => { setLibraryTab("favorites"); if (user) fetchFavoriteNovels(); }}>🔖 선호작</button>
              </div>
              {!user ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#6a5a8a" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
                  <div style={{ marginBottom: 20 }}>로그인하면 서재를 이용할 수 있어요</div>
                  <button className="btn btn-primary" style={{ padding: "12px 28px" }} onClick={() => setShowAuth(true)}>로그인하기</button>
                </div>
              ) : libraryTab === "my" ? (
                myNovels.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "#6a5a8a" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                    <div>아직 저장된 소설이 없어요</div>
                  </div>
                ) : myNovels.map(n => (
                  <NovelCard key={n.id} n={n} showActions user={user} onOpen={openNovel} onSeriesDetail={(n) => { setSeriesDetail(n); setShowToc(true); }} onToggleFavorite={toggleFavorite} />
                ))
              ) : (
                favoriteNovels.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "#6a5a8a" }}>
                    <div style={{ fontSize: 32, marginBottom: 12, lineHeight: 1 }}>🔖</div>
                    <div>아직 선호작이 없어요</div>
                  </div>
                ) : favoriteNovels.map(n => (
                  <NovelCard key={n.id} n={n} user={user} onOpen={openNovel} onSeriesDetail={(n) => { setSeriesDetail(n); setShowToc(true); }} onToggleFavorite={toggleFavorite} />
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}