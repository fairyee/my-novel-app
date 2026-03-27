"use client";
import { Novel } from "../types";

interface NovelCardProps {
  n: Novel;
  showActions?: boolean;
  user: any;
  onOpen: (n: Novel, mine: boolean) => void;
  onSeriesDetail: (n: Novel, mine: boolean) => void;
  onToggleFavorite: (n: Novel) => void;
}

export default function NovelCard({ n, showActions = false, user, onOpen, onSeriesDetail, onToggleFavorite }: NovelCardProps) {
  const episodes = n._episodes || [];
  const displayTitle = n.series_title && n.series_title !== n.title ? n.series_title : n.title;
  const coverImg = n.cover_image || episodes[0]?.cover_image;
  const synopsisText = n.synopsis || n._episodes?.[0]?.synopsis || "";
  const fallback = n.content.split("\n").filter((l) => l.trim()).slice(1, 4).join(" ");
  const rawPreview = synopsisText || fallback;
  const preview = rawPreview.length > 120 ? rawPreview.slice(0, 120) + "…" : rawPreview;

  const handleClick = () => {
    if (showActions) {
      const epList = episodes.length > 0 ? episodes : [n];
      onSeriesDetail({ ...n, _episodes: epList, _isMine: true, is_favorited: false }, true);
    } else if (episodes.length > 0) {
      onSeriesDetail({ ...n, _episodes: episodes, _isMine: false, is_favorited: false }, false);
    } else {
      onOpen(n, false);
    }
  };

  // 서재 카드
  if (showActions) {
    return (
      <div
        style={{ background: "#160f22", border: "1.5px solid #2d2040", borderRadius: 14, marginBottom: 12, cursor: "pointer", transition: "border-color 0.2s", overflow: "hidden" }}
        onMouseOver={(e) => (e.currentTarget.style.borderColor = "#4a3570")}
        onMouseOut={(e) => (e.currentTarget.style.borderColor = "#2d2040")}
        onClick={handleClick}
      >
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

  // 둘러보기 카드
  return (
    <div
      style={{ background: "#160f22", border: "1.5px solid #2d2040", borderRadius: 14, marginBottom: 12, cursor: "pointer", transition: "border-color 0.2s", overflow: "hidden", display: "flex" }}
      onMouseOver={(e) => (e.currentTarget.style.borderColor = "#4a3570")}
      onMouseOut={(e) => (e.currentTarget.style.borderColor = "#2d2040")}
      onClick={handleClick}
    >
      <div style={{ width: 110, flexShrink: 0, background: "#0d0a14", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {coverImg
          ? <img src={coverImg} alt={displayTitle} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ color: "#3a2a4a", fontSize: 32 }}>📖</div>
        }
      </div>
      <div style={{ flex: 1, padding: "14px", minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
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
          <button
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: n.is_favorited ? "#f472b6" : "#5a4a6a", fontFamily: "'Noto Serif KR', serif", padding: 0 }}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(n); }}
          >
            {n.is_favorited ? "🔖 선호작" : "📎 선호작"}
          </button>
          <span style={{ marginLeft: "auto" }}>{new Date(n.created_at).toLocaleDateString("ko-KR")}</span>
        </div>
      </div>
    </div>
  );
}
