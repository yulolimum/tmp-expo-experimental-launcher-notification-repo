# tmp-expo-experimental-launcher-notification-repo

### TLDR

- Affects Android, when tapping a push-notification in a killed/background state.
- Push Notification "response" (i.e. event, action, click) does not work when using `expo-browser` with `experimentalLauncherActivity` enabled.
- This can be observed using any of these libraries:
  - `expo-notification` ([ref](https://rnfirebase.io/messaging/notifications#handling-interaction)): `useLastNotificationResponse` (or other subscriptions/methods)
  - `@react-native-firebase/messaging` ([ref](https://rnfirebase.io/messaging/notifications#handling-interaction)): `getInitialNotification` and `onNotificationOpenedApp`
  - `@notifee/react-native` ([ref](https://rnfirebase.io/messaging/notifications#handling-interaction)): `getInitialNotification` and `onForegroundEvent`

---

### DESCRIPTION

Hello! I recently discovered that the push notification data/response gets swallowed by "something" and doesn't get returned in the methods/subscriptions when the app opens from a killed or background state from a push-notification tap. The response is always `undefined/null`.

I went through an existing project and isolated the `expo-browser` with `experimentalLauncherActivity` setting as the culprit.

Note, this does not affect push-notification responses when app is in the foreground state (local notification tapped). Only when the app is in killed or background state.

The attached reproducer demonstrates this issue.



| `"experimentalLauncherActivity": true`                               | `"experimentalLauncherActivity": false`                           |
| --------------------------------- | --------------------------------- |
|  <video src="https://github.com/user-attachments/assets/109c1294-21d7-47ab-9907-d4dbaaf06ba9" />    | <video src="https://github.com/user-attachments/assets/ba54f1dc-a6b5-4c37-af2c-e00a66d93fa0" /> |













---

### STEPS TO REPRODUCE

##### Setup

1. Clone repo

   ```bash
   git clone git@github.com:yulolimum/tmp-expo-experimental-launcher-notification-repo.git
   cd tmp-expo-experimental-launcher-notification-repo
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Update project with FCM and EAS information

   - Add your `google-services.json` to root of project
   - Update `app.json`:
     - Set `expo.extra.eas.projectId` with an EAS project that is linked to Firebase
     - Set `expo.android.package` with the one that matches your Firebase setup

4. Run prebuild, build, and run the app

   ```bash
   pnpm prebuild && pnpm android
   ```

##### Reproduce

1. Open app and allow push notification permissions.
2. Copy the Expo Push Token.
3. Open [Push Notification Tool](https://expo.dev/notifications) and fill out the following:
   - Expo Push Token: (from step 2)
   - Title: Test Notification
   - Body: This is a test notification.
   - Android Channel ID: general
4. (foreground) Send the notification and tap on it when received.
   - Observe: The notification response is logged correctly in the app.
5. (background) Press the home button to send app to background. Send another notification and tap on it when received.
   - Observe: The notification response is logged empty.
6. (killed) Force close the app. Send another notification and tap on it when received.
   - Observe: The notification response is logged empty.

##### Disable `experimentalLauncherActivity` and Compare

1. In `app.json`, set `experimentalLauncherActivity` to `false`.
2. Rebuild and run the app.

   ```bash
   pnpm prebuild && pnpm android
   ```

3. Repeat the steps in "Reproduce" section.

---

### ENV INFO

```
  expo-env-info 2.0.7 environment info:
    System:
      OS: macOS 15.6
      Shell: 5.9 - /bin/zsh
    Binaries:
      Node: 22.20.0 - ~/.asdf/installs/nodejs/22.20.0/bin/node
      Yarn: 1.22.22 - ~/.asdf/installs/nodejs/22.20.0/bin/yarn
      npm: 10.9.3 - ~/.asdf/plugins/nodejs/shims/npm
    Managers:
      CocoaPods: 1.16.2 - /Users/yulolimum/.asdf/shims/pod
    SDKs:
      iOS SDK:
        Platforms: DriverKit 25.0, iOS 26.0, macOS 26.0, tvOS 26.0, visionOS 26.0, watchOS 26.0
    IDEs:
      Android Studio: 2025.1 AI-251.26094.121.2512.13840223
      Xcode: 26.0.1/17A400 - /usr/bin/xcodebuild
    npmPackages:
      expo: ~54.0.23 => 54.0.23
      expo-router: ~6.0.14 => 6.0.14
      react: 19.1.0 => 19.1.0
      react-dom: 19.1.0 => 19.1.0
      react-native: 0.81.5 => 0.81.5
      react-native-web: ~0.21.0 => 0.21.2
    Expo Workflow: bare
```

---

### EXPO DOCTOR

```
17/17 checks passed. No issues detected!
```
