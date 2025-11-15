# Rebuild Instructions - Fix TurboModuleRegistry Error

## Issue
After installing `react-native-get-random-values`, you're getting a TurboModuleRegistry error because the native module needs to be linked and the app needs to be rebuilt.

## Solution

### For Android

1. **Clean the build**:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

2. **Rebuild and run**:
   ```bash
   npm run android
   ```

   Or if that doesn't work:
   ```bash
   npx react-native run-android
   ```

### For iOS (if on Mac)

1. **Install pods**:
   ```bash
   cd ios
   pod install
   cd ..
   ```

2. **Rebuild and run**:
   ```bash
   npm run ios
   ```

   Or:
   ```bash
   npx react-native run-ios
   ```

### Alternative: Complete Clean Rebuild

If the above doesn't work, do a complete clean rebuild:

#### Android:
```bash
# Stop Metro bundler (Ctrl+C if running)

# Clean everything
cd android
./gradlew clean
cd ..

# Clear Metro cache
npx react-native start --reset-cache
```

Then in a new terminal:
```bash
npm run android
```

#### iOS (if on Mac):
```bash
# Stop Metro bundler (Ctrl+C if running)

# Clean everything
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Clear Metro cache
npx react-native start --reset-cache
```

Then in a new terminal:
```bash
npm run ios
```

## What Changed

The following changes have been made to fix both issues:

### 1. ✅ Fixed TurboModuleRegistry Error
- Installed `react-native-get-random-values` package
- Added import in `index.js` (app entry point)
- Added import in `src/utils/biometrics.ts`
- **Requires app rebuild to link native module**

### 2. ✅ Fixed userId Extraction
- Updated `BiometricVerificationScreen.tsx` to extract userId from JWT token's `sub` claim
- No longer using `user.id` from Redux state
- Directly decodes the JWT token to get the `sub` claim

## After Rebuilding

Once the app is rebuilt:

1. **Login to the app** with your credentials
2. **Go to Privacy settings** (Menu → Privacy)
3. **Toggle biometric authentication ON**
4. **Check console logs** - you should see:
   ```
   === Biometric Enable Debug ===
   isAuthenticated: true
   token exists: true
   userId from token (sub): <your-uuid>
   userId type: string
   userId length: 36
   ✅ User validation passed, proceeding with biometric setup
   Biometric availability: { available: true, ... }
   Keys exist: false
   Generating biometric keys...
   New keys generated, public key length: 44
   Device metadata: { ... }
   Registering device with backend...
   Device registered with backend
   Biometric profile saved locally
   ```

5. **Test biometric login** on the login screen

## Troubleshooting

### Still getting TurboModuleRegistry error?
- Make sure you completely stopped the Metro bundler before rebuilding
- Try the "Complete Clean Rebuild" steps above
- Check that `react-native-get-random-values` is in `node_modules`
- Verify the import is at the top of `index.js`

### "userId must be a UUID" error?
- Check console logs for the userId value
- Make sure your JWT token has a `sub` claim
- Decode your token at jwt.io to verify the `sub` claim exists
- The `sub` claim should be a valid UUID format

### Keys not generating?
- Check if biometric hardware is available on your device
- Verify device biometrics are set up in system settings
- Check console for specific error messages

## Summary of Code Changes

### `index.js`
```javascript
// Added at the top
import 'react-native-get-random-values';
```

### `src/utils/biometrics.ts`
```typescript
// Added at the very top
import 'react-native-get-random-values';
```

### `src/screens/Auth/BiometricVerificationScreen.tsx`
```typescript
// Added JWT decode import
import jwtDecode, { JwtPayload } from 'jwt-decode';

// Added function to extract userId from token
const getUserIdFromToken = (): string | null => {
  if (!token) return null;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.sub ?? null;  // Extract from 'sub' claim
  } catch {
    return null;
  }
};

// Updated to use userId from token
await biometricService.registerDevice({
  userId: userId,  // From token's sub claim
  deviceId: deviceMeta.deviceId,
  publicKey: generatedPublicKey,
  deviceName: deviceMeta.deviceName,
  deviceOs: deviceMeta.deviceOs,
});
```

## Expected Result

After rebuilding and testing:
- ✅ No TurboModuleRegistry error
- ✅ Biometric keys generate successfully using NaCl
- ✅ userId is extracted from JWT token's `sub` claim
- ✅ Device registration succeeds with valid UUID
- ✅ "Device registered with backend" console log appears
- ✅ Biometric login works on login screen

