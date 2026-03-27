"use client";

interface AuthModalProps {
  authMode: "login" | "signup";
  setAuthMode: (m: "login" | "signup") => void;
  email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  authError: string;
  authLoading: boolean;
  onClose: () => void;
  onAuth: () => void;
  onGoogleLogin: () => void;
}

export default function AuthModal({
  authMode, setAuthMode, email, setEmail, password, setPassword,
  authError, authLoading, onClose, onAuth, onGoogleLogin,
}: AuthModalProps) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}
      onClick={onClose}
    >
      <div
        style={{ background: "#1a1228", borderRadius: "20px", padding: "28px 20px 32px", width: "100%", maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: 36, height: 4, background: "#2d2040", borderRadius: 2, margin: "0 auto 24px" }} />
        <h2 style={{ marginBottom: 20, fontSize: 18, fontWeight: 600, textAlign: "center" }}>
          {authMode === "login" ? "로그인" : "회원가입"}
        </h2>

        {/* 구글 로그인 */}
        <button
          style={{ width: "100%", padding: 13, fontSize: 15, marginBottom: 14, background: "#fff", color: "#222", border: "1.5px solid #e0e0e0", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", fontFamily: "'Noto Serif KR', serif", transition: "background 0.15s" }}
          onClick={onGoogleLogin}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Google로 계속하기
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, color: "#5a4a6a", fontSize: 12 }}>
          <span style={{ flex: 1, borderTop: "1px solid #2d2040" }} />
          또는
          <span style={{ flex: 1, borderTop: "1px solid #2d2040" }} />
        </div>

        <input
          className="input-field" style={{ marginBottom: 10 }} type="email" placeholder="이메일"
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input-field" style={{ marginBottom: 16 }} type="password" placeholder="비밀번호 (6자 이상)"
          value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onAuth(); }}
        />
        {authError && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{authError}</div>}

        <button className="btn btn-primary" style={{ width: "100%", padding: 14, fontSize: 15 }} onClick={onAuth} disabled={authLoading}>
          {authLoading ? <><span className="spinner" /> 처리 중...</> : authMode === "login" ? "로그인" : "회원가입"}
        </button>

        <div style={{ textAlign: "center", fontSize: 13, color: "#7a6a8a", marginTop: 14 }}>
          {authMode === "login" ? "계정이 없으신가요? " : "이미 계정이 있으신가요? "}
          <span
            style={{ color: "#a78bfa", cursor: "pointer" }}
            onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); }}
          >
            {authMode === "login" ? "회원가입" : "로그인"}
          </span>
        </div>
      </div>
    </div>
  );
}
