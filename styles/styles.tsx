import { StyleSheet } from 'react-native';

export const colors = {
    // Main backgrounds
    lightBg:'#ffffff',
    greyBg: "#F7FAFC",
    greyBg2:'#F8FAFC',
    grey3:'#2D3748',
    lightBlue:'#EBF8FF',
    lightGreen:'#F0FFF4',
    lightOrange:'#FFFBEB',
    lightPurple:'#FAF5FF',
    
 
    primary: "#00ab4b",       
    primaryBlue: "#0f172a",   
    primaryLight: "#5ced73",  
    
    // Text
    textPrimary: "#353a3e",   
    textSecondary: "#A0A0A0",
    textMuted: "#666666",  
    textDark: "#1A1A1A",   
    
    // Status colors
    success: "#00C851",       // Green
    warning: "#FF8800",       // Orange  
    danger: "#FF4444",        // Red
    
    // Borders/dividers
    border: "#1A1A1A", 
    border1:"#83f28f",
    border2:"#E2E8F0"       
  };

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:colors.lightBg,
  },
});
