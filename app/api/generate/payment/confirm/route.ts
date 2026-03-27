import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { paymentKey, orderId, amount } = await req.json();

  const secretKey = process.env.TOSS_SECRET_KEY;
  const encoded = Buffer.from(`${secretKey}:`).toString("base64");

  const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${encoded}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: data.message }, { status: response.status });
  }

  return NextResponse.json(data);
}
