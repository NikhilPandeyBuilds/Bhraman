// Bhraman - Mobile Application Entry
// Built for HackCelestial 3.0 (PS6: Local & Experiences)
// From Places -> To Plans | Discover Beyond the Obvious

import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, View, StatusBar, Alert, Modal, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { THEME } from './src/constants/theme';
import { HeaderBar } from './src/components/common/HeaderBar';
import { BottomTabBar, TabScreen } from './src/components/common/BottomTabBar';
import { DeviceFrame } from './src/components/common/DeviceFrame';
import { HomeScreen } from './src/components/home/HomeScreen';
import { NativeMapView } from './src/components/map/NativeMapView';
import { ItineraryView } from './src/components/itinerary/ItineraryView';
import { CommunityView } from './src/components/community/CommunityView';
import { SavedView } from './src/components/saved/SavedView';
import { ProfileView } from './src/components/profile/ProfileView';
import { ProviderView } from './src/components/provider/ProviderView';
import { VoiceTextInputModal } from './src/components/nlp/VoiceTextInputModal';
import { AuthModal } from './src/components/auth/AuthModal';
import { ShareDiscoveryModal } from './src/components/community/ShareDiscoveryModal';
import { CreateCommunityModal } from './src/components/community/CreateCommunityModal';
import { UnifiedSearchModal } from './src/components/search/UnifiedSearchModal';
import { HackathonDemoDock } from './src/components/demo/HackathonDemoDock';
import { AppProvider, useApp } from './src/context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { Place, LocalDiscovery, Community } from './src/types';

