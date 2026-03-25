"use client";
import { useState } from "react";

const GENRES = [
  { id: "romance", label: "💕 로맨스", color: "#f472b6" },
  { id: "bl", label: "💙 BL", color: "#818cf8" },
  { id: "gl", label: "💜 GL", color: "#c084fc" },
  { id: "fantasy", label: "🧙 판타지", color: "#a78bfa" },
  { id: "thriller", label: "🔪 스릴러", color: "#f87171" },
  { id: "sf", label: "🚀 SF", color: "#38bdf8" },
  { id: "mystery", label: "🔍 미스터리", color: "#fbbf24" },
  { id: "historical", label: "⚔️ 역사", color: "#86efac" },
];

const PRESET_TAGS = [
  "운명적 재회", "기억상실", "계약 연애", "학교생활", "직장 로맨스",
  "이세계", "복수", "금지된 사랑", "삼각관계", "첫사랑",
  "집착", "츤데레", "순정", "비밀연애", "신분차이",
];

const MOODS = [
  { id: "sweet", label: "🍬 달달" },
  { id: "sad", label: "😢 슬픔" },
  { id: "dark", label: "🌑 다크" },
  { id: "funny", label: "😂 웃음" },
  { id: "tense", label: "⚡ 긴장" },
];

const LENGTHS = [
  { id: "short", label: "단편", desc: "~500자", tokens: 700 },
  { id: "medium", label: "중편", desc: "~1500자", tokens: 1800 },
];

