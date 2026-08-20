import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, ActivityIndicator, Alert, Platform, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Searchbar, Surface, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { themeConstants } from '../../theme/themeConstants';
import { Skeleton } from '../../components/Indicators/Skeleton';
import { historyService } from '../../api/services/historyService';
import { showToast } from '../../components';

export const HistoryScreen = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const data = await historyService.getHistoryLogs();
      const groupedData = groupHistoryData(data);
      setHistoryData(groupedData);
    } catch (error) {
      showToast('error', 'Error', 'Failed to fetch history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const groupHistoryData = (data: any[]) => {
    const groups: { [key: string]: any[] } = { '⭐ Saved Phrases': [], 'Today': [], 'Yesterday': [], 'This Week': [], 'Older': [] };
    const now = new Date();
    
    data.forEach(item => {
      const date = new Date(item.createdAt);
      // Strip time for diffing
      const diffTime = Math.abs(now.setHours(0,0,0,0) - new Date(item.createdAt).setHours(0,0,0,0));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const time = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const formattedItem = {
        id: item._id,
        sign: item.details?.sign || 'Unknown',
        emoji: '🧏', 
        time,
        confidence: item.details?.confidence || 0,
        isFavorite: item.isFavorite || false,
      };

      if (formattedItem.isFavorite) {
        groups['⭐ Saved Phrases'].push(formattedItem);
      } else if (diffDays === 0) {
        groups['Today'].push(formattedItem);
      } else if (diffDays === 1) {
        groups['Yesterday'].push(formattedItem);
      } else if (diffDays <= 7) {
        groups['This Week'].push(formattedItem);
      } else {
        groups['Older'].push(formattedItem);
      }
    });

    return Object.keys(groups)
      .filter(key => groups[key].length > 0)
      .map(key => ({
        title: key,
        data: groups[key]
      }));
  };

  // Search filter
  const filteredData = useMemo(() => {
    if (!historyData) return [];
    
    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (!trimmedQuery) return historyData;
    
    // Split the query into multiple keywords to support searching for "thank you" or just "you"
    const keywords = trimmedQuery.split(/\s+/);
    
    return historyData.map(section => ({
      ...section,
      data: section.data.filter((item: any) => {
        const signText = (item.sign || '').toLowerCase();
        // Return true only if ALL keywords are found in the sign text
        return keywords.every(kw => signText.includes(kw));
      })
    })).filter(section => section.data.length > 0);
  }, [searchQuery, historyData]);

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await historyService.deleteHistoryLog(id);
      
      const newData = historyData.map(section => ({
        ...section,
        data: section.data.filter((item: any) => item.id !== id)
      })).filter(section => section.data.length > 0);
      setHistoryData(newData);
      showToast('success', 'Deleted', 'History log removed');
    } catch (error) {
      showToast('error', 'Error', 'Failed to delete history');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to delete all history? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await historyService.clearAllHistory();
              setHistoryData([]);
              showToast('success', 'Cleared', 'All history logs removed');
            } catch (error) {
              showToast('error', 'Error', 'Failed to clear history');
            }
          }
        }
      ]
    );
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await historyService.toggleFavorite(id);
      await fetchHistory(); 
    } catch (error) {
      showToast('error', 'Error', 'Failed to update favorite status');
    }
  };

  const handlePlaySpeech = (sign: string) => {
    console.log(`Playing speech for: ${sign}`);
    // Dummy speech play action
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
            icon={item.isFavorite ? "star" : "star-outline"}
            size={24}
            iconColor={item.isFavorite ? "#FFD700" : theme.colors.onSurfaceVariant}
            onPress={() => handleToggleFavorite(item.id)}
            style={styles.actionButton}
          />
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
    if (isLoading) {
      return (
        <View style={styles.footerLoader}>
          <Skeleton width="100%" height={72} borderRadius={16} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={72} borderRadius={16} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={72} borderRadius={16} />
        </View>
      );
    }
    
    // If not loading and we have data or empty state is handled elsewhere, show the 7-day notice
    return (
      <View style={styles.disclaimerContainer}>
        <Text style={[styles.disclaimerText, { color: theme.colors.onSurfaceVariant }]}>
          History only keeps the last 7 days of data.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, StatusBar.currentHeight || 0) + 10 }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>History</Text>
        <IconButton
          icon="delete-sweep-outline"
          size={24}
          iconColor={theme.colors.error}
          onPress={handleClearAll}
          style={styles.headerIcon}
          disabled={!historyData || historyData.length === 0}
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
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
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
  disclaimerContainer: {
    paddingVertical: themeConstants.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimerText: {
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.xs,
    textAlign: 'center',
    opacity: 0.7,
  }
});

