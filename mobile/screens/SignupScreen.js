import React, { useState } from 'react';
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
} from 'react-native';
import { ArrowLeft, User, Mail, Phone, MapPin, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react-native';
import axios from 'axios';
import { CERES_COLORS, CERES_TYPOGRAPHY, CERES_SPACING, CERES_BORDER_RADIUS } from '../theme/ceresTheme';
import { API_CONFIG } from '../config/apiConfig';

const SignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert('Error', 'First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert('Error', 'Last name is required');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Error', 'Valid email is required');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      Alert.alert('Error', 'Valid phone number is required');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('Error', 'Location/Route is required');
      return false;
    }
    if (!formData.password.trim() || formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (!agreeTerms) {
      Alert.alert('Error', 'You must agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/conductors/signup`, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        password: formData.password,
      });

      if (response.status === 201) {
        Alert.alert('Success', 'Signup successful! Please login with your credentials.', [
          {
            text: 'OK',
            onPress: () => navigation.replace('Login'),
          },
        ]);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Signup failed. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.wrapper}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color={CERES_COLORS.primary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CREATE ACCOUNT</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>CL</Text>
            </View>
            <Text style={styles.ceresTitle}>CERES LINER</Text>
            <Text style={styles.subtitle}>Join our conductor network</Text>
          </View>

          <View style={styles.form}>
            {/* First Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>FIRST NAME</Text>
              <View style={styles.inputWrapper}>
                <User color={CERES_COLORS.textSecondary} size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="John"
                  placeholderTextColor={CERES_COLORS.textTernary}
                  value={formData.firstName}
                  onChangeText={(value) => updateFormData('firstName', value)}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Last Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>LAST NAME</Text>
              <View style={styles.inputWrapper}>
                <User color={CERES_COLORS.textSecondary} size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Doe"
                  placeholderTextColor={CERES_COLORS.textTernary}
                  value={formData.lastName}
                  onChangeText={(value) => updateFormData('lastName', value)}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <View style={styles.inputWrapper}>
                <Mail color={CERES_COLORS.textSecondary} size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="john@example.com"
                  placeholderTextColor={CERES_COLORS.textTernary}
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <View style={styles.inputWrapper}>
                <Phone color={CERES_COLORS.textSecondary} size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="+63 9XX XXXX XXXX"
                  placeholderTextColor={CERES_COLORS.textTernary}
                  value={formData.phone}
                  onChangeText={(value) => updateFormData('phone', value)}
                  keyboardType="phone-pad"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Location */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>ROUTE / LOCATION</Text>
              <View style={styles.inputWrapper}>
                <MapPin color={CERES_COLORS.textSecondary} size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Dumaguete - Sibulan"
                  placeholderTextColor={CERES_COLORS.textTernary}
                  value={formData.location}
                  onChangeText={(value) => updateFormData('location', value)}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <Lock color={CERES_COLORS.textSecondary} size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor={CERES_COLORS.textTernary}
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff color={CERES_COLORS.textSecondary} size={20} />
                  ) : (
                    <Eye color={CERES_COLORS.textSecondary} size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>CONFIRM PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <Lock color={CERES_COLORS.textSecondary} size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor={CERES_COLORS.textTernary}
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <EyeOff color={CERES_COLORS.textSecondary} size={20} />
                  ) : (
                    <Eye color={CERES_COLORS.textSecondary} size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms Agreement */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAgreeTerms(!agreeTerms)}
              disabled={loading}
            >
              <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                {agreeTerms && <CheckCircle color={CERES_COLORS.primary} size={20} />}
              </View>
              <Text style={styles.termsText}>I agree to the terms and conditions</Text>
            </TouchableOpacity>

            {/* Signup Button */}
            <TouchableOpacity
              style={[styles.signupButton, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.signupButtonText}>
                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginLink}>
              <Text style={styles.loginLinkText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.replace('Login')} disabled={loading}>
                <Text style={styles.loginLinkButton}>LOGIN HERE</Text>
              </TouchableOpacity>
            </View>
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
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: CERES_SPACING.lg,
    paddingVertical: CERES_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: CERES_COLORS.border,
  },
  backButton: {
    padding: CERES_SPACING.sm,
    marginLeft: -CERES_SPACING.sm,
  },
  headerTitle: {
    ...CERES_TYPOGRAPHY.headerSmall,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: CERES_SPACING.lg,
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: CERES_SPACING.xl,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: CERES_BORDER_RADIUS.lg,
    backgroundColor: CERES_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: CERES_SPACING.md,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: CERES_COLORS.background,
  },
  ceresTitle: {
    ...CERES_TYPOGRAPHY.headerMedium,
    color: CERES_COLORS.primary,
    marginBottom: CERES_SPACING.xs,
  },
  subtitle: {
    ...CERES_TYPOGRAPHY.bodySmall,
    color: CERES_COLORS.textSecondary,
  },
  form: {
    paddingBottom: CERES_SPACING.xl,
  },
  formGroup: {
    marginBottom: CERES_SPACING.lg,
  },
  label: {
    ...CERES_TYPOGRAPHY.label,
    marginBottom: CERES_SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: CERES_SPACING.md,
    backgroundColor: CERES_COLORS.surface,
    borderRadius: CERES_BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: CERES_COLORS.border,
    minHeight: 48,
  },
  input: {
    flex: 1,
    marginHorizontal: CERES_SPACING.md,
    color: CERES_COLORS.text,
    fontSize: 14,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: CERES_SPACING.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: CERES_BORDER_RADIUS.xs,
    borderWidth: 2,
    borderColor: CERES_COLORS.border,
    marginRight: CERES_SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: CERES_COLORS.primary,
    backgroundColor: CERES_COLORS.surface,
  },
  termsText: {
    ...CERES_TYPOGRAPHY.bodySmall,
    flex: 1,
  },
  signupButton: {
    backgroundColor: CERES_COLORS.primary,
    paddingVertical: CERES_SPACING.md,
    borderRadius: CERES_BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: CERES_SPACING.lg,
    marginTop: CERES_SPACING.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: CERES_COLORS.background,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: CERES_SPACING.xl,
  },
  loginLinkText: {
    ...CERES_TYPOGRAPHY.bodySmall,
  },
  loginLinkButton: {
    ...CERES_TYPOGRAPHY.bodySmall,
    color: CERES_COLORS.primary,
    fontWeight: '600',
  },
});

export default SignupScreen;
