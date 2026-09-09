// Bhraman - Voice & Text NLP Input + "Here's what I understood" Confirmation Modal
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  useWindowDimensions
} from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { TravelerConstraints, Category, TransportMode, TravelerGroup } from '../../types';
import { NLPParser } from '../../services/nlpParser';
import { useApp } from '../../context/AppContext';

interface VoiceTextInputModalProps {
  visible: boolean;
  onClose: () => void;
  onBuildPlan: (constraints: TravelerConstraints) => void;
  initialConstraints?: TravelerConstraints;
}

export const VoiceTextInputModal: React.FC<VoiceTextInputModalProps> = ({
  visible,
  onClose,
  onBuildPlan,
  initialConstraints,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const { activeLanguage } = useApp();
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [activeRecognition, setActiveRecognition] = useState<any>(null);
  const [interpretedConstraints, setInterpretedConstraints] = useState<TravelerConstraints | null>(null);
  const [missingFieldsNotice, setMissingFieldsNotice] = useState<string[]>([]);

  // Transport options
  const transportOptions: { key: TransportMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'walk', label: 'Walk', icon: 'walk' },
    { key: 'bicycle', label: 'Cycle', icon: 'bicycle' },
    { key: 'bike', label: 'Bike', icon: 'speedometer' },
    { key: 'auto', label: 'Auto', icon: 'car-sport' },
    { key: 'cab', label: 'Cab', icon: 'car' },
  ];

  // Interest options
  const categoryOptions: { key: Category; label: string }[] = [
    { key: 'food', label: '🍔 Local Food' },
    { key: 'culture', label: '🏛️ Culture' },
    { key: 'photography', label: '📸 Photography' },
    { key: 'nature', label: '🌿 Nature' },
    { key: 'hidden_gem', label: '✨ Hidden Gems' },
    { key: 'heritage', label: '🏰 Heritage' },
    { key: 'quirky', label: '🔮 Quirky' },
    { key: 'peaceful', label: '🕊️ Peaceful' },
  ];

  // Group options
  const groupOptions: { key: TravelerGroup; label: string }[] = [
    { key: 'solo', label: 'Solo' },
    { key: 'couple', label: 'Couple' },
    { key: 'friends', label: 'Friends' },
    { key: 'family', label: 'Family' },
  ];

  // Handles text or speech submission
  const handleParseInput = (textToParse: string) => {
    if (!textToParse.trim()) return;
    setIsProcessing(true);

    setTimeout(() => {
      const parsed = NLPParser.parse(textToParse);
      const fullConstraints: TravelerConstraints = {
        baseLocation: parsed.constraints.baseLocation || {
          name: "Bandra Hotel (Waterfield Rd)",
          coordinates: { latitude: 19.0596, longitude: 72.8295 },
        },
        availableMinutes: parsed.constraints.availableMinutes || 180,
        budget: parsed.constraints.budget || 3000,
        groupSize: parsed.constraints.groupSize || 3,
        groupType: parsed.constraints.groupType || 'friends',
        interests: parsed.constraints.interests || ['food', 'culture', 'photography'],
        transportMode: parsed.constraints.transportMode || 'bike',
        requiresReturn: true,
        minimumBufferMinutes: 15,
      };

      setInterpretedConstraints(fullConstraints);
      setMissingFieldsNotice(parsed.missingFields);
      setIsProcessing(false);
    }, 400);
  };

  // Real Speech Recognition handler
  const isSpeechSupported = typeof window !== 'undefined' && (
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  );

  const handleToggleVoice = () => {
    setSpeechError(null);

    if (isListening) {
      if (activeRecognition) {
        try {
          activeRecognition.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    if (!isSpeechSupported) {
      Alert.alert(
        "Microphone Access",
        "Speech recognition requires an Android Web Speech provider or speech-to-text service on this device.\n\nYou can type your request directly in any language, or tap the multilingual voice test buttons below to test real NLP parsing."
      );
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = activeLanguage === 'mr' ? 'mr-IN' : activeLanguage === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setInputText(transcript);
          handleParseInput(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setSpeechError(`Speech recognition: ${event.error || 'No speech detected'}. You can type directly or try again.`);
      };

      recognition.onend = () => {
        setIsListening(false);
        setActiveRecognition(null);
      };

      recognition.start();
      setActiveRecognition(recognition);
    } catch (err: any) {
      setIsListening(false);
      setSpeechError("Could not start speech recognition. Please type your request.");
    }
  };

  // Updating editable fields
  const updateMinutes = (delta: number) => {
    if (!interpretedConstraints) return;
    const current = interpretedConstraints.availableMinutes;
    const next = Math.max(30, Math.min(480, current + delta));
    setInterpretedConstraints({ ...interpretedConstraints, availableMinutes: next });
  };

  const updateBudget = (amount: number) => {
    if (!interpretedConstraints) return;
    setInterpretedConstraints({ ...interpretedConstraints, budget: amount });
  };

  const updateGroupSize = (delta: number) => {
    if (!interpretedConstraints) return;
    const current = interpretedConstraints.groupSize;
    const next = Math.max(1, Math.min(10, current + delta));
    setInterpretedConstraints({ ...interpretedConstraints, groupSize: next });
  };

  const toggleInterest = (category: Category) => {
    if (!interpretedConstraints) return;
    const current = interpretedConstraints.interests;
    const exists = current.includes(category);
    const updated = exists ? current.filter(c => c !== category) : [...current, category];
    setInterpretedConstraints({ ...interpretedConstraints, interests: updated });
  };

  const setTransport = (mode: TransportMode) => {
    if (!interpretedConstraints) return;
    setInterpretedConstraints({ ...interpretedConstraints, transportMode: mode });
  };

  const handleConfirmAndBuild = () => {
    if (!interpretedConstraints) return;
    onBuildPlan(interpretedConstraints);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.modalOverlay, isDesktop && styles.modalOverlayDesktop]}>
        <View style={[styles.modalCard, isDesktop && styles.modalCardDesktop]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.modalTitle}>Describe Your Exploration</Text>
              <Text style={styles.modalSubtitle}>Speak or type naturally in Mumbai context</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Dual Voice / Text Input Box */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 3 friends in Bandra, 3 hours, ₹3,000, local food, culture, photography by bike..."
                placeholderTextColor={THEME.colors.textMuted}
                value={inputText}
                onChangeText={setInputText}
                multiline
                numberOfLines={3}
              />

              <View style={styles.inputActionsRow}>
                <TouchableOpacity
                  style={[styles.voiceBtn, isListening && styles.voiceBtnActive]}
                  onPress={handleToggleVoice}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name={isListening ? "mic" : "mic-outline"} 
                    size={20} 
                    color="#FFF" 
                  />
                  <Text style={styles.voiceBtnText}>
                    {isListening ? "Listening..." : "Tap to Speak"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.parseBtn}
                  onPress={() => handleParseInput(inputText)}
                  activeOpacity={0.8}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Text style={styles.parseBtnText}>Parse Intent</Text>
                      <Ionicons name="arrow-forward" size={16} color="#FFF" />
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Real Speech Error / Info Notice */}
              {speechError && (
                <View style={styles.speechErrorBanner}>
                  <Ionicons name="information-circle-outline" size={14} color={THEME.colors.warning} />
                  <Text style={styles.speechErrorText}>{speechError}</Text>
                </View>
              )}
            </View>

            {/* Multilingual Voice Intent Testing */}
            <View style={styles.voiceSamplesSection}>
              <Text style={styles.presetLabel}>Test Multilingual Voice Triggers (Honest Samples):</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 4 }}>
                <TouchableOpacity
                  style={[styles.presetChip, styles.presetChipMarathi]}
                  onPress={() => {
                    setInputText(NLPParser.DEMO_VOICE_SAMPLE_MR);
                    handleParseInput(NLPParser.DEMO_VOICE_SAMPLE_MR);
                  }}
                >
                  <Ionicons name="mic" size={12} color="#FFF" />
                  <Text style={[styles.presetChipText, { color: '#FFF' }]}>मराठी Voice Sample</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.presetChip, styles.presetChipHindi]}
                  onPress={() => {
                    setInputText(NLPParser.DEMO_VOICE_SAMPLE_HI);
                    handleParseInput(NLPParser.DEMO_VOICE_SAMPLE_HI);
                  }}
                >
                  <Ionicons name="mic" size={12} color="#FFF" />
                  <Text style={[styles.presetChipText, { color: '#FFF' }]}>हिन्दी Voice Sample</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.presetChip, styles.presetChipPrimary]}
                  onPress={() => {
                    setInputText(NLPParser.DEMO_VOICE_SAMPLE_EN);
                    handleParseInput(NLPParser.DEMO_VOICE_SAMPLE_EN);
                  }}
                >
                  <Ionicons name="mic" size={12} color="#FFF" />
                  <Text style={[styles.presetChipText, { color: '#FFF' }]}>English 3h Bandra</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Quick Text Query Presets */}
            <View style={styles.presetsRow}>
              <Text style={styles.presetLabel}>Quick Text Queries:</Text>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => {
                  const q = "Solo, 90 mins, ₹800, peaceful hidden spots on foot";
                  setInputText(q);
                  handleParseInput(q);
                }}
              >
                <Text style={styles.presetChipText}>🚶 Solo 90m Walk</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => {
                  const q = "Couple, 2 hours, ₹1500, local street food & culture by auto";
                  setInputText(q);
                  handleParseInput(q);
                }}
              >
                <Text style={styles.presetChipText}>🛺 Couple Food Auto</Text>
              </TouchableOpacity>
            </View>

            {/* "HERE'S WHAT I UNDERSTOOD" CONFIRMATION CARD */}
            {interpretedConstraints && (
              <View style={styles.understandingCard}>
                <View style={styles.understandingHeader}>
                  <Ionicons name="sparkles" size={18} color={THEME.colors.primary} />
                  <Text style={styles.understandingTitle}>Here's what I understood</Text>
                </View>
                <Text style={styles.understandingDesc}>
                  Review and fine-tune your parameters before building the itinerary:
                </Text>

                {/* Base Location */}
                <View style={styles.fieldSection}>
                  <Text style={styles.fieldLabel}>📍 Starting Base Location</Text>
                  <View style={styles.readOnlyBadge}>
                    <Text style={styles.readOnlyText}>
                      {interpretedConstraints.baseLocation.name}
                    </Text>
                  </View>
                </View>

                {/* Time & Return Deadline */}
                <View style={styles.fieldSection}>
                  <View style={styles.fieldLabelRow}>
                    <Text style={styles.fieldLabel}>⏱️ Available Exploration Time</Text>
                    <Text style={styles.fieldValueHighlight}>
                      {Math.floor(interpretedConstraints.availableMinutes / 60)}h {interpretedConstraints.availableMinutes % 60}m
                    </Text>
                  </View>
                  <View style={styles.stepperRow}>
                    <TouchableOpacity style={styles.stepperBtn} onPress={() => updateMinutes(-30)}>
                      <Text style={styles.stepperBtnText}>- 30m</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.timeChip, interpretedConstraints.availableMinutes === 60 && styles.timeChipActive]}
                      onPress={() => setInterpretedConstraints({ ...interpretedConstraints, availableMinutes: 60 })}
                    >
                      <Text style={[styles.timeChipText, interpretedConstraints.availableMinutes === 60 && styles.timeChipTextActive]}>1 hr</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.timeChip, interpretedConstraints.availableMinutes === 120 && styles.timeChipActive]}
                      onPress={() => setInterpretedConstraints({ ...interpretedConstraints, availableMinutes: 120 })}
                    >
                      <Text style={[styles.timeChipText, interpretedConstraints.availableMinutes === 120 && styles.timeChipTextActive]}>2 hr</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.timeChip, interpretedConstraints.availableMinutes === 180 && styles.timeChipActive]}
                      onPress={() => setInterpretedConstraints({ ...interpretedConstraints, availableMinutes: 180 })}
                    >
                      <Text style={[styles.timeChipText, interpretedConstraints.availableMinutes === 180 && styles.timeChipTextActive]}>3 hr</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.stepperBtn} onPress={() => updateMinutes(30)}>
                      <Text style={styles.stepperBtnText}>+ 30m</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Total Budget */}
                <View style={styles.fieldSection}>
                  <View style={styles.fieldLabelRow}>
                    <Text style={styles.fieldLabel}>💰 Total Budget</Text>
                    <Text style={styles.fieldValueHighlight}>₹{interpretedConstraints.budget.toLocaleString()}</Text>
                  </View>
                  <View style={styles.chipsWrap}>
                    {[1000, 2000, 3000, 5000].map(val => (
                      <TouchableOpacity
                        key={val}
                        style={[styles.budgetChip, interpretedConstraints.budget === val && styles.budgetChipActive]}
                        onPress={() => updateBudget(val)}
                      >
                        <Text style={[styles.budgetChipText, interpretedConstraints.budget === val && styles.budgetChipTextActive]}>
                          ₹{val.toLocaleString()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Group Size */}
                <View style={styles.fieldSection}>
                  <View style={styles.fieldLabelRow}>
                    <Text style={styles.fieldLabel}>👥 Group Size</Text>
                    <Text style={styles.fieldValueHighlight}>
                      {interpretedConstraints.groupSize} {interpretedConstraints.groupSize === 1 ? 'Person' : 'People'}
                    </Text>
                  </View>
                  <View style={styles.counterRow}>
                    <TouchableOpacity style={styles.counterBtn} onPress={() => updateGroupSize(-1)}>
                      <Text style={styles.counterBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{interpretedConstraints.groupSize}</Text>
                    <TouchableOpacity style={styles.counterBtn} onPress={() => updateGroupSize(1)}>
                      <Text style={styles.counterBtnText}>+</Text>
                    </TouchableOpacity>
                    <View style={styles.groupTypeRow}>
                      {groupOptions.map(g => (
                        <TouchableOpacity
                          key={g.key}
                          style={[styles.groupTypeChip, interpretedConstraints.groupType === g.key && styles.groupTypeChipActive]}
                          onPress={() => setInterpretedConstraints({ ...interpretedConstraints, groupType: g.key })}
                        >
                          <Text style={[styles.groupTypeText, interpretedConstraints.groupType === g.key && styles.groupTypeTextActive]}>
                            {g.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Transport Mode */}
                <View style={styles.fieldSection}>
                  <Text style={styles.fieldLabel}>🛵 Transport Mode (Shapes Reachability)</Text>
                  <View style={styles.transportRow}>
                    {transportOptions.map(t => (
                      <TouchableOpacity
                        key={t.key}
                        style={[
                          styles.transportBtn,
                          interpretedConstraints.transportMode === t.key && styles.transportBtnActive,
                        ]}
                        onPress={() => setTransport(t.key)}
                      >
                        <Ionicons
                          name={t.icon}
                          size={18}
                          color={interpretedConstraints.transportMode === t.key ? '#FFF' : THEME.colors.textMuted}
                        />
                        <Text
                          style={[
                            styles.transportBtnText,
                            interpretedConstraints.transportMode === t.key && styles.transportBtnTextActive,
                          ]}
                        >
                          {t.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Interests */}
                <View style={styles.fieldSection}>
                  <Text style={styles.fieldLabel}>🎯 Desired Mood & Interests</Text>
                  <View style={styles.chipsWrap}>
                    {categoryOptions.map(cat => {
                      const isSelected = interpretedConstraints.interests.includes(cat.key);
                      return (
                        <TouchableOpacity
                          key={cat.key}
                          style={[styles.interestChip, isSelected && styles.interestChipActive]}
                          onPress={() => toggleInterest(cat.key)}
                        >
                          <Text style={[styles.interestChipText, isSelected && styles.interestChipTextActive]}>
                            {cat.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Primary Action Button */}
                <TouchableOpacity
                  style={styles.buildExperienceBtn}
                  onPress={handleConfirmAndBuild}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buildExperienceBtnText}>BUILD MY EXPERIENCE</Text>
                  <Ionicons name="flash" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalOverlayDesktop: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.surfaceBorder,
  },
  modalCardDesktop: {
    maxWidth: 680,
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.lg,
    paddingBottom: THEME.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.surfaceElevated,
  },
  scrollArea: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
  },
  inputContainer: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  textInput: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 65,
  },
  inputActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: THEME.spacing.sm,
    gap: 8,
  },
  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.radius.full,
    gap: 6,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  voiceBtnActive: {
    backgroundColor: THEME.colors.danger,
    borderColor: THEME.colors.danger,
  },
  voiceBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  parseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: THEME.radius.full,
    gap: 6,
  },
  parseBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  speechErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: THEME.radius.sm,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  speechErrorText: {
    fontSize: 10,
    color: THEME.colors.warning,
    flex: 1,
  },
  voiceSamplesSection: {
    marginVertical: 6,
  },
  presetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: THEME.spacing.sm,
  },
  presetLabel: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  presetChipMarathi: {
    backgroundColor: '#C2410C',
    borderColor: '#EA580C',
  },
  presetChipHindi: {
    backgroundColor: '#0F766E',
    borderColor: '#0D9488',
  },
  presetChipPrimary: {
    backgroundColor: '#1E40AF',
    borderColor: '#2563EB',
  },
  presetChipText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  understandingCard: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radius.xl,
    padding: THEME.spacing.md,
    marginTop: THEME.spacing.sm,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
  },
  understandingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  understandingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  understandingDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 4,
    marginBottom: THEME.spacing.md,
  },
  fieldSection: {
    marginBottom: THEME.spacing.md,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginBottom: 6,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldValueHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  readOnlyBadge: {
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.radius.md,
  },
  readOnlyText: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  stepperBtn: {
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: THEME.radius.sm,
  },
  stepperBtnText: {
    color: THEME.colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  timeChip: {
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.radius.sm,
  },
  timeChipActive: {
    backgroundColor: THEME.colors.primary,
  },
  timeChipText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  timeChipTextActive: {
    color: '#FFF',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  budgetChip: {
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  budgetChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  budgetChipText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  budgetChipTextActive: {
    color: '#FFF',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterBtn: {
    backgroundColor: THEME.colors.surfaceElevated,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  counterValue: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
  groupTypeRow: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 8,
    flexWrap: 'wrap',
  },
  groupTypeChip: {
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.radius.sm,
  },
  groupTypeChipActive: {
    backgroundColor: THEME.colors.primaryDark,
  },
  groupTypeText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  groupTypeTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  transportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  transportBtn: {
    flex: 1,
    backgroundColor: THEME.colors.surfaceElevated,
    paddingVertical: 8,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  transportBtnActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  transportBtnText: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  transportBtnTextActive: {
    color: '#FFF',
  },
  interestChip: {
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  interestChipActive: {
    backgroundColor: THEME.colors.secondary,
    borderColor: THEME.colors.secondary,
  },
  interestChipText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  interestChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  buildExperienceBtn: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: THEME.radius.lg,
    gap: 8,
    marginTop: THEME.spacing.md,
  },
  buildExperienceBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
