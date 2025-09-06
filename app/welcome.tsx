import { View, Text, Button, StyleSheet, Image, TouchableOpacity } from "react-native";
import { colors } from "@/styles/styles";
import { router } from "expo-router";


export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
        <Text style={styles.logo}>Tutoric</Text>

        <View style={styles.tagBtn}>
        <Text style={styles.subtitle}>
            The tutor's Workspace
        </Text>
        <View style={styles.buttonContainer}>
            <TouchableOpacity
                style={[styles.button]}
                onPress={() => router.push('/(auth)/login')}>
                <Text style={{ color: "#fff", fontSize: 18, textAlign: "center", fontWeight:'600' }}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.button, {backgroundColor: colors.lightBg,borderColor: colors.border1, borderWidth: 1}]}
                onPress={() => router.push('/(auth)/signup')}>
                <Text style={{ color: colors.primary, fontSize: 18, textAlign: "center", fontWeight:'600'}}>Start Free Trial</Text>
            </TouchableOpacity>
        </View>
        </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  logo: {
    color:colors.primaryLight,
    fontSize: 48,
    
  },
tagBtn:{
width:"100%",

},
  subtitle: {
    fontSize: 24,
    textAlign: "center",
    color:colors.textSecondary,
    marginBottom: 40,
    fontWeight: "600",
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  button:{
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
  }


});
