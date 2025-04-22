import Header from '@/components/Header';
import LoginModal from '@/components/LoginModal';
import { useTheme } from '@/contexts/ThemeContext';
import { useWallet } from '@/contexts/WalletContext';
import { usePrivy } from '@privy-io/expo';
import { Bell, ChevronRight, CircleHelp as HelpCircle, LogOut, Moon, Shield, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { wallet, disconnectWallet } = useWallet();
  const { user, logout, isReady } = usePrivy();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const menuSections = [
    {
      title: 'Account',
      items: [
        {
          icon: <User size={20} color={colors.text} />,
          title: 'Profile Settings',
          onPress: () => {},
        },
        {
          icon: <Bell size={20} color={colors.text} />,
          title: 'Notifications',
          onPress: () => {},
        },
        {
          icon: <Moon size={20} color={colors.text} />,
          title: 'Dark Mode',
          onPress: toggleTheme,
          isSwitch: true,
          value: isDark,
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          icon: <Shield size={20} color={colors.text} />,
          title: 'Security Settings',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: <HelpCircle size={20} color={colors.text} />,
          title: 'Help & Support',
          onPress: () => {},
        },
      ],
    },
  ];

  // Handle Privy logout
  const handleLogout = async () => {
    if (user) {
      await logout();
    }
    disconnectWallet();
  };

  if (!isReady) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Profile" />
        <View style={styles.notLoggedInContainer}>
          <Text style={[styles.notLoggedInText, { color: colors.text }]}>
            Please log in to view your profile
          </Text>
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: colors.tint }]}
            onPress={() => setShowLoginModal(true)}
          >
            <Text style={[styles.loginButtonText, { color: '#FFFFFF' }]}>
              Login / Create Account
            </Text>
          </TouchableOpacity>
        </View>
        <LoginModal 
          visible={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
      </View>
    );
  }

  // Get user's email if available
  const emailAccount = user.linked_accounts?.find(account => account.type === 'email');
  const email = emailAccount ? emailAccount.address : 'No email connected';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Profile" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.tint }]}>
            <Text style={styles.avatarText}>
              {email.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {user.id.slice(0, 8)}
            </Text>
            <Text style={[styles.profileWallet, { color: colors.neutral }]}>
              {wallet.publicKey 
                ? `${wallet.publicKey.slice(0, 8)}...${wallet.publicKey.slice(-8)}`
                : 'No wallet connected'
              }
            </Text>
          </View>
          
          <TouchableOpacity style={[styles.editButton, { borderColor: colors.border }]}>
            <Text style={[styles.editButtonText, { color: colors.text }]}>Edit</Text>
          </TouchableOpacity>
        </View>
        
        {menuSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.neutral }]}>{section.title}</Text>
            
            <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex < section.items.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.menuItemLeft}>
                    {item.icon}
                    <Text style={[styles.menuItemTitle, { color: colors.text }]}>{item.title}</Text>
                  </View>
                  
                  {item.isSwitch ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onPress}
                      trackColor={{ false: colors.muted, true: colors.tint }}
                      thumbColor="#FFFFFF"
                    />
                  ) : (
                    <ChevronRight size={20} color={colors.neutral} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleLogout}
        >
          <LogOut size={20} color={colors.negative} />
          <Text style={[styles.logoutText, { color: colors.negative }]}>Logout</Text>
        </TouchableOpacity>
        
        <Text style={[styles.versionText, { color: colors.muted }]}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 4,
  },
  profileWallet: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
    borderWidth: 1,
  },
  editButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginBottom: 8,
    paddingLeft: 4,
  },
  menuCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  logoutText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginLeft: 8,
  },
  versionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 32,
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  notLoggedInText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  loginButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    marginBottom: 20,
  },
  loginButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
});