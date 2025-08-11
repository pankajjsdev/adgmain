import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import { useNetworkRecovery } from '@/utils/networkRecovery';

export const NetworkStatusIndicator = memo(() => {
  const { colors } = useGlobalStyles();
  const { networkState, queueStatus, clearQueue } = useNetworkRecovery();
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (!networkState.isConnected || queueStatus.pendingRetries > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [networkState.isConnected, queueStatus.pendingRetries, fadeAnim]);

  if (networkState.isConnected && queueStatus.pendingRetries === 0) {
    return null;
  }

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        zIndex: 1000,
        backgroundColor: networkState.isConnected ? colors.status.warning : colors.status.error,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      }}
    >
      <Ionicons
        name={networkState.isConnected ? 'sync-outline' : 'cloud-offline-outline'}
        size={20}
        color="white"
        style={{ marginRight: 8 }}
      />
      
      <View style={{ flex: 1 }}>
        <Text style={{
          color: 'white',
          fontSize: 14,
          fontWeight: '600',
          marginBottom: 2
        }}>
          {networkState.isConnected ? 'Syncing...' : 'No Internet Connection'}
        </Text>
        
        <Text style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: 12
        }}>
          {networkState.isConnected 
            ? `${queueStatus.pendingRetries} requests pending`
            : 'Some features may not work'
          }
        </Text>
      </View>

      {queueStatus.pendingRetries > 0 && (
        <TouchableOpacity
          onPress={clearQueue}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
          }}
        >
          <Text style={{
            color: 'white',
            fontSize: 12,
            fontWeight: '600'
          }}>
            Clear
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
});

NetworkStatusIndicator.displayName = 'NetworkStatusIndicator';
