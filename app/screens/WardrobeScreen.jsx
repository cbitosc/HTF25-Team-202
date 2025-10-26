import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Picker,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { CLOTHING_CATEGORIES, COLORS } from '../utils/constants';
import { addWardrobeItem, getWardrobeItems, deleteWardrobeItem } from '../services/mongodbService';
import { useFocusEffect } from '@react-navigation/native';

const WardrobeScreen = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [itemName, setItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tops');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [adding, setAdding] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadWardrobeItems();
    }, [user])
  );

  const loadWardrobeItems = async () => {
    try {
      setLoading(true);
      if (user?.uid) {
        const wardrobeItems = await getWardrobeItems(user.uid);
        setItems(wardrobeItems || []);
      }
    } catch (error) {
      console.error('Error loading wardrobe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!itemName.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }

    try {
      setAdding(true);
      await addWardrobeItem(user.uid, {
        name: itemName,
        category: selectedCategory,
        color: selectedColor,
      });
      setItemName('');
      setSelectedCategory('Tops');
      setSelectedColor('#000000');
      setModalVisible(false);
      loadWardrobeItems();
      Alert.alert('Success', 'Item added to wardrobe!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add item');
      console.error(error);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteWardrobeItem(itemId);
      loadWardrobeItems();
      Alert.alert('Success', 'Item removed from wardrobe');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete item');
      console.error(error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={[styles.colorBox, { backgroundColor: item.color }]} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            'Delete Item',
            'Are you sure?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => handleDeleteItem(item.id) },
            ]
          );
        }}
        style={styles.deleteBtn}
      >
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wardrobe</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B9D" />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>👔</Text>
          <Text style={styles.emptyTitle}>No items yet</Text>
          <Text style={styles.emptyDesc}>Add wardrobe items to get outfit suggestions</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Wardrobe Item</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Item Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Blue Denim Jacket"
                value={itemName}
                onChangeText={setItemName}
                editable={!adding}
              />

              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedCategory}
                  onValueChange={(value) => setSelectedCategory(value)}
                  enabled={!adding}
                >
                  {CLOTHING_CATEGORIES.map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Color</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.colorScroll}
              >
                {COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionActive,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                disabled={adding}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addItemButton, adding && styles.addItemButtonDisabled]}
                onPress={handleAddItem}
                disabled={adding}
              >
                {adding ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.addItemButtonText}>Add Item</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
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
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  colorBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 12,
    color: '#999',
  },
  deleteBtn: {
    paddingHorizontal: 8,
  },
  deleteText: {
    fontSize: 16,
    color: '#FF6B9D',
    fontWeight: 'bold',
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
    maxHeight: '90%',
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
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxHeight: '60%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  colorScroll: {
    marginVertical: 8,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 3,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionActive: {
    borderColor: '#333',
  },
  checkmark: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  addItemButton: {
    flex: 1,
    backgroundColor: '#FF6B9D',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addItemButtonDisabled: {
    opacity: 0.6,
  },
  addItemButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default WardrobeScreen;
