import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CameraStageSurface } from '@/features/shopper/camera/CameraStageSurface';

function installMediaDevices(getUserMedia: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      getUserMedia,
    },
  });
}

describe('CameraStageSurface', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('starts a local-only camera preview and stops tracks on unmount', async () => {
    vi.stubEnv('VITE_CAMERA_PREVIEW_ENABLED', 'true');

    const stop = vi.fn();
    const stream = {
      getTracks: () => [{ stop }],
    } as unknown as MediaStream;
    const getUserMedia = vi.fn(() => Promise.resolve(stream));

    installMediaDevices(getUserMedia);

    const { unmount } = render(
      <CameraStageSurface
        body="Fallback body"
        label="Mirror stage"
        title="Step closer"
      />,
    );

    expect(await screen.findByLabelText(/local camera preview/i)).toBeInTheDocument();
    expect(getUserMedia).toHaveBeenCalledWith({
      audio: false,
      video: true,
    });

    unmount();
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('shows calm fallback copy when camera access is denied', async () => {
    vi.stubEnv('VITE_CAMERA_PREVIEW_ENABLED', 'true');

    installMediaDevices(
      vi.fn(() => Promise.reject(new Error('Permission denied'))),
    );

    render(
      <CameraStageSurface
        body="Fallback body"
        label="Mirror stage"
        title="Step closer"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText(/mirror preview is reduced/i)).toBeInTheDocument();
    });
    expect(screen.queryByLabelText(/local camera preview/i)).not.toBeInTheDocument();
  });
});
