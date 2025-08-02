import { apiGet } from '@/api';
import { useAnalytics, useComponentAnalytics } from '@/hooks/useAnalytics';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, TouchableOpacity, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const { width: screenWidth } = Dimensions.get('window');

interface CarouselItemData {
  _id: string;
  link: string;
  place: string;
  priority: number;
  src: string;
  status: number;
  type: string;
}

interface BannerCarouselProps {
  height?: number;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ height = 200 }) => {
  const { colors, spacing } = useGlobalStyles();
  const { track, events } = useAnalytics();
  const { trackComponentEvent } = useComponentAnalytics('BannerCarousel');
  const [banners, setBanners] = useState<CarouselItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      trackComponentEvent('banner_fetch_started', { height });
      
      const response = await apiGet<CarouselItemData[]>('/banner/student/banners?limit=10&skip=0&order=asc&status=10');
      
      console.log('Banner API response:', response);

      if (response.success && response.data && Array.isArray(response.data)) {
        // Filter banners for homePage and sort by priority
        const homePageBanners = response.data
          .filter(banner => banner.place === 'homePage' && banner.status === 1)
          .sort((a, b) => a.priority - b.priority);
        
        setBanners(homePageBanners);
        track(events.HOME_BANNER_VIEWED, {
          banner_count: homePageBanners.length,
          total_banners: response.data.length,
          carousel_height: height,
          fetch_success: true
        });
        
        console.log(`Loaded ${homePageBanners.length} home page banners`);
      } else {
        setError('Failed to load banners');
        trackComponentEvent('banner_fetch_failed', {
          error: 'API response unsuccessful or no data',
          response_success: response.success,
          has_data: !!response.data
        });
      }
    } catch (err: any) {
      console.error('Error fetching banners:', err);
      setError(err.message || 'Failed to load banners');
      trackComponentEvent('banner_fetch_error', {
        error_message: err.message,
        error_name: err.name
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBannerPress = (banner: CarouselItemData) => {
    // Track banner click event
    track(events.HOME_BANNER_CLICKED, {
      banner_id: banner._id,
      banner_link: banner.link,
      link_type: banner.link?.startsWith('http') ? 'external' : 'internal',
      carousel_height: height
    });

    if (banner.link) {
      // Handle navigation based on link type
      if (banner.link.startsWith('http')) {
        // External link - you might want to open in browser
        console.log('Opening external link:', banner.link);
        trackComponentEvent('external_link_clicked', {
          banner_id: banner._id,
          url: banner.link
        });
      } else {
        // Internal navigation
        try {
          router.push(banner.link as any);
          trackComponentEvent('internal_navigation', {
            banner_id: banner._id,
            destination: banner.link
          });
        } catch (error) {
          console.error('Navigation error:', error);
          trackComponentEvent('navigation_error', {
            banner_id: banner._id,
            error_message: (error as Error).message,
            destination: banner.link
          });
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

  // Ensure banners is always an array to prevent map errors
  const safeBanners = Array.isArray(banners) ? banners : [];

  return (
    <View style={localStyles.container}>
      <Carousel
        width={screenWidth - (spacing.base * 2)}
        height={height}
        data={safeBanners}
        renderItem={renderBannerItem}
        autoPlay={safeBanners.length > 0}
        autoPlayInterval={4000}
        scrollAnimationDuration={800}
        loop={safeBanners.length > 1}
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
