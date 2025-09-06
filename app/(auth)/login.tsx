import { colors } from '@/styles/styles';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from './authstyles';
import { useUserStore } from '../context/useUserStore';


export default function Login() {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [loading,setLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false);
  const setUser = useUserStore((state) => state.setUser);
  const [message, setMessage] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
   
  } = useForm();



  const onSubmitForm = async (data:any) => {
    try {
      setLoading(true)
      console.log('logging in');
      const {email,password} = data
      const response = await axios.post('http://10.182.90.139:3000/auth/login', {
        email,
        password,
        // expoPushToken
      });
      
      if (response.status === 200 || response.status === 201) {
 
        const { token, role, userData} = response.data;
        
        // Store the token and role securely
       
        console.log('Login successful:', response.data);
     
        await SecureStore.setItemAsync('token', token);  
        setUser(userData);
        router.push('/(tabs)/dashboard');
      }
        else {
            console.log(' error in Login', response);
          }

    } catch (error:any) {
      if (error.response) {
      // Server responded with an error (4xx or 5xx)
      console.log('Login failed:', error.response.data);
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
            <Text style={styles.title}>Login to your account</Text>
            <Text style={styles.subtitle}></Text>
          </View>
  
              {/* Email Input */}
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
                      placeholder="Enter your password"
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
              {errors.password && (
                <Text style={styles.errorText}>{String(errors.password.message)}</Text>
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
                    
                  </TouchableOpacity>
                  <Text style={styles.termsText}>
                      I agree to the{' '}
                      <Text style={styles.termsLink}>Terms of Service</Text>
                      {' '}and{' '}
                      <Text style={styles.termsLink}>Privacy Policy</Text>
                    </Text>
                </View>
  
                {/* Sign Up Button */}
                {loading ? 
                <TouchableOpacity style={{backgroundColor:'#fff',borderColor:colors.primaryLight,display:'flex',alignItems:'center'}}>
                  <ActivityIndicator size="small" color={colors.primary}/>
                </TouchableOpacity> :
                <TouchableOpacity 
                style={[
                  styles.signupButton,
                  !acceptTerms && styles.buttonDisabled
                ]} 
                onPress={handleSubmit(onSubmitForm)}
                disabled={!acceptTerms}
                activeOpacity={0.8}  
              >
              <Text style={styles.signupButtonText}>Login</Text>
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
            onPress={() => router.push('/(auth)/signup')}
            activeOpacity={0.7}
          >
            <Text style={styles.footerText}>
            
              <Text style={styles.linkText}>Create Account</Text>
            </Text>
          </TouchableOpacity>
  
  
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 
