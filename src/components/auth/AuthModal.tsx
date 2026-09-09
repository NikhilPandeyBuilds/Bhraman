// Bhraman - Real User Account Authentication & Profile Modal
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  ScrollView, 
  Alert 
} from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { SupportedLanguage, Category } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../services/i18n/languageService';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'edit';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  visible,
  onClose,
  initialMode = 'edit',
}) => {
  const { user, isAuthenticated, loginUser, signupUser, updateProfile } = useApp();
  const [mode, setMode] = useState<'login' | 'signup' | 'edit'>(initialMode);

  const [email, setEmail] = useState(user.email || '');
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [homeCity, setHomeCity] = useState(user.homeCity || 'Mumbai');
  const [selectedLanguages, setSelectedLanguages] = useState<SupportedLanguage[]>(user.languages || ['en', 'hi', 'mr']);
  const [selectedInterests, setSelectedInterests] = useState<Category[]>(user.interests || ['food', 'culture', 'photography']);

  const categoryList: { key: Category; label: string }[] = [
    { key: 'food', label: '🍔 Local Food' },
    { key: 'culture', label: '🏛️ Culture' },
    { key: 'photography', label: '📸 Photography' },
    { key: 'nature', label: '🌿 Nature' },
    { key: 'hidden_gem', label: '✨ Hidden Gems' },
    { key: 'heritage', label: '🏰 Heritage' },
    { key: 'quirky', label: '🔮 Quirky' },
    { key: 'peaceful', label: '🕊️ Peaceful' },
  ];

  const toggleLanguage = (code: SupportedLanguage) => {
    setSelectedLanguages(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const toggleInterest = (cat: Category) => {
    setSelectedInterests(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Required", "Please provide a valid email address.");
      return;
    }

    if (mode === 'login') {
      await loginUser(email, name);
      onClose();
    } else if (mode === 'signup') {
      if (!name.trim()) {
        Alert.alert("Required", "Please enter your name.");
        return;
      }
      await signupUser(email, name, homeCity);
      onClose();
    } else {
      // Edit mode
      await updateProfile({
        name,
        email,
        bio,
        homeCity,
        languages: selectedLanguages,
        interests: selectedInterests,
      });
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Modal Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.modalTitle}>
                {mode === 'login' ? 'Log In to Bhraman' : mode === 'signup' ? 'Create Explorer Account' : 'Edit Profile & Preferences'}
              </Text>
              <Text style={styles.modalSub}>
                {mode === 'edit' ? 'Update your identity, languages & interests' : 'Join the local exploration network'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Mode Switcher */}
          <View style={styles.modeTabsRow}>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'edit' && styles.modeTabActive]}
              onPress={() => setMode('edit')}
            >
              <Text style={[styles.modeTabText, mode === 'edit' && styles.modeTabTextActive]}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'login' && styles.modeTabActive]}
              onPress={() => setMode('login')}
            >
              <Text style={[styles.modeTabText, mode === 'login' && styles.modeTabTextActive]}>Switch User</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'signup' && styles.modeTabActive]}
              onPress={() => setMode('signup')}
            >
              <Text style={[styles.modeTabText, mode === 'signup' && styles.modeTabTextActive]}>New Account</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Name */}
            {mode !== 'login' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Aarav Kapoor or Maya Patel"
                  placeholderTextColor={THEME.colors.textMuted}
                />
              </View>
            )}

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="e.g. traveler@bhraman.local"
                placeholderTextColor={THEME.colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Home City */}
            {mode !== 'login' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Home Base / Current City</Text>
                <TextInput
                  style={styles.textInput}
                  value={homeCity}
                  onChangeText={setHomeCity}
                  placeholder="e.g. Mumbai, Pune, Delhi, London"
                  placeholderTextColor={THEME.colors.textMuted}
                />
              </View>
            )}

            {/* Bio */}
            {mode === 'edit' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio & Local Explorer Note</Text>
                <TextInput
                  style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Share your passion for hidden lanes, food trails, or photography..."
                  placeholderTextColor={THEME.colors.textMuted}
                  multiline
                />
              </View>
            )}

            {/* Languages Spoken (Chips) */}
            {mode !== 'login' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Languages Spoken (For Multilingual Discovery)</Text>
                <View style={styles.chipsWrap}>
                  {SUPPORTED_LANGUAGES.map(lang => {
                    const isSelected = selectedLanguages.includes(lang.code);
                    return (
                      <TouchableOpacity
                        key={lang.code}
                        style={[styles.langChip, isSelected && styles.langChipActive]}
                        onPress={() => toggleLanguage(lang.code)}
                      >
                        <Text style={[styles.langChipText, isSelected && styles.langChipTextActive]}>
                          {lang.nativeName} ({lang.name})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Preferred Travel Interests */}
            {mode !== 'login' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Exploration Interests</Text>
                <View style={styles.chipsWrap}>
                  {categoryList.map(cat => {
                    const isSelected = selectedInterests.includes(cat.key);
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
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.submitBtnText}>
                {mode === 'login' ? 'LOG IN' : mode === 'signup' ? 'SIGN UP & JOIN' : 'SAVE CHANGES'}
              </Text>
              <Ionicons name="checkmark-circle" size={18} color="#FFF" />
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
    maxHeight: '90%',
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
  modeTabsRow: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.background,
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.sm,
    borderRadius: THEME.radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: THEME.radius.sm,
  },
  modeTabActive: {
    backgroundColor: THEME.colors.primary,
  },
  modeTabText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: '#FFF',
    fontWeight: '700',
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
  langChip: {
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  langChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  langChipText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  langChipTextActive: {
    color: '#FFF',
  },
  interestChip: {
    backgroundColor: THEME.colors.background,
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
    fontWeight: '600',
  },
  interestChipTextActive: {
    color: '#FFF',
  },
  submitBtn: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: THEME.radius.lg,
    gap: 8,
    marginTop: THEME.spacing.sm,
    marginBottom: 30,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
