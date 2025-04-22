import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from './WalletContext';

// Define types
interface Coin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
  amount?: number;
}

interface CoinContextType {
  coins: Coin[];
  portfolio: Coin[];
  totalValue: number;
  loading: boolean;
  error: string | null;
  fetchCoins: () => Promise<void>;
  buyToken: (coin: Coin, amount: number) => Promise<boolean>;
  removeFromPortfolio: (coinId: string) => void;
  buyMore: (coin: Coin, usdcAmount: number) => Promise<boolean>;
}

const CoinContext = createContext<CoinContextType | undefined>(undefined);

export function CoinProvider({ children }: { children: React.ReactNode }) {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [portfolio, setPortfolio] = useState<Coin[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { wallet, balance, depositUSDC, withdrawUSDC } = useWallet();
  
  // Mock data for demo purposes
  const mockCoins = [
    {
      id: 'dogecoin',
      name: 'Dogecoin',
      symbol: 'doge',
      current_price: 0.1435,
      price_change_percentage_24h: 2.35,
      market_cap: 20430250000,
      total_volume: 1202540000,
      image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    },
    {
      id: 'shiba-inu',
      name: 'Shiba Inu',
      symbol: 'shib',
      current_price: 0.00002154,
      price_change_percentage_24h: -1.27,
      market_cap: 12650780000,
      total_volume: 389540000,
      image: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
    },
    {
      id: 'pepe',
      name: 'Pepe',
      symbol: 'pepe',
      current_price: 0.00000914,
      price_change_percentage_24h: 5.67,
      market_cap: 3845670000,
      total_volume: 578990000,
      image: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg',
    },
    {
      id: 'floki',
      name: 'Floki',
      symbol: 'floki',
      current_price: 0.0001547,
      price_change_percentage_24h: -3.45,
      market_cap: 1456780000,
      total_volume: 234560000,
      image: 'https://assets.coingecko.com/coins/images/16746/large/FLOKI.png',
    },
    {
      id: 'bonk',
      name: 'Bonk',
      symbol: 'bonk',
      current_price: 0.00002634,
      price_change_percentage_24h: 8.12,
      market_cap: 1654890000,
      total_volume: 345670000,
      image: 'https://assets.coingecko.com/coins/images/28600/large/bonk.jpg',
    },
    {
      id: 'wojak',
      name: 'Wojak',
      symbol: 'wojak',
      current_price: 0.00000143,
      price_change_percentage_24h: -2.78,
      market_cap: 143560000,
      total_volume: 45678000,
      image: 'https://assets.coingecko.com/coins/images/30152/large/wojak-finance.png',
    },
    {
      id: 'mog-coin',
      name: 'Mog Coin',
      symbol: 'mog',
      current_price: 0.00003567,
      price_change_percentage_24h: 12.34,
      market_cap: 356780000,
      total_volume: 89670000,
      image: 'https://assets.coingecko.com/coins/images/29457/large/mogcoin.png',
    },
    {
      id: 'cat-in-a-dogs-world',
      name: 'Cat In A Dogs World',
      symbol: 'catdog',
      current_price: 0.0000789,
      price_change_percentage_24h: -5.67,
      market_cap: 87650000,
      total_volume: 23456000,
      image: 'https://assets.coingecko.com/coins/images/29440/large/catdogeai.png',
    }
  ];
  
  // Update total portfolio value whenever portfolio changes
  useEffect(() => {
    const newTotalValue = portfolio.reduce((total, coin) => {
      return total + (coin.amount || 0) * coin.current_price;
    }, 0);
    
    setTotalValue(newTotalValue);
  }, [portfolio]);
  
  const fetchCoins = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, we would fetch from an API
      // For this demo, we'll use the mock data
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Randomize the order of the coins
      const shuffledCoins = [...mockCoins].sort(() => 0.5 - Math.random());
      
      setCoins(shuffledCoins);
    } catch (error) {
      setError('Failed to fetch coins');
      console.error('Error fetching coins:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const buyToken = async (coin: Coin, usdcAmount: number) => {
    try {
      // Check if user has enough balance
      if (parseFloat(balance.usdc) < usdcAmount) {
        throw new Error('Insufficient USDC balance');
      }
      
      // Calculate amount of tokens to buy
      const tokenAmount = usdcAmount / coin.current_price;
      
      // Update USDC balance
      await withdrawUSDC(usdcAmount, 'internal_transfer');
      
      // Check if coin is already in portfolio
      const existingCoinIndex = portfolio.findIndex(item => item.id === coin.id);
      
      if (existingCoinIndex !== -1) {
        // Update existing coin
        const updatedPortfolio = [...portfolio];
        updatedPortfolio[existingCoinIndex] = {
          ...updatedPortfolio[existingCoinIndex],
          amount: (updatedPortfolio[existingCoinIndex].amount || 0) + tokenAmount,
        };
        
        setPortfolio(updatedPortfolio);
      } else {
        // Add new coin to portfolio
        setPortfolio([...portfolio, { ...coin, amount: tokenAmount }]);
      }
      
      return true;
    } catch (error) {
      console.error('Error buying token:', error);
      return false;
    }
  };
  
  const removeFromPortfolio = (coinId: string) => {
    try {
      // Find the coin to remove
      const coinToRemove = portfolio.find(coin => coin.id === coinId);
      
      if (!coinToRemove) {
        throw new Error('Coin not found in portfolio');
      }
      
      // Calculate USDC value
      const usdcValue = (coinToRemove.amount || 0) * coinToRemove.current_price;
      
      // Update USDC balance
      depositUSDC(usdcValue);
      
      // Remove coin from portfolio
      const updatedPortfolio = portfolio.filter(coin => coin.id !== coinId);
      setPortfolio(updatedPortfolio);
    } catch (error) {
      console.error('Error removing from portfolio:', error);
    }
  };
  
  const buyMore = async (coin: Coin, usdcAmount: number) => {
    return await buyToken(coin, usdcAmount);
  };
  
  return (
    <CoinContext.Provider
      value={{
        coins,
        portfolio,
        totalValue,
        loading,
        error,
        fetchCoins,
        buyToken,
        removeFromPortfolio,
        buyMore,
      }}
    >
      {children}
    </CoinContext.Provider>
  );
}

export function useCoins() {
  const context = useContext(CoinContext);
  
  if (context === undefined) {
    throw new Error('useCoins must be used within a CoinProvider');
  }
  
  return context;
}