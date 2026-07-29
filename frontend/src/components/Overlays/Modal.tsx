import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Portal, Modal as PaperModal, useTheme } from 'react-native-paper';
import { themeConstants } from '../../theme/themeConstants';

interface ModalProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  dismissable?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ 
  visible, 
  onDismiss, 
  children, 
  dismissable = true 
}) => {
  const theme = useTheme();

  return (
    <Portal>
      <PaperModal 
        visible={visible} 
        onDismiss={onDismiss} 
        dismissable={dismissable}
        contentContainerStyle={[styles.container, { backgroundColor: theme.colors.surface }]}
      >
        {children}
      </PaperModal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: themeConstants.spacing.xl,
    padding: themeConstants.spacing.l,
    borderRadius: themeConstants.radii.l,
  },
});
