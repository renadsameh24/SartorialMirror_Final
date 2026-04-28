export type LocalCameraPreviewController = {
  start: () => Promise<MediaStream>;
  stop: () => void;
};

type LocalCameraPreviewOptions = {
  mediaDevices?: Pick<MediaDevices, 'getUserMedia'>;
};

export function stopMediaStream(stream: MediaStream | null) {
  for (const track of stream?.getTracks() ?? []) {
    track.stop();
  }
}

export function createLocalCameraPreview(
  options: LocalCameraPreviewOptions = {},
): LocalCameraPreviewController {
  let activeStream: MediaStream | null = null;

  return {
    async start() {
      const mediaDevices = options.mediaDevices ?? navigator.mediaDevices;

      if (!mediaDevices?.getUserMedia) {
        throw new Error('Local camera preview is unavailable.');
      }

      activeStream = await mediaDevices.getUserMedia({
        audio: false,
        video: true,
      });

      return activeStream;
    },
    stop() {
      stopMediaStream(activeStream);
      activeStream = null;
    },
  };
}
