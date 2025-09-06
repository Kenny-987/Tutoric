import { colors } from "@/styles/styles";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingBottom: 30,
    },
    header: {
      paddingTop: 20,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    backButton: {
      width: 40,
      height: 40, 
      borderRadius: 20,
      backgroundColor: colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop:30,
      marginBottom: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    logoContainer: {
      alignItems: 'center',
    },
    logo: {
      width: 80,
      height: 80,
    },
    formSection: {
      flex: 1,
      paddingHorizontal: 20,
    },
    titleContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
    },
    formContainer: {
      gap: 16,
    },
    inputGroup: {
      gap: 8,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginLeft: 4,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: '#e1e5e9',
      // borderColor: colors.secondaryColor,
      borderRadius: 12,
      backgroundColor: '#fff',
      paddingHorizontal: 16,
      height: 54,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    inputError: {
      borderColor:colors.danger,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.textPrimary,
      paddingVertical: 0, 
    },
    eyeButton: {
      padding: 4,
    },
    errorText: {
      color: colors.danger,
      fontSize: 13,
      marginLeft: 4,
      marginTop: 0,
    },
    termsContainer: {
      marginTop: 10,
      display:'flex',
      flexDirection: 'row',
      gap:4,
      alignItems: 'center',
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: '#ddd',
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    termsText: {
      flex: 1,
      fontSize: 14,
      color: '#666',
      lineHeight: 20,
    },
    termsLink: {
      color: colors.primary,
      fontWeight: '600',
    },
    signupButton: {
      backgroundColor: colors.primary,
      height: 54,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10,
      shadowColor: colors.primaryLight,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    buttonDisabled: {
      backgroundColor: '#ccc',
      shadowOpacity: 0,
      elevation: 0,
    },
    signupButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
    },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 30,
      gap: 20,
    },
    loginLink: {
      alignItems: 'center',
    },
    footerText: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
    },
    linkText: {
      color: colors.primary,
      fontWeight: '600',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 15,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: '#e1e5e9',
    },
    dividerText: {
      fontSize: 14,
      color: '#999',
      fontWeight: '500',
    },

  });