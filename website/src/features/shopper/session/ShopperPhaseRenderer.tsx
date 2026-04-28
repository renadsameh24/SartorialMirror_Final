import type { ReactNode } from 'react';

import type { ShopperPhaseLayout } from '@/features/shopper/session/shopperPhaseLayout';
import { usePostResetConfirmation } from '@/features/shopper/session/usePostResetConfirmation';
import { selectShopperPhase } from '@/stores/session/selectors';
import { useSessionStore } from '@/stores/session/sessionStore';
import {
  createCatalogScreenLayout,
  createDetectionScreenLayout,
  createFitDetailsScreenLayout,
  createIdleScreenLayout,
  createSessionEndConfirmationLayout,
  createTryOnScreenLayout,
  useCatalogScreenModel,
  useDetectionScreenModel,
  useFitDetailsScreenModel,
  useIdleScreenModel,
  useTryOnScreenModel,
} from '@/screens/shopper';

type ShopperPhaseRendererProps = {
  children: (layout: ShopperPhaseLayout) => ReactNode;
};

function IdlePhase({
  children,
}: ShopperPhaseRendererProps) {
  return <>{children(createIdleScreenLayout(useIdleScreenModel()))}</>;
}

function DetectionPhase({
  children,
}: ShopperPhaseRendererProps) {
  return (
    <>{children(createDetectionScreenLayout(useDetectionScreenModel(true)))}</>
  );
}

function CatalogPhase({
  children,
}: ShopperPhaseRendererProps) {
  return <>{children(createCatalogScreenLayout(useCatalogScreenModel(true)))}</>;
}

function TryOnPhase({
  children,
}: ShopperPhaseRendererProps) {
  return <>{children(createTryOnScreenLayout(useTryOnScreenModel(true)))}</>;
}

function FitDetailsPhase({
  children,
}: ShopperPhaseRendererProps) {
  return <>{children(createFitDetailsScreenLayout(useFitDetailsScreenModel()))}</>;
}

export function ShopperPhaseRenderer({
  children,
}: ShopperPhaseRendererProps) {
  const shopperPhase = useSessionStore(selectShopperPhase);
  const showPostResetConfirmation = usePostResetConfirmation();

  if (shopperPhase === 'idle' && showPostResetConfirmation) {
    return <>{children(createSessionEndConfirmationLayout())}</>;
  }

  switch (shopperPhase) {
    case 'idle':
      return <IdlePhase>{children}</IdlePhase>;
    case 'detection':
      return <DetectionPhase>{children}</DetectionPhase>;
    case 'catalog':
      return <CatalogPhase>{children}</CatalogPhase>;
    case 'tryOn':
      return <TryOnPhase>{children}</TryOnPhase>;
    case 'fitDetails':
      return <FitDetailsPhase>{children}</FitDetailsPhase>;
    case 'sessionEnd':
      return <>{children(createSessionEndConfirmationLayout())}</>;
    default:
      return <IdlePhase>{children}</IdlePhase>;
  }
}
