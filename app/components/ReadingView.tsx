"use client";
import { Novel, Comment } from "../types";

interface ReadingViewProps {
  readingNovel: Novel;
  readingSeries: Novel[];
  isMyNovel: boolean;
  isLastEpisode: boolean;
  comments: Comment[];
  commentText: string;
  setCommentText: (v: string) => void;
  commentLoading: boolean;
  user: any;
  onBack: () => void;
  onOpenEpisode: (ep: Novel, mine: boolean) => void;
  onSubmitComment: () => void;
  onDeleteComment: (id: string) => void;
  onEdit: (n: Novel) => void;
  onContinue: (n: Novel) => void;
  onShowAuth: () => void;
}

export default function ReadingView({
  readingNovel, readingSeries, isMyNovel, isLastEpisode,
  comments, commentText, setCommentText, commentLoading,
  user, onBack, onOpenEpisode, onSubmitComment, onDeleteComment,
  onEdit, onContinue, onShowAuth,
}: ReadingViewProps) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,8,18,1)", zIndex: 100, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 160 }}>

        {/* 헤더 */}
        <div style={{ position: "sticky", top: 0, background: "rgba(10,8,18,1)cc", backdropFilter: "blur(12px)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2e2048", zIndex: 10 }}>
          <button style={{ background: "none", border: "none", color: "#a89ec0", fontSize: 14, cursor: "pointer", fontFamily: "'Noto Serif KR', serif" }} onClick={onBack}>← 뒤로</button>
          <span style={{ fontSize: 12, color: "#6a5a8a" }}>👁 {readingNovel.views}</span>
        </div>

        {/* 화 목록 탭 */}
        {readingSeries.length > 1 && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #2e2048", display: "flex", gap: 8, overflowX: "auto" }}>
            {readingSeries.map((ep) => (
              <button key={ep.id}
                style={{ flexShrink: 0, padding: "6px 12px", background: ep.id === readingNovel.id ? "rgba(45,31,78,0.9)" : "rgba(28,21,48,0.9)", border: `1px solid ${ep.id === readingNovel.id ? "#7c3aed" : "#2e2048"}`, borderRadius: 20, color: ep.id === readingNovel.id ? "#c4b8ff" : "#7a6a9a", fontSize: 12, cursor: "pointer", fontFamily: "'Noto Serif KR', serif" }}
                onClick={() => onOpenEpisode(ep, isMyNovel)}>
                {ep.episode_number}화
              </button>
            ))}
          </div>
        )}

        <div style={{ padding: "28px 20px" }}>
          {readingNovel.cover_image && (
            <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 20, position: "relative" }}>
              <img src={readingNovel.cover_image} alt="cover" style={{ width: "100%", height: 200, objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(10,8,18,1))" }} />
            </div>
          )}

          {readingNovel.series_title && <div style={{ fontSize: 12, color: "#7c3aed", marginBottom: 6 }}>📚 {readingNovel.series_title}</div>}
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>
            {readingNovel.episode_number ? `${readingNovel.episode_number}화. ` : ""}{readingNovel.title}
          </h1>
          <div style={{ fontSize: 12, color: "#6a5a8a", marginBottom: 28 }}>
            {readingNovel.genre}{readingNovel.tags && ` · ${readingNovel.tags}`}
          </div>
          <div style={{ lineHeight: 2.2, fontSize: 16, color: "#e8e2f5", whiteSpace: "pre-wrap", fontWeight: 300 }}>
            {readingNovel.content}
          </div>

          {/* 댓글 */}
          <div style={{ marginTop: 48, borderTop: "1px solid #2e2048", paddingTop: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#b8aed0", marginBottom: 20 }}>
              💬 댓글 {comments.length > 0 ? `${comments.length}개` : ""}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              <textarea
                style={{ flex: 1, background: "rgba(28,21,48,0.9)", border: "1.5px solid #2e2048", borderRadius: 10, padding: "10px 12px", color: "#ede8f5", fontFamily: "'Noto Serif KR', serif", fontSize: 14, outline: "none", resize: "none", minHeight: 72 }}
                placeholder={user ? "댓글을 남겨보세요..." : "로그인 후 댓글을 남길 수 있어요"}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onFocus={() => { if (!user) onShowAuth(); }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmitComment(); } }}
              />
              <button
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", border: "none", borderRadius: 10, padding: "0 16px", color: "#fff", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 13, flexShrink: 0, opacity: commentText.trim() ? 1 : 0.4 }}
                onClick={onSubmitComment}
                disabled={commentLoading || !commentText.trim()}
              >
                {commentLoading ? "..." : "등록"}
              </button>
            </div>

            {comments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#6a5a8a", fontSize: 13 }}>첫 댓글을 남겨보세요 🌙</div>
            ) : comments.map((c) => (
              <div key={c.id} style={{ marginBottom: 16, padding: "12px 14px", background: "rgba(19,16,32,0.85)", borderRadius: 10, border: "1px solid #2e2048" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#a78bfa" }}>{c.nickname}</span>
                    <span style={{ fontSize: 11, color: "#6a5a8a" }}>{new Date(c.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  {user?.id === c.user_id && (
                    <button style={{ background: "none", border: "none", color: "#6a5a8a", cursor: "pointer", fontSize: 11, fontFamily: "'Noto Serif KR', serif" }}
                      onClick={() => { if (confirm("댓글을 삭제할까요?")) onDeleteComment(c.id); }}>삭제</button>
                  )}
                </div>
                <div style={{ fontSize: 14, color: "#b8aed0", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{c.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      {isMyNovel && (
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, padding: "10px 16px 20px", background: "rgba(10,8,18,1)ee", borderTop: "1px solid #2e2048" }}>
          <div style={{ display: "grid", gridTemplateColumns: isLastEpisode ? "1fr 1fr" : "1fr", gap: 8 }}>
            <button style={{ padding: "11px", background: "transparent", border: "1.5px solid #2e2048", borderRadius: 12, color: "#a89ec0", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 13 }}
              onClick={() => onEdit(readingNovel)}>✏️ 편집</button>
            {isLastEpisode && (
              <button style={{ padding: "11px", background: "transparent", border: "1.5px solid #7c3aed", borderRadius: 12, color: "#c4b8ff", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 13 }}
                onClick={() => onContinue(readingNovel)}>📖 다음 화 쓰기</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
