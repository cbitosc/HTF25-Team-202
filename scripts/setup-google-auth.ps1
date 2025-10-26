Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Google Sign-In Setup Helper" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Error: .env file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Generate SHA-1 Certificate Fingerprint" -ForegroundColor Yellow
Write-Host "----------------------------------------------"
Write-Host ""

# Check if Android debug keystore exists
$keystorePath = "$env:USERPROFILE\.android\debug.keystore"

if (Test-Path $keystorePath) {
    Write-Host "Found debug keystore at: $keystorePath" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your SHA-1 fingerprint:" -ForegroundColor Yellow
    Write-Host "----------------------"
    
    # Get SHA-1 fingerprint
    $output = keytool -list -v -keystore $keystorePath -alias androiddebugkey -storepass android -keypass android 2>&1
    $sha1 = ($output | Select-String "SHA1:").ToString().Split(":")[1].Trim()
    Write-Host $sha1 -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "Debug keystore not found. Generating new one..." -ForegroundColor Yellow
    
    # Create .android directory if it doesn't exist
    $androidDir = "$env:USERPROFILE\.android"
    if (-not (Test-Path $androidDir)) {
        New-Item -ItemType Directory -Path $androidDir | Out-Null
    }
    
    # Generate keystore
    keytool -genkey -v -keystore $keystorePath -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
    
    Write-Host ""
    Write-Host "Your SHA-1 fingerprint:" -ForegroundColor Yellow
    Write-Host "----------------------"
    
    $output = keytool -list -v -keystore $keystorePath -alias androiddebugkey -storepass android -keypass android 2>&1
    $sha1 = ($output | Select-String "SHA1:").ToString().Split(":")[1].Trim()
    Write-Host $sha1 -ForegroundColor Green
    Write-Host ""
}

Write-Host ""
Write-Host "Step 2: Firebase Configuration Required" -ForegroundColor Yellow
Write-Host "----------------------------------------------"
Write-Host ""
Write-Host "Now you need to:" -ForegroundColor White
Write-Host "1. Go to: https://console.firebase.google.com/project/hackthon-project-10c89" -ForegroundColor Cyan
Write-Host "2. Navigate to: Authentication → Sign-in method → Google" -ForegroundColor Cyan
Write-Host "3. Click 'Enable' and add your support email" -ForegroundColor Cyan
Write-Host "4. Add Android app with package name: com.aioutfitplanner.app" -ForegroundColor Cyan
Write-Host "5. Add the SHA-1 fingerprint shown above" -ForegroundColor Cyan
Write-Host ""
Write-Host "Step 3: Get OAuth Client IDs" -ForegroundColor Yellow
Write-Host "----------------------------------------------"
Write-Host ""
Write-Host "After adding the Android app:" -ForegroundColor White
Write-Host "1. Go to: https://console.cloud.google.com/apis/credentials" -ForegroundColor Cyan
Write-Host "2. Copy the Web client ID (EXPO_CLIENT_ID)" -ForegroundColor Cyan
Write-Host "3. Copy the Android client ID (ANDROID_CLIENT_ID)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Step 4: Update .env file" -ForegroundColor Yellow
Write-Host "----------------------------------------------"
Write-Host ""
Write-Host "Update your .env file with the client IDs:" -ForegroundColor White
Write-Host "EXPO_CLIENT_ID=your-web-client-id.apps.googleusercontent.com" -ForegroundColor Gray
Write-Host "ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com" -ForegroundColor Gray
Write-Host "IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com" -ForegroundColor Gray
Write-Host ""
Write-Host "Step 5: Restart Expo" -ForegroundColor Yellow
Write-Host "----------------------------------------------"
Write-Host ""
Write-Host "Run: npx expo start -c" -ForegroundColor Cyan
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "For detailed instructions, see:" -ForegroundColor White
Write-Host "GOOGLE_OAUTH_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan