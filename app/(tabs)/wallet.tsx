import Header from '@/components/Header';
import { useTheme } from '@/contexts/ThemeContext';
import { useWallet } from '@/contexts/WalletContext';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { ArrowDownToLine, ArrowUpFromLine, Copy, Plus, RefreshCw, Send } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function WalletScreen() {
  const { colors } = useTheme();
  const { wallet, balance, depositUSDC, withdrawUSDC, refreshWallet, isRefreshing, network } = useWallet();
  const [amount, setAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [activeTab, setActiveTab] = useState('deposit');
  
  const copyToClipboard = async () => {
    if (!wallet.publicKey) return;
    
    await Clipboard.setStringAsync(wallet.publicKey);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  const handleDeposit = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      alert('Please enter a valid amount');
      return;
    }
    
    depositUSDC(parseFloat(amount));
    setAmount('');
  };
  
  const handleWithdraw = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (!withdrawAddress) {
      alert('Please enter a withdrawal address');
      return;
    }
    
    withdrawUSDC(parseFloat(amount), withdrawAddress);
    setAmount('');
    setWithdrawAddress('');
  };

  const handleRefresh = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await refreshWallet();
  };

  // Format balance for display - show at most 5 decimal places
  const formatSOL = (amount: string) => {
    const num = parseFloat(amount);
    if (num === 0) return '0';
    if (num < 0.00001) return '<0.00001';
    return num.toFixed(Math.min(5, amount.split('.')[1]?.length || 5));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Wallet" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.walletCard}>
          <LinearGradient
            colors={['#7C3AED', '#6366F1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.walletGradient}
          >
            <View style={styles.walletHeader}>
              <View style={styles.walletTitleContainer}>
                <Text style={styles.walletTitle}>Solana Wallet</Text>
                <Text style={styles.networkBadge}>
                  {network === 'devnet' ? 'DEVNET' : 'MAINNET'}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.refreshButton} 
                onPress={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <RefreshCw size={16} color="#FFF" />
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text style={styles.balanceValue}>{formatSOL(balance.sol)} SOL</Text>
              <View style={styles.solBalanceContainer}>
                {/* <Text style={styles.balanceSubtext}>{parseFloat(balance.usdc).toFixed(2)} USDC</Text>
                <Text style={styles.solBalanceText}>
                  {formatSOL(balance.sol)} SOL
                </Text> */}
              </View>
            </View>
            
            <View style={styles.addressContainer}>
              <Text style={styles.addressLabel}>Wallet Address</Text>
              <View style={styles.addressRow}>
                <Text style={styles.addressValue} numberOfLines={1} ellipsizeMode="middle">
                  {wallet.publicKey || 'Loading...'}
                </Text>
                <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
                  <Copy size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
        
        <View style={[styles.tabContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.tabButtons}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'deposit' && { borderBottomColor: colors.tint, borderBottomWidth: 2 }
              ]}
              onPress={() => setActiveTab('deposit')}
            >
              <ArrowDownToLine 
                size={16} 
                color={activeTab === 'deposit' ? colors.tint : colors.neutral} 
              />
              <Text
                style={[
                  styles.tabButtonText,
                  { color: activeTab === 'deposit' ? colors.tint : colors.neutral }
                ]}
              >
                Deposit
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'withdraw' && { borderBottomColor: colors.tint, borderBottomWidth: 2 }
              ]}
              onPress={() => setActiveTab('withdraw')}
            >
              <ArrowUpFromLine 
                size={16} 
                color={activeTab === 'withdraw' ? colors.tint : colors.neutral} 
              />
              <Text
                style={[
                  styles.tabButtonText,
                  { color: activeTab === 'withdraw' ? colors.tint : colors.neutral }
                ]}
              >
                Withdraw
              </Text>
            </TouchableOpacity>
          </View>
          
          {activeTab === 'deposit' ? (
            <View style={styles.formContainer}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Amount (USDC)</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                <Text style={[styles.inputPrefix, { color: colors.neutral }]}>$</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
              
              <View style={styles.quickAmounts}>
                {[5, 10, 25, 100].map(amt => (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.quickAmountButton, { borderColor: colors.border }]}
                    onPress={() => setAmount(amt.toString())}
                  >
                    <Text style={[styles.quickAmountText, { color: colors.text }]}>${amt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.tint }]}
                onPress={handleDeposit}
              >
                <Plus size={18} color="#FFF" />
                <Text style={styles.actionButtonText}>Add Funds</Text>
              </TouchableOpacity>
              
              <Text style={[styles.disclaimer, { color: colors.muted }]}>
                Note: This is a demo app. In production, this would connect to a real payment processor.
              </Text>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Amount (USDC)</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                <Text style={[styles.inputPrefix, { color: colors.neutral }]}>$</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
              
              <Text style={[styles.formLabel, { color: colors.text, marginTop: 16 }]}>Withdraw To</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Solana Address"
                  placeholderTextColor={colors.muted}
                  value={withdrawAddress}
                  onChangeText={setWithdrawAddress}
                />
              </View>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.tint, marginTop: 24 }]}
                onPress={handleWithdraw}
              >
                <Send size={18} color="#FFF" />
                <Text style={styles.actionButtonText}>Send Funds</Text>
              </TouchableOpacity>
              
              <Text style={[styles.disclaimer, { color: colors.muted }]}>
                Note: This is a demo app. In production, this would perform real blockchain transactions.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const LinearGradient = require('expo-linear-gradient').LinearGradient;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  walletCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    height: 300,
  },
  walletGradient: {
    flex: 1,
    padding: 24,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  walletTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginRight: 8,
  },
  networkBadge: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  refreshButton: {
    padding: 6,
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceContainer: {
    marginBottom: 32,
  },
  balanceLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  balanceValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    color: '#FFFFFF',
  },
  balanceSubtext: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  solBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  solBalanceText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 8,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
  },
  addressContainer: {
    marginTop: 'auto',
  },
  addressLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  copyButton: {
    padding: 6,
  },
  tabContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 24,
  },
  tabButtons: {
    flexDirection: 'row',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  tabButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginLeft: 8,
  },
  formContainer: {
    padding: 16,
  },
  formLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  inputPrefix: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    height: '100%',
  },
  quickAmounts: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 24,
  },
  quickAmountButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  quickAmountText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
  },
  actionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  disclaimer: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});