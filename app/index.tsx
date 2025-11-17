import * as Clipboard from 'expo-clipboard'
import { useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'

import { usePermissions } from '@/utils/usePermissions'
import { usePushNotifications } from '@/utils/usePushNotifications'

export default function Index() {
  const { grantedNotifications, checkOrRequestNotifications } = usePermissions()
  const { pushToken, notification } = usePushNotifications()
  const [copyFeedback, setCopyFeedback] = useState(false)

  async function handleRequestPermission() {
    await checkOrRequestNotifications({
      systemFallback: 'notifications',
      alertOnDenied: true
    })
  }

  async function handleCopyToken() {
    if (!pushToken) return
    await Clipboard.setStringAsync(pushToken)
    setCopyFeedback(true)
    setTimeout(() => setCopyFeedback(false), 2000)
  }

  const notificationPayload = notification ? JSON.stringify(notification, null, 2) : null

  return (
    <ScrollView className='flex-1 bg-black'>
      <View className='p-6 pb-20'>
        <View className='mb-6'>
          <Text className='text-gray-500 font-mono text-xs uppercase tracking-wider mb-3'>
            {'// PERMISSION STATUS'}
          </Text>

          {grantedNotifications === null ? (
            <View className='border border-gray-700 p-4'>
              <Text className='text-yellow-400 font-mono text-sm text-center'>&gt; CHECKING PERMISSIONS...</Text>
            </View>
          ) : grantedNotifications ? (
            <View className='border border-green-500 bg-green-950/20 p-4'>
              <Text className='text-green-400 font-mono text-sm text-center'>✓ PERMISSION GRANTED</Text>
            </View>
          ) : (
            <Pressable
              onPress={handleRequestPermission}
              className='border-2 border-red-500 bg-red-950/20 p-4 active:bg-red-950/40'>
              <Text className='text-red-500 font-mono text-sm uppercase text-center tracking-wider'>
                [ REQUEST PERMISSION ]
              </Text>
            </Pressable>
          )}
        </View>

        <View className='mb-6'>
          <Text className='text-gray-500 font-mono text-xs uppercase tracking-wider mb-3'>{'// EXPO PUSH TOKEN'}</Text>

          <View className='border border-gray-700 bg-gray-950 p-3 mb-2'>
            <TextInput
              value={pushToken || 'Waiting for token...'}
              editable={false}
              multiline
              className='text-cyan-400 font-mono text-xs'
              style={{ minHeight: 40 }}
            />
          </View>

          <Pressable
            onPress={handleCopyToken}
            disabled={!pushToken}
            className='border border-gray-600 bg-gray-900 p-3 active:bg-gray-800 disabled:opacity-50'>
            <Text className='text-white font-mono text-xs uppercase text-center tracking-wider'>
              {copyFeedback ? '✓ COPIED TO CLIPBOARD' : '[ COPY TO CLIPBOARD ]'}
            </Text>
          </Pressable>
        </View>

        <View className='mb-6'>
          <Text className='text-gray-500 font-mono text-xs uppercase tracking-wider mb-3'>
            {'// NOTIFICATION PAYLOAD'}
          </Text>

          <View className='border border-gray-700 bg-gray-950 p-4'>
            {notificationPayload ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}>
                <Text className='text-green-400 font-mono text-xs'>{notificationPayload}</Text>
              </ScrollView>
            ) : (
              <Text className='text-gray-400 font-mono text-xs'>
                &gt; NULL{'\n'}
                &gt; No notification data received{'\n'}
                &gt; Tap a notification to see payload here
              </Text>
            )}
          </View>
        </View>

        <View className='border-t border-gray-800 pt-4'>
          <Text className='text-gray-500 font-mono text-xs'>
            &gt; STATUS:{' '}
            {grantedNotifications === null ? 'INITIALIZING' : grantedNotifications ? 'READY' : 'AWAITING_PERMISSION'}
          </Text>
          <Text className='text-gray-500 font-mono text-xs mt-1'>
            &gt; LAST_RESPONSE: {notification ? 'RECEIVED' : 'NULL'}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}
