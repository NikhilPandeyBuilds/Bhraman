// Bhraman - Native Mobile Device Shell & Frame
// Renders full-screen on mobile devices and a smartphone shell on wide desktop screens
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, TouchableOpacity, Text } from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  const [forceFullscreen, setForceFullscreen] = useState(false);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const isWide = windowWidth > 500 && !forceFullscreen;

  if (!isWide) {
    return (
      <View style={styles.nativeContainer}>
        {children}
      </View>
    );
  }

  return (
    <View style={styles.desktopOuter}>
      {/* Top Controller Bar */}
      <View style={styles.desktopControls}>
        <View style={styles.brandBadge}>
          <Text style={styles.brandBadgeTitle}>BHRAMAN MOBILE APP</Text>
          <Text style={styles.brandBadgeSub}>HackCelestial 3.0 • PS6</Text>
        </View>

        <TouchableOpacity
          style={styles.fullscreenBtn}
          onPress={() => setForceFullscreen(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="expand" size={14} color="#FFF" />
          <Text style={styles.fullscreenBtnText}>Expand Fullscreen</Text>
        </TouchableOpacity>
      </View>

      {/* Smartphone Device Frame */}
      <View style={styles.deviceFrame}>
        {/* Dynamic Island / Speaker Notch */}
        <View style={styles.deviceTopBar}>
          <View style={styles.timeLabel}>
            <Text style={styles.timeText}>9:41</Text>
          </View>
          <View style={styles.dynamicIsland}>
            <View style={styles.cameraLens} />
            <View style={styles.sensorDot} />
          </View>
          <View style={styles.statusIcons}>
            <Ionicons name="cellular" size={12} color={THEME.colors.textPrimary} />
            <Ionicons name="wifi" size={12} color={THEME.colors.textPrimary} />
            <Ionicons name="battery-full" size={14} color={THEME.colors.textPrimary} />
          </View>
        </View>

        {/* Content Viewport */}
        <View style={styles.viewport}>
          {children}
        </View>

        {/* Home Indicator Bar */}
        <View style={styles.homeIndicatorBar}>
          <View style={styles.homeIndicator} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  nativeContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  desktopOuter: {
    flex: 1,
    height: '100%' as any,
    minHeight: '100vh' as any,
    backgroundColor: '#070A0E',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  desktopControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 410,
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  brandBadge: {
    justifyContent: 'center',
  },
  brandBadgeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.primary,
    letterSpacing: 1,
  },
  brandBadgeSub: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  fullscreenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.radius.sm,
    gap: 4,
  },
  fullscreenBtnText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
  },
  deviceFrame: {
    width: 410,
    maxWidth: '100%',
    height: '92%' as any,
    maxHeight: 840,
    minHeight: 640,
    backgroundColor: THEME.colors.background,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: '#242D3D',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 28,
    elevation: 20,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  deviceTopBar: {
    height: 38,
    backgroundColor: THEME.colors.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 100,
  },
  timeLabel: {
    width: 45,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  dynamicIsland: {
    width: 96,
    height: 22,
    backgroundColor: '#000',
    borderRadius: 11,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  cameraLens: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E293B',
  },
  sensorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#064E3B',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 45,
    justifyContent: 'flex-end',
  },
  viewport: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  homeIndicatorBar: {
    height: 18,
    backgroundColor: THEME.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeIndicator: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});
