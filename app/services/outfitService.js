import { saveOutfit, getSavedOutfits, deleteOutfit } from './mongodbService';
import { generateOutfitId } from '../utils/helpers';

export const createAndSaveOutfit = async (userId, outfitDetails) => {
  try {
    const outfit = {
      id: generateOutfitId(),
      top: outfitDetails.top,
      bottom: outfitDetails.bottom,
      shoes: outfitDetails.shoes,
      accessories: outfitDetails.accessories,
      colorScheme: outfitDetails.colorScheme,
      tips: outfitDetails.tips,
      occasion: outfitDetails.occasion,
      style: outfitDetails.style,
      isFavorite: outfitDetails.isFavorite || false,
      rating: outfitDetails.rating || 0,
      notes: outfitDetails.notes || '',
    };

    return await saveOutfit(userId, outfit);
  } catch (error) {
    console.error('Error creating outfit:', error);
    throw error;
  }
};

export const fetchUserOutfits = async (userId) => {
  try {
    return await getSavedOutfits(userId);
  } catch (error) {
    console.error('Error fetching user outfits:', error);
    throw error;
  }
};

export const removeOutfit = async (outfitId) => {
  try {
    return await deleteOutfit(outfitId);
  } catch (error) {
    console.error('Error removing outfit:', error);
    throw error;
  }
};

export const combineOutfitElements = (wardrobeItems, style, occasion) => {
  const tops = wardrobeItems.filter(item => item.category === 'Tops');
  const bottoms = wardrobeItems.filter(item => item.category === 'Bottoms');
  const shoes = wardrobeItems.filter(item => item.category === 'Shoes');
  const accessories = wardrobeItems.filter(item => item.category === 'Accessories');

  const randomTop = tops[Math.floor(Math.random() * tops.length)];
  const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
  const randomShoes = shoes[Math.floor(Math.random() * shoes.length)];
  const randomAccessories = accessories.slice(0, 2);

  return {
    top: randomTop,
    bottom: randomBottom,
    shoes: randomShoes,
    accessories: randomAccessories,
  };
};
