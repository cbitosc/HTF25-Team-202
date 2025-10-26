import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

// Mock data for outfit categories
const OUTFIT_CATEGORIES = [
  { id: '1', name: 'Casual', icon: '👕', count: '234' },
  { id: '2', name: 'Formal', icon: '👔', count: '189' },
  { id: '3', name: 'Seasonal', icon: '🌞', count: '156' },
  { id: '4', name: 'Work', icon: '💼', count: '203' },
  { id: '5', name: 'Party', icon: '🎉', count: '167' },
  { id: '6', name: 'Date Night', icon: '💝', count: '145' },
];

// Mock data for trending outfits
const TRENDING_OUTFITS = [
  { id: '1', style: 'Minimalist', likes: '1.2k', color: '#E5E5E5' },
  { id: '2', style: 'Streetwear', likes: '890', color: '#E6F3FF' },
  { id: '3', style: 'Business Casual', likes: '756', color: '#B3D9FF' },
  { id: '4', style: 'Boho Chic', likes: '1.1k', color: '#F7FAFC' },
];

// Mock data for style categories
const STYLE_CATEGORIES = [
  { id: '1', name: 'Minimalist', color: '#E8E8E8' },
  { id: '2', name: 'Boho', color: '#FFE8E8' },
  { id: '3', name: 'Classic', color: '#E8F4FF' },
  { id: '4', name: 'Streetwear', color: '#F0E8FF' },
  { id: '5', name: 'Athleisure', color: '#E8FFE8' },
  { id: '6', name: 'Vintage', color: '#FFF8E8' },
];

export default function OutfitDiscoveryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [savedOutfits, setSavedOutfits] = useState<string[]>([]);

  const toggleSaveOutfit = (outfitId: string) => {
    setSavedOutfits(prev => 
      prev.includes(outfitId) 
        ? prev.filter(id => id !== outfitId)
        : [...prev, outfitId]
    );
  };

  // Placeholder image component for outfits
  const OutfitPlaceholder = ({ color, style, likes }: { color: string; style: string; likes: string }) => (
    <View style={[styles.outfitPlaceholder, { backgroundColor: color }]}>
      <View style={styles.placeholderContent}>
        <ThemedText style={styles.placeholderStyle}>{style}</ThemedText>
        <ThemedText style={styles.placeholderLikes}>❤️ {likes}</ThemedText>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <ThemedView style={styles.heroSection}>
        <ThemedText
          type="title"
          style={styles.heroTitle}>
          Discover Your Style
        </ThemedText>
        <ThemedText style={styles.heroSubtitle}>
          Get inspired by AI-powered outfit suggestions and trending fashion
        </ThemedText>
      </ThemedView>

      {/* Search Bar */}
      <ThemedView style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <IconSymbol name="magnifyingglass" size={20} color="#007AFF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search outfits by style, color, occasion..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
        </View>
      </ThemedView>

      {/* Quick Actions */}
      <ThemedView style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton}>
          <View style={styles.quickActionIcon}>
            <IconSymbol name="sparkles" size={24} color="#007AFF" />
          </View>
          <ThemedText style={styles.quickActionText}>AI Style Quiz</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton}>
          <View style={styles.quickActionIcon}>
            <IconSymbol name="camera" size={24} color="#007AFF" />
          </View>
          <ThemedText style={styles.quickActionText}>Upload Outfit</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton}>
          <View style={styles.quickActionIcon}>
            <IconSymbol name="heart" size={24} color="#007AFF" />
          </View>
          <ThemedText style={styles.quickActionText}>My Favorites</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Trending Now Section */}
      <Collapsible title="🔥 Trending Now">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {TRENDING_OUTFITS.map((outfit) => (
            <ThemedView key={outfit.id} style={styles.trendingCard}>
              <OutfitPlaceholder color={outfit.color} style={outfit.style} likes={outfit.likes} />
              <View style={styles.outfitOverlay}>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={() => toggleSaveOutfit(outfit.id)}
                >
                  <IconSymbol 
                    name={savedOutfits.includes(outfit.id) ? "heart.fill" : "heart"} 
                    size={20} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
              </View>
            </ThemedView>
          ))}
        </ScrollView>
      </Collapsible>

      {/* Outfit Categories */}
      <Collapsible title="👗 Outfit Categories">
        <View style={styles.categoriesGrid}>
          {OUTFIT_CATEGORIES.map((category) => (
            <TouchableOpacity 
              key={category.id} 
              style={styles.categoryCard}
            >
              <ThemedText style={styles.categoryIcon}>{category.icon}</ThemedText>
              <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
              <ThemedText style={styles.categoryCount}>{category.count}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </Collapsible>

      {/* Style Categories */}
      <Collapsible title="🎨 Style Personalities">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {STYLE_CATEGORIES.map((style) => (
            <TouchableOpacity key={style.id} style={[styles.styleCard, { backgroundColor: style.color }]}>
              <ThemedText style={styles.styleName}>{style.name}</ThemedText>
              <ThemedText style={styles.styleExplore}>Explore →</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Collapsible>

      {/* AI Recommendations */}
      <Collapsible title="🤖 AI Style Assistant">
        <ThemedView style={styles.aiCard}>
          <IconSymbol name="sparkles" size={32} color="#007AFF" />
          <ThemedText style={styles.aiTitle}>Personalized Outfit Suggestions</ThemedText>
          <ThemedText style={styles.aiDescription}>
            Get AI-powered recommendations based on your wardrobe, preferences, and occasion
          </ThemedText>
          <TouchableOpacity style={styles.aiButton}>
            <ThemedText style={styles.aiButtonText}>Get Style Advice</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </Collapsible>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  heroSection: {
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  heroTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 8,
    color: '#007AFF',
  },
  heroSubtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666666',
    paddingHorizontal: 20,
  },
  searchContainer: {
    marginVertical: 16,
    backgroundColor: '#F8F9FA',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333333',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#F8F9FA',
  },
  quickActionButton: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E6F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  quickActionText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#007AFF',
    fontWeight: '600',
  },
  horizontalScroll: {
    marginHorizontal: -16,
  },
  trendingCard: {
    width: 200,
    height: 250,
    borderRadius: 12,
    margin: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F0F1F3',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outfitPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContent: {
    alignItems: 'center',
  },
  placeholderStyle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  placeholderLikes: {
    fontSize: 14,
    color: '#007AFF',
  },
  outfitOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  saveButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 8,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4,
    backgroundColor: '#F8F9FA',
  },
  categoryCard: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: '#F0F1F3',
    borderRadius: 12,
    padding: 16,
    margin: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333333',
  },
  categoryCount: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  styleCard: {
    padding: 20,
    borderRadius: 12,
    margin: 8,
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  styleName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333333',
  },
  styleExplore: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  aiCard: {
    alignItems: 'center',
    backgroundColor: '#E6F3FF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#B3D9FF',
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 8,
    textAlign: 'center',
    color: '#007AFF',
  },
  aiDescription: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666666',
    lineHeight: 20,
  },
  aiButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});