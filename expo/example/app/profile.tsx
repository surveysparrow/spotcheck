import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { trackEvent, trackScreen } from 'surveysparrow-expo-spotchecks';
import type { Variables, CustomProperties, UserDetails } from 'surveysparrow-expo-spotchecks';

const ProfileScreen: React.FC = () => {
  useEffect(() => {
    const variables: Variables = {
      sparrowLang: 'en',
      'test-variable': '****test-VALUE****',
    };
    const customProperties: CustomProperties = {};
    const userDetails: UserDetails = {
      email: 'gokul@gmail.com',
    };

    trackScreen('ProfileScreen', {
      variables,
      customProperties,
      userDetails,
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white", paddingTop: 40 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backIcon}>
            <Text>Back</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Profile Screen</Text>
        </View>
        <View style={styles.content}>
          <TouchableOpacity
            onPress={async () => {
              await trackEvent('ProfileScreen', {
                test: {},
              });
            }}
            style={{ backgroundColor: '#f0f0f0', paddingHorizontal: 10 }}>
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
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    position: 'relative',
  },
  backIcon: {
    position: 'absolute',
    left: 10,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  content: {},
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
    marginVertical: 10,
    fontSize: 16,
  },
});

export default ProfileScreen;
