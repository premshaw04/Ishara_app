import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Searchbar, useTheme } from 'react-native-paper';
import { themeConstants } from '../../theme/themeConstants';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChangeText,
  onClear,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={onChangeText}
        value={value}
        onClearIconPress={onClear}
        style={[styles.searchbar, { backgroundColor: theme.colors.surfaceVariant }]}
        inputStyle={styles.input}
        iconColor={theme.colors.onSurfaceVariant}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: themeConstants.spacing.m,
  },
  searchbar: {
    borderRadius: themeConstants.radii.l,
    elevation: 0, // Flatten it out per modern design
  },
  input: {
    fontFamily: themeConstants.typography.fontFamily.regular,
    fontSize: themeConstants.typography.size.m,
  },
});
