declare module '@stellar/freighter-api' {
  export function isConnected(): Promise<boolean>;
  export function getPublicKey(): Promise<string>;
  export function setAllowed(): Promise<void>;
  export function signTransaction(xdr: string, options?: { networkPassphrase: string }): Promise<string>;
  
  const freighter: {
    isConnected: () => Promise<boolean>;
    getPublicKey: () => Promise<string>;
    setAllowed: () => Promise<void>;
    signTransaction: (xdr: string, options?: { networkPassphrase: string }) => Promise<string>;
  };
  
  export default freighter;
}  