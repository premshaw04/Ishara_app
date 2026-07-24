import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { themeConstants } from '../../theme/themeConstants';

interface OutlinedButtonProps {
  title: string;
  onPress: () => void;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const OutlinedButton: React.FC<OutlinedButtonProps> = ({
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
      mode="outlined"
      onPress={onPress}
      icon={icon}
      loading={loading}
      disabled={disabled}
      textColor={theme.colors.primary}
      style={[styles.button, style, { borderColor: theme.colors.outline }]}
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
    borderWidth: 1.5,
  },
  content: {
    paddingVertical: themeConstants.spacing.xs,
  },
  label: {
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.l,
  },
});
