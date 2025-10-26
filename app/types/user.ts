export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  mobile: string;
  password?: string; // Only used during registration, not stored in state
  displayName?: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  userId: string;
  style: StylePreference;
  favoriteColors: string[];
  sizes: {
    top?: string;
    bottom?: string;
    shoes?: string;
  };
  weatherPreference?: 'cold' | 'warm' | 'hot';
  formality?: 'casual' | 'business-casual' | 'formal';
}

export type StylePreference = 
  | 'gen-z' 
  | 'millennial' 
  | 'gen-x' 
  | 'classic' 
  | 'bohemian' 
  | 'streetwear' 
  | 'minimalist' 
  | 'vintage';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}