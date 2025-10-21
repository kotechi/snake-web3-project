import { useCallback, useEffect, useState } from "react";
import { getPublicKey, connect, disconnect } from "~/config/wallet.client";

export interface UseWalletOptions {
  autoConnect?: boolean; // attempt to read existing wallet on mount
}

export function useWallet(options: UseWalletOptions = {}) {
  const { autoConnect = true } = options;
  const [address, setAddress] = useState<string>("-");
  const isConnected = address !== "-";
  const [loading, setLoading] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    const pub = await getPublicKey();
    setAddress(pub ?? "-");
  }, []);

  const handleConnect = useCallback(async () => {
    setLoading(true);
    await connect(refresh);
    setLoading(false);
  }, [refresh]);

  const handleDisconnect = useCallback(async () => {
    setLoading(true);
    await disconnect(refresh);
    setLoading(false);
  }, [refresh]);

  useEffect(() => {
    if (autoConnect) {
      void refresh();
    }
    // Listen for global wallet change events so multiple hook instances stay in sync.
    const handler = () => void refresh();
    if (typeof window !== "undefined") {
      window.addEventListener("wallet:changed", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("wallet:changed", handler);
      }
    };
  }, [autoConnect, refresh]);

  return {
    address,
    isConnected,
    loading,
    refresh,
    connect: handleConnect,
    disconnect: handleDisconnect,
  } as const;
}
