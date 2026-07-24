import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, SafeAreaView, ActivityIndicator } from 'react-native';
import { useTheme, Searchbar, Surface, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { themeConstants } from '../../theme/themeConstants';
import { Skeleton } from '../../components/Indicators/Skeleton';

// Dummy Data
const INITIAL_DATA = [
  {
    title: 'Today',
    data: [
      { id: '1', sign: 'HELLO', emoji: '👋', time: '09:41 AM', confidence: 92 },
      { id: '2', sign: 'THANK YOU', emoji: '🙏', time: '09:38 AM', confidence: 95 },
      { id: '3', sign: 'GOOD MORNING', emoji: '🌅', time: '09:35 AM', confidence: 88 },
      { id: '4', sign: 'HOW ARE YOU?', emoji: '🤝', time: '09:32 AM', confidence: 90 },
      { id: '5', sign: 'YES', emoji: '👍', time: '09:30 AM', confidence: 98 },
      { id: '6', sign: 'NO', emoji: '👎', time: '09:28 AM', confidence: 97 },
    ],
  },
  {
    title: 'Yesterday',
    data: [
      { id: '7', sign: 'PLEASE', emoji: '🥺', time: '05:15 PM', confidence: 85 },
      { id: '8', sign: 'SORRY', emoji: '😔', time: '04:20 PM', confidence: 89 },
    ],
  },
];

export const HistoryScreen = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [historyData, setHistoryData] = useState(INITIAL_DATA);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Search filter
  const filteredData = useMemo(() => {
    if (!searchQuery) return historyData;
    
    return historyData.map(section => ({
      ...section,
      data: section.data.filter(item => 
        item.sign.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(section => section.data.length > 0);
  }, [searchQuery, historyData]);

  const handleDelete = (id: string) => {
    const newData = historyData.map(section => ({
      ...section,
      data: section.data.filter(item => item.id !== id)
    })).filter(section => section.data.length > 0);
    setHistoryData(newData);
  };

  const handlePlaySpeech = (sign: string) => {
    console.log(`Playing speech for: ${sign}`);
    // Dummy speech play action
  };

  const loadMore = () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setHistoryData(prev => [
        ...prev,
        {
          title: 'Last Week',
          data: [
            { id: Math.random().toString(), sign: 'WATER', emoji: '💧', time: '10:00 AM', confidence: 91 },
            { id: Math.random().toString(), sign: 'FOOD', emoji: '🍔', time: '09:00 AM', confidence: 84 },
          ]
        }
      ]);
      setIsLoadingMore(false);
    }, 1500);
  };

  const renderItem = ({ item }: { item: any }) => (
    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
      <View style={styles.cardContent}>
        <View style={styles.leftContent}>
          <Text style={styles.emoji}>{item.emoji}</Text>
          <View style={styles.textInfo}>
            <Text style={[styles.signText, { color: theme.colors.onSurface }]}>{item.sign}</Text>
            <View style={styles.subTextRow}>
              <Text style={[styles.timeText, { color: theme.colors.onSurfaceVariant }]}>{item.time}</Text>
              <Text style={[styles.confidenceText, { color: theme.colors.primary }]}> • {item.confidence}% match</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.actions}>
          <IconButton
            icon="delete-outline"
            size={20}
            iconColor={theme.colors.error}
            onPress={() => handleDelete(item.id)}
            style={styles.actionButton}
          />
          <IconButton
            icon="play"
            size={24}
            iconColor={theme.colors.primary}
            mode="contained-tonal"
            containerColor={theme.colors.primaryContainer}
            onPress={() => handlePlaySpeech(item.sign)}
            style={styles.actionButton}
          />
        </View>
      </View>
    </Surface>
  );

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>{title}</Text>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="history" size={64} color={theme.colors.surfaceVariant} />
      <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>No History Found</Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
        {searchQuery ? 'Try a different search term' : 'Start recognizing signs to see your history'}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <Skeleton width="100%" height={72} borderRadius={16} style={{ marginBottom: 16 }} />
        <Skeleton width="100%" height={72} borderRadius={16} />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>History</Text>
        <IconButton
          icon="calendar-month-outline"
          size={24}
          iconColor={theme.colors.primary}
          onPress={() => console.log('Filter pressed')}
          style={styles.headerIcon}
        />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search signs..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}
          iconColor={theme.colors.primary}
          inputStyle={{ color: theme.colors.onSurface }}
          elevation={0}
        />
      </View>

      {/* List */}
      <SectionList
        sections={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        onEndReached={searchQuery ? undefined : loadMore}
        onEndReachedThreshold={0.5}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: themeConstants.spacing.m,
    paddingVertical: themeConstants.spacing.m,
    position: 'relative',
  },
  headerTitle: {
    fontFamily: themeConstants.typography.fontFamily.bold,
    fontSize: themeConstants.typography.size.l,
  },
  headerIcon: {
    position: 'absolute',
    right: themeConstants.spacing.m,
  },
  searchContainer: {
    paddingHorizontal: themeConstants.spacing.l,
    paddingBottom: themeConstants.spacing.m,
  },
  searchBar: {
    borderRadius: themeConstants.radii.l,
    height: 48,
  },
  listContent: {
    paddingHorizontal: themeConstants.spacing.l,
    paddingBottom: themeConstants.spacing.xxxl,
    flexGrow: 1,
  },
  sectionTitle: {
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.m,
    marginTop: themeConstants.spacing.m,
    marginBottom: themeConstants.spacing.s,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: themeConstants.radii.l,
    marginBottom: themeConstants.spacing.m,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: themeConstants.spacing.m,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 28,
    marginRight: themeConstants.spacing.m,
  },
  textInfo: {
    flex: 1,
  },
  signText: {
    fontFamily: themeConstants.typography.fontFamily.bold,
    fontSize: themeConstants.typography.size.m,
    marginBottom: 4,
  },
  subTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontFamily: themeConstants.typography.fontFamily.regular,
    fontSize: themeConstants.typography.size.xs,
  },
  confidenceText: {
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    margin: 0,
    marginLeft: themeConstants.spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: themeConstants.spacing.xxxl * 2,
  },
  emptyTitle: {
    fontFamily: themeConstants.typography.fontFamily.bold,
    fontSize: themeConstants.typography.size.l,
    marginTop: themeConstants.spacing.m,
  },
  emptySubtitle: {
    fontFamily: themeConstants.typography.fontFamily.regular,
    fontSize: themeConstants.typography.size.s,
    marginTop: themeConstants.spacing.xs,
    textAlign: 'center',
    paddingHorizontal: themeConstants.spacing.xl,
  },
  footerLoader: {
    paddingVertical: themeConstants.spacing.l,
    alignItems: 'center',
  },
});

