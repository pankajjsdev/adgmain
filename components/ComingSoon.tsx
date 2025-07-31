import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const ComingSoon = () => {
  return (
    <View style={styles.container}>
      {/* Replace with your actual image path */}
      <Image 
        source={require('../assets/images/coming-soon.png')} 
        style={styles.image} 
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200, // Adjust height as needed
    marginVertical: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default ComingSoon;