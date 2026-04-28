import type { BaseCommand } from '@/adapters/contracts/shared';
import type {
  CalibrationProfileId,
  ColorId,
  GarmentId,
  GarmentVariantId,
  ShopperInputMethod,
  SizeCode,
} from '@/types/shared';

export type ShopperCommand =
  | BaseCommand<'shopper.session.start', { input: ShopperInputMethod }>
  | BaseCommand<
      'shopper.session.end',
      { reason: 'userRequested' | 'timeout' | 'systemReset' }
    >
  | BaseCommand<'shopper.catalog.selectGarment', { garmentId: GarmentId }>
  | BaseCommand<'shopper.catalog.selectSize', { sizeCode: SizeCode }>
  | BaseCommand<
      'shopper.catalog.selectColor',
      { colorId: ColorId; variantId?: GarmentVariantId }
    >
  | BaseCommand<'shopper.navigation.openCatalog', Record<string, never>>
  | BaseCommand<'shopper.navigation.openFitDetails', Record<string, never>>
  | BaseCommand<'shopper.navigation.returnToTryOn', Record<string, never>>;

export type AdminCommand =
  | BaseCommand<
      'admin.calibration.start',
      { profileId?: CalibrationProfileId }
    >
  | BaseCommand<'admin.calibration.cancel', Record<string, never>>
  | BaseCommand<'admin.health.refresh', Record<string, never>>
  | BaseCommand<'admin.logs.refresh', Record<string, never>>
  | BaseCommand<'admin.catalog.refresh', Record<string, never>>;
