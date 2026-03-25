"use client";
import { useState } from "react";

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
  "운명적 재회", "기억상실", "계약 연애", "학교생활", "직장 로맨스",
  "이세계", "복수", "금지된 사랑", "삼각관계", "첫사랑",
  "집착", "츤데레", "순정", "비밀연애", "신분차이",
  "용사와 마왕", "오해와 화해", "소꿉친구", "재벌", "빙의",
];

const MOODS = [
  { id: "sweet", label: "🍬 달달" },
  { id: "sad", label: "😢 슬픔" },
  { id: "dark", label: "🌑 다크" },
  { id: "funny", label: "😂 웃음" },
  { id: "tense", label: "⚡ 긴장" },
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

interface Character {
  id: number;
  name: string;
  desc: string;
  role: string;
}

export default function Home() {
  const [genre, setGenre] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState<string>("");
  const [mood, setMood] = useState<string | null>(null);
  const [rating, setRating] = useState<string>("all");
  const [pov, setPov] = useState<string>("third");
  const [title, setTitle] = useState<string>("");
  const [synopsis, setSynopsis] = useState<string>("");
  const [characters, setCharacters] = useState<Character[]>([{ id: 1, name: "", desc: "", role: "주인공" }]);
  const [novel, setNovel] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<string>("form");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedNovel, setEditedNovel] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [continuing, setContinuing] = useState<boolean>(false);

  const selectedGenre = GENRES.find((g) => g.id === genre);
  const accentColor = selectedGenre?.color || "#a78bfa";

  function toggleTag(tag: string) {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  function addCustomTag() {
    const t = customTag.trim();
    if (t && !selectedTags.includes(t)) setSelectedTags((prev) => [...prev, t]);
    setCustomTag("");
  }

  function addCharacter() {
    setCharacters((prev) => [...prev, { id: Date.now(), name: "", desc: "", role: "조연" }]);
  }

  function removeCharacter(id: number) {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  }

  function updateCharacter(id: number, field: keyof Character, value: string) {
    setCharacters((prev) => prev.map((c) => c.id === id ? { ...c, [field]: value } : c));
  }

  async function generateNovel() {
    setError(""); setLoading(true); setStep("result"); setNovel(""); setIsEditing(false);
    const ratingLabel = rating === "all" ? "전체가 (순수하고 건전하게)" : rating === "teen" ? "15세 이상 (약간의 긴장감, 키스 정도)" : "성인 (키스, 스킨십, 성적 암시 포함, 노골적이지 않게)";
    const povLabel = pov === "first" ? "1인칭 (나는, 내가)" : "3인칭 (그는, 그녀는)";
    const charDesc = characters.filter(c => c.name || c.desc).map(c => `- ${c.role} ${c.name || "이름없음"}: ${c.desc || "설정없음"}`).join("\n");
    const prompt = `당신은 감성적이고 몰입감 있는 한국 소설 작가입니다. 아래 설정으로 소설을 한국어로 써주세요.
${title ? `작품 제목: ${title}` : ""}
장르: ${selectedGenre?.label || "자유"}
태그: ${selectedTags.length > 0 ? selectedTags.join(", ") : "자유"}
분위기: ${MOODS.find(m => m.id === mood)?.label || "자유"}
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
        .char-row { display: flex; gap: 8px; margin-bottom: 8px; }
        .role-select { background: #1a1228; border: 1.5px solid #2d2040; border-radius: 8px; padding: 8px 12px; color: #e8e0f0; font-family: 'Noto Serif KR', serif; font-size: 13px; outline: none; cursor: pointer; }
        .btn { border: none; border-radius: 10px; padding: 10px 18px; cursor: pointer; font-family: 'Noto Serif KR', serif; font-size: 14px; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-primary { background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff; }
        .btn-outline { background: transparent; border: 1.5px solid #2d2040; color: #9a8aaa; }
        .btn-outline:hover { border-color: #7c3aed !important; color: #e8e0f0 !important; }
        .btn-danger { background: transparent; border: 1.5px solid #3d1f1f; color: #f87171; border-radius: 8px; padding: 6px 10px; cursor: pointer; font-size: 12px; transition: all 0.2s; }
        .btn-danger:hover { background: #3d1f1f; }
        .novel-editor { width: 100%; background: transparent; border: none; outline: none; color: #ddd4ee; font-family: 'Noto Serif KR', serif; font-size: 16px; line-height: 2.1; resize: none; font-weight: 300; min-height: 400px; }
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
        <div style={{ textAlign: "center", padding: "48px 20px 32px" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", color: "#5a4a6a", marginBottom: 12 }}>AI NOVEL STUDIO</div>
          <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: 700 }}><span className="shimmer-text">소설 창작소</span></h1>
          <p style={{ margin: "12px 0 0", color: "#7a6a8a", fontSize: 15, fontWeight: 300 }}>당신만의 이야기를 AI와 함께 만들어보세요</p>
        </div>

        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px 80px" }}>
          {step === "form" && (
            <div className="fade-in">

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
                    <button key={tag} className={`tag-btn${selectedTags.includes(tag) ? " selected" : ""}`}
                      onClick={() => toggleTag(tag)}>{tag}</button>
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
                      <span key={tag} onClick={() => toggleTag(tag)}
                        style={{ background: "#2d1f4e", border: "1px solid #7c3aed", borderRadius: 20, padding: "4px 10px", fontSize: 12, color: "#c4b8ff", cursor: "pointer" }}>
                        {tag} ✕
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="section">
                <div className="section-title">03. 분위기 <span style={{ fontSize: 10, color: "#5a4a6a" }}>선택</span></div>
                <div style={{ display: "flex", gap: 8 }}>
                  {MOODS.map((m) => (
                    <button key={m.id} className={`opt-btn${mood === m.id ? " selected" : ""}`}
                      style={mood === m.id ? { borderColor: accentColor } : {}}
                      onClick={() => setMood(mood === m.id ? null : m.id)}>{m.label}</button>
                  ))}
                </div>
              </div>

              <div className="section">
                <div className="section-title">04. 시점 <span style={{ fontSize: 10, color: "#5a4a6a" }}>선택</span></div>
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
                <div className="section-title">05. 수위 <span style={{ fontSize: 10, color: "#5a4a6a" }}>선택</span></div>
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
                <div className="section-title">06. 작품 제목 <span style={{ fontSize: 10, color: "#5a4a6a" }}>선택</span></div>
                <input className="input-field" placeholder="제목을 입력하면 그대로 사용돼요 (비우면 AI가 정해요)" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="section">
                <div className="section-title">07. 줄거리 / 배경 설정 <span style={{ fontSize: 10, color: "#5a4a6a" }}>선택</span></div>
                <textarea className="input-field" rows={3} placeholder="예: 기억을 잃고 낯선 도시에서 깨어난 남자가 자신의 과거를 추적하는 이야기. 배경은 비 내리는 서울." value={synopsis} onChange={(e) => setSynopsis(e.target.value)} />
              </div>

              <div className="section">
                <div className="section-title">08. 등장인물 <span style={{ fontSize: 10, color: "#5a4a6a" }}>선택</span></div>
                {characters.map((char, idx) => (
                  <div key={char.id} className="char-card">
                    <div className="char-row">
                      <select className="role-select" value={char.role} onChange={(e) => updateCharacter(char.id, "role", e.target.value)}>
                        <option>주인공</option>
                        <option>히로인</option>
                        <option>조연</option>
                        <option>악역</option>
                        <option>조력자</option>
                      </select>
                      <input className="input-field" style={{ flex: 1 }} placeholder="이름" value={char.name} onChange={(e) => updateCharacter(char.id, "name", e.target.value)} />
                      {idx > 0 && (
                        <button className="btn-danger" onClick={() => removeCharacter(char.id)}>삭제</button>
                      )}
                    </div>
                    <textarea className="input-field" rows={2} placeholder="캐릭터 특징 (예: 냉정하고 계산적인 30대 CEO, 과거에 큰 상처가 있다)" value={char.desc} onChange={(e) => updateCharacter(char.id, "desc", e.target.value)} />
                  </div>
                ))}
                {characters.length < 5 && (
                  <button className="btn btn-outline" onClick={addCharacter} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
                    + 캐릭터 추가
                  </button>
                )}
              </div>

              {error && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 16, textAlign: "center" }}>⚠️ {error}</div>}
              <button className="btn btn-primary" style={{ width: "100%", padding: 16, fontSize: 16, borderRadius: 12, justifyContent: "center" }} onClick={generateNovel} disabled={loading}>
                {loading ? <><span className="spinner" /> 생성 중...</> : "✨ 소설 생성하기"}
              </button>
            </div>
          )}

          {step === "result" && (
            <div className="fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <button className="btn btn-outline" onClick={() => { setStep("form"); setNovel(""); setIsEditing(false); }}>← 다시 만들기</button>
                <button className="btn btn-outline" style={{ borderColor: isEditing ? accentColor : "#2d2040", color: isEditing ? accentColor : "#9a8aaa" }}
                  onClick={() => { setIsEditing(!isEditing); setEditedNovel(novel); }} disabled={loading}>
                  {isEditing ? "✅ 편집 완료" : "✏️ 편집"}
                </button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                {[selectedGenre?.label, ...selectedTags, MOODS.find(m => m.id === mood)?.label, RATINGS.find(r => r.id === rating)?.label].filter(Boolean).map((tag, i) => (
                  <span key={i} style={{ background: "#1a1228", border: "1px solid #2d2040", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#9a8aaa" }}>{tag}</span>
                ))}
              </div>

              <div style={{ background: "linear-gradient(180deg,#1a1228 0%,#160f22 100%)", border: `1px solid ${isEditing ? accentColor+"66" : "#2d2040"}`, borderRadius: 16, padding: "36px 32px", minHeight: 300, boxShadow: "0 8px 48px #0007", transition: "all 0.3s" }}>
                {loading && <div style={{ textAlign: "center", padding: "48px 0", color: "#5a4a6a" }}><div style={{ fontSize: 32, marginBottom: 16 }}>✍️</div><div>이야기를 쓰고 있어요...</div></div>}
                {!loading && isEditing && <textarea className="novel-editor" value={editedNovel} onChange={(e) => setEditedNovel(e.target.value)} />}
                {!loading && !isEditing && novel && <div style={{ lineHeight: 2.1, fontSize: 16, color: "#ddd4ee", whiteSpace: "pre-wrap", fontWeight: 300 }}>{novel}</div>}
              </div>

              {!loading && novel && (
                <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 10 }}>
                  <button className="btn btn-primary" onClick={continueNovel} disabled={continuing} style={{ flex: "1 1 140px", justifyContent: "center" }}>
                    {continuing ? <><span className="spinner" /> 이어쓰는 중...</> : "📖 이어쓰기"}
                  </button>
                  <button className="btn btn-outline" onClick={generateNovel} disabled={loading} style={{ flex: "1 1 110px", justifyContent: "center" }}>🔄 재생성</button>
                  <button className="btn btn-outline" onClick={saveAsText} style={{ flex: "1 1 110px", justifyContent: "center" }}>💾 저장</button>
                  <button className="btn btn-outline" onClick={copyToClipboard} style={{ flex: "1 1 110px", justifyContent: "center", borderColor: copied ? "#86efac" : "#2d2040", color: copied ? "#86efac" : "#9a8aaa" }}>
                    {copied ? "✅ 복사됨" : "📋 복사"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}