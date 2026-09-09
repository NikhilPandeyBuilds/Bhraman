// Bhraman - Real Community Creation Modal
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
  Alert 
} from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { Category, SupportedLanguage } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../services/i18n/languageService';

interface CreateCommunityModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  visible,
  onClose,
}) => {
  const { createCommunity, activeLanguage, user } = useApp();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('1. Respect local privacy & residents.\n2. Leave no trace / zero littering.\n3. Share authentic, non-commercial advice.');
  const [location, setLocation] = useState('Bandra & Coastal Mumbai');
  const [category, setCategory] = useState<Category>('culture');
  const [primaryLanguage, setPrimaryLanguage] = useState<SupportedLanguage>(activeLanguage);

  const coverPresets = [
    { label: 'Night Streets', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80' },
    { label: 'Mangrove Lagoon', url: 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?w=800&auto=format&fit=crop&q=80' },
    { label: 'Food Street', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80' },
    { label: 'Art Lanes', url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=80' },
  ];

  const [selectedCover, setSelectedCover] = useState(coverPresets[0].url);

  const categories: { key: Category; label: string }[] = [
    { key: 'culture', label: '🏛️ Culture' },
    { key: 'food', label: '🍔 Local Food' },
    { key: 'photography', label: '📸 Photography' },
    { key: 'nature', label: '🌿 Nature' },
    { key: 'hidden_gem', label: '✨ Hidden Gems' },
    { key: 'heritage', label: '🏰 Heritage' },
    { key: 'quirky', label: '🔮 Quirky' },
  ];

  const handleCreate = async () => {
    if (!name.trim() || !tagline.trim() || !description.trim()) {
      Alert.alert("Missing Fields", "Please provide a community name, tagline, and description.");
      return;
    }

    await createCommunity({
      name: name.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      rules: rules.trim(),
      category,
      location: location.trim(),
      creatorId: user.id,
      creatorName: user.name,
      coverImage: selectedCover,
      primaryLanguage,
    });

    // Reset form
    setName('');
    setTagline('');
    setDescription('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.modalTitle}>+ Create Local Community</Text>
              <Text style={styles.modalSub}>
                Organize fellow neighborhood explorers & guide visiting tourists (+40 pts)
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Community Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Community Name *</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Bandra Coastal Architecture Walkers"
                placeholderTextColor={THEME.colors.textMuted}
              />
            </View>

            {/* Tagline */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Short Tagline / Catchphrase *</Text>
              <TextInput
                style={styles.textInput}
                value={tagline}
                onChangeText={setTagline}
                placeholder="e.g. Mapping Portuguese verandahs & colonial alleys"
                placeholderTextColor={THEME.colors.textMuted}
              />
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Focus Category</Text>
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

            {/* Primary Language */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Primary Language (Helps Tourists Filter)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {SUPPORTED_LANGUAGES.map(lang => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.langChip, primaryLanguage === lang.code && styles.langChipActive]}
                    onPress={() => setPrimaryLanguage(lang.code)}
                  >
                    <Text style={[styles.langChipText, primaryLanguage === lang.code && styles.langChipTextActive]}>
                      {lang.nativeName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>About the Community *</Text>
              <TextInput
                style={[styles.textInput, { height: 70, textAlignVertical: 'top' }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Explain the mission, types of sessions organized, and what members will discover..."
                placeholderTextColor={THEME.colors.textMuted}
                multiline
              />
            </View>

            {/* Rules */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Community Guidelines & Etiquette</Text>
              <TextInput
                style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
                value={rules}
                onChangeText={setRules}
                multiline
              />
            </View>

            {/* Cover Image */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Cover Photo</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {coverPresets.map(preset => {
                  const isSelected = selectedCover === preset.url;
                  return (
                    <TouchableOpacity
                      key={preset.label}
                      onPress={() => setSelectedCover(preset.url)}
                      style={[styles.coverCard, isSelected && styles.coverCardSelected]}
                    >
                      <Image source={{ uri: preset.url }} style={styles.coverImg} />
                      <Text style={[styles.coverLabel, isSelected && styles.coverLabelSelected]}>
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Create Button */}
            <TouchableOpacity
              style={styles.createBtn}
              onPress={handleCreate}
              activeOpacity={0.8}
            >
              <Text style={styles.createBtnText}>CREATE COMMUNITY</Text>
              <Ionicons name="people" size={18} color="#FFF" />
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
  modalCard: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.surfaceBorder,
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
  coverCard: {
    width: 90,
    borderRadius: THEME.radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: THEME.colors.surfaceBorder,
    backgroundColor: THEME.colors.background,
  },
  coverCardSelected: {
    borderColor: THEME.colors.primary,
  },
  coverImg: {
    width: '100%',
    height: 55,
  },
  coverLabel: {
    fontSize: 9,
    textAlign: 'center',
    paddingVertical: 2,
    color: THEME.colors.textMuted,
  },
  coverLabelSelected: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  createBtn: {
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
  createBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
