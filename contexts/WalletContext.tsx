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
  const [wallet, setWallet] = useState({
    publicKey: null,
    isConnected: false,
  });
  
  const [balance, setBalance] = useState({
    usdc: '10',
    sol: '10',
  });
  
  // Initialize wallet on app load
  useEffect(() => {
    const initWallet = async () => {
      try {
        const storedPublicKey = await storage.getItem('wallet_public_key');
        
        if (storedPublicKey) {
          setWallet({
            publicKey: storedPublicKey,
            isConnected: true,
          });
          
          await refreshWallet();
        }
      } catch (error) {
        console.error('Error initializing wallet:', error);
      }
    };
    
    initWallet();
  }, []);
  
  const connectWallet = async () => {
    try {
      // In a real app, we would use a real wallet adapter
      // For this demo, we'll generate a fake key pair
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
      
      return true;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return false;
    }
  };
  
  const disconnectWallet = async () => {
    try {
      await storage.removeItem('wallet_public_key');
      await storage.removeItem('wallet_balance_usdc');
      
      setWallet({
        publicKey: null,
        isConnected: false,
      });
      
      setBalance({
        usdc: '0',
        sol: '0',
      });
      
      return true;
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      return false;
    }
  };
  
  const refreshWallet = async () => {
    try {
      // In a real app, this would query the blockchain
      // For this demo, we'll retrieve the stored balance
      const storedUSDC = await storage.getItem('wallet_balance_usdc');
      
      if (storedUSDC) {
        setBalance(prev => ({
          ...prev,
          usdc: storedUSDC,
        }));
      }
    } catch (error) {
      console.error('Error refreshing wallet:', error);
    }
  };
  
  const depositUSDC = async (amount: number) => {
    try {
      // In a real app, this would interact with a payment processor
      // For this demo, we'll just update the stored balance
      const newBalance = (parseFloat(balance.usdc) + amount).toFixed(2);
      
      await storage.setItem('wallet_balance_usdc', newBalance);
      
      setBalance(prev => ({
        ...prev,
        usdc: newBalance,
      }));
      
      return true;
    } catch (error) {
      console.error('Error depositing USDC:', error);
      return false;
    }
  };
  
  const withdrawUSDC = async (amount: number, address: string) => {
    try {
      // In a real app, this would create a blockchain transaction
      // For this demo, we'll just update the stored balance
      const currentBalance = parseFloat(balance.usdc);
      
      if (amount > currentBalance) {
        throw new Error('Insufficient balance');
      }
      
      const newBalance = (currentBalance - amount).toFixed(2);
      
      await storage.setItem('wallet_balance_usdc', newBalance);
      
      setBalance(prev => ({
        ...prev,
        usdc: newBalance,
      }));
      
      return true;
    } catch (error) {
      console.error('Error withdrawing USDC:', error);
      return false;
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