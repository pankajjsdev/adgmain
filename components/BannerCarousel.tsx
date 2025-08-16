import { apiGet } from '@/api';
import { useAnalytics, useComponentAnalytics } from '@/hooks/useAnalytics';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, TouchableOpacity, View, Text } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '@/store/authStore';

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

interface GreetingSlide {
  _id: string;
  type: 'greeting';
  link?: string;
}

interface BannerCarouselProps {
  height?: number;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ height = 200 }) => {
  const { colors, spacing } = useGlobalStyles();
  const { track, events } = useAnalytics();
  const { trackComponentEvent } = useComponentAnalytics('BannerCarousel');
  const { user } = useAuthStore();
  const [banners, setBanners] = useState<CarouselItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchBanners();
    
    // Update time every minute for greeting
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
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
        
        // Create greeting slide
        const greetingSlide: GreetingSlide = {
          _id: 'greeting-slide',
          type: 'greeting',
          link: '/(root)/profile'
        };
        
        // Combine greeting slide with banners
        const allSlides = [greetingSlide, ...homePageBanners];
        setBanners(allSlides as any);
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

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get time-based emoji
  const getTimeEmoji = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '🌅';
    if (hour < 17) return '☀️';
    return '🌙';
  };

  const handleBannerPress = (banner: CarouselItemData | GreetingSlide) => {
    // Handle greeting slide click
    if ('type' in banner && banner.type === 'greeting') {
      track('greeting_slide_clicked', {
        slide_id: banner._id,
        user_name: user?.firstName,
        greeting: getGreeting()
      });
      if (banner.link) {
        router.push(banner.link as any);
      }
      return;
    }

    // Track banner click event
    track(events.HOME_BANNER_CLICKED, {
      banner_id: banner._id,
      banner_link: (banner as CarouselItemData).link,
      link_type: (banner as CarouselItemData).link?.startsWith('http') ? 'external' : 'internal',
      carousel_height: height
    });

    const bannerData = banner as CarouselItemData;
    if (bannerData.link) {
      // Handle navigation based on link type
      if (bannerData.link.startsWith('http')) {
        // External link - you might want to open in browser
        console.log('Opening external link:', bannerData.link);
        trackComponentEvent('external_link_clicked', {
          banner_id: bannerData._id,
          url: bannerData.link
        });
      } else {
        // Internal navigation
        try {
          router.push(bannerData.link as any);
          trackComponentEvent('internal_navigation', {
            banner_id: bannerData._id,
            destination: bannerData.link
          });
        } catch (error) {
          console.error('Navigation error:', error);
          trackComponentEvent('navigation_error', {
            banner_id: bannerData._id,
            error_message: (error as Error).message,
            destination: bannerData.link
          });
        }
      }
    }
  };

  const renderGreetingSlide = () => (
    <TouchableOpacity
      style={[
        localStyles.bannerItem,
        { height, backgroundColor: 'transparent' }
      ]}
      onPress={() => handleBannerPress({ _id: 'greeting-slide', type: 'greeting', link: '/(root)/profile' } as GreetingSlide)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[colors.brand.primary, colors.brand.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={localStyles.greetingGradient}
      >
        <View style={localStyles.greetingContent}>
          <Text style={localStyles.timeEmoji}>{getTimeEmoji()}</Text>
          <Text style={localStyles.greeting}>
            {getGreeting()}, <Text style={localStyles.greetingName}>{user?.firstName || 'User'}!</Text>
          </Text>
          <Text style={localStyles.greetingSubtext}>
            Ready to continue your learning journey?
          </Text>
          <View style={localStyles.greetingStats}>
            <View style={localStyles.statItem}>
              <Text style={localStyles.statNumber}>12</Text>
              <Text style={localStyles.statLabel}>Courses</Text>
            </View>
            <View style={localStyles.statDivider} />
            <View style={localStyles.statItem}>
              <Text style={localStyles.statNumber}>85%</Text>
              <Text style={localStyles.statLabel}>Progress</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderBannerItem = ({ item }: { item: CarouselItemData | GreetingSlide }) => {
    if ('type' in item && item.type === 'greeting') {
      return renderGreetingSlide();
    }

    const bannerItem = item as CarouselItemData;
    return (
      <TouchableOpacity
        style={[
          localStyles.bannerItem,
          { height, backgroundColor: colors.surface.secondary }
        ]}
        onPress={() => handleBannerPress(item)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: bannerItem.src }}
          style={localStyles.bannerImage}
          resizeMode="cover"
          onError={() => console.log('Image load error for:', bannerItem.src)}
        />
      </TouchableOpacity>
    );
  };

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
  greetingGradient: {
    width: '100%' as const,
    height: '100%' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
  },
  greetingContent: {
    alignItems: 'center' as const,
    width: '100%' as const,
  },
  timeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600' as const,
    fontFamily: 'Urbanist',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center' as const,
    lineHeight: 26,
  },
  greetingName: {
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  greetingSubtext: {
    fontSize: 14,
    fontFamily: 'Urbanist',
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center' as const,
    marginBottom: 16,
    lineHeight: 18,
  },
  greetingStats: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    alignItems: 'center' as const,
    width: '100%' as const,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  statItem: {
    alignItems: 'center' as const,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800' as const,
    fontFamily: 'Urbanist',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Urbanist',
    color: '#FFFFFF',
    opacity: 0.8,
    fontWeight: '500' as const,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
};

export default BannerCarousel;
