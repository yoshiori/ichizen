import React from 'react';
import { View, Text } from 'react-native';

export default function TestApp() {
  console.log('TestApp rendering...');
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, color: '#000' }}>Test App Works!</Text>
    </View>
  );
}