import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getWardrobeItems } from '../services/mongodbService';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [wardrobeCount, setWardrobeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWardrobeCount();
  }, [user]);

  const loadWardrobeCount = async () => {
    try {
      if (user?.uid) {
        const items = await getWardrobeItems(user.uid);
        setWardrobeCount(items?.length || 0);
      }
    } catch (error) {
      console.error('Error loading wardrobe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome, {user?.email?.split('@')[0]}!</Text>
          <Text style={styles.subtitle}>Let's help you find the perfect outfit</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#FF6B9D" />
        ) : (
          <>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{wardrobeCount}</Text>
              <Text style={styles.statLabel}>Wardrobe Items</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Saved Outfits</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Preferences')}
        >
          <View style={[styles.iconBox, { backgroundColor: '#FFE5EC' }]}>
            <Text style={styles.icon}>👗</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Style Preferences</Text>
            <Text style={styles.menuDesc}>Set your fashion style</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Wardrobe')}
        >
          <View style={[styles.iconBox, { backgroundColor: '#E5F5FF' }]}>
            <Text style={styles.icon}>👔</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>My Wardrobe</Text>
            <Text style={styles.menuDesc}>Add and manage items</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Suggestions')}
        >
          <View style={[styles.iconBox, { backgroundColor: '#E5FFE5' }]}>
            <Text style={styles.icon}>✨</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Get Suggestions</Text>
            <Text style={styles.menuDesc}>AI-powered outfits</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('SavedOutfits')}
        >
          <View style={[styles.iconBox, { backgroundColor: '#FFF5E5' }]}>
            <Text style={styles.icon}>❤️</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Saved Outfits</Text>
            <Text style={styles.menuDesc}>Your favorite looks</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  logoutBtn: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  menuContainer: {
    padding: 20,
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuDesc: {
    fontSize: 12,
    color: '#999',
  },
});

export default HomeScreen;
