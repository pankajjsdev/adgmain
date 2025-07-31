import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Ionicons } from '@expo/vector-icons'; // Using @expo/vector-icons

const Header = () => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">LOGO</ThemedText>
      <View style={styles.iconsContainer}>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#000" />{/* Adjust color as needed */}
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="person-circle-outline" size={24} color="#000" />{/* Adjust color as needed */}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  iconsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
});

export default Header;