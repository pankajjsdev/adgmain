import { Image, StyleSheet, Platform, ScrollView, SafeAreaView } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ComingSoon from '@/components/ComingSoon';
import QuickLinks from '@/components/QuickLinks';
import UpcomingTasks from '@/components/UpcomingTasks';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}> {/* Wrap with SafeAreaView */}
      <Header />
      <ScrollView>
        <ThemedView style={styles.contentContainer}>
          <ThemedText type="title" style={styles.greeting}>Hello, Harsh!</ThemedText>
          <ComingSoon />
          <QuickLinks />
          <UpcomingTasks />
        </ThemedView>
      </ScrollView>
      {/* Footer is typically part of the layout, not the screen */}
      {/* <Footer /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },
});
