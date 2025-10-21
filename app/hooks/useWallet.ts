import { useState, useEffect } from 'react';
import freighter from '@stellar/freighter-api';

export function useWallet() {
  const [address, setAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const connected = await freighter.isConnected();
      if (connected) {
        const userAddress = await freighter.getPublicKey();
        setAddress(userAddress);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connect = async () => {
    setIsLoading(true);
    try {
      const connected = await freighter.isConnected();
      
      if (!connected) {
        window.open('https://www.freighter.app/', '_blank');
        alert('Please install Freighter wallet extension first');
        setIsLoading(false);
        return;
      }

      // Get public key (this will trigger permission popup)
      const userAddress = await freighter.getPublicKey();
      
      if (!userAddress) {
        throw new Error('No address returned from wallet');
      }

      setAddress(userAddress);
      setIsConnected(true);
      
      console.log('Wallet connected:', userAddress);
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      
      // Handle specific errors
      if (error?.message?.includes('User declined')) {
        alert('Connection cancelled by user');
      } else if (error?.message?.includes('Freighter is locked')) {
        alert('Please unlock your Freighter wallet first');
      } else {
        alert(`Failed to connect wallet: ${error?.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setAddress('');
    setIsConnected(false);
  };

  const signTransaction = async (xdr: string): Promise<string> => {
    try {
      const signedXdr = await freighter.signTransaction(xdr, {
        networkPassphrase: 'Test SDF Network ; September 2015',
      });
      return signedXdr;
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  };

  return {
    address,
    isConnected,
    isLoading,
    connect,
    disconnect,
    signTransaction,
  };
}