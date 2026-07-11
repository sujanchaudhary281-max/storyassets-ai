export type Platform = 'ios' | 'android';

export const DEVICE_SIZES = {
  ios: {
    'iphone-6.9': { label: 'iPhone 6.9"', width: 1320, height: 2868, platform: 'ios' as const },
    'iphone-6.7': { label: 'iPhone 6.7"', width: 1290, height: 2796, platform: 'ios' as const },
    'ipad-13': { label: 'iPad 13"', width: 2064, height: 2752, platform: 'ios' as const },
  },
  android: {
    'phone': { label: 'Phone', width: 1080, height: 1920, platform: 'android' as const },
    'tablet-7': { label: '7" Tablet', width: 1200, height: 1920, platform: 'android' as const },
    'tablet-10': { label: '10" Tablet', width: 1600, height: 2560, platform: 'android' as const },
  },
} as const;

export type DeviceSize = keyof typeof DEVICE_SIZES['ios'] | keyof typeof DEVICE_SIZES['android'];

export function getDeviceSizesForPlatform(platform: Platform) {
  return DEVICE_SIZES[platform];
}

export function getDeviceSize(key: DeviceSize) {
  return (DEVICE_SIZES.ios as any)[key] ?? (DEVICE_SIZES.android as any)[key];
}

export function getAllDeviceSizes() {
  return { ...DEVICE_SIZES.ios, ...DEVICE_SIZES.android };
}