export default function Home() {
  const [genre, setGenre] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState<string>("");
  const [mood, setMood] = useState<string | null>(null);
  const [protagonist, setProtagonist] = useState<string>("");
  const [protagonistDesc, setProtagonistDesc] = useState<string>("");
  const [length, setLength] = useState<string>("short");
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
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function addCustomTag() {
    const t = customTag.trim();
    if (t && !selectedTags.includes(t)) {
      setSelectedTags((prev) => [...prev, t]);
    }
    setCustomTag("");
  }

  async function generateNovel() {
    if (!genre) { setError("장르를 선택해주세요."); return; }
    if (selectedTags.length === 0) { setError("태그를 최소 1개 선택해주세요."); return; }
    setError(""); setLoading(true); setStep("result"); setNovel(""); setIsEditing(false);
    const lengthObj = LENGTHS.find((l) => l.id === length)!;
    const moodLabel = MOODS.find((m) => m.id === mood)?.label || "";
    const prompt = `당신은 감성적이고 몰입감 있는 한국 소설 작가입니다. 아래 설정으로 ${lengthObj.label}(${lengthObj.desc}) 소설을 한국어로 써주세요.\n장르: ${selectedGenre?.label}\n태그: ${selectedTags.join(", ")}\n분위기: ${moodLabel || "자유"}\n주인공 이름: ${protagonist || "이름 없음"}\n주인공 설정: ${protagonistDesc || "특별한 설정 없음"}\n분량: ${lengthObj.desc} 내외\n규칙: 제목을 먼저 쓰고 한 줄 띄우기. 생생한 묘사와 대화 포함. 마크다운 없이 순수 텍스트로.`;
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, tokens: lengthObj.tokens }) });
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
    const a = document.createElement("a"); a.href = url; a.download = "소설.txt"; a.click();
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
        .genre-btn { border: 1.5px solid #2d2040; background: #1a1228; color: #c4b8d8; border-radius: 12px; padding: 10px 16px; cursor: pointer; font-family: 'Noto Serif KR', serif; font-size: 14px; transition: all 0.2s; text-align: center; width: 100%; }
        .genre-btn:hover, .genre-btn.selected { background: #221738; color: #fff; transform: translateY(-2px); }
        .tag-btn { border: 1.5px solid #2d2040; background: #1a1228; color: #9a8aaa; border-radius: 20px; padding: 6px 14px; cursor: pointer; font-family: 'Noto Serif KR', serif; font-size: 13px; transition: all 0.2s; }
        .tag-btn:hover { border-color: #7c3aed; color: #e8e0f0; }
        .tag-btn.selected { background: #2d1f4e; border-color: #7c3aed; color: #c4b8ff; }
        .mood-btn { border: 1.5px solid #2d2040; background: #1a1228; color: #9a8aaa; border-radius: 10px; padding: 8px 14px; cursor: pointer; font-family: 'Noto Serif KR', serif; font-size: 13px; transition: all 0.2s; flex: 1; text-align: center; }
        .mood-btn:hover, .mood-btn.selected { background: #221738; color: #fff; }
        .input-field { width: 100%; background: #1a1228; border: 1.5px solid #2d2040; border-radius: 10px; padding: 12px 16px; color: #e8e0f0; font-family: 'Noto Serif KR', serif; font-size: 14px; outline: none; transition: border-color 0.2s; resize: vertical; }
        .input-field:focus { border-color: #7c3aed; }
        .input-field::placeholder { color: #5a4a6a; }
        .btn { border: none; border-radius: 10px; padding: 10px 18px; cursor: pointer; font-family: 'Noto Serif KR', serif; font-size: 14px; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-primary { background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff; }
        .btn-outline { background: transparent; border: 1.5px solid #2d2040; color: #9a8aaa; }
        .btn-outline:hover { border-color: #7c3aed !important; color: #e8e0f0 !important; }
        .novel-editor { width: 100%; background: transparent; border: none; outline: none; color: #ddd4ee; font-family: 'Noto Serif KR', serif; font-size: 16px; line-height: 2.1; resize: none; font-weight: 300; min-height: 400px; }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .shimmer-text { background: linear-gradient(90deg, #7c3aed, #f472b6, #a78bfa, #7c3aed); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 3s linear infinite; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.5s ease forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { display:inline-block; width:16px; height:16px; border:2px solid #ffffff44; border-top-color:#fff; border-radius:50%; animation: spin 0.7s linear infinite; }
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

              {/* 장르 */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#c4b8d8", marginBottom: 12 }}>01. 장르 <span style={{ fontSize: 10, color: "#f472b6" }}>필수</span></div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                  {GENRES.map((g) => (
                    <button key={g.id} className={`genre-btn${genre === g.id ? " selected" : ""}`}
                      style={genre === g.id ? { borderColor: g.color, boxShadow: `0 0 16px ${g.color}33` } : {}}
                      onClick={() => setGenre(g.id)}>{g.label}</button>
                  ))}
                </div>
              </div>

              {/* 태그 */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#c4b8d8", marginBottom: 12 }}>02. 태그 <span style={{ fontSize: 10, color: "#f472b6" }}>필수 (1개 이상)</span></div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {PRESET_TAGS.map((tag) => (
                    <button key={tag} className={`tag-btn${selectedTags.includes(tag) ? " selected" : ""}`}
                      onClick={() => toggleTag(tag)}>{tag}</button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="input-field" style={{ resize: "none" }} placeholder="직접 태그 입력 (예: 용사와 마왕)" value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTag(); } }} />
                  <button className="btn btn-outline" onClick={addCustomTag} style={{ whiteSpace: "nowrap" }}>+ 추가</button>
                </div>
                {selectedTags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                    {selectedTags.map((tag) => (
                      <span key={tag} style={{ background: "#2d1f4e", border: "1px solid #7c3aed", borderRadius: 20, padding: "4px 10px", fontSize: 12, color: "#c4b8ff", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                        onClick={() => toggleTag(tag)}>{tag} ✕</span>
                    ))}
                  </div>
                )}
              </div>

              {/* 분위기 */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#c4b8d8", marginBottom: 12 }}>03. 분위기 <span style={{ fontSize: 10, color: "#5a4a6a" }}>선택</span></div>
                <div style={{ display: "flex", gap: 8 }}>
                  {MOODS.map((m) => (
                    <button key={m.id} className={`mood-btn${mood === m.id ? " selected" : ""}`}
                      style={mood === m.id ? { borderColor: accentColor, color: "#fff" } : {}}
                      onClick={() => setMood(mood === m.id ? null : m.id)}>{m.label}</button>
                  ))}
                </div>
              </div>

              {/* 주인공 */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#c4b8d8", marginBottom: 12 }}>04. 주인공 설정 <span style={{ fontSize: 10, color: "#5a4a6a" }}>선택</span></div>
                <input className="input-field" style={{ marginBottom: 10 }} placeholder="주인공 이름 (예: 이서준)" value={protagonist} onChange={(e) => setProtagonist(e.target.value)} />
                <textarea className="input-field" rows={2} placeholder="주인공 특징 (예: 차갑지만 따뜻한 마음을 숨기고 있다)" value={protagonistDesc} onChange={(e) => setProtagonistDesc(e.target.value)} />
              </div>

              {/* 분량 */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#c4b8d8", marginBottom: 12 }}>05. 분량</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {LENGTHS.map((l) => (
                    <button key={l.id} style={{ flex: 1, border: `1.5px solid ${length === l.id ? accentColor : "#2d2040"}`, background: length === l.id ? "#221738" : "#1a1228", color: length === l.id ? "#fff" : "#c4b8d8", borderRadius: 10, padding: 12, cursor: "pointer", fontFamily: "'Noto Serif KR',serif", transition: "all 0.2s" }} onClick={() => setLength(l.id)}>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>{l.label}</div>
                      <div style={{ fontSize: 12, color: "#7a6a8a", marginTop: 3 }}>{l.desc}</div>
                    </button>
                  ))}
                </div>
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
                {[selectedGenre?.label, ...selectedTags, LENGTHS.find(l => l.id === length)?.label].filter(Boolean).map((tag, i) => (
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