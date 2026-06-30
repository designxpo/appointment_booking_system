"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS } from "@/lib/plans";
import { verifyUsdtPayment } from "@/lib/onchain";
import { billingEnv } from "@/lib/env";
import type { PlanTier } from "@/lib/types";

const PERIOD_DAYS = 30;

/**
 * Two-step crypto subscription:
 *
 *  1. createPaymentIntent(tier) — issues a UNIQUE one-time amount
 *     (price + random cents, e.g. 19.37 USDT) tied to this account, expiring
 *     in 2h. The unique amount is what binds an anonymous on-chain transfer to
 *     this user — without it, anyone could submit a stranger's tx hash.
 *  2. activatePlan(intentId, txHash) — verifies on-chain that txHash paid
 *     EXACTLY the intent amount to the admin wallet, records it in the
 *     append-only payments ledger (unique tx_hash = replay-proof forever),
 *     and starts a 30-day period. The expire-plans cron downgrades lapsed
 *     plans; paying again extends.
 */

export async function createPaymentIntent(tier: PlanTier) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const plan = PLANS[tier];
  if (!plan || plan.priceUsdt === 0) return { error: "Invalid plan" };

  // Unique cents offset 0.01–0.99 → amount like 19.37. Retry on the rare
  // collision with another pending intent of the same amount.
  const admin = createAdminClient();
  for (let attempt = 0; attempt < 5; attempt++) {
    const cents = 1 + Math.floor(Math.random() * 99);
    const amount = Number((plan.priceUsdt + cents / 100).toFixed(2));

    const { data: clash } = await admin
      .from("payment_intents")
      .select("id")
      .eq("amount_usdt", amount)
      .eq("status", "pending")
      .gte("expires_at", new Date().toISOString())
      .maybeSingle();
    if (clash) continue;

    const { data: intent, error } = await admin
      .from("payment_intents")
      .insert({ clinic_id: user.id, plan: tier, amount_usdt: amount })
      .select("id, amount_usdt, expires_at")
      .single();
    if (error) return { error: error.message };

    return {
      ok: true,
      intentId: intent.id,
      amountUsdt: Number(intent.amount_usdt),
      expiresAt: intent.expires_at,
      wallet: billingEnv.adminWallet,
    };
  }
  return { error: "Could not allocate a payment amount. Try again." };
}

export async function activatePlan(intentId: string, txHash: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (!/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
    return { error: "Invalid transaction hash" };
  }

  const admin = createAdminClient();
  const { data: intent } = await admin
    .from("payment_intents")
    .select("id, clinic_id, plan, amount_usdt, status, expires_at")
    .eq("id", intentId)
    .eq("clinic_id", user.id) // an intent only works for the account that created it
    .single();
  if (!intent) return { error: "Payment request not found." };
  if (intent.status !== "pending") return { error: "This payment request was already used." };
  if (new Date(intent.expires_at).getTime() < Date.now()) {
    return { error: "This payment request expired. Start again." };
  }

  const tier = intent.plan as PlanTier;
  const decimals = billingEnv.usdtDecimals;
  const expectedBaseUnits = BigInt(
    Math.round(Number(intent.amount_usdt) * 10 ** decimals),
  );

  const verdict = await verifyUsdtPayment(txHash, expectedBaseUnits);
  if (!verdict.ok) return { error: verdict.reason ?? "Payment could not be verified." };

  // Ledger insert FIRST — its unique tx_hash makes replays a hard DB error,
  // closing the check-then-act race the old last_tx_hash field had.
  const { error: ledgerErr } = await admin.from("payments").insert({
    clinic_id: user.id,
    tx_hash: txHash,
    plan: tier,
    amount_usdt: intent.amount_usdt,
  });
  if (ledgerErr) {
    if (ledgerErr.code === "23505") return { error: "This payment has already been used." };
    return { error: ledgerErr.message };
  }

  await admin
    .from("payment_intents")
    .update({ status: "used" })
    .eq("id", intent.id);

  const now = new Date();
  const expires = new Date(now.getTime() + PERIOD_DAYS * 24 * 60 * 60 * 1000);
  const { error } = await admin
    .from("profiles")
    .update({
      plan: tier,
      plan_started_at: now.toISOString(),
      plan_expires_at: expires.toISOString(),
      last_tx_hash: txHash,
    })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/billing");
  return { ok: true, expiresAt: expires.toISOString() };
}
