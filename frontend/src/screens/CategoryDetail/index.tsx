import React from 'react';
import { StyleSheet, View, Text, FlatList, Pressable } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../../navigation/types';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { SignCard } from '../../components/Cards/SignCard';
import { DUMMY_SIGNS } from '../../data/learnData';

export const CategoryDetailScreen = ({ route, navigation }: RootStackScreenProps<'CategoryDetail'>) => {
  const theme = useTheme();
  const { categoryId, categoryName } = route.params;

  const categorySigns = DUMMY_SIGNS.filter(sign => sign.categoryId === categoryId);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={28} color={theme.colors.onBackground} />
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>{categoryName}</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={categorySigns}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="text-box-search-outline" size={64} color={theme.colors.outline} />
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              No signs available in this category yet.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <SignCard
            sign={item}
            index={index}
            onPress={() => navigation.navigate('SignDetail', { signId: item.id })}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});
