import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { themeConstants } from '../../theme/themeConstants';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  icon?: any;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  icon,
  loading,
  disabled,
  style,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  return (
    <Button
      mode="contained"
      onPress={onPress}
      icon={icon}
      loading={loading}
      disabled={disabled}
      buttonColor={theme.colors.primary}
      textColor={theme.colors.onPrimary}
      style={[styles.button, style]}
      contentStyle={styles.content}
      labelStyle={styles.label}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}>
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
