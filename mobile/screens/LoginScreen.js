import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react-native';
import { loginConductor, getConductorSession } from '../services/authService';
import { CERES_COLORS, CERES_TYPOGRAPHY, CERES_SPACING, CERES_BORDER_RADIUS } from '../theme/ceresTheme';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const session = await getConductorSession();
    if (session) {
      navigation.replace('Home');
    }
    setLoading(false);
  };

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoggingIn(true);
    try {
      const session = await loginConductor(email, password);
      if (session) {
        Alert.alert('Success', `Welcome back, ${session.firstName}!`);
        navigation.replace('Home');
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      Alert.alert('Login Failed', errorMessage);
      console.error('Login error:', error);
    } finally {
      setLoggingIn(false);
    }
  };

  if (loading) return null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>CL</Text>
            </View>
            <Text style={styles.title}>CERES LINER</Text>
            <Text style={styles.subtitle}>CONDUCTOR APP</Text>
            <Text style={styles.version}>Ticketing System v1.0</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <View style={styles.inputWrapper}>
              <Mail color={CERES_COLORS.textSecondary} size={24} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={CERES_COLORS.textTernary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loggingIn}
              />
            </View>

            <Text style={[styles.label, { marginTop: CERES_SPACING.md }]}>PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <Lock color={CERES_COLORS.textSecondary} size={24} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={CERES_COLORS.textTernary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loggingIn}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                disabled={loggingIn}
              >
                {showPassword ? (
                  <Eye color={CERES_COLORS.textSecondary} size={24} />
                ) : (
                  <EyeOff color={CERES_COLORS.textSecondary} size={24} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.loginButton, loggingIn && styles.loginButtonDisabled]} 
              onPress={handleLogin}
              disabled={loggingIn}
            >
              {loggingIn ? (
                <ActivityIndicator color={CERES_COLORS.background} size="small" />
              ) : (
                <>
                  <LogIn color={CERES_COLORS.background} size={24} />
                  <Text style={styles.loginButtonText}>LOGIN</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.signupSection}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => navigation.navigate('Signup')}
            >
              <UserPlus color={CERES_COLORS.primary} size={20} />
              <Text style={styles.signupButtonText}>CREATE ACCOUNT</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>v1.0.0 | Dumaguete City</Text>
            <Text style={styles.poweredText}>Powered by Ceres Liner</Text>
            <Text style={styles.noteText}>For admin access, visit the web dashboard</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CERES_COLORS.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: CERES_SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoContainer: {
    backgroundColor: CERES_COLORS.primary,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: CERES_SPACING.md,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: CERES_COLORS.background,
  },
  title: {
    ...CERES_TYPOGRAPHY.headerMedium,
    color: CERES_COLORS.primary,
    marginBottom: CERES_SPACING.xs,
  },
  subtitle: {
    ...CERES_TYPOGRAPHY.label,
    color: CERES_COLORS.textSecondary,
    marginBottom: CERES_SPACING.xs,
  },
  version: {
    ...CERES_TYPOGRAPHY.caption,
    color: CERES_COLORS.textTernary,
  },
  form: {
    gap: CERES_SPACING.lg,
    marginBottom: CERES_SPACING.xl,
  },
  label: {
    ...CERES_TYPOGRAPHY.label,
    color: CERES_COLORS.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CERES_COLORS.surface,
    borderRadius: CERES_BORDER_RADIUS.lg,
    paddingHorizontal: CERES_SPACING.md,
    minHeight: 56,
    borderWidth: 1,
    borderColor: CERES_COLORS.border,
  },
  input: {
    flex: 1,
    color: CERES_COLORS.text,
    fontSize: 14,
    marginLeft: CERES_SPACING.md,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: CERES_COLORS.primary,
    minHeight: 56,
    borderRadius: CERES_BORDER_RADIUS.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: CERES_SPACING.sm,
    marginTop: CERES_SPACING.md,
  },
  loginButtonText: {
    color: CERES_COLORS.background,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  signupSection: {
    alignItems: 'center',
    marginBottom: CERES_SPACING.xl,
  },
  signupText: {
    ...CERES_TYPOGRAPHY.bodySmall,
    marginBottom: CERES_SPACING.md,
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: CERES_SPACING.md,
    paddingHorizontal: CERES_SPACING.lg,
    borderWidth: 2,
    borderColor: CERES_COLORS.primary,
    borderRadius: CERES_BORDER_RADIUS.md,
    gap: CERES_SPACING.sm,
  },
  signupButtonText: {
    ...CERES_TYPOGRAPHY.label,
    color: CERES_COLORS.primary,
  },
  footer: {
    alignItems: 'center',
    marginTop: CERES_SPACING.xl,
    paddingVertical: CERES_SPACING.lg,
  },
  footerText: {
    ...CERES_TYPOGRAPHY.caption,
    marginBottom: CERES_SPACING.xs,
  },
  poweredText: {
    ...CERES_TYPOGRAPHY.caption,
    color: CERES_COLORS.primary,
    fontWeight: '600',
    marginBottom: CERES_SPACING.xs,
  },
  noteText: {
    ...CERES_TYPOGRAPHY.caption,
    color: CERES_COLORS.textTernary,
    fontStyle: 'italic',
    marginTop: CERES_SPACING.sm,
  },
});

export default LoginScreen;
