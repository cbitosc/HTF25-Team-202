export type ClothingCategory = 
  | 'tops' 
  | 'bottoms' 
  | 'dresses' 
  | 'outerwear' 
  | 'shoes' 
  | 'accessories';

export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all-season';

export interface WardrobeItem {
  id: string;
  userId: string;
  name: string;
  category: ClothingCategory;
  color: string;
  brand?: string;
  size?: string;
  season: Season;
  imageUrl?: string;
  tags?: string[];
  purchaseDate?: Date;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WardrobeFilter {
  category?: ClothingCategory;
  color?: string;
  season?: Season;
  isFavorite?: boolean;
  searchQuery?: string;
}

export interface WardrobeStats {
  totalItems: number;
  itemsByCategory: Record<ClothingCategory, number>;
  itemsBySeason: Record<Season, number>;
  favoriteCount: number;
}