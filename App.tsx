import React from 'react';
import { PermissionsAndroid, SafeAreaView, ScrollView, View, StatusBar, Text, StyleSheet } from 'react-native';
import WifiScanner from './WifiScanner';

const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <WifiScanner />
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: 'lightgray',
  },
});

export default App;
