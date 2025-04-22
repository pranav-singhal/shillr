import { getUserEmbeddedSolanaWallet, useEmbeddedSolanaWallet, usePrivy } from '@privy-io/expo';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Platform-specific storage implementation
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  }
};

interface WalletContextType {
  wallet: {
    publicKey: string | null;
    isConnected: boolean;
  };
  balance: {
    usdc: string;
    sol: string;
  };
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  depositUSDC: (amount: number) => Promise<void>;
  withdrawUSDC: (amount: number, address: string) => Promise<void>;
  refreshWallet: () => Promise<void>;
}

interface WalletProviderProps {
  children: React.ReactNode;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: WalletProviderProps) {
  const [wallet, setWallet] = useState<{
    publicKey: string | null;
    isConnected: boolean;
  }>({
    publicKey: null,
    isConnected: false,
  });
  
  const [balance, setBalance] = useState({
    usdc: '10',
    sol: '10',
  });

  const { user, isReady } = usePrivy();
  const solanaWallet = useEmbeddedSolanaWallet();
  
  // Initialize wallet when user is loaded
  useEffect(() => {
    const initWallet = async () => {
      if (isReady && user) {
        // Check if user has an embedded wallet
        const embeddedWallet = getUserEmbeddedSolanaWallet(user);
        
        if (embeddedWallet && embeddedWallet.address) {
          setWallet({
            publicKey: embeddedWallet.address,
            isConnected: true,
          });
          
          await refreshWallet();
        } else {
          // Create a wallet if they don't have one yet
          await connectWallet();
        }
      } else if (isReady && !user) {
        // Reset wallet state when user logs out
        setWallet({
          publicKey: null,
          isConnected: false,
        });
      }
    };
    
    initWallet();
  }, [isReady, user]);
  
  const connectWallet = async () => {
    try {
      // If we have a Privy user, create an embedded wallet
      if (user) {
        // Create wallet if none exists
        if (solanaWallet.wallets && solanaWallet.wallets.length === 0) {
          await solanaWallet.create?.();
        }
        
        // Get the wallet address after creation
        const embeddedWallet = getUserEmbeddedSolanaWallet(user);
        
        if (embeddedWallet && embeddedWallet.address) {
          setWallet({
            publicKey: embeddedWallet.address,
            isConnected: true,
          });
          
          // Initialize with some balance for demo
          setBalance({
            usdc: '10.00',
            sol: '0.5',
          });
          
          return;
        }
      }
      
      // Fallback to demo wallet if no Privy user
      const randomBytes = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Math.random().toString()
      );
      
      const publicKey = randomBytes.substring(0, 32);
      
      // Store the public key securely
      await storage.setItem('wallet_public_key', publicKey);
      
      setWallet({
        publicKey: publicKey,
        isConnected: true,
      });
      
      // Initialize with some balance for demo
      setBalance({
        usdc: '10.00',
        sol: '0.5',
      });
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };
  
  const disconnectWallet = async () => {
    try {
      // Clear wallet data from secure storage
      await storage.removeItem('wallet_public_key');
      
      // Reset wallet state
      setWallet({
        publicKey: null,
        isConnected: false,
      });
      
      // Reset balance
      setBalance({
        usdc: '0',
        sol: '0',
      });
      
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };
  
  const depositUSDC = async (amount: number) => {
    try {
      // In a real app, we would call a blockchain API
      // For this demo, we'll just update the balance in state
      const newBalance = parseFloat(balance.usdc) + amount;
      
      setBalance({
        ...balance,
        usdc: newBalance.toFixed(2),
      });
      
    } catch (error) {
      console.error('Error depositing USDC:', error);
    }
  };
  
  const withdrawUSDC = async (amount: number, address: string) => {
    try {
      // In a real app, we would call a blockchain API
      // For this demo, we'll just update the balance in state
      const newBalance = Math.max(0, parseFloat(balance.usdc) - amount);
      
      setBalance({
        ...balance,
        usdc: newBalance.toFixed(2),
      });
      
    } catch (error) {
      console.error('Error withdrawing USDC:', error);
    }
  };
  
  const refreshWallet = async () => {
    try {
      // In a real app, we would query the blockchain for latest balances
      // For this demo, we'll use the stored balance
      
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Error refreshing wallet:', error);
    }
  };
  
  return (
    <WalletContext.Provider
      value={{
        wallet,
        balance,
        connectWallet,
        disconnectWallet,
        depositUSDC,
        withdrawUSDC,
        refreshWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  
  return context;
}