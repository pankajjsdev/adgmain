import { Stack } from 'expo-router';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';

export default function RootLayout() {
  const { colors } = useGlobalStyles();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background.primary,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontFamily: 'Urbanist-SemiBold',
          fontSize: 18,
        },
        contentStyle: {
          backgroundColor: colors.background.primary,
        },
      }}
    >
      <Stack.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="analytics/index" 
        options={{ 
          title: 'Analytics',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="courses/index" 
        options={{ 
          title: 'Courses',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="courses/[courseId]/index" 
        options={{ 
          title: 'Course Details',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="courses/[courseId]/chapters/index" 
        options={{ 
          title: 'Chapters',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="courses/[courseId]/chapters/[chapterId]/index" 
        options={{ 
          title: 'Chapter Details',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="courses/[courseId]/chapters/[chapterId]/assignments/index" 
        options={{ 
          title: 'Assignments',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="courses/[courseId]/chapters/[chapterId]/assignments/[assignmentId]/index" 
        options={{ 
          title: 'Assignment Details',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="courses/[courseId]/chapters/[chapterId]/notes/index" 
        options={{ 
          title: 'Notes',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="courses/[courseId]/chapters/[chapterId]/notes/[noteId]/index" 
        options={{ 
          title: 'Note Details',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="courses/[courseId]/chapters/[chapterId]/tests/index" 
        options={{ 
          title: 'Tests',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="courses/[courseId]/chapters/[chapterId]/tests/[testId]/index" 
        options={{ 
          title: 'Test Details',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="courses/[courseId]/chapters/[chapterId]/videos/index" 
        options={{ 
          title: 'Videos',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="courses/[courseId]/chapters/[chapterId]/videos/[videoId]/index" 
        options={{ 
          title: 'Video Player',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="forum/index" 
        options={{ 
          title: 'Forum',
          headerShown: true 
        }} 
      />
    </Stack>
  );
}
