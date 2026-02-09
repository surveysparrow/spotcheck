import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SpotCheck } from "surveysparrow-expo-spotchecks";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: "Home Screen" }} />
        <Stack.Screen name="profile" options={{ title: "Profile Screen" }} />
        <Stack.Screen name="settings" options={{ title: "Settings Screen" }} />
      </Stack>
      <SpotCheck />
    </SafeAreaProvider>
  );
}
