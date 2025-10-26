import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { STYLE_PREFERENCES, EVENT_TYPES } from '../utils/constants';
import { getUserPreferences, saveUserPreferences } from '../services/mongodbService';

const PreferencesScreen = () => {
  const { user } = useAuth();
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    try {
      if (user?.uid) {
        const prefs = await getUserPreferences(user.uid);
        if (prefs) {
          setSelectedStyle(prefs.style || null);
          setSelectedEvents(prefs.events || []);
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedStyle) {
      Alert.alert('Error', 'Please select a style preference');
      return;
    }

    try {
      setSaving(true);
      await saveUserPreferences(user.uid, {
        style: selectedStyle,
        events: selectedEvents,
        updatedAt: new Date(),
      });
      Alert.alert('Success', 'Preferences saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const toggleEvent = (eventValue) => {
    if (selectedEvents.includes(eventValue)) {
      setSelectedEvents(selectedEvents.filter(e => e !== eventValue));
    } else {
      setSelectedEvents([...selectedEvents, eventValue]);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF6B9D" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fashion Style Preference</Text>
        <Text style={styles.sectionDesc}>Choose your preferred fashion style</Text>

        <View style={styles.optionsContainer}>
          {STYLE_PREFERENCES.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.optionButton,
                selectedStyle === style.value && styles.optionButtonActive,
              ]}
              onPress={() => setSelectedStyle(style.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedStyle === style.value && styles.optionTextActive,
                ]}
              >
                {style.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Favorite Occasions</Text>
        <Text style={styles.sectionDesc}>Select occasions you dress up for</Text>

        <View style={styles.tagsContainer}>
          {EVENT_TYPES.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={[
                styles.tag,
                selectedEvents.includes(event.value) && styles.tagActive,
              ]}
              onPress={() => toggleEvent(event.value)}
            >
              <Text
                style={[
                  styles.tagText,
                  selectedEvents.includes(event.value) && styles.tagTextActive,
                ]}
              >
                {event.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  optionButtonActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#fff',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
  },
  tagActive: {
    backgroundColor: '#FFE5EC',
    borderColor: '#FF6B9D',
  },
  tagText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  tagTextActive: {
    color: '#FF6B9D',
  },
  buttonContainer: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  saveButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PreferencesScreen;
