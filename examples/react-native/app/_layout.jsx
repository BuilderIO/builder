import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Layout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: 'white' },
        headerShown: false
      }}
    >
    </Stack>
  );
}