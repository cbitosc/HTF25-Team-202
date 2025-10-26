import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Picker,
  FlatList,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { EVENT_TYPES } from '../utils/constants';
import { getWardrobeItems, getUserPreferences, saveOutfit } from '../services/mongodbService';
import { getOutfitSuggestions } from '../services/geminiService';
import { generateOutfitId } from '../utils/helpers';

const OutfitSuggestionScreen = () => {
  const { user } = useAuth();
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [selectedOccasion, setSelectedOccasion] = useState('casual_day');
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showOccasionModal, setShowOccasionModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (user?.uid) {
        const [items, prefs] = await Promise.all([
          getWardrobeItems(user.uid),
          getUserPreferences(user.uid),
        ]);
        setWardrobeItems(items || []);
        setPreferences(prefs || {});
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (wardrobeItems.length === 0) {
      Alert.alert('Error', 'Please add items to your wardrobe first');
      return;
    }

    try {
      setLoading(true);
      const occasion = EVENT_TYPES.find(e => e.value === selectedOccasion)?.label || 'Casual';
      
      const result = await getOutfitSuggestions(
        wardrobeItems,
        { style: preferences?.style || 'casual' },
        occasion
      );
      setSuggestions(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate suggestions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOutfit = async () => {
    if (!suggestions) return;

    try {
      setSaving(true);
      const outfit = {
        id: generateOutfitId(),
        ...suggestions,
        occasion: selectedOccasion,
        style: preferences?.style || 'casual',
        isFavorite: true,
        rating: 5,
        createdAt: new Date(),
      };

      await saveOutfit(user.uid, outfit);
      Alert.alert('Success', 'Outfit saved to favorites!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save outfit');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    setSuggestions(null);
  };

  if (loading && wardrobeItems.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF6B9D" />
      </View>
    );
  }

  if (wardrobeItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>✨</Text>
          <Text style={styles.emptyTitle}>No Wardrobe Items</Text>
          <Text style={styles.emptyDesc}>Add items to your wardrobe to get AI outfit suggestions</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Outfit Generator</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Select Occasion</Text>
        <TouchableOpacity
          style={styles.occasionButton}
          onPress={() => setShowOccasionModal(true)}
        >
          <Text style={styles.occasionText}>
            {EVENT_TYPES.find(e => e.value === selectedOccasion)?.label || 'Select'}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.generateButton, loading && styles.generateButtonDisabled]}
          onPress={handleGenerateSuggestions}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.generateButtonText}>Generate Outfit ✨</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {suggestions && (
        <View style={styles.card}>
          <Text style={styles.suggestionTitle}>Your Suggested Outfit</Text>

          <View style={styles.outfitBox}>
            <View style={styles.outfitItem}>
              <Text style={styles.outfitLabel}>Top</Text>
              <Text style={styles.outfitValue}>{suggestions.outfit?.top?.name || 'Not specified'}</Text>
            </View>
            <View style={styles.outfitItem}>
              <Text style={styles.outfitLabel}>Bottom</Text>
              <Text style={styles.outfitValue}>{suggestions.outfit?.bottom?.name || 'Not specified'}</Text>
            </View>
            <View style={styles.outfitItem}>
              <Text style={styles.outfitLabel}>Shoes</Text>
              <Text style={styles.outfitValue}>{suggestions.outfit?.shoes?.name || 'Not specified'}</Text>
            </View>
          </View>

          {suggestions.colorScheme && suggestions.colorScheme.length > 0 && (
            <View style={styles.colorsSection}>
              <Text style={styles.colorSectionTitle}>Color Scheme</Text>
              <View style={styles.colorsContainer}>
                {suggestions.colorScheme.map((color, index) => (
                  <View
                    key={index}
                    style={[styles.colorDot, { backgroundColor: color }]}
                  />
                ))}
              </View>
            </View>
          )}

          {suggestions.tips && suggestions.tips.length > 0 && (
            <View style={styles.tipsSection}>
              <Text style={styles.tipsSectionTitle}>Styling Tips</Text>
              {suggestions.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
            >
              <Text style={styles.refreshButtonText}>Generate Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSaveOutfit}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save to Favorites ❤️</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal visible={showOccasionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Occasion</Text>
              <TouchableOpacity onPress={() => setShowOccasionModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={EVENT_TYPES}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedOccasion(item.value);
                    setShowOccasionModal(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  card: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  occasionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
  },
  occasionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 20,
    color: '#FF6B9D',
  },
  generateButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  outfitBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  outfitItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  outfitLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 2,
  },
  outfitValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  colorsSection: {
    marginBottom: 16,
  },
  colorSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  colorsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  tipsSection: {
    marginBottom: 16,
  },
  tipsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 14,
    color: '#FF6B9D',
    marginRight: 8,
    fontWeight: 'bold',
  },
  tipText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  refreshButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B9D',
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#FF6B9D',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FF6B9D',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#999',
  },
  modalOption: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
});

export default OutfitSuggestionScreen;
