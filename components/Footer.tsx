import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from './ThemedView';
import { Ionicons } from '@expo/vector-icons'; // Using @expo/vector-icons
import { Link } from 'expo-router';

const Footer = () => {
  return (
    <ThemedView style={styles.container}>
      <Link href="/" asChild>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home-outline" size={24} color="#000" />{/* Adjust color as needed */}
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/courses" asChild>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="book-outline" size={24} color="#000" />{/* Adjust color as needed */}
          <Text style={styles.navText}>Courses</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/browse" asChild>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="search-outline" size={24} color="#000" />{/* Adjust color as needed */}
          <Text style={styles.navText}>Browse</Text>
        </TouchableOpacity>
      </Link>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc', // Adjust color as needed
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default Footer;