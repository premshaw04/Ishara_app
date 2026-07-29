import React, { useState } from 'react';
import { StyleSheet, View, FlatList, ScrollView, Pressable, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainTabScreenProps } from '../../navigation/types';
import { SearchBar } from '../../components/Inputs/SearchBar';
import { CategoryCard } from '../../components/Cards/CategoryCard';
import { DUMMY_CATEGORIES } from '../../data/learnData';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList } from '../../navigation/types';

// Properly type the navigation props to allow pushing to CategoryDetail
type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'LearnTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const LearnScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Alphabet', 'Numbers', 'Greetings', 'Emotions'];

  const filteredCategories = DUMMY_CATEGORIES.filter(cat => {
    if (activeFilter !== 'All' && cat.name !== activeFilter) return false;
    if (searchQuery && !cat.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>Learn</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search signs or categories..."
        />
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {filters.map((filter, index) => (
            <Pressable
              key={index}
              style={[
                styles.filterChip,
                {
                  backgroundColor: activeFilter === filter ? theme.colors.primary : theme.colors.surface,
                  borderColor: activeFilter === filter ? theme.colors.primary : theme.colors.outlineVariant,
                }
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: activeFilter === filter ? theme.colors.onPrimary : theme.colors.onSurfaceVariant }
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item, index }) => (
          <CategoryCard
            category={item}
            index={index}
            onPress={() => navigation.navigate('CategoryDetail', { 
              categoryId: item.id, 
              categoryName: item.name 
            })}
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 8, // Using 8 here because card has margin 8, total padding 16
    paddingBottom: 24,
  },
});
