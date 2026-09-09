// Bhraman - Responsive Device Shell
// Provides a full-screen responsive container for Mobile, Tablet, and Desktop Web
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { THEME } from '../../constants/theme';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%' as any,
    minHeight: '100vh' as any,
    backgroundColor: THEME.colors.background,
  },
});
