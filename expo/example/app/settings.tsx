import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  trackEvent,
  trackScreen,
} from "surveysparrow-expo-spotchecks";
import type { Variables, CustomProperties, UserDetails } from "surveysparrow-expo-spotchecks";

const SettingsScreen: React.FC = () => {
  useEffect(() => {
    const variables: Variables = {};
    const customProperties: CustomProperties = {};
    const userDetails: UserDetails = {};

    trackScreen("SettingsScreen", {
      variables,
      customProperties,
      userDetails,
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backIcon}
          >
            <Text>Back</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Settings Screen</Text>
        </View>
        <View style={styles.content}>
          <TouchableOpacity
            onPress={async () => {
              await trackEvent("SettingsScreen", {
                test: {},
              });
            }}
            style={{ backgroundColor: "#f0f0f0", paddingHorizontal: 10 }}
          >
            <Text style={styles.link}>Track Event</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    position: "relative",
  },
  backIcon: {
    position: "absolute",
    left: 10,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  link: {
    color: "blue",
    textDecorationLine: "underline",
    marginVertical: 10,
    fontSize: 16,
  },
});

export default SettingsScreen;
