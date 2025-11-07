import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { saveUserPreferences } from './mongodbService';

WebBrowser.maybeCompleteAuthSession();

// Storage keys
const USER_STORAGE_KEY = '@user';
const TOKEN_STORAGE_KEY = '@token';

interface GoogleUser {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified?: boolean;
}

// Get user info from Google
const getUserInfo = async (accessToken: string): Promise<GoogleUser> => {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    const data = await response.json();
    
    return {
      id: data.id,
      email: data.email,
      displayName: data.name,
      photoURL: data.picture,
      emailVerified: data.verified_email,
    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw new Error('Failed to fetch user information');
  }
};

// Store user and token
const storeUserData = async (user: GoogleUser, token: string) => {
  try {
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (error) {
    console.error('Error storing user data:', error);
    throw new Error('Failed to store user data');
  }
};

// Get stored user
export const getStoredUser = async (): Promise<GoogleUser | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
};

// Get stored token
export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Error getting stored token:', error);
    return null;
  }
};

// Login with Google
export const loginWithGoogle = async (accessToken: string): Promise<GoogleUser> => {
  try {
    const user = await getUserInfo(accessToken);
    await storeUserData(user, accessToken);
    
    // Initialize preferences for new users
    try {
      await saveUserPreferences(user.id, {
        style: 'classic',
        favoriteColors: [],
        sizes: {},
      });
    } catch (error) {
      console.log('User preferences already exist or failed to save');
    }
    
    return user;
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Logout error:', error);
    throw new Error('Failed to logout');
  }
};

// Get current user
export const getCurrentUser = async (): Promise<GoogleUser | null> => {
  return await getStoredUser();
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getStoredUser();
  const token = await getStoredToken();
  return !!(user && token);
};

// Verify token is still valid
export const verifyToken = async (): Promise<boolean> => {
  try {
    const token = await getStoredToken();
    if (!token) return false;
    
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`
    );
    
    return response.ok;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
};

// Listen to auth state changes (for compatibility)
export const onAuthChange = (callback: (user: GoogleUser | null) => void) => {
  // Check stored user on mount
  getStoredUser().then(callback);
  
  // Return unsubscribe function
  return () => {};
};

export default {
  loginWithGoogle,
  logoutUser,
  getCurrentUser,
  isAuthenticated,
  verifyToken,
  onAuthChange,
  getStoredToken,
  getStoredUser,
};