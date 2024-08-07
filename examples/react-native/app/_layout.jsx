import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Layout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: 'white' },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }}  />
      <Stack.Screen name="Page" options={{ headerShown: false }}  />
    </Stack>
  );
}