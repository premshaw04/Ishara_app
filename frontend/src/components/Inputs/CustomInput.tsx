import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, HelperText, useTheme } from 'react-native-paper';
import { themeConstants } from '../../theme/themeConstants';

interface CustomInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry,
  keyboardType = 'default',
  leftIcon,
  rightIcon,
  onRightIconPress,
}) => {
  const theme = useTheme();
  
  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        error={!!error}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        left={leftIcon ? <TextInput.Icon icon={leftIcon} /> : undefined}
        right={rightIcon ? <TextInput.Icon icon={rightIcon} onPress={onRightIconPress} /> : undefined}
        outlineStyle={styles.outline}
        style={styles.input}
      />
      {error ? (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: themeConstants.spacing.s,
  },
  input: {
    backgroundColor: 'transparent',
  },
  outline: {
    borderRadius: themeConstants.radii.m,
  },
});
