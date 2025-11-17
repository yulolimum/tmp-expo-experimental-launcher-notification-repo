import type { PermissionResponse } from 'expo-modules-core'
import type { NotificationChannelInput } from 'expo-notifications'
import type { PropsWithChildren } from 'react'

import * as Application from 'expo-application'
import { PermissionStatus } from 'expo-modules-core'
import {
  AndroidImportance,
  getPermissionsAsync as getNotificationsPermissionsAsync,
  requestPermissionsAsync as requestNotificationsPermissionsAsync,
  setNotificationChannelAsync
} from 'expo-notifications'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Alert, Linking, Platform } from 'react-native'

import { getObjectEntries } from './objects'

import { useAppState } from './useAppState'

const DEBUG = true

function usePermissionsContext() {
  const permissionsCheckInterval = useRef<NodeJS.Timeout | undefined>(undefined)

  // List of permissions to check. `null` = not yet checked. `boolean` = granted or not.
  const [grantedNotifications, setGrantedNotifications] = useState<boolean | null>(null)
  // const [grantedLocation, setGrantedLocation] = useState<boolean | null>(null)

  // function checkOrRequestLocation(opts?: Pick<CheckOrRequestOpts, "systemFallback" | "alertOnDenied" | "label">) {
  //   return checkOrRequestPermission({
  //     alertStore,
  //     label: "Location Permission",
  //     get: getForegroundPermissionsAsync,
  //     request: requestForegroundPermissionsAsync,
  //     ...opts,
  //   })
  // }

  async function checkOrRequestNotifications(
    opts?: Pick<CheckOrRequestOpts, 'systemFallback' | 'alertOnDenied' | 'label'>
  ) {
    const granted = await checkOrRequestPermission({
      label: 'Notifications Permission',
      get: getNotificationsPermissionsAsync,
      request: requestNotificationsPermissionsAsync,
      ...opts
    })

    setGrantedNotifications(granted)

    return granted
  }

  async function configureNotifications() {
    debug('[configureNotifications.start]', 'Configuring notification channels...')
    if (Platform.OS === 'android') {
      for (const [id, channel] of getObjectEntries(androidNotificationChannels)) {
        try {
          const existingChannel = await setNotificationChannelAsync(id, channel)
          debug('[configureNotifications]', `Channel ${id} already exists:`, existingChannel)
        } catch (error) {
          debug('[configureNotifications.error]', `Failed to set channel ${id}:`, error)
        }
      }
    }
    debug('[configureNotifications.end]', 'Configured notification channels')
  }

  function checkAllPermissions() {
    debug('[checkAllPermissions]', 'Checking permissions...')
    configureNotifications().then(() => checkPermission(getNotificationsPermissionsAsync).then(setGrantedNotifications))
    // checkPermission(getForegroundPermissionsAsync).then(setGrantedLocation)
  }

  useEffect(() => {
    checkAllPermissions()
    permissionsCheckInterval.current = setInterval(checkAllPermissions, 30000)
  }, [])

  useAppState(
    {
      onForeground: () => {
        clearInterval(permissionsCheckInterval.current)
        checkAllPermissions()
        permissionsCheckInterval.current = setInterval(checkAllPermissions, 30000)
      }
    },
    []
  )

  debug('[permissions]', {
    //  grantedLocation,
    grantedNotifications
  })

  return {
    // states
    // grantedLocation,
    grantedNotifications,

    // actions
    // checkOrRequestLocation,
    checkOrRequestNotifications
  }
}

export function canPermissionBeRequested(permission?: PermissionResponse | null) {
  if (!permission) return true

  if (permission.status === PermissionStatus.GRANTED) return false
  if (permission.status === PermissionStatus.UNDETERMINED) return true
  if (permission.status === PermissionStatus.DENIED && permission.canAskAgain) return true

  return false
}

export async function checkPermission(get: () => Promise<PermissionResponse>) {
  const permission = await get()

  return permission?.status === PermissionStatus.GRANTED
}

export async function checkOrRequestPermission(opts: CheckOrRequestOpts) {
  const { get, request, alertOnDenied = true, systemFallback = true, label } = opts

  const permission = await get()

  const deniedMessage = `${label ?? 'Permission'} is required.`

  if (permission?.status === PermissionStatus.GRANTED) {
    return true
  }

  if (canPermissionBeRequested(permission) && !!request) {
    const response = await request()

    if (response.granted) return true

    if (alertOnDenied) {
      Alert.alert('Permission Denied', deniedMessage)
      return false
    }
  } else if (systemFallback) {
    Alert.prompt(
      `${label ?? 'Permission'} Required`,
      `Please enable the required ${label?.toLowerCase() ?? 'permission'} in your device settings.`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'android' && systemFallback === 'notifications') {
              Linking.sendIntent('android.settings.APP_NOTIFICATION_SETTINGS', [
                { key: 'android.provider.extra.APP_PACKAGE', value: Application.applicationId! }
              ])
            } else {
              Linking.openSettings()
            }
          }
        }
      ]
    )
  }

  return false
}

type CheckOrRequestOpts = {
  get: () => Promise<PermissionResponse>
  request: () => Promise<PermissionResponse>
  systemFallback?: 'settings' | 'notifications' | false
  alertOnDenied?: boolean
  label?: string
}

const androidNotificationChannels = {
  general: {
    name: 'General',
    importance: AndroidImportance.HIGH,
    description: 'Used for receiving general notifications'
  }
} satisfies Record<string, NotificationChannelInput>

const PermissionsContext = createContext<PermissionsContext>(undefined as any)
type PermissionsContext = ReturnType<typeof usePermissionsContext>

export function PermissionsProvider(props: PropsWithChildren) {
  const data = usePermissionsContext()

  return <PermissionsContext.Provider value={data}>{props.children}</PermissionsContext.Provider>
}

export function usePermissions() {
  return useContext(PermissionsContext)
}

const debug: typeof console.info = (...args) =>
  DEBUG ? console.info(Platform.OS, '[usePermissions]', ...args) : undefined
