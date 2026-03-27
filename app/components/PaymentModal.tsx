"use client";
import { useEffect, useRef, useState } from "react";

interface PaymentModalProps {
  onClose: () => void;
  onSuccess: () => void;
  plan: "day" | "month";
}

const PLANS = {
  day: { label: "오늘 하루 무제한", amount: 990, desc: "오늘 하루 동안 무제한 생성" },
  month: { label: "한 달 무제한", amount: 4900, desc: "30일 동안 무제한 생성" },
};

export default function PaymentModal({ onClose, onSuccess, plan }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"day" | "month">(plan);
  const widgetRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const agreementRef = useRef<HTMLDivElement>(null);

  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
  const currentPlan = PLANS[selectedPlan];

  useEffect(() => {
    const loadWidget = async () => {
      const { loadTossPayments } = await import("@tosspayments/tosspayments-sdk");
      const tossPayments = await loadTossPayments(clientKey);
      const orderId = `novella_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const widgets = tossPayments.widgets({ customerKey: orderId });
      widgetRef.current = widgets;

      await widgets.setAmount({ currency: "KRW", value: currentPlan.amount });
      await widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" });
      await widgets.renderAgreement({ selector: "#payment-agreement", variantKey: "AGREEMENT" });
    };

    loadWidget();
  }, [selectedPlan]);

  async function handlePay() {
    if (!widgetRef.current) return;
    setLoading(true); setError("");
    try {
      await widgetRef.current.requestPayment({
        orderId: `novella_${Date.now()}`,
        orderName: currentPlan.label,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (e: any) {
      setError(e.message || "결제 중 오류가 발생했어요.");
    }
    setLoading(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: "#1a1228", borderRadius: "20px 20px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>

        {/* 헤더 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#f0ecfc", fontFamily: "'Noto Serif KR', serif" }}>✨ 더 쓰고 싶다면</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#8878b0", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {/* 플랜 선택 */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {(["day", "month"] as const).map(p => (
            <button key={p}
              onClick={() => setSelectedPlan(p)}
              style={{ flex: 1, padding: "14px 8px", borderRadius: 12, border: `2px solid ${selectedPlan === p ? "#9b6dff" : "#332860"}`, background: selectedPlan === p ? "rgba(155,109,255,0.15)" : "rgba(255,255,255,0.03)", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", transition: "all 0.2s" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: selectedPlan === p ? "#d4bfff" : "#cdc5e8", marginBottom: 4 }}>{PLANS[p].label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: selectedPlan === p ? "#9b6dff" : "#8878b0" }}>{PLANS[p].amount.toLocaleString()}원</div>
              <div style={{ fontSize: 11, color: "#8878b0", marginTop: 2 }}>{PLANS[p].desc}</div>
            </button>
          ))}
        </div>

        {/* 토스 위젯 */}
        <div id="payment-method" ref={containerRef} style={{ marginBottom: 10 }} />
        <div id="payment-agreement" ref={agreementRef} style={{ marginBottom: 16 }} />

        {error && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 10, textAlign: "center" }}>{error}</div>}

        <button
          onClick={handlePay}
          disabled={loading}
          style={{ width: "100%", padding: 16, borderRadius: 12, border: "none", background: loading ? "#5a3fa0" : "linear-gradient(135deg, #7c3aed, #b06aff)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Noto Serif KR', serif", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>
          {loading ? "결제 처리 중..." : `${currentPlan.amount.toLocaleString()}원 결제하기`}
        </button>

        <div style={{ textAlign: "center", fontSize: 11, color: "#6a5a8a", marginTop: 12 }}>
          테스트 모드 · 실제 결제 없음
        </div>
      </div>
    </div>
  );
}
