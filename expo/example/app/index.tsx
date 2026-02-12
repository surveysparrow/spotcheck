import { useRouter } from "expo-router";
import { useLayoutEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  initializeSpotChecks,
  trackScreen,
  trackEvent,
} from "surveysparrow-expo-spotchecks";
import type {
  SsSpotcheckListener,
  UserDetails,
  Variables,
  CustomProperties,
} from "surveysparrow-expo-spotchecks";

const listener: SsSpotcheckListener = {
  onSurveyLoaded: async (response: Record<string, any>) => {
    console.log('Survey Loaded', response);
  },
  onSurveyResponse: async (response: Record<string, any>) => {
    console.log('Survey Response', response);
  },
  onPartialSubmission: async (response: Record<string, any>) => {
    console.log('Partial Submission', response);
  },
  onCloseButtonTap: async () => {
    console.log('Close Button Tapped');
  },
};

export default function Index() {
  const router = useRouter();

  useLayoutEffect(() => {
    initializeSpotChecks({
      domainName: "your-domain.com",
      targetToken: "your-target-token",
      userDetails: {
        email: "your-email@example.com"
      },
      listener,
    });  
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.container}>
        <Text style={styles.title}>Home Screen</Text>
        <View>
          <TouchableOpacity onPress={() => router.navigate("profile" as any)}>
            <Text style={styles.buttonText}>Profile Screen</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.navigate("settings" as any)}>
            <Text style={styles.buttonText}>Settings Screen</Text>
          </TouchableOpacity>
        </View>
        <View></View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    color: "blue",
    marginVertical: 10,
  },
});
