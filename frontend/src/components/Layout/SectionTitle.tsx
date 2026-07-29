import React from 'react';
import { StyleSheet, Text, TextStyle, StyleProp } from 'react-native';
import { useTheme } from 'react-native-paper';
import { themeConstants } from '../../theme/themeConstants';

interface SectionTitleProps {
  title: string;
  style?: StyleProp<TextStyle>;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, style }) => {
  const theme = useTheme();

  return (
    <Text style={[styles.title, { color: theme.colors.onSurface }, style]}>
      {title}
    </Text>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: themeConstants.typography.fontFamily.semibold,
    fontSize: themeConstants.typography.size.l,
    marginVertical: themeConstants.spacing.m,
  },
});
