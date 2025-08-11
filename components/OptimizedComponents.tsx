import React, { lazy, memo, Suspense, useCallback, useMemo } from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity, Image } from 'react-native';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import { usePerformanceMonitoring, ImageOptimizer } from '@/utils/performance';
import * as Analytics from '@/utils/analytics';
import type { VideoPlayerProps } from '@/components/VideoPlayer';

// Lazy loaded components for code splitting
export const LazyVideoPlayer = lazy(() => import('@/components/VideoPlayer').then(module => ({ default: module.VideoPlayer })));
export const LazyCourseDetail = lazy(() => import('@/app/(root)/courses/[courseId]'));
export const LazyModernVideoPlayer = lazy(() => import('@/components/ModernVideoPlayer').then(module => ({ default: module.ModernVideoPlayer })));

// Loading fallback component
const LoadingFallback = memo(({ componentName }: { componentName: string }) => {
  const { colors } = useGlobalStyles();
  
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background.primary
    }}>
      <ActivityIndicator size="large" color={colors.brand.primary} />
      <Text style={{
        marginTop: 16,
        color: colors.text.secondary,
        fontSize: 16
      }}>
        Loading {componentName}...
      </Text>
    </View>
  );
});

LoadingFallback.displayName = 'LoadingFallback';

// Optimized Course Card with React.memo
interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    progress: number;
    instructor: string;
    duration: number;
    difficulty: string;
    rating: number;
  };
  onPress: (courseId: string) => void;
}

export const OptimizedCourseCard = memo<CourseCardProps>(({ course, onPress }) => {
  const { colors } = useGlobalStyles();
  const { measureOperation } = usePerformanceMonitoring('CourseCard');
  
  const handlePress = useCallback(() => {
    measureOperation('course_card_press', () => {
      Analytics.trackEvent('COURSE_CARD_PRESSED', {
        course_id: course.id,
        course_title: course.title,
        progress: course.progress
      });
      onPress(course.id);
    });
  }, [course.id, course.title, course.progress, onPress, measureOperation]);
  
  const optimizedThumbnail = useMemo(() => 
    ImageOptimizer.optimizeImageUrl(course.thumbnail, 120, 80),
    [course.thumbnail]
  );
  
  const placeholder = useMemo(() => 
    ImageOptimizer.generatePlaceholder(120, 80, colors.surface.overlay),
    [colors.surface.overlay]
  );
  
  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.surface.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: colors.brand.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Image
          source={{ uri: optimizedThumbnail }}
          style={{
            width: 120,
            height: 80,
            borderRadius: 12,
            backgroundColor: colors.surface.overlay,
          }}
          defaultSource={{ uri: placeholder }}
          resizeMode="cover"
        />
        
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text.primary,
              marginBottom: 4,
            }} numberOfLines={2}>
              {course.title}
            </Text>
            
            <Text style={{
              fontSize: 14,
              color: colors.text.secondary,
              marginBottom: 8,
            }} numberOfLines={2}>
              {course.description}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{
              fontSize: 12,
              color: colors.text.secondary,
            }}>
              {course.instructor}
            </Text>
            
            <View style={{
              backgroundColor: colors.brand.primary,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
            }}>
              <Text style={{
                fontSize: 12,
                color: 'white',
                fontWeight: '600',
              }}>
                {course.progress}% Complete
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.course.id === nextProps.course.id &&
    prevProps.course.progress === nextProps.course.progress &&
    prevProps.course.title === nextProps.course.title
  );
});

OptimizedCourseCard.displayName = 'OptimizedCourseCard';

// Optimized Video Player with Suspense wrapper
export const SuspenseVideoPlayer = memo(({ ...props }: VideoPlayerProps) => (
  <Suspense fallback={<LoadingFallback componentName="Video Player" />}>
    <LazyVideoPlayer {...props} />
  </Suspense>
));

SuspenseVideoPlayer.displayName = 'SuspenseVideoPlayer';

// Optimized Course Detail with Suspense wrapper
export const SuspenseCourseDetail = memo(({ ...props }) => (
  <Suspense fallback={<LoadingFallback componentName="Course Detail" />}>
    <LazyCourseDetail {...props} />
  </Suspense>
));

SuspenseCourseDetail.displayName = 'SuspenseCourseDetail';

// Progressive Image component with blur placeholder
interface ProgressiveImageProps {
  source: { uri: string };
  style: any;
  width: number;
  height: number;
  resizeMode?: 'cover' | 'contain' | 'stretch';
}

export const ProgressiveImage = memo<ProgressiveImageProps>(({ 
  source, 
  style, 
  width, 
  height, 
  resizeMode = 'cover' 
}) => {
  const { colors } = useGlobalStyles();
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  
  const optimizedUri = useMemo(() => 
    ImageOptimizer.optimizeImageUrl(source.uri, width, height),
    [source.uri, width, height]
  );
  
  const placeholder = useMemo(() => 
    ImageOptimizer.generatePlaceholder(width, height, colors.surface.overlay),
    [width, height, colors.surface.overlay]
  );
  
  if (hasError) {
    return (
      <View style={[style, { 
        backgroundColor: colors.surface.overlay,
        justifyContent: 'center',
        alignItems: 'center'
      }]}>
        <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
          Image unavailable
        </Text>
      </View>
    );
  }
  
  return (
    <View style={style}>
      {!isLoaded && (
        <Image
          source={{ uri: placeholder }}
          style={[style, { position: 'absolute' }]}
          resizeMode={resizeMode}
        />
      )}
      <Image
        source={{ uri: optimizedUri }}
        style={[style, { opacity: isLoaded ? 1 : 0 }]}
        resizeMode={resizeMode}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </View>
  );
});

ProgressiveImage.displayName = 'ProgressiveImage';
