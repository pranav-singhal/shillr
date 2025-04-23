import React, { createContext, useContext, useEffect, useState } from 'react';
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

// API response types for the Mainnet API
interface AutoFunToken {
  id: string; // Token mint address
  name: string;
  ticker: string; // Used as symbol
  image: string;
  description: string;
  marketCapUSD: number;
  tokenPriceUSD: number;
  priceChange24h: number;
  volume24h: number;
}

interface AutoFunResponse {
  tokens: AutoFunToken[];
  page: number;
  totalPages: number;
  total: number;
  hasMore: boolean;
}

// API params type
interface FetchTokensParams {
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  hideImported?: number;
  status?: string;
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

// Utility function to fetch tokens from Auto.fun API (mainnet)
async function fetchAutoFunTokens(params: FetchTokensParams = {}): Promise<AutoFunResponse> {
  const defaultParams: FetchTokensParams = {
    limit: 20,
    page: 1,
    sortBy: 'marketCapUSD',
    sortOrder: 'desc',
    hideImported: 1,
    status: 'bonded',
  };

  const queryParams = new URLSearchParams();
  const mergedParams = { ...defaultParams, ...params };

  Object.entries(mergedParams).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  console.log('Query params:', queryParams.toString());
  
  const url = `https://recursive.so/api/tokens?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      method: 'GET',
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', JSON.stringify(Object.fromEntries([...response.headers.entries()])));
    console.log('Response from auto fun:', response);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Detailed fetch error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      url,
    });
    
    // Rethrow the error after logging details
    throw error;
  }
}

// Convert Auto.fun tokens to our Coin format
function convertAutoFunToCoin(token: AutoFunToken): Coin {
  return {
    id: token.id,
    name: token.name,
    symbol: token.ticker.toLowerCase(),
    current_price: token.tokenPriceUSD,
    price_change_percentage_24h: token.priceChange24h,
    market_cap: token.marketCapUSD,
    total_volume: token.volume24h,
    image: token.image,
  };
}

// Utility function to fetch devnet tokens (placeholder for now)
async function fetchDevnetTokens(): Promise<Coin[]> {
  // Mock data for devnet (to be replaced with actual API call when available)
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

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return mockCoins;
}

export function CoinProvider({ children }: { children: React.ReactNode }) {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [portfolio, setPortfolio] = useState<Coin[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { wallet, balance, depositUSDC, withdrawUSDC, network } = useWallet();
  
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
      let fetchedCoins: Coin[];

      if (network === 'mainnet-beta') {
        console.log('Fetching coins for mainnet-beta network');
        // For mainnet, use the Auto.fun API
        try {
          const response = await fetchAutoFunTokens({
            limit: 20,
            page: 1,
            sortBy: 'marketCapUSD',
            sortOrder: 'desc',
          });
          
          fetchedCoins = response.tokens.map(convertAutoFunToCoin);
          console.log(`Successfully fetched ${fetchedCoins.length} tokens from mainnet`);
        } catch (mainnetError) {
          console.error('Mainnet fetch specific error:', mainnetError);
          throw mainnetError; // Re-throw to be caught by the outer catch
        }
      } else {
        console.log(`Fetching coins for ${network} network`);
        // For devnet, use the devnet API or mock data
        fetchedCoins = await fetchDevnetTokens();
        console.log(`Successfully fetched ${fetchedCoins.length} tokens from devnet`);
      }
      
      setCoins(fetchedCoins);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch coins';
      setError(errorMessage);
      console.error('Error fetching coins details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        network: network,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Load coins when network changes
  useEffect(() => {
    fetchCoins();
  }, [network]);
  
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