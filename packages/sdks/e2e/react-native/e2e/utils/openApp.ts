import { resolveConfig } from 'detox/internals';

const platform = device.getPlatform();

export const openApp = async () => {
  const config = await resolveConfig();
  if (config.configurationName.split('.')[1] === 'debug') {
    return await openAppForDebugBuild(platform);
  } else {
    return await device.launchApp({ newInstance: true });
  }
};

async function openAppForDebugBuild(platform: 'ios' | 'android') {
  const url = getDevLauncherPackagerUrl(platform);
  const deepLinkUrl = getDeepLinkUrl(url);

  console.log('deepLinkUrl', {
    url,
    deepLinkUrl,
    platform,
  });

  if (platform === 'ios') {
    await device.launchApp({
      newInstance: true,
    });
    sleep(3000);
    await device.openURL({
      url: deepLinkUrl,
    });
  } else {
    await device.launchApp({
      newInstance: true,
      url: deepLinkUrl,
    });
  }

  await sleep(3000);
}

const getDeepLinkUrl = (url: string) =>
  `exp+my-app://expo-development-client/?url=${encodeURIComponent(url)}`;

const getDevLauncherPackagerUrl = (platform: 'ios' | 'android') =>
  `http://localhost:8081?platform=${platform}&dev=true&minify=false&disableOnboarding=1`;

const sleep = (t: number) => new Promise((res) => setTimeout(res, t));
