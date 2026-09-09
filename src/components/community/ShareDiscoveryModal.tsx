// Bhraman - Real Local Discovery Creation Modal
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  ScrollView, 
  Image, 
  Alert,
  useWindowDimensions 
} from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../../context/AppContext';
import { Category, SupportedLanguage } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../services/i18n/languageService';

interface ShareDiscoveryModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ShareDiscoveryModal: React.FC<ShareDiscoveryModalProps> = ({
  visible,
  onClose,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const { addDiscovery, activeLanguage, user } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [localTip, setLocalTip] = useState('');
  const [neighborhood, setNeighborhood] = useState('Bandra West');
  const [category, setCategory] = useState<Category>('hidden_gem');
  const [cost, setCost] = useState('0');
  const [stayMinutes, setStayMinutes] = useState('30');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(activeLanguage);
  const [isPickingImage, setIsPickingImage] = useState(false);

  // Curated photo choices for fallback / rapid preview
  const photoPresets = [
    { label: 'Murals Lane', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80' },
    { label: 'Tidal Rocks', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80' },
    { label: 'Old Verandah', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80' },
    { label: 'Sunset Deck', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=600&auto=format&fit=crop&q=80' },
    { label: 'Hidden Cafe', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80' },
  ];

  const [selectedPhoto, setSelectedPhoto] = useState(photoPresets[0].url);
  const [isCustomPhoto, setIsCustomPhoto] = useState(false);

  // Real Mobile Photo Actions
  const handleTakePhoto = async () => {
    try {
      setIsPickingImage(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Camera Permission Required",
          "Bhraman needs camera access so you can photograph and document this local gem."
        );
        setIsPickingImage(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedPhoto(result.assets[0].uri);
        setIsCustomPhoto(true);
      }
    } catch (err) {
      Alert.alert("Camera Error", "Could not access camera on this device. You can choose from gallery or select a sample photo.");
    } finally {
      setIsPickingImage(false);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      setIsPickingImage(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Gallery Permission Required",
          "Bhraman needs photo gallery access to let you upload your discovery photo."
        );
        setIsPickingImage(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedPhoto(result.assets[0].uri);
        setIsCustomPhoto(true);
      }
    } catch (err) {
      Alert.alert("Gallery Error", "Could not load photo gallery. You can select a sample photo.");
    } finally {
      setIsPickingImage(false);
    }
  };

  const categories: { key: Category; label: string }[] = [
    { key: 'hidden_gem', label: '✨ Hidden Gem' },
    { key: 'food', label: '🍔 Local Food' },
    { key: 'culture', label: '🏛️ Culture' },
    { key: 'photography', label: '📸 Photography' },
    { key: 'nature', label: '🌿 Nature' },
    { key: 'heritage', label: '🏰 Heritage' },
    { key: 'peaceful', label: '🕊️ Peaceful' },
  ];

  const handlePublish = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Missing Information", "Please provide a title and description for your discovery.");
      return;
    }

    await addDiscovery({
      title: title.trim(),
      description: description.trim(),
      localTip: localTip.trim() || undefined,
      neighborhood: neighborhood.trim(),
      category,
      creatorId: user.id,
      creatorName: user.name,
      creatorHandle: `@${user.name.toLowerCase().replace(/\s+/g, '_')}`,
      coordinates: {
        latitude: 19.055 + (Math.random() * 0.015 - 0.007),
        longitude: 72.830 + (Math.random() * 0.015 - 0.007),
      },
      averageCostPerPerson: parseInt(cost, 10) || 0,
      typicalStayMinutes: parseInt(stayMinutes, 10) || 30,
      imageUrl: selectedPhoto,
      originalLanguage: selectedLanguage,
      isUserCreated: true,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setLocalTip('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.modalOverlay, isDesktop && styles.modalOverlayDesktop]}>
        <View style={[styles.modalCard, isDesktop && styles.modalCardDesktop]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.modalTitle}>+ Share a Local Discovery</Text>
              <Text style={styles.modalSub}>
                Contribute raw neighborhood spots unknown to generic tourist apps (+50 pts)
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Discovery Name / Title *</Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Secret Sunset Stone Steps at Ranwar"
                placeholderTextColor={THEME.colors.textMuted}
              />
            </View>

            {/* Neighborhood */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Neighborhood / Area</Text>
              <TextInput
                style={styles.textInput}
                value={neighborhood}
                onChangeText={setNeighborhood}
                placeholder="e.g. Bandra West, Khar, Worli, Girgaon"
                placeholderTextColor={THEME.colors.textMuted}
              />
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.chipsWrap}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[styles.categoryChip, category === cat.key && styles.categoryChipActive]}
                    onPress={() => setCategory(cat.key)}
                  >
                    <Text style={[styles.categoryChipText, category === cat.key && styles.categoryChipTextActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>What makes this spot special? *</Text>
              <TextInput
                style={[styles.textInput, { height: 70, textAlignVertical: 'top' }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe how to find it, the atmosphere, historical context, or unique features..."
                placeholderTextColor={THEME.colors.textMuted}
                multiline
              />
            </View>

            {/* Local Tip */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Insider Local Tip</Text>
              <TextInput
                style={styles.textInput}
                value={localTip}
                onChangeText={setLocalTip}
                placeholder="e.g. Visit right at 5:45 PM for golden light; entry is free via side gate."
                placeholderTextColor={THEME.colors.textMuted}
              />
            </View>

            {/* Cost & Stay Duration */}
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Est. Cost (₹)</Text>
                <TextInput
                  style={styles.textInput}
                  value={cost}
                  onChangeText={setCost}
                  placeholder="0"
                  placeholderTextColor={THEME.colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Typical Stay (Mins)</Text>
                <TextInput
                  style={styles.textInput}
                  value={stayMinutes}
                  onChangeText={setStayMinutes}
                  placeholder="30"
                  placeholderTextColor={THEME.colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Language Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Primary Language of Content</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {SUPPORTED_LANGUAGES.slice(0, 5).map(lang => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.langChip, selectedLanguage === lang.code && styles.langChipActive]}
                    onPress={() => setSelectedLanguage(lang.code)}
                  >
                    <Text style={[styles.langChipText, selectedLanguage === lang.code && styles.langChipTextActive]}>
                      {lang.nativeName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Real Mobile Photo Selection */}
            <View style={styles.inputGroup}>
              <View style={styles.photoHeaderRow}>
                <Text style={styles.inputLabel}>Discovery Photo *</Text>
                {isCustomPhoto && (
                  <View style={styles.customBadge}>
                    <Ionicons name="checkmark-circle" size={12} color={THEME.colors.success} />
                    <Text style={styles.customBadgeText}>Device Captured</Text>
                  </View>
                )}
              </View>

              {/* Action Buttons: Camera & Gallery */}
              <View style={styles.photoActionsRow}>
                <TouchableOpacity
                  style={styles.photoActionBtn}
                  onPress={handleTakePhoto}
                  disabled={isPickingImage}
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera" size={18} color={THEME.colors.primary} />
                  <Text style={styles.photoActionText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.photoActionBtn}
                  onPress={handlePickFromGallery}
                  disabled={isPickingImage}
                  activeOpacity={0.8}
                >
                  <Ionicons name="images" size={18} color={THEME.colors.secondary} />
                  <Text style={styles.photoActionText}>Choose Gallery</Text>
                </TouchableOpacity>
              </View>

              {/* Photo Preview Container */}
              <View style={styles.photoPreviewBox}>
                <Image source={{ uri: selectedPhoto }} style={styles.previewImage} />
                <View style={styles.previewOverlay}>
                  <Text style={styles.previewCaption}>
                    {isCustomPhoto ? "✓ Uploaded from Mobile Device" : "Selected Preview"}
                  </Text>
                </View>
              </View>

              {/* Curated Sample Choices */}
              <Text style={styles.sampleSubLabel}>Or choose from curated Mumbai photo presets:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 4 }}>
                {photoPresets.map(preset => {
                  const isSelected = selectedPhoto === preset.url && !isCustomPhoto;
                  return (
                    <TouchableOpacity
                      key={preset.label}
                      onPress={() => {
                        setSelectedPhoto(preset.url);
                        setIsCustomPhoto(false);
                      }}
                      style={[styles.photoPresetCard, isSelected && styles.photoPresetCardSelected]}
                    >
                      <Image source={{ uri: preset.url }} style={styles.photoPresetImg} />
                      <Text style={[styles.photoPresetLabel, isSelected && styles.photoPresetLabelSelected]}>
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Publish Button */}
            <TouchableOpacity
              style={styles.publishBtn}
              onPress={handlePublish}
              activeOpacity={0.8}
            >
              <Text style={styles.publishBtnText}>PUBLISH LOCAL DISCOVERY</Text>
              <Ionicons name="cloud-upload" size={18} color="#FFF" />
            </TouchableOpacity>
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
    fontSize: 17,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  modalSub: {
    fontSize: 11,
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
  inputGroup: {
    marginBottom: THEME.spacing.md,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: THEME.colors.background,
    color: THEME.colors.textPrimary,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryChip: {
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  categoryChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  categoryChipText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  langChip: {
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  langChipActive: {
    backgroundColor: THEME.colors.secondary,
    borderColor: THEME.colors.secondary,
  },
  langChipText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  langChipTextActive: {
    color: '#FFF',
  },
  photoPresetCard: {
    width: 80,
    borderRadius: THEME.radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: THEME.colors.surfaceBorder,
    backgroundColor: THEME.colors.background,
  },
  photoPresetCardSelected: {
    borderColor: THEME.colors.primary,
  },
  photoPresetImg: {
    width: '100%',
    height: 55,
  },
  photoPresetLabel: {
    fontSize: 9,
    textAlign: 'center',
    paddingVertical: 2,
    color: THEME.colors.textMuted,
  },
  photoPresetLabelSelected: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  photoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  customBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: THEME.radius.full,
  },
  customBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.success,
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  photoActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.surfaceElevated,
    paddingVertical: 12,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  photoActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  photoPreviewBox: {
    position: 'relative',
    width: '100%',
    height: 150,
    borderRadius: THEME.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    backgroundColor: THEME.colors.background,
    marginBottom: 10,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  previewCaption: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
  },
  sampleSubLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginBottom: 6,
  },
  publishBtn: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: THEME.radius.lg,
    gap: 8,
    marginTop: THEME.spacing.sm,
    marginBottom: 35,
  },
  publishBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