function BhramanAppContent() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const {
    constraints,
    setConstraints,
    activeItinerary,
    activeDiff,
    trafficCondition,
    weatherCondition,
    buildExperience,
    acceptDiff,
    dismissDiff,
    triggerHeavyRain,
    triggerTrafficSpike,
    triggerTimeCut,
    triggerBudgetCut,
    resetDemoConditions,
    saveCurrentItinerary,
    user
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabScreen>('home');
  const [isProviderMode, setIsProviderMode] = useState<boolean>(false);
  const [isDemoDockOpen, setIsDemoDockOpen] = useState<boolean>(true); // Open by default for judge convenience
  
  // Real Modals State
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isCreateCommunityModalOpen, setIsCreateCommunityModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isViewingItineraryModal, setIsViewingItineraryModal] = useState<boolean>(false);

  // Handler: Build Plan from constraints & open Itinerary view
  const handleBuildExperience = (customConstraints?: any) => {
    buildExperience(customConstraints);
    setIsViewingItineraryModal(true);
  };

  const handleSelectSponsoredPlace = (place: Place) => {
    Alert.alert(
      `${place.name} (Sponsored)`,
      `${place.description}\n\nNote: This is a verified business placement. Commercial sponsors can purchase visibility, but NEVER organic relevance.`
    );
  };

  return (
    <DeviceFrame>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={THEME.colors.background} />

        {/* Global Header Bar (Includes Desktop Navigation when on wide screen) */}
        <HeaderBar
          traffic={trafficCondition}
          weather={weatherCondition}
          onOpenDemoDock={() => setIsDemoDockOpen(!isDemoDockOpen)}
          isDemoDockOpen={isDemoDockOpen}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          hasActivePlan={!!activeItinerary}
          onOpenSearch={() => setIsSearchModalOpen(true)}
        />

        {/* Floating / Collapsible Hackathon Demo Dock */}
        {isDemoDockOpen && (
          <HackathonDemoDock
            onRunBaseDemo={() => {
              resetDemoConditions();
              setIsViewingItineraryModal(true);
            }}
            onTriggerHeavyRain={() => {
              triggerHeavyRain();
              setIsViewingItineraryModal(true);
            }}
            onTriggerTrafficSpike={() => {
              triggerTrafficSpike();
              setIsViewingItineraryModal(true);
            }}
            onTriggerTimeCut={() => {
              triggerTimeCut(70);
              setIsViewingItineraryModal(true);
            }}
            onTriggerBudgetCut={() => {
              triggerBudgetCut(1000);
              setIsViewingItineraryModal(true);
            }}
            onResetConditions={resetDemoConditions}
            currentTraffic={trafficCondition}
            currentWeather={weatherCondition}
            onClose={() => setIsDemoDockOpen(false)}
          />
        )}

        {/* Main Content Area: 5 Core Product Tabs */}
        <View style={styles.contentArea}>
          {isProviderMode ? (
            <ProviderView onBackToTraveler={() => setIsProviderMode(false)} />
          ) : (
            <>
              {/* TAB 1: HOME */}
              {activeTab === 'home' && (
                <HomeScreen
                  constraints={constraints}
                  onChangeConstraints={setConstraints}
                  onOpenVoiceTextInput={() => setIsVoiceModalOpen(true)}
                  onBuildExperience={() => handleBuildExperience()}
                  activePlan={activeItinerary}
                  onViewActivePlan={() => setIsViewingItineraryModal(true)}
                  onSelectSponsoredPlace={handleSelectSponsoredPlace}
                  onOpenSearch={() => setIsSearchModalOpen(true)}
                />
              )}

              {/* TAB 2: EXPLORE */}
              {activeTab === 'explore' && (
                <NativeMapView
                  activeItinerary={activeItinerary}
                  transportMode={constraints.transportMode}
                  traffic={trafficCondition}
                />
              )}

              {/* TAB 3: COMMUNITIES */}
              {activeTab === 'communities' && (
                <CommunityView
                  onOpenCreateCommunity={() => setIsCreateCommunityModalOpen(true)}
                  onOpenShareDiscovery={() => setIsShareModalOpen(true)}
                />
              )}

              {/* TAB 4: SAVED */}
              {activeTab === 'saved' && (
                <SavedView
                  onLoadSavedPlan={(plan) => {
                    if (plan.constraints) {
                      setConstraints(plan.constraints);
                      buildExperience(plan.constraints);
                    } else {
                      buildExperience();
                    }
                    setIsViewingItineraryModal(true);
                  }}
                  onExplorePlace={(place) => {
                    setActiveTab('explore');
                  }}
                />
              )}

              {/* TAB 5: PROFILE */}
              {activeTab === 'profile' && (
                <ProfileView
                  onSwitchToProvider={() => setIsProviderMode(true)}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                  savedPlanCount={activeItinerary ? 1 : 0}
                />
              )}
            </>
          )}
        </View>

        {/* Bottom Tab Navigation Bar (Visible in mobile traveler mode) */}
        {!isProviderMode && !isDesktop && (
          <BottomTabBar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            hasActivePlan={!!activeItinerary}
          />
        )}

        {/* ITINERARY RESULT MODAL (Section 38: Itinerary opens as main result experience) */}
        <Modal
          visible={isViewingItineraryModal}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setIsViewingItineraryModal(false)}
        >
          <SafeAreaView style={styles.itineraryModalContainer}>
            <View style={styles.itineraryModalHeader}>
              <TouchableOpacity
                style={styles.closeItineraryBtn}
                onPress={() => setIsViewingItineraryModal(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={20} color={THEME.colors.textPrimary} />
                <Text style={styles.closeItineraryText}>Back to Bhraman</Text>
              </TouchableOpacity>
              <Text style={styles.itineraryHeaderTitle}>Calculated Plan</Text>
              <View style={{ width: 40 }} />
            </View>

            <ItineraryView
              itinerary={activeItinerary}
              activeDiff={activeDiff}
              onAcceptDiff={acceptDiff}
              onDismissDiff={dismissDiff}
              onTriggerSimulateChange={(sc) => {
                if (sc === 'heavy_rain') triggerHeavyRain();
                else if (sc === 'traffic_spike') triggerTrafficSpike();
                else if (sc === 'time_cut') triggerTimeCut(70);
                else if (sc === 'budget_cut') triggerBudgetCut(1000);
              }}
              onSavePlan={saveCurrentItinerary}
            />
          </SafeAreaView>
        </Modal>

        {/* Voice & Text Natural Language Input Modal */}
        <VoiceTextInputModal
          visible={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onBuildPlan={(newConstraints) => {
            setConstraints(newConstraints);
            handleBuildExperience(newConstraints);
          }}
          initialConstraints={constraints}
        />

        {/* Unified Search Modal across Places, Discoveries, Communities, Creators, Events */}
        <UnifiedSearchModal
          visible={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onSelectPlace={(p) => {
            setIsSearchModalOpen(false);
            setActiveTab('explore');
          }}
          onSelectCommunity={(c) => {
            setIsSearchModalOpen(false);
            setActiveTab('communities');
          }}
          onSelectDiscovery={(d: LocalDiscovery) => {
            setIsSearchModalOpen(false);
            setActiveTab('communities');
          }}
        />

        {/* Real User Authentication & Profile Editor Modal */}
        <AuthModal
          visible={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />

        {/* Real Local Discovery Creator Modal (+50 Explorer Points) */}
        <ShareDiscoveryModal
          visible={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
        />

        {/* Real Community Creation Modal (+40 Explorer Points) */}
        <CreateCommunityModal
          visible={isCreateCommunityModalOpen}
          onClose={() => setIsCreateCommunityModalOpen(false)}
        />
      </SafeAreaView>
    </DeviceFrame>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BhramanAppContent />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    display: 'flex',
    flexDirection: 'column',
    height: '100%' as any,
    minHeight: '100vh' as any,
    width: '100%',
  },
  contentArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    width: '100%',
    display: 'flex',
  },
  itineraryModalContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    width: '100%',
    height: '100%' as any,
    minHeight: '100vh' as any,
  },
  itineraryModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
    backgroundColor: THEME.colors.surface,
  },
  closeItineraryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  closeItineraryText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  itineraryHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
});
