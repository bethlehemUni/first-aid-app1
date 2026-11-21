# SCAN, LEARN & ACT – First Aid: Android + iOS app (Capacitor)

This folder is a **self-contained wrapper**. It lives in its own `mobile/` folder and does not change any file of the website
(`src/`, `public/`, `vite.config.ts`, GitHub Pages workflow, etc.). Delete the folder and the website is exactly as before.

## Status (read first)
| Item | Status |
|---|---|
| Android project (`android/`) and iOS project (`ios/`) generated with Capacitor 8 | Done |
| App name "Scan, Learn & Act – First Aid", icon + splash from the university crest | Done (generated, not yet seen on a device) |
| Website content in `www/` opens, is RTL, 16 topics load, audio call fires, quiz starts, 101 link visible on every page | Checked in headless Chromium at 390 px width |
| Android APK/AAB compiled | **NOT built.** The environment that prepared this had no Android SDK and no access to Google/Maven servers |
| iOS app compiled | **NOT built.** Needs a Mac with Xcode |
| Run on a real phone (calling 101, Arabic voice, safe areas, icon, splash) | **NOT tested** |

Do not treat the apps as finished until you have done the build + device tests below.

## What is inside
- `www/index.html` – the whole website as one offline file (all text, images, logo, quiz, audio code inlined). The app therefore works with no internet.
  It was taken from the latest single-file build (`SCAN-LEARN-ACT.html`).
- `capacitor.config.json` – app id `com.scanlearnact.firstaid`, name, white splash, safe-area handling.
- `android/`, `ios/` – native projects. `resources/` – icon/splash sources. `scripts/sync-web.mjs` – copies a new website build into `www/`.
- `ci/` – two optional GitHub Actions files (untested) if you prefer GitHub to compile for you.

### Important: the app id
`com.scanlearnact.firstaid` is a placeholder I chose. **It can never be changed after you publish.** Decide on the final id first
(for example one based on a domain the university owns), then change it in `capacitor.config.json`, `android/app/build.gradle`
(`applicationId`, `namespace`), `android/app/src/main/res/values/strings.xml`, the Java package folder, and in Xcode (Bundle Identifier).

### Updating the app when the website changes
1. In the website repo: `npm run build` (produces `dist/`).
2. In `mobile/`: `npm run sync-web -- ../dist` then `npx cap sync`.
3. Raise `versionCode`/`versionName` (Android, `android/app/build.gradle`) and the version/build (Xcode) before each store upload.

## Build Android
Needs: Android Studio (free, Windows/Mac/Linux; includes JDK 21 and the SDK), Node 22.
1. `cd mobile && npm install && npx cap sync android`
2. `npx cap open android` -> wait for Gradle sync -> **Run** on an emulator or a USB phone (enable Developer options + USB debugging), or
   command line: `cd android && ./gradlew assembleDebug` -> `android/app/build/outputs/apk/debug/app-debug.apk` (copy to a phone and open it).
3. For Google Play: `./gradlew bundleRelease` (or Android Studio: Build > Generate Signed Bundle) -> `.aab`. Create a keystore (`keytool`) and keep it + passwords backed up; use Play App Signing.

## Build iOS (Mac required – no way around this)
Needs: a Mac, Xcode (free), Node 22. Capacitor 8 uses Swift Package Manager (no CocoaPods).
1. `cd mobile && npm install && npx cap sync ios && npx cap open ios`
2. In Xcode: target **App** > Signing & Capabilities > pick your Team (a free Apple ID works for testing on your own iPhone, apps expire after 7 days).
3. Select your iPhone (cable, enable Developer Mode on the phone) or a simulator and press **Run**.
4. For the App Store: Product > Archive > Distribute App > App Store Connect.

## Test on real devices (checklist)
- Opens offline (airplane mode): home shows all 16 cases; open each; quiz; kit locations; references.
- Arabic RTL layout, nothing hidden under the status bar / notch / home indicator; rotate the phone.
- **Tap the 101 button**: the dialer must open with 101 (do NOT complete a real call; cancel). Check on at least one Android and one iPhone. Tablets/Wi-Fi-only devices have no dialer.
- Audio: "listen to the steps" button and the AED audio button – check speed options, and that an **Arabic voice is installed** (Android: Settings > Text-to-speech; iPhone: Settings > Accessibility > Spoken Content > Voices). The quiz celebration sound (Web Audio) – check with silent switch on/off on iPhone.
- "Bethlehem University on the map" link opens the maps app/browser. Back button on Android returns within the app.
- Icon and splash look right; app name is not cut off under the icon.
- QR codes printed on kits still open the **website**; they do not open the app (that would need deep links, not set up).

## Google Play – what you need
- Google Play Console developer account: **one-time US$25**, identity verification (ID, and for an organisation a D-U-N-S number).
- Personal accounts created recently must run a **closed test with about 12 testers for 14 days** before production access. (Check the current rule in Play Console.)
- Signed `.aab`, a target API level that meets Google's current requirement (this project targets 36), app icon 512x512, feature graphic 1024x500, at least 2 phone screenshots.
- A **public privacy-policy URL** (the app collects no data and has no account, but the form is still required), Data safety form, content rating questionnaire, health-app declarations (state that it is educational, not medical advice).
- Arabic + English store listing; a support email.

## Apple App Store – what you need
- A **Mac with Xcode** (or a cloud Mac / CI macOS runner) – required for the final archive.
- **Apple Developer Program: US$99 per year** (universities/non-profits may qualify for a fee waiver; an organisation account needs a D-U-N-S number).
- App Store Connect record, signing certificates/provisioning (Xcode can manage them automatically), screenshots (iPhone 6.9"/6.5" sizes; iPad if iPad is enabled), privacy-policy URL, App Privacy ("data not collected") answers, age rating.
- Review risks: Guideline 4.2 (a plain website in a wrapper can be rejected – this app works offline and has audio, quiz and map links, say so in the review notes); 1.4.1 (medical information: keep the references and disclaimer visible and tell the reviewer the content is educational and reviewed by nursing staff). Allow a few days to some weeks for review.
- iPhone only? In Xcode set Targeted Device Family to iPhone to avoid needing iPad screenshots.

## Needs Mac / accounts / payment – summary
- Mac: building and archiving the iOS app (a macOS CI runner is a possible workaround; free for public GitHub repos).
- Free: Android Studio, Xcode, testing on your own devices (iOS free signing expires in 7 days).
- Accounts + money: Google Play $25 once; Apple $99/year (possible waiver). Publishing is not possible without them.

## Technical notes
- Router is HashRouter, so navigation works from the app's local files.
- The service worker is disabled inside the app (not needed; everything is bundled). The website's own PWA/offline behaviour on GitHub Pages is untouched.
- `sync-web.mjs` removes `viewport-fit=cover` only in the app copy so the native view sits inside the status bar/notch; the website keeps it.
- Source-level checks (not device tests): Capacitor opens `tel:` and external https links through the system (Android `Bridge.launchIntent`, iOS `UIApplication.open`).
- The ZIP provided for this task contained an older version of the website source (October 17: no Partners page, no collapsible sections, no quiz levels). So `www/` was built from the latest single-file build instead.
