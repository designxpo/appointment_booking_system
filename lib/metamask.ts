/**
 * Minimal MetaMask USDT transfer helper (browser-only).
 *
 * Builds an ERC-20 `transfer(address,uint256)` call to the configured USDT
 * contract, sending the monthly price to the admin wallet, and returns the tx
 * hash. No web3 library — just the injected EIP-1193 provider, so the scaffold
 * stays dependency-light. USDT uses 6 decimals.
 */

interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

const TRANSFER_SELECTOR = "0xa9059cbb"; // keccak256("transfer(address,uint256)")[:4]

function pad32(hex: string): string {
  return hex.replace(/^0x/, "").padStart(64, "0");
}

/**
 * USDT has 6 decimals. The amount is paid to the CENT (payment-intent binding:
 * the unique cents are how the server matches this transfer to your account),
 * so rounding here must mirror the server's Math.round to base units.
 */
function toUsdtBaseUnits(amount: number): string {
  const base = BigInt(Math.round(amount * 1_000_000));
  return base.toString(16);
}

export async function payWithUsdt(amountUsdt: number): Promise<string> {
  const eth = typeof window !== "undefined" ? window.ethereum : undefined;
  if (!eth) throw new Error("MetaMask not found. Please install it.");

  const admin = process.env.NEXT_PUBLIC_ADMIN_USDT_WALLET;
  const contract = process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS;
  if (!admin || !contract) throw new Error("Billing wallet is not configured.");

  const accounts = (await eth.request({
    method: "eth_requestAccounts",
  })) as string[];
  const from = accounts[0];
  if (!from) throw new Error("No wallet account connected.");

  const data =
    TRANSFER_SELECTOR +
    pad32(admin.toLowerCase()) +
    pad32(toUsdtBaseUnits(amountUsdt));

  const txHash = (await eth.request({
    method: "eth_sendTransaction",
    params: [{ from, to: contract, data, value: "0x0" }],
  })) as string;

  return txHash;
}
