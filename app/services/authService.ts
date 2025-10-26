import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  mobile: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface UpdateProfileData {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  mobile: string;
}

export const registerUser = async (data: RegisterData): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const result = await response.json();
    const user = result.user;
    
    // Store token and user data
    await AsyncStorage.setItem('authToken', result.token);
    await AsyncStorage.setItem('userData', JSON.stringify(user));

    return user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (data: LoginData): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const result = await response.json();
    const user = result.user;
    
    // Store token and user data
    await AsyncStorage.setItem('authToken', result.token);
    await AsyncStorage.setItem('userData', JSON.stringify(user));

    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const userData = await AsyncStorage.getItem('userData');

    if (!token || !userData) {
      return null;
    }

    return JSON.parse(userData);
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

export const updateUserProfile = async (data: UpdateProfileData): Promise<User> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Profile update failed');
    }

    const result = await response.json();
    const user = result.user;
    
    // Update stored user data
    await AsyncStorage.setItem('userData', JSON.stringify(user));

    return user;
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  // Check for stored user on mount
  getCurrentUser().then(callback);

  // Return unsubscribe function
  return () => {};
};