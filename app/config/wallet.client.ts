import {
  allowAllModules,
  FREIGHTER_ID,
  StellarWalletsKit,
  WalletNetwork,
} from "@creit.tech/stellar-wallets-kit";

// Key used in localStorage for persisted wallet choice.
const SELECTED_WALLET_ID = FREIGHTER_ID;

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function getSelectedWalletId() {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(SELECTED_WALLET_ID);
  } catch {
    return null;
  }
}

// Lazy, singleton kit instance created only in the browser.
let kit: StellarWalletsKit | null = null;
export function getKit() {
  if (!isBrowser()) {
    throw new Error("StellarWalletsKit accessed on the server");
  }
  if (!kit) {
    kit = new StellarWalletsKit({
      modules: allowAllModules(),
      network: WalletNetwork.TESTNET,
      selectedWalletId: getSelectedWalletId() ?? FREIGHTER_ID,
    });
  }
  return kit;
}

export const signTransaction = (...args: any[]) => (getKit().signTransaction as any)(...args);

export async function getPublicKey() {
  if (!isBrowser()) return null; // SSR always null
  if (!getSelectedWalletId()) return null;
  const { address } = await getKit().getAddress();
  return address;
}

export async function setWallet(walletId: string) {
  if (!isBrowser()) return; // no-op on server
  localStorage.setItem(SELECTED_WALLET_ID, walletId);
  getKit().setWallet(walletId);
  // Notify any listeners that wallet selection changed.
  window.dispatchEvent(new CustomEvent("wallet:changed"));
}

export async function disconnect(callback?: () => Promise<void>) {
  if (!isBrowser()) return; // no-op on server
  localStorage.removeItem(SELECTED_WALLET_ID);
  getKit().disconnect();
  window.dispatchEvent(new CustomEvent("wallet:changed"));
  if (callback) await callback();
}

export async function connect(callback?: () => Promise<void>) {
  if (!isBrowser()) return; // no-op on server
  await getKit().openModal({
    onWalletSelected: async (option) => {
      try {
        await setWallet(option.id);
        if (callback) await callback();
      } catch (e) {
        console.error(e);
      }
      return option.id;
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                                  Balances                                  */
/* -------------------------------------------------------------------------- */
export interface HorizonBalance {
  asset_type: string; // e.g. "native" | "credit_alphanum4" | "credit_alphanum12"
  asset_code?: string;
  asset_issuer?: string;
  balance: string; // string decimal per Horizon
}

interface AccountResponse {
  balances: HorizonBalance[];
}

const TESTNET_HORIZON = "https://horizon-testnet.stellar.org";

/** Fetch all balances for the current public key from Horizon (TESTNET). */
export async function getBalances(): Promise<HorizonBalance[] | null> {
  if (!isBrowser()) return null;
  const pubKey = await getPublicKey();
  if (!pubKey) return null;
  try {
    const res = await fetch(`${TESTNET_HORIZON}/accounts/${pubKey}`);
    if (!res.ok) throw new Error(`Horizon error ${res.status}`);
    const data: AccountResponse = await res.json();
    return data.balances;
  } catch (e) {
    console.error("Failed to load balances", e);
    return null;
  }
}

/** Convenience helper returning the native XLM balance as number (or null). */
export async function getNativeBalance(): Promise<number | null> {
  const balances = await getBalances();
  if (!balances) return null;
  const native = balances.find((b) => b.asset_type === "native");
  if (!native) return null;
  const asNum = Number(native.balance);
  return Number.isFinite(asNum) ? asNum : null;
}
