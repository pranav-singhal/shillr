import { useTheme } from '@/contexts/ThemeContext';
import { useLoginWithEmail, usePrivy } from '@privy-io/expo';
import { X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function LoginModal({ visible, onClose }: LoginModalProps) {
  const { colors } = useTheme();
  const { user } = usePrivy();
  const { sendCode, loginWithCode, state } = useLoginWithEmail();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');
  
  const handleLoginWithEmail = async () => {
    setError('');
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      const res = await sendCode({ email });
      console.log({sendCodeRes: res});
      if (res.success) {
        setCodeSent(true);
      } else {
        setError('Failed to send verification code. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to send verification code. Please try again.');
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    if (!code || code.length < 4) {
      setError('Please enter a valid verification code');
      return;
    }

    try {
      await loginWithCode({
        code,
        email
      });
      // If successful, the usePrivy hook will update the user state
      // and the modal will close automatically via our useEffect
    } catch (error) {
      console.error('Verification error:', error);
      setError('Invalid verification code. Please try again.');
    }
  };

  useEffect(() => {
    if (user) {
      onClose();
    }
  }, [user, onClose]);

  // If user is already logged in, don't show the modal
  

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>Welcome to ShillR</Text>
            <Text style={[styles.subtitle, { color: colors.neutral }]}>
              {!codeSent 
                ? "Create an account or sign in to start trading memecoins"
                : `Enter the verification code sent to ${email}`
              }
            </Text>
            
            {!codeSent ? (
              <>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background, 
                    borderColor: error ? colors.negative : colors.border,
                    color: colors.text 
                  }]}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.neutral}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
                
                {error ? (
                  <Text style={[styles.errorText, { color: colors.negative }]}>
                    {error}
                  </Text>
                ) : null}
                
                <TouchableOpacity 
                  style={[
                    styles.loginButton, 
                    { backgroundColor: colors.tint },
                    (state.status === 'sending-code') && { opacity: 0.7 }
                  ]}
                  onPress={handleLoginWithEmail}
                  disabled={state.status === 'sending-code'}
                >
                  <Text style={[styles.loginButtonText, { color: '#FFFFFF' }]}>
                    {state.status === 'sending-code' ? 'Sending...' : 'Continue with Email'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background, 
                    borderColor: error ? colors.negative : colors.border,
                    color: colors.text 
                  }]}
                  placeholder="Enter verification code"
                  placeholderTextColor={colors.neutral}
                  keyboardType="number-pad"
                  value={code}
                  onChangeText={setCode}
                />
                
                {error ? (
                  <Text style={[styles.errorText, { color: colors.negative }]}>
                    {error}
                  </Text>
                ) : null}
                
                <TouchableOpacity 
                  style={[
                    styles.loginButton, 
                    { backgroundColor: colors.tint },
                    (state.status === 'submitting-code') && { opacity: 0.7 }
                  ]}
                  onPress={handleVerifyCode}
                  disabled={state.status === 'submitting-code'}
                >
                  <Text style={[styles.loginButtonText, { color: '#FFFFFF' }]}>
                    {state.status === 'submitting-code' ? 'Verifying...' : 'Verify Code'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.resendButton}
                  onPress={() => {
                    setCodeSent(false);
                    setCode('');
                  }}
                >
                  <Text style={[styles.resendButtonText, { color: colors.tint }]}>
                    Use different email
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  loginButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  resendButton: {
    padding: 8,
  },
  resendButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  }
}); 