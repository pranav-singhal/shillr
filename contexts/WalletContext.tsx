import { getUserEmbeddedSolanaWallet, useEmbeddedSolanaWallet, usePrivy } from '@privy-io/expo';
import { Connection, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from '@solana/web3.js';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Network configuration
export type SolanaNetwork = 'devnet' | 'mainnet-beta';

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
  network: SolanaNetwork;
  isRefreshing: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  depositUSDC: (amount: number) => Promise<void>;
  withdrawUSDC: (amount: number, address: string) => Promise<void>;
  refreshWallet: () => Promise<void>;
  getSolanaConnection: () => Connection;
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
    sol: '0',
  });

  // Network configuration - defaulting to devnet for development
  const [network] = useState<SolanaNetwork>('mainnet-beta');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { user, isReady } = usePrivy();
  const solanaWallet = useEmbeddedSolanaWallet();
  
  // Get Solana connection based on the current network
  const getSolanaConnection = () => {
    return new Connection(clusterApiUrl(network));
  };
  
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
          
          // Fetch the real balance
          await refreshWallet();
          
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
      if (!wallet.publicKey) {
        return;
      }
      
      setIsRefreshing(true);
      
      // Get a connection to the Solana network
      const connection = getSolanaConnection();
      
      // Create a PublicKey object from the wallet's public key
      const publicKey = new PublicKey(wallet.publicKey);
      
      // Fetch the SOL balance
      const solBalance = await connection.getBalance(publicKey);

      console.log('solBalance', solBalance);
      
      // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
      const solBalanceInSol = solBalance / LAMPORTS_PER_SOL;
      
      // Update the balance state
      setBalance(prevBalance => ({
        ...prevBalance,
        sol: solBalanceInSol.toFixed(8),
      }));
      
    } catch (error) {
      console.error('Error refreshing wallet:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <WalletContext.Provider
      value={{
        wallet,
        balance,
        network,
        isRefreshing,
        connectWallet,
        disconnectWallet,
        depositUSDC,
        withdrawUSDC,
        refreshWallet,
        getSolanaConnection,
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