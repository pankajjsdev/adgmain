import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface CommonListProps<T> {
  title?: string;
  items: T[];
  renderItem: ({ item }: { item: T }) => React.JSX.Element;
  keyExtractor: (item: T, index: number) => string;
  style?: object;
}

function CommonList<T>({
  title,
  items,
  renderItem,
  keyExtractor,
  style
}: CommonListProps<T>) {
  return (
    <ThemedView style={[styles.container, style]}>
      {title && <ThemedText type="title" style={styles.title}>{title}</ThemedText>}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  title: {
    marginBottom: 12
  },
  listContent: {
    paddingVertical: 4
  }
});

export default CommonList;
