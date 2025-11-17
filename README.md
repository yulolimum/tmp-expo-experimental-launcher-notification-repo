# tmp-expo-experimental-launcher-notification-repo

## TLDR

- Affects Android, when tapping a push-notification in a killed/background state. 
- Push Notification "response" (i.e. event, action, click) does not work when using `expo-browser` with `experimentalLauncherActivity` enabled.
- This can be observed using any of these libraries:
   - `expo-notification` ([ref](https://rnfirebase.io/messaging/notifications#handling-interaction)): `useLastNotificationResponse` (or other subscriptions/methods)
   - `@react-native-firebase/messaging` ([ref](https://rnfirebase.io/messaging/notifications#handling-interaction)): `getInitialNotification` and `onNotificationOpenedApp`
   - `@notifee/react-native` ([ref](https://rnfirebase.io/messaging/notifications#handling-interaction)): `getInitialNotification` and `onForegroundEvent`

---

## DESCRIPTION

Hello! I recently discovered that the push notification data/response gets swallowed by "something" and doesn't get returned in the methods/subscriptions when the app opens from a killed or background state from a push-notification tap. The response is always `undefined/null`. 

I went through an existing project and isolated the `expo-browser` with `experimentalLauncherActivity` setting as the culprit.

The attached reproducer demonstrates this issue.

---

## STEPS TO REPRODUCE

todo:

--- 

## ENV INFO

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

## EXPO DOCTOR

```
17/17 checks passed. No issues detected!
```