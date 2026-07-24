import React from 'react';
import { StyleSheet } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { themeConstants } from '../../theme/themeConstants';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightIcon?: string;
  onRightPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBack = false, 
  rightIcon, 
  onRightPress 
}) => {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <Appbar.Header style={[styles.header, { backgroundColor: theme.colors.background }]}>
      {showBack && <Appbar.BackAction onPress={() => navigation.goBack()} />}
      <Appbar.Content title={title} titleStyle={styles.title} />
      {rightIcon && <Appbar.Action icon={rightIcon} onPress={onRightPress} />}
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    elevation: 0, // Flat design
  },
  title: {
    fontFamily: themeConstants.typography.fontFamily.semibold,
    fontSize: themeConstants.typography.size.xl,
  },
});
