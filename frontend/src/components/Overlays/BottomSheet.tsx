import React, { forwardRef, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import GorhomBottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useTheme } from 'react-native-paper';
import { themeConstants } from '../../theme/themeConstants';

interface BottomSheetProps {
  children: React.ReactNode;
  snapPoints?: string[];
  onChange?: (index: number) => void;
}

export const BottomSheet = forwardRef<GorhomBottomSheet, BottomSheetProps>(({ 
  children, 
  snapPoints = ['25%', '50%', '90%'],
  onChange 
}, ref) => {
  const theme = useTheme();

  // Memoized snap points
  const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints]);

  return (
    <GorhomBottomSheet
      ref={ref}
      index={-1} // Starts closed
      snapPoints={memoizedSnapPoints}
      onChange={onChange}
      enablePanDownToClose={true}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      )}
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
    >
      <View style={styles.contentContainer}>
        {children}
      </View>
    </GorhomBottomSheet>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: themeConstants.spacing.l,
  },
});
