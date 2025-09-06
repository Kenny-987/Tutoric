import { Redirect } from 'expo-router';
import { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useUserStore } from "./context/useUserStore";

export default function Index() {
    const { isLoggedIn, loadUserFromStorage } = useUserStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log('checking user status');
        
        const init = async () => {
          await loadUserFromStorage();
          setIsLoading(false);
        };
        init();
      }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return <Redirect href={isLoggedIn ? "/(tabs)/dashboard" : "/welcome"} />;
}