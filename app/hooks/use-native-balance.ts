import { useEffect, useState, useCallback } from "react";
import { getNativeBalance } from "~/config/wallet.client";

export function useNativeBalance(address: string) {
  const [balance, setBalance] = useState<string>("-");

  const fetchBalance = useCallback(async () => {
    if (!address || address === "-") {
      setBalance("-");
      return;
    }
    const bal = await getNativeBalance();
    setBalance(bal != null ? bal.toFixed(2) : "0.00");
  }, [address]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!address || address === "-") {
        setBalance("-");
        return;
      }
      const bal = await getNativeBalance();
      if (!cancelled) {
        setBalance(bal != null ? bal.toFixed(2) : "0.00");
      }
    };
    run();
    console.log("changed balance");
    return () => {
      cancelled = true;
    };
  }, [address]);

  return { balance, refetch: fetchBalance } as const;
}
