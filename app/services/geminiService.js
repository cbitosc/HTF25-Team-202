import axios from 'axios';

const GEMINI_API_KEY = 'AIzaSyCVSEI4lmcCQCYfOPjlMgroeZ0oPzdQROY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const api = axios.create({
  baseURL: GEMINI_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getOutfitSuggestions = async (wardrobeItems, userPreferences, occasion) => {
  try {
    const prompt = buildOutfitPrompt(wardrobeItems, userPreferences, occasion);
    
    const response = await api.post('', {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }, {
      params: {
        key: GEMINI_API_KEY,
      },
    });

    const suggestionsText = response.data.candidates[0].content.parts[0].text;
    return parseOutfitSuggestions(suggestionsText);
  } catch (error) {
    console.error('Error getting outfit suggestions:', error);
    throw error;
  }
};

export const getColorAdvice = async (selectedColors, style) => {
  try {
    const prompt = `Given these colors: ${selectedColors.join(', ')} and style preference: ${style}, 
    provide 5 specific fashion tips for combining these colors effectively. Include color psychology and trendy combinations.`;
    
    const response = await api.post('', {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }, {
      params: {
        key: GEMINI_API_KEY,
      },
    });

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error getting color advice:', error);
    throw error;
  }
};

export const getAccessoryAdvice = async (outfit, occasion, style) => {
  try {
    const prompt = `For a ${occasion} event with ${style} style preference, and given these outfit items:
    Top: ${outfit.top?.name || 'casual top'}, 
    Bottom: ${outfit.bottom?.name || 'jeans'},
    Shoes: ${outfit.shoes?.name || 'sneakers'},
    Please suggest 3-5 specific accessories that would complement this outfit. Include why each accessory works.`;
    
    const response = await api.post('', {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }, {
      params: {
        key: GEMINI_API_KEY,
      },
    });

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error getting accessory advice:', error);
    throw error;
  }
};

export const getLayeringTips = async (outfit, weather) => {
  try {
    const prompt = `For ${weather} weather and the following outfit items:
    Top: ${outfit.top?.name || 'shirt'}, 
    Bottom: ${outfit.bottom?.name || 'pants'},
    Shoes: ${outfit.shoes?.name || 'shoes'},
    Provide 3-4 specific layering tips to make this outfit weather-appropriate and stylish.`;
    
    const response = await api.post('', {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }, {
      params: {
        key: GEMINI_API_KEY,
      },
    });

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error getting layering tips:', error);
    throw error;
  }
};

const buildOutfitPrompt = (wardrobeItems, preferences, occasion) => {
  const itemList = wardrobeItems.map(item => `${item.category}: ${item.name} (${item.color})`).join(', ');
  
  return `You are a professional fashion stylist. Based on the following:
    Available wardrobe items: ${itemList}
    Style preference: ${preferences.style}
    Occasion: ${occasion}
    
    Suggest the best complete outfit combination. Include:
    1. Specific items for top, bottom, shoes, and accessories
    2. Color coordination explanation
    3. Why this combination works for the ${occasion} occasion
    4. Styling tips and suggestions
    5. Alternative variations if items are similar
    
    Format your response as JSON with keys: outfit, colorScheme, tips, alternatives`;
};

const parseOutfitSuggestions = (text) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {
      outfit: text,
      colorScheme: [],
      tips: [text],
      alternatives: [],
    };
  } catch (error) {
    console.error('Error parsing suggestions:', error);
    return {
      outfit: text,
      colorScheme: [],
      tips: [text],
      alternatives: [],
    };
  }
};
