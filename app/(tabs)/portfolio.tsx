import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Header from '@/components/Header';
import { useCoins } from '@/contexts/CoinContext';
import { ArrowUpRight, TrendingUp, TrendingDown, X } from 'lucide-react-native';
import PortfolioChart from '@/components/PortfolioChart';

export default function PortfolioScreen() {
  const { colors } = useTheme();
  const { portfolio, totalValue, removeFromPortfolio, buyMore } = useCoins();
  const [timeFrame, setTimeFrame] = useState('1D');
  
  const timeFrames = ['1D', '1W', '1M', '3M', 'ALL'];

  const renderPortfolioItem = ({ item }) => {
    const isPriceUp = item.price_change_percentage_24h > 0;
    const valueHeld = item.amount * item.current_price;
    
    return (
      <Pressable
        style={[styles.coinItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={styles.coinHeader}>
          <View style={styles.coinInfo}>
            <Image source={{ uri: item.image }} style={styles.coinImage} />
            <View>
              <Text style={[styles.coinName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.coinSymbol, { color: colors.neutral }]}>{item.symbol.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.coinValues}>
            <Text style={[styles.coinValue, { color: colors.text }]}>${valueHeld.toFixed(2)}</Text>
            <View style={styles.priceChangeContainer}>
              {isPriceUp ? (
                <TrendingUp color={colors.positive} size={14} />
              ) : (
                <TrendingDown color={colors.negative} size={14} />
              )}
              <Text 
                style={[
                  styles.priceChange, 
                  { color: isPriceUp ? colors.positive : colors.negative }
                ]}
              >
                {Math.abs(item.price_change_percentage_24h).toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.coinDetails}>
          <Text style={[styles.coinAmount, { color: colors.neutral }]}>
            {item.amount.toFixed(4)} {item.symbol.toUpperCase()} @ ${item.current_price.toFixed(4)}
          </Text>
          
          <View style={styles.coinActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.highlight }]}
              onPress={() => buyMore(item, 5)} // Buy $5 more of the coin
            >
              <Text style={styles.actionButtonText}>Buy More</Text>
              <ArrowUpRight size={14} color="#FFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.removeButton]}
              onPress={() => removeFromPortfolio(item.id)}
            >
              <X size={20} color={colors.negative} />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Portfolio" />
      
      <View style={styles.summaryContainer}>
        <Text style={[styles.summaryLabel, { color: colors.neutral }]}>Portfolio Value</Text>
        <Text style={[styles.summaryValue, { color: colors.text }]}>${totalValue.toFixed(2)}</Text>
        
        <View style={styles.timeFrameContainer}>
          {timeFrames.map(tf => (
            <TouchableOpacity 
              key={tf}
              style={[
                styles.timeFrameButton,
                timeFrame === tf && { backgroundColor: colors.tint }
              ]}
              onPress={() => setTimeFrame(tf)}
            >
              <Text 
                style={[
                  styles.timeFrameText,
                  { color: timeFrame === tf ? '#FFF' : colors.neutral }
                ]}
              >
                {tf}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.chartContainer}>
          <PortfolioChart timeFrame={timeFrame} />
        </View>
      </View>
      
      <View style={styles.portfolioContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Coins</Text>
        
        {portfolio.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.neutral }]}>
              No coins in your portfolio yet.
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.muted }]}>
              Start swiping right to buy some coins!
            </Text>
          </View>
        ) : (
          <FlatList
            data={portfolio}
            renderItem={renderPortfolioItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  summaryContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  summaryLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  summaryValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    marginBottom: 16,
  },
  timeFrameContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeFrameButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
    marginRight: 8,
  },
  timeFrameText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
  },
  chartContainer: {
    height: 200,
    marginBottom: 24,
  },
  portfolioContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 24,
  },
  coinItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  coinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  coinName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  coinSymbol: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  coinValues: {
    alignItems: 'flex-end',
  },
  coinValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  priceChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceChange: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginLeft: 4,
  },
  coinDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coinAmount: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  coinActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
    marginRight: 8,
  },
  actionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#FFF',
    marginRight: 4,
  },
  removeButton: {
    padding: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
});