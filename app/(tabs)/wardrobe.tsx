import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import {
  addWardrobeItem,
  deleteWardrobeItem,
  getWardrobeItems
} from '../services/mongodbService';
import { ClothingCategory, Season, WardrobeItem } from '../types/wardrobe';

export default function WardrobeScreen() {
  const { user } = useAuth();
  
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | 'all'>('all');
  
  // Add item form state
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'tops' as ClothingCategory,
    color: '',
    brand: '',
    size: '',
    season: 'all-season' as Season,
  });

  useEffect(() => {
    if (user) {
      loadWardrobeItems();
    }
  }, [user]);

  useEffect(() => {
    filterItems();
  }, [items, selectedCategory]);

  const loadWardrobeItems = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const wardrobeItems = await getWardrobeItems(user.id);
      setItems(wardrobeItems);
    } catch (error) {
      console.error('Error loading wardrobe:', error);
      Alert.alert('Error', 'Failed to load your wardrobe items');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWardrobeItems();
    setRefreshing(false);
  };

  const filterItems = () => {
    if (selectedCategory === 'all') {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.category === selectedCategory));
    }
  };

  const handleAddItem = async () => {
    if (!user) return;
    
    if (!newItem.name.trim() || !newItem.color.trim()) {
      Alert.alert('Validation Error', 'Please fill in name and color');
      return;
    }
    
    try {
      const itemData = {
        name: newItem.name.trim(),
        category: newItem.category,
        color: newItem.color.trim(),
        brand: newItem.brand.trim() || undefined,
        size: newItem.size.trim() || undefined,
        season: newItem.season,
        imageUrl: undefined,
      };
      
      await addWardrobeItem(user.id, itemData);
      
      // Reset form
      setNewItem({
        name: '',
        category: 'tops',
        color: '',
        brand: '',
        size: '',
        season: 'all-season',
      });
      
      setShowAddModal(false);
      await loadWardrobeItems();
      Alert.alert('Success', 'Item added to wardrobe!');
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item to wardrobe');
    }
  };

  const handleDeleteItem = (itemId: string, itemName: string) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${itemName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWardrobeItem(itemId);
              await loadWardrobeItems();
              Alert.alert('Success', 'Item deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const getCategoryIcon = (category: ClothingCategory) => {
    const icons: Record<ClothingCategory, string> = {
      tops: 'shirt',
      bottoms: 'male',
      dresses: 'woman',
      outerwear: 'jacket',
      shoes: 'footsteps',
      accessories: 'watch',
    };
    return icons[category];
  };

  const getCategoryColor = (category: ClothingCategory) => {
    const colors: Record<ClothingCategory, string> = {
      tops: '#FF6B6B',
      bottoms: '#4ECDC4',
      dresses: '#FFE66D',
      outerwear: '#95E1D3',
      shoes: '#A8E6CF',
      accessories: '#FFDAC1',
    };
    return colors[category];
  };

  const categories: { key: ClothingCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'tops', label: 'Tops' },
    { key: 'bottoms', label: 'Bottoms' },
    { key: 'dresses', label: 'Dresses' },
    { key: 'outerwear', label: 'Outerwear' },
    { key: 'shoes', label: 'Shoes' },
    { key: 'accessories', label: 'Accessories' },
  ];

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScroll}
      contentContainerStyle={styles.categoryContent}
    >
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.key}
          style={[
            styles.categoryChip,
            selectedCategory === cat.key && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedCategory(cat.key)}
        >
          <Text
            style={[
              styles.categoryChipText,
              selectedCategory === cat.key && styles.categoryChipTextActive,
            ]}
          >
            {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderWardrobeItem = ({ item }: { item: WardrobeItem }) => (
    <Card variant="outlined" style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View
          style={[
            styles.itemIcon,
            { backgroundColor: getCategoryColor(item.category) },
          ]}
        >
          <Ionicons
            name={getCategoryIcon(item.category) as any}
            size={24}
            color="#FFFFFF"
          />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemCategory}>
            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteItem(item.id || '', item.name)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.itemDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="color-palette-outline" size={16} color="#8E8E93" />
          <Text style={styles.detailText}>{item.color}</Text>
        </View>
        
        {item.brand && (
          <View style={styles.detailRow}>
            <Ionicons name="pricetag-outline" size={16} color="#8E8E93" />
            <Text style={styles.detailText}>{item.brand}</Text>
          </View>
        )}
        
        {item.size && (
          <View style={styles.detailRow}>
            <Ionicons name="resize-outline" size={16} color="#8E8E93" />
            <Text style={styles.detailText}>Size {item.size}</Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Ionicons name="partly-sunny-outline" size={16} color="#8E8E93" />
          <Text style={styles.detailText}>
            {item.season.replace('-', ' ')}
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Wardrobe Item</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalForm}>
            <Input
              label="Item Name *"
              placeholder="e.g., Blue Denim Jeans"
              value={newItem.name}
              onChangeText={(text) => setNewItem({ ...newItem, name: text })}
              leftIcon="shirt-outline"
            />
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categorySelect}
              >
                {categories.slice(1).map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.selectChip,
                      newItem.category === cat.key && styles.selectChipActive,
                    ]}
                    onPress={() =>
                      setNewItem({ ...newItem, category: cat.key as ClothingCategory })
                    }
                  >
                    <Text
                      style={[
                        styles.selectChipText,
                        newItem.category === cat.key && styles.selectChipTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <Input
              label="Color *"
              placeholder="e.g., Navy Blue"
              value={newItem.color}
              onChangeText={(text) => setNewItem({ ...newItem, color: text })}
              leftIcon="color-palette-outline"
            />
            
            <Input
              label="Brand (Optional)"
              placeholder="e.g., Levi's"
              value={newItem.brand}
              onChangeText={(text) => setNewItem({ ...newItem, brand: text })}
              leftIcon="pricetag-outline"
            />
            
            <Input
              label="Size (Optional)"
              placeholder="e.g., M, 32, L"
              value={newItem.size}
              onChangeText={(text) => setNewItem({ ...newItem, size: text })}
              leftIcon="resize-outline"
            />
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Season</Text>
              <View style={styles.seasonRow}>
                {(['all-season', 'summer', 'winter', 'spring', 'fall'] as Season[]).map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.seasonChip,
                      newItem.season === s && styles.seasonChipActive,
                    ]}
                    onPress={() => setNewItem({ ...newItem, season: s })}
                  >
                    <Text
                      style={[
                        styles.seasonChipText,
                        newItem.season === s && styles.seasonChipTextActive,
                      ]}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={() => setShowAddModal(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title="Add Item"
              onPress={handleAddItem}
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Wardrobe</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {renderCategoryFilter()}

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading wardrobe...</Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="shirt-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>No Items Yet</Text>
          <Text style={styles.emptySubtitle}>
            {selectedCategory === 'all'
              ? 'Add your first wardrobe item to get started!'
              : `No ${selectedCategory} in your wardrobe yet.`}
          </Text>
          <Button
            title="Add Item"
            onPress={() => setShowAddModal(true)}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderWardrobeItem}
          keyExtractor={(item) => item.id || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {renderAddModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryScroll: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  categoryContent: {
    padding: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  statsBar: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  statsText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyButton: {
    minWidth: 150,
  },
  listContent: {
    padding: 16,
  },
  itemCard: {
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  itemCategory: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  modalForm: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  categorySelect: {
    flexDirection: 'row',
  },
  selectChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  selectChipActive: {
    backgroundColor: '#007AFF',
  },
  selectChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  selectChipTextActive: {
    color: '#FFFFFF',
  },
  seasonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  seasonChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  seasonChipActive: {
    backgroundColor: '#34C759',
  },
  seasonChipText: {
    fontSize: 12,
    color: '#000000',
  },
  seasonChipTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  modalButton: {
    flex: 1,
  },
});