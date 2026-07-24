import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from 'react-native-paper';
import { themeConstants } from '../../theme/themeConstants';

interface BaseCardProps extends ViewProps {
  children: React.ReactNode;
}

export const BaseCard: React.FC<BaseCardProps> = ({ children, style, ...props }) => {
  const theme = useTheme();

  return (
    <View 
      style={[
        styles.card, 
        { backgroundColor: theme.colors.surface }, 
        themeConstants.shadows.small,
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: themeConstants.radii.l,
    padding: themeConstants.spacing.m,
    marginVertical: themeConstants.spacing.s,
  },
});
