import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import { apiGet } from '@/api';
import { router } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

interface CarouselItemData {
  _id: string;
  src: string;
  link: string;
}

interface BannerCarouselProps {
  height?: number;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ height = 200 }) => {
  const { colors, spacing } = useGlobalStyles();
  const [banners, setBanners] = useState<CarouselItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await apiGet<CarouselItemData[]>('/banner/student/banners?limit=50&skip=0&order=asc&status=10');
      
      if (response.success && response.data) {
        setBanners(response.data);
      } else {
        setError('Failed to load banners');
      }
    } catch (err: any) {
      console.error('Error fetching banners:', err);
      setError(err.message || 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleBannerPress = (banner: CarouselItemData) => {
    if (banner.link) {
      // Handle navigation based on link type
      if (banner.link.startsWith('http')) {
        // External link - you might want to open in browser
        console.log('Opening external link:', banner.link);
      } else {
        // Internal navigation
        try {
          router.push(banner.link as any);
        } catch (error) {
          console.error('Navigation error:', error);
        }
      }
    }
  };

  const renderBannerItem = ({ item }: { item: CarouselItemData }) => (
    <TouchableOpacity
      style={[
        localStyles.bannerItem,
        { height, backgroundColor: colors.surface.secondary }
      ]}
      onPress={() => handleBannerPress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.src }}
        style={localStyles.bannerImage}
        resizeMode="cover"
        onError={() => console.log('Image load error for:', item.src)}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[localStyles.container, localStyles.loadingContainer, { height }]}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  if (error || banners.length === 0) {
    return (
      <View style={[localStyles.container, localStyles.errorContainer, { height }]}>
        <Image
          source={{ uri: 'https://via.placeholder.com/400x200/4ECDC4/FFFFFF?text=Coming+Soon' }}
          style={localStyles.bannerImage}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={localStyles.container}>
      <Carousel
        width={screenWidth - (spacing.base * 2)}
        height={height}
        data={banners}
        renderItem={renderBannerItem}
        autoPlay={true}
        autoPlayInterval={4000}
        scrollAnimationDuration={800}
        loop={banners.length > 1}
        pagingEnabled={true}
        snapEnabled={true}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
      />
    </View>
  );
};

const localStyles = {
  container: {
    marginVertical: 16,
  },
  loadingContainer: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderRadius: 12,
  },
  errorContainer: {
    borderRadius: 12,
    overflow: 'hidden' as const,
  },
  bannerItem: {
    borderRadius: 12,
    overflow: 'hidden' as const,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bannerImage: {
    width: '100%' as const,
    height: '100%' as const,
  },
};

export default BannerCarousel;
