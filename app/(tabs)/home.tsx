import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
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
import { useAuth } from '../context/AuthContext';
import { getSavedOutfitsList, getWardrobeItems } from '../services/mongodbService';

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [savedOutfits, setSavedOutfits] = useState<any[]>([]);
  const [wardrobeCount, setWardrobeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [outfits, items] = await Promise.all([
        getSavedOutfitsList(user.id),
        getWardrobeItems(user.id),
      ]);
      
      setSavedOutfits(outfits.slice(0, 3)); // Show only 3 recent outfits
      setWardrobeCount(items.length);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load your data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
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
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.username}>{user?.displayName || 'User'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Card title="Quick Actions" variant="elevated" style={styles.card}>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/suggestions')}
            >
              <Ionicons name="sparkles" size={32} color="#007AFF" />
              <Text style={styles.actionText}>Get Outfit</Text>
              <Text style={styles.actionSubtext}>Suggestions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/wardrobe')}
            >
              <Ionicons name="shirt" size={32} color="#5856D6" />
              <Text style={styles.actionText}>My Wardrobe</Text>
              <Text style={styles.actionSubtext}>{wardrobeCount} items</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Ionicons name="settings" size={32} color="#FF9500" />
              <Text style={styles.actionText}>Preferences</Text>
              <Text style={styles.actionSubtext}>Customize</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Statistics */}
        <Card title="Your Style Stats" variant="elevated" style={styles.card}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{wardrobeCount}</Text>
              <Text style={styles.statLabel}>Wardrobe Items</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{savedOutfits.length}</Text>
              <Text style={styles.statLabel}>Saved Outfits</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {savedOutfits.reduce((sum, o) => sum + (o.timesWorn || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>Times Worn</Text>
            </View>
          </View>
        </Card>

        {/* Recent Saved Outfits */}
        {savedOutfits.length > 0 && (
          <Card
            title="Recent Saved Outfits"
            variant="elevated"
            style={styles.card}
            rightIcon="chevron-forward"
            onRightIconPress={() => router.push('/(tabs)/profile')}
          >
            {savedOutfits.map((outfit, index) => (
              <TouchableOpacity
                key={index}
                style={styles.outfitItem}
                onPress={() => {
                  Alert.alert('Outfit Details', 'View outfit details feature coming soon!');
                }}
              >
                <View style={styles.outfitIcon}>
                  <Ionicons name="shirt-outline" size={24} color="#007AFF" />
                </View>
                <View style={styles.outfitInfo}>
                  <Text style={styles.outfitName}>
                    {outfit.outfit?.name || `Outfit ${index + 1}`}
                  </Text>
                  <Text style={styles.outfitOccasion}>
                    {outfit.outfit?.occasion || 'Casual'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* Get Started Card (if no wardrobe items) */}
        {wardrobeCount === 0 && (
          <Card title="Get Started" variant="elevated" style={styles.card}>
            <Text style={styles.getStartedText}>
              Start by adding items to your wardrobe to get personalized outfit suggestions!
            </Text>
            <Button
              title="Add Wardrobe Items"
              onPress={() => router.push('/(tabs)/wardrobe')}
              fullWidth
              style={styles.getStartedButton}
            />
          </Card>
        )}

        {/* Style Tip of the Day */}
        <Card title="Style Tip of the Day" variant="outlined" style={styles.card}>
          <View style={styles.tipContainer}>
            <Ionicons name="bulb" size={24} color="#FF9500" />
            <Text style={styles.tipText}>
              Mix textures for depth! Try pairing smooth fabrics with textured pieces
              for a more dynamic and interesting look.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 16,
    color: '#8E8E93',
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginTop: 8,
  },
  actionSubtext: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5EA',
  },
  outfitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  outfitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  outfitInfo: {
    flex: 1,
  },
  outfitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  outfitOccasion: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  getStartedText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
    textAlign: 'center',
  },
  getStartedButton: {
    marginTop: 8,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    marginLeft: 12,
    lineHeight: 20,
  },
});