import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, PanResponder, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useWallet } from '@/contexts/WalletContext';
import { useCoins } from '@/contexts/CoinContext';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '@/components/Header';
import { Info as InfoIcon, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react-native';
import Slider from '@/components/Slider';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export default function DiscoverScreen() {
  const { colors } = useTheme();
  const { wallet, balance } = useWallet();
  const { coins, loading, fetchCoins } = useCoins();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeAmount, setSwipeAmount] = useState(5); // Default $5 USDC per swipe
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp'
  });

  useEffect(() => {
    fetchCoins();
  }, []);

  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false
    }).start();
  };

  const swipeLeft = () => {
    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH, y: 0 },
      duration: 250,
      useNativeDriver: false
    }).start(() => {
      setCurrentIndex(currentIndex + 1);
      position.setValue({ x: 0, y: 0 });
    });
  };

  const swipeRight = () => {
    if (parseFloat(balance.usdc) < swipeAmount) {
      alert('Insufficient USDC balance');
      resetPosition();
      return;
    }
    
    triggerHapticFeedback();
    
    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH, y: 0 },
      duration: 250,
      useNativeDriver: false
    }).start(() => {
      // Logic for buying the coin would go here
      const coin = coins[currentIndex];
      // Buy coin logic with swipeAmount of USDC
      setCurrentIndex(currentIndex + 1);
      position.setValue({ x: 0, y: 0 });
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeLeft();
        } else {
          resetPosition();
        }
      }
    })
  ).current;

  const renderCard = () => {
    if (loading) {
      return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading coins...</Text>
        </View>
      );
    }

    if (currentIndex >= coins.length) {
      return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.noMoreText, { color: colors.text }]}>No more coins!</Text>
          <TouchableOpacity 
            style={[styles.refreshButton, { backgroundColor: colors.tint }]}
            onPress={() => {
              setCurrentIndex(0);
              fetchCoins();
            }}
          >
            <Text style={[styles.refreshButtonText, { color: colors.card }]}>Refresh</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const coin = coins[currentIndex];
    const isPriceUp = coin.price_change_percentage_24h > 0;

    return (
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          { 
            backgroundColor: colors.card,
            borderColor: colors.border,
            transform: [
              { translateX: position.x },
              { rotate }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent']}
          style={styles.gradientTop}
        />
        
        <View style={styles.cardContent}>
          <Image source={{ uri: coin.image }} style={styles.coinImage} />
          
          <Text style={[styles.coinName, { color: colors.text }]}>{coin.name}</Text>
          <Text style={[styles.coinSymbol, { color: colors.neutral }]}>{coin.symbol.toUpperCase()}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={[styles.coinPrice, { color: colors.text }]}>
              ${coin.current_price.toFixed(4)}
            </Text>
            
            <View style={styles.priceChangeContainer}>
              {isPriceUp ? (
                <TrendingUp color={colors.positive} size={16} />
              ) : (
                <TrendingDown color={colors.negative} size={16} />
              )}
              <Text 
                style={[
                  styles.priceChange, 
                  { color: isPriceUp ? colors.positive : colors.negative }
                ]}
              >
                {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
              </Text>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Market Cap</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                ${(coin.market_cap / 1000000).toFixed(2)}M
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Volume (24h)</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                ${(coin.total_volume / 1000000).toFixed(2)}M
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.infoButton}>
            <InfoIcon size={18} color={colors.muted} />
            <Text style={[styles.infoText, { color: colors.muted }]}>Learn more</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.swipeGuide}>
          <View style={[styles.swipeAction, styles.swipeLeft]}>
            <Text style={styles.swipeActionText}>SKIP</Text>
          </View>
          <View style={[styles.swipeAction, styles.swipeRight]}>
            <Text style={styles.swipeActionText}>BUY</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Discover" />
      
      <View style={styles.sliderContainer}>
        <Text style={[styles.sliderLabel, { color: colors.text }]}>
          Swipe Amount: ${swipeAmount} USDC
        </Text>
        <Slider
          value={swipeAmount}
          minimumValue={1}
          maximumValue={100}
          step={1}
          onValueChange={setSwipeAmount}
        />
      </View>
      
      <View style={styles.cardsContainer}>
        {renderCard()}
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.skipButton, { backgroundColor: colors.muted }]} 
          onPress={swipeLeft}
        >
          <Text style={styles.actionButtonText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.buyButton, { backgroundColor: colors.positive }]} 
          onPress={swipeRight}
        >
          <Text style={styles.actionButtonText}>Buy ${swipeAmount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  sliderContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sliderLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginBottom: 8,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 1.4,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 80,
    zIndex: 1,
  },
  cardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  coinImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    alignSelf: 'center',
  },
  coinName: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    marginBottom: 4,
    textAlign: 'center',
  },
  coinSymbol: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  coinPrice: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginRight: 12,
  },
  priceChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceChange: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginLeft: 6,
  },
  swipeGuide: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  swipeAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
  },
  swipeLeft: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  swipeRight: {
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
  },
  swipeActionText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 32,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    gap: 16,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    minWidth: 120,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: '#6B7280',
  },
  buyButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    color: 'white',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  loadingText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    textAlign: 'center',
  },
  noMoreText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignSelf: 'center',
  },
  refreshButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});