import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { themeConstants } from '../../theme/themeConstants';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  title,
  onPress,
  icon,
  loading,
  disabled,
  style,
}) => {
  const theme = useTheme();

  return (
    <Button
      mode="contained-tonal"
      onPress={onPress}
      icon={icon}
      loading={loading}
      disabled={disabled}
      buttonColor={theme.colors.primaryContainer}
      textColor={theme.colors.primary}
      style={[styles.button, style]}
      contentStyle={styles.content}
      labelStyle={styles.label}>
      {title}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: themeConstants.radii.m,
  },
  content: {
    paddingVertical: themeConstants.spacing.xs,
  },
  label: {
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.l,
  },
});
