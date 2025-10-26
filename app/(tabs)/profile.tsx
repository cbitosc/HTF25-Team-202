import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/authService';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age?.toString() || '',
    gender: user?.gender || 'other',
    mobile: user?.mobile || '',
  });

  const handleSave = async () => {
    if (!formData.name || !formData.age || !formData.mobile) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await updateUserProfile({
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender as 'male' | 'female' | 'other',
        mobile: formData.mobile,
      });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      age: user?.age?.toString() || '',
      gender: user?.gender || 'other',
      mobile: user?.mobile || '',
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Please login to view profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{user.name}</Text>
            <Text style={styles.headerEmail}>{user.email}</Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
            disabled={loading}
          >
            <Ionicons
              name={isEditing ? 'close' : 'pencil'}
              size={20}
              color="#007AFF"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              editable={isEditing}
              placeholder="Enter your name"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={user.email}
              editable={false}
            />
            <Text style={styles.fieldNote}>Email cannot be changed</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.age}
              onChangeText={(text) => setFormData({ ...formData, age: text })}
              editable={isEditing}
              keyboardType="numeric"
              placeholder="Enter your age"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>
              {(['male', 'female', 'other'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderOption,
                    formData.gender === option && styles.genderOptionSelected,
                    !isEditing && styles.genderOptionDisabled,
                  ]}
                  onPress={() => isEditing && setFormData({ ...formData, gender: option })}
                  disabled={!isEditing}
                >
                  <Text
                    style={[
                      styles.genderOptionText,
                      formData.gender === option && styles.genderOptionTextSelected,
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Mobile</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.mobile}
              onChangeText={(text) => setFormData({ ...formData, mobile: text })}
              editable={isEditing}
              keyboardType="phone-pad"
              placeholder="Enter your mobile number"
            />
          </View>

          {isEditing && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.accountOption} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            <Text style={styles.accountOptionTextDanger}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  headerEmail: {
    fontSize: 14,
    color: '#8E8E93',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F1F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    padding: 20,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  inputDisabled: {
    backgroundColor: '#F8F9FA',
    color: '#8E8E93',
  },
  fieldNote: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    height: 48,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  genderOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  genderOptionDisabled: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E5E5EA',
  },
  genderOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  genderOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F1F3',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  accountSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  accountOptionTextDanger: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 12,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
});