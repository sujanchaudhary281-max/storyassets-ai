import { DEVICE_SIZES } from './device-sizes';

export interface ValidationResult {
  valid: boolean;
  errors: {
    assetId: string;
    expected: { width: number; height: number };
    actual: { width: number; height: number };
    message: string;
  }[];
}

export function validateExportAssets(
  assets: Array<{ id: string; width: number; height: number; deviceSize: string | null; assetType: string }>
): ValidationResult {
  const errors: ValidationResult['errors'] = [];

  for (const asset of assets) {
    let expected: { width: number; height: number } | null = null;

    if (asset.assetType === 'feature_graphic') {
      expected = { width: 1024, height: 500 };
    } else if (asset.assetType === 'icon_512') {
      expected = { width: 512, height: 512 };
    } else if (asset.deviceSize) {
      const all = { ...DEVICE_SIZES.ios, ...DEVICE_SIZES.android };
      const spec = all[asset.deviceSize as keyof typeof all];
      if (spec) expected = { width: spec.width, height: spec.height };
    }

    if (expected && (asset.width !== expected.width || asset.height !== expected.height)) {
      errors.push({
        assetId: asset.id,
        expected,
        actual: { width: asset.width, height: asset.height },
        message: `Expected ${expected.width}x${expected.height}, got ${asset.width}x${asset.height}`,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}
