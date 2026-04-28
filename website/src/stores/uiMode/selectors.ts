import type { UiModeStore } from '@/stores/uiMode/uiModeStore';

export function selectUiMode(state: UiModeStore) {
  return state.mode;
}

export function selectIsShopperMode(state: UiModeStore) {
  return state.mode === 'shopper';
}

export function selectIsAdminMode(state: UiModeStore) {
  return state.mode === 'admin';
}
