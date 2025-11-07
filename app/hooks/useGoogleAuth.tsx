import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const googleClientId = Constants.expoConfig?.extra?.GOOGLE_CLIENT_ID;
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const redirectUri = Platform.select({
    web: 'http://localhost:19006',
    default: 'http://localhost:19006'
  });

  console.log('Redirect URI:', redirectUri);

  // Check for auth success in sessionStorage (set by popup callback)
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const checkAuthStatus = setInterval(() => {
      const authSuccess = sessionStorage.getItem('auth_success');
      const accessToken = sessionStorage.getItem('google_access_token');
      const authError = sessionStorage.getItem('auth_error');

      if (authSuccess === 'true' && accessToken) {
        console.log('Auth success detected, token:', accessToken);
        sessionStorage.removeItem('auth_success');
        sessionStorage.removeItem('google_access_token');
        sessionStorage.removeItem('auth_error');
        setIsAuthenticating(false);
        handleGoogleSignIn(accessToken);
      } else if (authError) {
        console.error('Auth error detected:', authError);
        sessionStorage.removeItem('auth_success');
        sessionStorage.removeItem('google_access_token');
        sessionStorage.removeItem('auth_error');
        setIsAuthenticating(false);
        Alert.alert('Authentication Error', authError);
      }
    }, 500);

    return () => clearInterval(checkAuthStatus);
  }, []);

  const handleGoogleSignIn = async (accessToken: string) => {
    try {
      console.log('Starting Google sign-in with token:', accessToken);
      const user = await loginWithGoogle(accessToken);
      console.log('Login successful, user:', user);
      
      console.log('Redirecting to home...');
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Google sign-in error:', error);
      Alert.alert(
        'Login Failed',
        error instanceof Error ? error.message : 'Please try again.'
      );
    }
  };

  const promptAsync = async () => {
    try {
      setIsAuthenticating(true);

      // Build the OAuth URL manually
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${googleClientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent('openid profile email')}`;

      console.log('Opening auth URL:', authUrl);

      if (Platform.OS === 'web') {
        // Open in a popup window for web
        const width = 500;
        const height = 600;
        const left = (window.screen.width / 2) - (width / 2);
        const top = (window.screen.height / 2) - (height / 2);
        
        const popup = window.open(
          authUrl,
          'Google OAuth',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup) {
          setIsAuthenticating(false);
          Alert.alert('Popup Blocked', 'Please allow popups for this site to sign in with Google.');
          return { type: 'error' };
        }

        // Monitor popup
        const checkPopup = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkPopup);
            // Auth status will be checked by the useEffect above
          }
        }, 500);

        return { type: 'success' };
      } else {
        // Use WebBrowser for mobile
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
        setIsAuthenticating(false);

        if (result.type === 'success' && result.url) {
          const params = new URLSearchParams(result.url.split('#')[1]);
          const accessToken = params.get('access_token');
          
          if (accessToken) {
            await handleGoogleSignIn(accessToken);
            return { type: 'success' };
          }
        }

        return { type: result.type };
      }
    } catch (error) {
      console.error('OAuth error:', error);
      setIsAuthenticating(false);
      return { type: 'error', error };
    }
  };

  return {
    request: { clientId: googleClientId },
    promptAsync,
    isAuthenticating,
  };
};