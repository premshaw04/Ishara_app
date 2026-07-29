import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { themeConstants } from '../../theme/themeConstants';
import { PrimaryButton } from '../Buttons/PrimaryButton';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops, something went wrong!</Text>
          <Text style={styles.subtitle}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </Text>
          <PrimaryButton title="Try Again" onPress={this.resetError} style={styles.button} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: themeConstants.spacing.xl,
    backgroundColor: '#F9FAFB', // fallback color
  },
  title: {
    fontSize: themeConstants.typography.size.xl,
    fontFamily: themeConstants.typography.fontFamily.bold,
    color: themeConstants.palette.error,
    marginBottom: themeConstants.spacing.m,
  },
  subtitle: {
    fontSize: themeConstants.typography.size.m,
    fontFamily: themeConstants.typography.fontFamily.regular,
    color: themeConstants.palette.gray600,
    textAlign: 'center',
    marginBottom: themeConstants.spacing.xl,
  },
  button: {
    width: '100%',
  },
});
