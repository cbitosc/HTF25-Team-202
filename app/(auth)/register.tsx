import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    mobile: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 13 || age > 120) {
        newErrors.age = 'Please enter a valid age (13-120)';
      }
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        age: parseInt(formData.age),
        gender: formData.gender,
        mobile: formData.mobile.trim(),
      });
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.back();
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    const newErrors = { ...errors };
    delete newErrors[field];
    setErrors(newErrors);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join AI Outfit Planner and get personalized style recommendations
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(text) => updateField('name', text)}
                error={errors.name}
                autoCapitalize="words"
                leftIcon="person-outline"
              />

              <Input
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
              />

              <Input
                label="Mobile Number"
                placeholder="Enter 10-digit mobile number"
                value={formData.mobile}
                onChangeText={(text) => updateField('mobile', text)}
                error={errors.mobile}
                keyboardType="phone-pad"
                maxLength={10}
                leftIcon="call-outline"
              />

              <Input
                label="Age"
                placeholder="Enter your age"
                value={formData.age}
                onChangeText={(text) => updateField('age', text)}
                error={errors.age}
                keyboardType="number-pad"
                maxLength={3}
                leftIcon="calendar-outline"
              />

              <View style={styles.genderContainer}>
                <Text style={styles.genderLabel}>Gender</Text>
                <View style={styles.genderButtons}>
                  {(['male', 'female', 'other'] as const).map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.genderButton,
                        formData.gender === gender && styles.genderButtonActive,
                      ]}
                      onPress={() => updateField('gender', gender)}
                    >
                      <Text
                        style={[
                          styles.genderButtonText,
                          formData.gender === gender && styles.genderButtonTextActive,
                        ]}
                      >
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Input
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChangeText={(text) => updateField('password', text)}
                error={errors.password}
                secureTextEntry
                leftIcon="lock-closed-outline"
              />

              <Input
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChangeText={(text) => updateField('confirmPassword', text)}
                error={errors.confirmPassword}
                secureTextEntry
                leftIcon="lock-closed-outline"
              />

              <Button
                title="Create Account"
                onPress={handleRegister}
                fullWidth
                size="large"
                loading={loading}
                disabled={loading}
              />
            </View>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 24,
  },
  genderContainer: {
    marginBottom: 16,
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  genderButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  genderButtonTextActive: {
    color: '#FFFFFF',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  loginLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
});