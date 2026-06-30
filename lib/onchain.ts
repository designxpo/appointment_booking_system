import "server-only";
import { billingEnv } from "@/lib/env";

/**
 * Minimal on-chain verification of a USDT (ERC-20) transfer via JSON-RPC.
 * No web3 library — raw eth_getTransactionByHash + eth_getTransactionReceipt.
 *
 * Verifies that `txHash`:
 *   - succeeded (receipt status 0x1)
 *   - called the configured USDT contract
 *   - is a transfer(adminWallet, amount) with amount >= expected base units
 *
 * Returns { ok } or { ok:false, reason }. If no EVM_RPC_URL is configured we
 * fail OPEN only in development (returns ok with a warning) so the scaffold is
 * usable; in production a missing RPC is a hard failure.
 */

const TRANSFER_SELECTOR = "a9059cbb";

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const url = billingEnv.rpcUrl!;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message ?? "RPC error");
  return json.result as T;
}

export interface VerifyResult {
  ok: boolean;
  reason?: string;
}

/**
 * Verify a USDT transfer of EXACTLY `expectedBaseUnits` to the admin wallet.
 * Exact-match matters: each upgrade gets a unique one-time amount (payment
 * intent), which is what binds an anonymous on-chain transfer to a specific
 * account. A ">=" check would let anyone claim a stranger's larger transfer.
 */
export async function verifyUsdtPayment(
  txHash: string,
  expectedBaseUnits: bigint,
): Promise<VerifyResult> {
  if (!billingEnv.rpcUrl) {
    if (process.env.NODE_ENV === "production") {
      return { ok: false, reason: "Payment verification is not configured." };
    }
    console.warn("[onchain] EVM_RPC_URL unset — skipping verification (dev only)");
    return { ok: true };
  }

  try {
    const [tx, receipt] = await Promise.all([
      rpc<null | { to: string; input: string }>("eth_getTransactionByHash", [txHash]),
      rpc<null | { status: string }>("eth_getTransactionReceipt", [txHash]),
    ]);

    if (!tx || !receipt) return { ok: false, reason: "Transaction not found yet." };
    if (receipt.status !== "0x1") return { ok: false, reason: "Transaction failed." };

    const contract = billingEnv.usdtContract.toLowerCase();
    if (tx.to?.toLowerCase() !== contract) {
      return { ok: false, reason: "Payment was not to the USDT contract." };
    }

    const input = tx.input.replace(/^0x/, "").toLowerCase();
    if (!input.startsWith(TRANSFER_SELECTOR)) {
      return { ok: false, reason: "Not an ERC-20 transfer." };
    }
    // transfer(address to, uint256 amount): 32-byte padded args after selector.
    const toArg = "0x" + input.slice(8 + 24, 8 + 64); // last 20 bytes of word 1
    const amountArg = BigInt("0x" + input.slice(8 + 64, 8 + 128));

    if (toArg.toLowerCase() !== billingEnv.adminWallet.toLowerCase()) {
      return { ok: false, reason: "Payment recipient mismatch." };
    }
    if (amountArg !== expectedBaseUnits) {
      return { ok: false, reason: "Paid amount does not match this payment request." };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "Verification error" };
  }
}
