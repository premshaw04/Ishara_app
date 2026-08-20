import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SvgXml } from 'react-native-svg';
import { themeConstants } from '../theme/themeConstants';

const googleLogoXml = `
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
  <path fill="none" d="M0 0h48v48H0z"></path>
</svg>
`;

interface GoogleButtonProps {
  onPress: () => void;
  title?: string;
  disabled?: boolean;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({ 
  onPress, 
  title = "Continue with Google",
  disabled = false
}) => {
  const theme = useTheme();
  
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { 
          backgroundColor: theme.dark ? '#1E1E1E' : '#FFFFFF',
          borderColor: theme.dark ? '#333333' : '#E0E0E0',
          opacity: disabled ? 0.7 : 1
        }
      ]} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.contentContainer}>
        <SvgXml xml={googleLogoXml} width="24" height="24" style={styles.icon} />
        <Text style={[
          styles.text, 
          { color: theme.dark ? '#FFFFFF' : '#333333' }
        ]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: themeConstants.radii.m,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: themeConstants.spacing.m,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: themeConstants.spacing.m,
  },
  text: {
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.m,
  }
});
