import { StylePreference } from './user';
import { WardrobeItem } from './wardrobe';

export type OccasionType = 
  | 'casual' 
  | 'work' 
  | 'formal' 
  | 'party' 
  | 'date' 
  | 'sports' 
  | 'outdoor' 
  | 'beach' 
  | 'wedding' 
  | 'interview';

export interface Outfit {
  id: string;
  userId: string;
  name?: string;
  occasion: OccasionType;
  style: StylePreference;
  items: {
    top?: WardrobeItem;
    bottom?: WardrobeItem;
    dress?: WardrobeItem;
    outerwear?: WardrobeItem;
    shoes?: WardrobeItem;
    accessories?: WardrobeItem[];
  };
  colorScheme: string[];
  aiSuggestions?: {
    tips: string[];
    colorAdvice: string;
    accessoryAdvice: string;
    layeringTips: string;
  };
  isSaved: boolean;
  isFavorite: boolean;
  rating?: number;
  notes?: string;
  weatherContext?: {
    temperature?: number;
    condition?: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface OutfitSuggestion {
  outfit: Outfit;
  confidence: number;
  alternatives: Outfit[];
  reasoning: string;
}

export interface SavedOutfit {
  id: string;
  userId: string;
  outfitId: string;
  outfit: Outfit;
  tags?: string[];
  lastWorn?: Date;
  timesWorn: number;
  createdAt: Date;
}

export interface OutfitGenerationRequest {
  userId: string;
  occasion: OccasionType;
  style: StylePreference;
  availableItems: WardrobeItem[];
  preferences?: {
    colors?: string[];
    excludeColors?: string[];
    mustIncludeItems?: string[];
    weather?: string;
  };
}