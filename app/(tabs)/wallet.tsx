import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Header from '@/components/Header';
import { useWallet } from '@/contexts/WalletContext';
import { Copy, Send, RefreshCw, Plus, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function WalletScreen() {
  const { colors } = useTheme();
  const { wallet, balance, depositUSDC, withdrawUSDC, refreshWallet } = useWallet();
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
              <Text style={styles.walletTitle}>Solana Wallet</Text>
              <TouchableOpacity 
                style={styles.refreshButton} 
                onPress={refreshWallet}
              >
                <RefreshCw size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text style={styles.balanceValue}>${parseFloat(balance.usdc).toFixed(2)}</Text>
              <Text style={styles.balanceSubtext}>{parseFloat(balance.usdc).toFixed(2)} USDC</Text>
            </View>
            
            <View style={styles.addressContainer}>
              <Text style={styles.addressLabel}>Wallet Address</Text>
              <View style={styles.addressRow}>
                <Text style={styles.addressValue}>
                  {wallet.publicKey 
                    ? `${wallet.publicKey.slice(0, 8)}...${wallet.publicKey.slice(-8)}`
                    : 'Loading...'
                  }
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
    height: 220,
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
  walletTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  refreshButton: {
    padding: 6,
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