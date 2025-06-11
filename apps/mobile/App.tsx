import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import './src/i18n';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>今日の小さな善行</Text>
      <Text style={styles.subtitle}>Today's Small Good Deed</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
});
