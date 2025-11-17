import { Stack } from 'expo-router'
import { Text, View } from 'react-native'

import '@/assets/css/global.css'
import { PermissionsProvider } from '@/utils/usePermissions'
import { PushNotificationsProvider } from '@/utils/usePushNotifications'

export default function RootLayout() {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19)

  return (
    <PermissionsProvider>
      <PushNotificationsProvider>
        <View className='flex-1 bg-black py-7'>
          <View className='pt-16 px-6 pb-4 border-b border-gray-800'>
            <Text className='text-white font-mono text-lg uppercase tracking-wider'>NOTIFICATION BUG REPRODUCER</Text>
            <Text className='text-gray-500 font-mono text-xs mt-1'>Last Update {timestamp}</Text>
          </View>

          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </PushNotificationsProvider>
    </PermissionsProvider>
  )
}
