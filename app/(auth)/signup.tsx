import { colors } from '@/styles/styles';
import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Yup from 'yup';
import { useUserStore } from '../context/useUserStore';
import { styles } from './authstyles';

const SignupSchema = Yup.object().shape({
  fullname: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must include at least one uppercase letter')
    .matches(/[a-z]/, 'Must include at least one lowercase letter')
    .matches(/[0-9]/, 'Must include at least one number')
    .matches(/[!@#$%^&*]/, 'Must include at least one special character (!@#$%^&*)'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Password confirmation is required'),
});

export default function Signup() {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [loading,setLoading] = useState(false)
  const setUser = useUserStore((state) => state.setUser);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
   
  } = useForm({
    resolver: yupResolver(SignupSchema),
  });

  const password = watch('password', '')
  const onSubmitForm = async (data:any) => {
    try {
      
      
      const {fullname,email,password} = data
      const response = await axios.post('http://10.182.90.139:3000/auth/signup', {
        email,
        password,
        fullname, 
      });
      
      if (response.status === 200 || response.status === 201) {
 
        const { token, role, userData} = response.data;
        
        // Store the token and role securely
        await SecureStore.setItemAsync('token', token);
        setUser(userData)

          } else {
            console.log('Signup failed', response);
          }

    } catch (error:any) {
      if (error.response) {
      // Server responded with an error (4xx or 5xx)
      console.log('Signup failed:', error.response.data);
      alert(error.response.data.message || 'Login failed. Please try again.');
    } else if (error.request) {
      // Request was made, but no response received
      console.log('No response:', error.request);
      alert('Unable to connect to the server. Please check your internet connection or try again later.');
    } else {
      // Something else went wrong
      console.log('Unexpected error:', error.message);
      alert('Something went wrong. Please try again.');
    }
    }finally{
      setLoading(false)
    }
  };
 
  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    if (strength <= 2) return { label: 'Weak', color: 'red' };
    if (strength === 3 || strength === 4) return { label: 'Medium', color: 'orange' };
    return { label: 'Strong', color: 'green' };
  };

  const { label: strengthLabel, color: strengthColor } = getPasswordStrength();
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <Text>Tutoric</Text>
          </View>
        </View>
  
        {/* Form Section */}
        <View style={styles.formSection}>
        <View style={styles.formContainer}>
        <View style={styles.titleContainer}>
            <Text style={styles.title}>Create Account</Text>
        </View>
        <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <Controller
                control={control}
                name="fullname"
                rules={{
                  required: 'Full name is required',
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[
                    styles.inputWrapper,
                    errors.email && styles.inputError
                  ]}>
                    <Ionicons 
                      name="person-outline" 
                      size={20} 
                      color="#777" 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your full name"
                      autoCapitalize="none"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholderTextColor="#999"
                    />
                  </View>
                )}
              />
              {errors.fullname && (
                <Text style={styles.errorText}>{String(errors.fullname.message)}</Text>
              )}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Enter a valid email address'
                  }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[
                    styles.inputWrapper,
                    errors.email && styles.inputError
                  ]}>
                    <Ionicons 
                      name="mail-outline" 
                      size={20} 
                      color="#777" 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholderTextColor="#999"
                    />
                  </View>
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>{String(errors.email.message)}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <Controller
                control={control}
                name="password"
                rules={{
                  required: 'Password is required',
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[
                    styles.inputWrapper,
                    errors.email && styles.inputError
                  ]}>
                    <Ionicons 
                      name="lock-closed-outline" 
                      size={20} 
                      color="#777" 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Create a strong password"
                      autoCapitalize="none"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholderTextColor="#999"
                      secureTextEntry={!isPasswordVisible}
                    />
                    <TouchableOpacity
                      onPress={() => setPasswordVisible(!isPasswordVisible)}
                      style={styles.eyeButton}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isPasswordVisible ? 'eye' : 'eye-off'}
                        size={20}
                        color="#777"
                      />
                    </TouchableOpacity>
                    
                  </View>
                )}
              />
              <Text style={{ color: strengthColor }}>{`Strength: ${strengthLabel}`}</Text>
              {errors.password && (
                <Text style={styles.errorText}>{String(errors.password.message)}</Text>
              )}
            </View>


            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <Controller
                control={control}
                name="confirmPassword"
                rules={{
                  required: 'Password is required',
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[
                    styles.inputWrapper,
                    errors.email && styles.inputError
                  ]}>
                    <Ionicons 
                      name="lock-closed-outline" 
                      size={20} 
                      color="#777" 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm your password"
                      autoCapitalize="none"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholderTextColor="#999"
                      secureTextEntry={!isConfirmPasswordVisible}
                    />
                    <TouchableOpacity
                      onPress={() => setConfirmPasswordVisible(!isConfirmPasswordVisible)}
                      style={styles.eyeButton}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isPasswordVisible ? 'eye' : 'eye-off'}
                        size={20}
                        color="#777"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{String(errors.confirmPassword.message)}</Text>
              )}
            </View>
            {/* Terms and Conditions */}
              <View style={styles.termsContainer}>
                  <TouchableOpacity 
                    style={styles.checkboxContainer}
                    onPress={() => setAcceptTerms(!acceptTerms)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                      {acceptTerms && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.termsText}>
                      I agree to the{' '}
                      <Text style={styles.termsLink}>Terms of Service</Text>
                      {' '}and{' '}
                      <Text style={styles.termsLink}>Privacy Policy</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
            {loading ? <ActivityIndicator size="small"/> :
                <TouchableOpacity 
                style={[
                  styles.signupButton,
                  !acceptTerms && styles.buttonDisabled
                ]} 
                onPress={handleSubmit(onSubmitForm)}
                disabled={!acceptTerms}
                activeOpacity={0.8}  
              >
              <Text style={styles.signupButtonText}>Create Account</Text>
              </TouchableOpacity>
                }
        </View>
   
        </View>
  
        {/* Footer Links */}
        <View style={styles.footer}>
        <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.7}
          >
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text style={styles.linkText}>Sign In</Text>
            </Text>
          </TouchableOpacity>
  
  
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}   