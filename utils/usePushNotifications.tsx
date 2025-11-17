import type {
  ExpoPushToken,
  NotificationRequestInput,
  NotificationResponse,
  NotificationTriggerInput
} from 'expo-notifications'
import type { PropsWithChildren } from 'react'

import { checkPermission, usePermissions } from '@/utils/usePermissions'
import {
  clearLastNotificationResponse,
  getExpoPushTokenAsync,
  getPermissionsAsync as getNotificationsPermissionsAsync,
  scheduleNotificationAsync,
  setNotificationHandler,
  useLastNotificationResponse
} from 'expo-notifications'
import { createContext, useContext, useEffect, useState } from 'react'
import { Platform } from 'react-native'

const DEBUG = true

// When the app is running, push-notifications need to be handled manually.
setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
})

function usePushNotificationsContext() {
  const { grantedNotifications } = usePermissions()

  const [pushToken, setPushToken] = useState<string | undefined>(undefined)
  const [notification, setNotification] = useState<NotificationResponse | null>(null)
  const lastNotification = useLastNotificationResponse()

  function displayLocalNotification(
    notification: Omit<NotificationRequestInput, 'trigger'> & { trigger?: NotificationTriggerInput }
  ) {
    scheduleNotificationAsync({ trigger: null, ...notification })
  }

  // Subscribe to notification press events
  useEffect(() => {
    debug('[lastNotification]', ' Last notification response:', JSON.stringify(lastNotification, null, 2))
    if (lastNotification) {
      setNotification(lastNotification)
      void clearLastNotificationResponse()
    }
  }, [lastNotification])

  // Subsribe to push notification token updates
  useEffect(() => {
    getPushNotificationToken().then((token) => {
      if (token) setPushToken(token)
    })
  }, [grantedNotifications])

  return {
    notification,
    clearNotification: () => setNotification(null),
    displayLocalNotification,
    pushToken
  }
}

export async function getPushNotificationToken() {
  const notificationsGranted = await checkPermission(getNotificationsPermissionsAsync)

  if (!notificationsGranted) return undefined

  try {
    const response = await Promise.race<ExpoPushToken>([
      new Promise((_, reject) => setTimeout(() => reject('Timeout reached.'), 1000)),
      getExpoPushTokenAsync()
    ])

    debug('[getPushNotificationToken]', 'Push notification token retrieved:', response)

    return response.data
  } catch (error) {
    debug('[getPushNotificationToken]', 'This may not work on simulators or if permissions are not granted.', error)
  }
}

const PushNotificationsContext = createContext<PushNotificationsContext>(undefined as any)
type PushNotificationsContext = ReturnType<typeof usePushNotificationsContext>

export function PushNotificationsProvider(props: PropsWithChildren) {
  const data = usePushNotificationsContext()

  return <PushNotificationsContext.Provider value={data}>{props.children}</PushNotificationsContext.Provider>
}

export function usePushNotifications() {
  return useContext(PushNotificationsContext)
}

const debug: typeof console.info = (...args) =>
  DEBUG ? console.info(Platform.OS, '[usePushNotifications]', ...args) : undefined
