"use client";
import { Novel } from "../types";

interface SeriesDetailProps {
  seriesDetail: Novel;
  showToc: boolean;
  setShowToc: (v: boolean) => void;
  coverUploading: boolean;
  onBack: () => void;
  onOpenEpisode: (ep: Novel, mine: boolean) => void;
  onToggleFavorite: (n: Novel) => void;
  onToggleSeriesPublic: (seriesId: string, novelId: string, makePublic: boolean) => void;
  onUploadCover: (file: File, seriesId: string, novelId?: string) => Promise<string | null>;
  onContinueFromLibrary: (n: Novel) => void;
  onEditFromLibrary: (n: Novel) => void;
  onShowDeleteModal: (n: Novel) => void;
  setSeriesDetail: (n: Novel | null) => void;
}

export default function SeriesDetail({
  seriesDetail, showToc, setShowToc, coverUploading,
  onBack, onOpenEpisode, onToggleFavorite, onToggleSeriesPublic,
  onUploadCover, onContinueFromLibrary, onEditFromLibrary, onShowDeleteModal, setSeriesDetail,
}: SeriesDetailProps) {
  const isMine = !!(seriesDetail as any)._isMine;
  const eps = seriesDetail._episodes || [];
  const lastEp = eps[eps.length - 1];
  const allPublic = eps.every(ep => ep.is_public);
  const sid = seriesDetail.series_id || seriesDetail.id;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0d0a14", zIndex: 100, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", paddingBottom: 40 }}>

        {/* 헤더 */}
        <div style={{ position: "sticky", top: 0, background: "#0d0a14cc", backdropFilter: "blur(12px)", padding: "12px 16px", display: "flex", alignItems: "center", borderBottom: "1px solid #2d2040", zIndex: 10 }}>
          <button style={{ background: "none", border: "none", color: "#9a8aaa", fontSize: 14, cursor: "pointer", fontFamily: "'Noto Serif KR', serif" }} onClick={onBack}>← 뒤로</button>
        </div>

        {/* 커버 */}
        {seriesDetail.cover_image && (
          <div style={{ width: "100%", background: "#0d0a14", display: "flex", justifyContent: "center", position: "relative" }}>
            <img src={seriesDetail.cover_image} alt={seriesDetail.series_title || seriesDetail.title} style={{ width: "100%", maxHeight: 400, objectFit: "contain" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to bottom, transparent, #0d0a14)" }} />
          </div>
        )}

        <div style={{ padding: "24px 20px" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{seriesDetail.series_title || seriesDetail.title}</h1>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {seriesDetail.genre && <span style={{ fontSize: 11, background: "#2d1f4e", color: "#a78bfa", borderRadius: 20, padding: "3px 10px" }}>{seriesDetail.genre}</span>}
            <span style={{ fontSize: 11, background: "#1a2d1f", color: "#6ee7b7", borderRadius: 20, padding: "3px 10px" }}>총 {eps.length}화</span>
            {seriesDetail.tags && seriesDetail.tags.split(",").slice(0, 3).map((t) => (
              <span key={t} style={{ fontSize: 11, background: "#1a1228", color: "#7a6a8a", borderRadius: 20, padding: "3px 10px", border: "1px solid #2d2040" }}>#{t.trim()}</span>
            ))}
          </div>

          {/* 선호작 버튼 — 내 작품 아닐 때만 */}
          {!isMine && (
            <button
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: seriesDetail.is_favorited ? "#2d1f4e" : "transparent", border: `1.5px solid ${seriesDetail.is_favorited ? "#7c3aed" : "#2d2040"}`, borderRadius: 24, color: seriesDetail.is_favorited ? "#c4b8ff" : "#7a6a8a", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 14, marginBottom: 20, transition: "all 0.2s" }}
              onClick={() => onToggleFavorite(seriesDetail)}
            >
              {seriesDetail.is_favorited ? "🔖" : "📎"}
              <span>{seriesDetail.is_favorited ? "선호작 취소" : "선호작 추가"}</span>
            </button>
          )}

          {/* 작품 소개 */}
          {seriesDetail.synopsis && (
            <div style={{ background: "#160f22", borderRadius: 12, padding: "16px", marginBottom: 24, border: "1px solid #2d2040" }}>
              <div style={{ fontSize: 12, color: "#7a6a8a", marginBottom: 8, fontWeight: 600 }}>작품 소개</div>
              <div style={{ fontSize: 14, color: "#c4b8d8", lineHeight: 1.9 }}>{seriesDetail.synopsis}</div>
            </div>
          )}

          {/* 내 작품 전용 버튼들 */}
          {isMine && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px", background: "transparent", border: "1.5px solid #2d2040", borderRadius: 12, color: "#9a8aaa", cursor: "pointer", fontSize: 13, fontFamily: "'Noto Serif KR', serif" }}>
                  <input type="file" accept="image/*" style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await onUploadCover(file, sid, seriesDetail.series_id ? undefined : seriesDetail.id);
                      if (url) setSeriesDetail({ ...seriesDetail, cover_image: url });
                    }} />
                  {coverUploading ? "업로드 중..." : "🖼️ 커버 변경"}
                </label>
                {lastEp && (
                  <button
                    style={{ padding: "11px", background: "transparent", border: "1.5px solid #7c3aed", borderRadius: 12, color: "#c4b8ff", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 13 }}
                    onClick={() => { setSeriesDetail(null); onContinueFromLibrary(lastEp); }}
                  >
                    📖 다음 화 쓰기
                  </button>
                )}
              </div>

              {/* 전체 공개 토글 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#160f22", borderRadius: 10, border: "1px solid #2d2040", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#c4b8d8" }}>전체 공개 설정</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: allPublic ? "#7c3aed" : "#5a4a6a" }}>{allPublic ? "🌍 공개" : "🔒 비공개"}</span>
                  <label style={{ position: "relative", width: 44, height: 24, cursor: "pointer" }} onClick={() => onToggleSeriesPublic(sid, seriesDetail.id, !allPublic)}>
                    <span style={{ position: "absolute", inset: 0, background: allPublic ? "#7c3aed" : "#2d2040", borderRadius: 24, transition: "0.3s" }}>
                      <span style={{ position: "absolute", height: 18, width: 18, left: allPublic ? 23 : 3, bottom: 3, background: "white", borderRadius: "50%", transition: "0.3s" }} />
                    </span>
                  </label>
                </div>
              </div>

              <button
                style={{ width: "100%", padding: "10px", background: "transparent", border: "1px solid #3d1f1f", borderRadius: 10, color: "#f87171", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", fontSize: 13, marginBottom: 20 }}
                onClick={() => onShowDeleteModal(seriesDetail)}
              >
                🗑️ 삭제
              </button>
            </>
          )}

          {/* 목차 */}
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#160f22", borderRadius: showToc ? "12px 12px 0 0" : 12, border: "1px solid #2d2040", cursor: "pointer" }}
            onClick={() => setShowToc(!showToc)}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "#c4b8d8" }}>
              📋 목차 <span style={{ color: "#7c3aed", marginLeft: 4 }}>{eps.length}화</span>
            </span>
            <span style={{ fontSize: 13, color: "#5a4a6a", display: "inline-block", transform: showToc ? "rotate(180deg)" : "rotate(0deg)", transition: "0.2s" }}>▾</span>
          </div>
          {showToc && (
            <div style={{ border: "1px solid #2d2040", borderTop: "none", borderRadius: "0 0 12px 12px", overflow: "hidden" }}>
              {eps.map((ep, idx) => (
                <div
                  key={ep.id}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#160f22", borderTop: idx > 0 ? "1px solid #2d2040" : "none", cursor: "pointer" }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#1a1228")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "#160f22")}
                  onClick={() => onOpenEpisode(ep, isMine)}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: "#2d1f4e", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#a78bfa", fontWeight: 600 }}>{ep.episode_number}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e8e0f0", marginBottom: 2 }}>{ep.episode_number}화. {ep.title}</div>
                    <div style={{ fontSize: 11, color: "#5a4a6a" }}>{new Date(ep.created_at).toLocaleDateString("ko-KR")}</div>
                  </div>
                  {isMine && (
                    <button
                      style={{ background: "transparent", border: "1px solid #2d2040", borderRadius: 8, padding: "4px 10px", color: "#7a6a8a", cursor: "pointer", fontSize: 11, fontFamily: "'Noto Serif KR', serif", flexShrink: 0 }}
                      onClick={(e) => { e.stopPropagation(); onEditFromLibrary(ep); }}
                    >
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
  );
}
