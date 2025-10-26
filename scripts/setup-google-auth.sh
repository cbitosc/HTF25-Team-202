#!/bin/bash

echo "=========================================="
echo "Google Sign-In Setup Helper"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    exit 1
fi

echo "Step 1: Generate SHA-1 Certificate Fingerprint"
echo "----------------------------------------------"
echo ""

# Check if Android debug keystore exists
KEYSTORE_PATH="$HOME/.android/debug.keystore"

if [ -f "$KEYSTORE_PATH" ]; then
    echo "Found debug keystore at: $KEYSTORE_PATH"
    echo ""
    echo "Your SHA-1 fingerprint:"
    echo "----------------------"
    keytool -list -v -keystore "$KEYSTORE_PATH" -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep "SHA1:" | cut -d' ' -f3
    echo ""
else
    echo "Debug keystore not found. Generating new one..."
    keytool -genkey -v -keystore "$KEYSTORE_PATH" -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
    echo ""
    echo "Your SHA-1 fingerprint:"
    echo "----------------------"
    keytool -list -v -keystore "$KEYSTORE_PATH" -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep "SHA1:" | cut -d' ' -f3
    echo ""
fi

echo ""
echo "Step 2: Firebase Configuration Required"
echo "----------------------------------------------"
echo ""
echo "Now you need to:"
echo "1. Go to: https://console.firebase.google.com/project/hackthon-project-10c89"
echo "2. Navigate to: Authentication → Sign-in method → Google"
echo "3. Click 'Enable' and add your support email"
echo "4. Add Android app with package name: com.aioutfitplanner.app"
echo "5. Add the SHA-1 fingerprint shown above"
echo ""
echo "Step 3: Get OAuth Client IDs"
echo "----------------------------------------------"
echo ""
echo "After adding the Android app:"
echo "1. Go to: https://console.cloud.google.com/apis/credentials"
echo "2. Copy the Web client ID (EXPO_CLIENT_ID)"
echo "3. Copy the Android client ID (ANDROID_CLIENT_ID)"
echo ""
echo "Step 4: Update .env file"
echo "----------------------------------------------"
echo ""
echo "Update your .env file with the client IDs:"
echo "EXPO_CLIENT_ID=your-web-client-id.apps.googleusercontent.com"
echo "ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com"
echo "IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com"
echo ""
echo "Step 5: Restart Expo"
echo "----------------------------------------------"
echo ""
echo "Run: npx expo start -c"
echo ""
echo "=========================================="
echo "For detailed instructions, see:"
echo "GOOGLE_OAUTH_SETUP_GUIDE.md"
echo "=========================================="