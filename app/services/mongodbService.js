import axios from 'axios';

// MongoDB Atlas Data API Configuration
// Note: You need to set up MongoDB Atlas Data API for this to work
// Go to: https://cloud.mongodb.com > Data API > Enable Data API
const MONGODB_DATA_API_URL = process.env.MONGODB_DATA_API_URL || 'https://data.mongodb-api.com/app/data-xxxxx/endpoint/data/v1';
const MONGODB_API_KEY = process.env.MONGODB_API_KEY || 'your-api-key-here';
const DATABASE_NAME = process.env.MONGODB_DB_NAME || 'ai_outfit_planner';

const api = axios.create({
  baseURL: MONGODB_DATA_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'api-key': MONGODB_API_KEY,
  },
});

// Helper function to make Data API requests
const makeRequest = async (action, collection, document = null, filter = null) => {
  const payload = {
    dataSource: 'Cluster0',
    database: DATABASE_NAME,
    collection,
  };

  if (document) payload.document = document;
  if (filter) payload.filter = filter;

  try {
    const response = await api.post(`/action/${action}`, payload);
    return response.data;
  } catch (error) {
    console.error(`MongoDB ${action} error:`, error);
    throw error;
  }
};

// Outfit operations
export const saveOutfit = async (userId, outfitData) => {
  try {
    const outfit = {
      userId,
      ...outfitData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const result = await makeRequest('insertOne', 'outfits', outfit);
    return { id: result.insertedId, ...outfit };
  } catch (error) {
    console.error('Error saving outfit:', error);
    throw error;
  }
};

export const getSavedOutfits = async (userId) => {
  try {
    const result = await makeRequest('find', 'outfits', null, { userId });
    return result.documents || [];
  } catch (error) {
    console.error('Error fetching outfits:', error);
    return [];
  }
};

export const updateOutfit = async (outfitId, updates) => {
  try {
    const result = await makeRequest('updateOne', 'outfits', 
      { $set: { ...updates, updatedAt: new Date().toISOString() } },
      { _id: { $oid: outfitId } }
    );
    return result;
  } catch (error) {
    console.error('Error updating outfit:', error);
    throw error;
  }
};

export const deleteOutfit = async (outfitId) => {
  try {
    await makeRequest('deleteOne', 'outfits', null, { _id: { $oid: outfitId } });
  } catch (error) {
    console.error('Error deleting outfit:', error);
    throw error;
  }
};

// Wardrobe operations
export const addWardrobeItem = async (userId, itemData) => {
  try {
    const item = {
      userId,
      ...itemData,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const result = await makeRequest('insertOne', 'wardrobe', item);
    return { id: result.insertedId, ...item };
  } catch (error) {
    console.error('Error adding wardrobe item:', error);
    throw error;
  }
};

export const getWardrobeItems = async (userId, filters = {}) => {
  try {
    const filter = { userId, ...filters };
    const result = await makeRequest('find', 'wardrobe', null, filter);
    return result.documents || [];
  } catch (error) {
    console.error('Error fetching wardrobe items:', error);
    return [];
  }
};

export const updateWardrobeItem = async (itemId, updates) => {
  try {
    const result = await makeRequest('updateOne', 'wardrobe',
      { $set: { ...updates, updatedAt: new Date().toISOString() } },
      { _id: { $oid: itemId } }
    );
    return result;
  } catch (error) {
    console.error('Error updating wardrobe item:', error);
    throw error;
  }
};

export const deleteWardrobeItem = async (itemId) => {
  try {
    await makeRequest('deleteOne', 'wardrobe', null, { _id: { $oid: itemId } });
  } catch (error) {
    console.error('Error deleting wardrobe item:', error);
    throw error;
  }
};

// User preferences operations
export const getUserPreferences = async (userId) => {
  try {
    const result = await makeRequest('findOne', 'preferences', null, { userId });
    return result.document || null;
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return null;
  }
};

export const saveUserPreferences = async (userId, preferences) => {
  try {
    const result = await makeRequest('updateOne', 'preferences',
      { 
        $set: { 
          ...preferences,
          updatedAt: new Date().toISOString()
        },
        $setOnInsert: { 
          userId,
          createdAt: new Date().toISOString()
        }
      },
      { userId }
    );
    return result;
  } catch (error) {
    console.error('Error saving preferences:', error);
    throw error;
  }
};

// Saved outfits operations
export const addToSavedOutfits = async (userId, outfitId) => {
  try {
    const savedOutfit = {
      userId,
      outfitId,
      timesWorn: 0,
      createdAt: new Date().toISOString(),
    };
    
    const result = await makeRequest('insertOne', 'saved_outfits', savedOutfit);
    return { id: result.insertedId, ...savedOutfit };
  } catch (error) {
    console.error('Error saving outfit to favorites:', error);
    throw error;
  }
};

export const getSavedOutfitsList = async (userId) => {
  try {
    const result = await makeRequest('find', 'saved_outfits', null, { userId });
    return result.documents || [];
  } catch (error) {
    console.error('Error fetching saved outfits:', error);
    return [];
  }
};

export const incrementWornCount = async (savedOutfitId) => {
  try {
    await makeRequest('updateOne', 'saved_outfits',
      { 
        $inc: { timesWorn: 1 },
        $set: { lastWorn: new Date().toISOString() }
      },
      { _id: { $oid: savedOutfitId } }
    );
  } catch (error) {
    console.error('Error incrementing worn count:', error);
    throw error;
  }
};

export default {
  saveOutfit,
  getSavedOutfits,
  updateOutfit,
  deleteOutfit,
  addWardrobeItem,
  getWardrobeItems,
  updateWardrobeItem,
  deleteWardrobeItem,
  getUserPreferences,
  saveUserPreferences,
  addToSavedOutfits,
  getSavedOutfitsList,
  incrementWornCount,
};
