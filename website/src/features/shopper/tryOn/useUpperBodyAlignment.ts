import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';

import {
  FilesetResolver,
  PoseLandmarker,
  type NormalizedLandmark,
} from '@mediapipe/tasks-vision';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import { setBackend, ready as tfReady } from '@tensorflow/tfjs-core';

export type UpperBodyAlignmentState =
  | { state: 'idle' }
  | { state: 'loadingModel' }
  | { state: 'error'; message: string }
  | {
      state: 'noPerson';
      debug?: {
        noPoseFrames: number;
        shouldersMissingFrames?: number;
        mpFramesProcessed?: number;
        video?: {
          readyState: number;
          w: number;
          h: number;
          t: number;
        };
        tf: 'idle' | 'loading' | 'ready' | 'error';
        shouldersSeen?: 'yes' | 'no';
      };
    }
  | {
      state: 'tracking';
      aligned: boolean;
      confidence: number;
      source: 'mediapipe' | 'movenet';
      landmarks: {
        leftShoulder: NormalizedLandmark;
        rightShoulder: NormalizedLandmark;
        leftElbow?: NormalizedLandmark;
        rightElbow?: NormalizedLandmark;
        leftWrist?: NormalizedLandmark;
        rightWrist?: NormalizedLandmark;
        leftHip?: NormalizedLandmark;
        rightHip?: NormalizedLandmark;
      };
    };

const POSE_LANDMARKER_TASK_URL = '/mediapipe/models/pose_landmarker_full.task';

// MediaPipe Pose landmark indices
const L_SHOULDER = 11;
const R_SHOULDER = 12;
const L_ELBOW = 13;
const R_ELBOW = 14;
const L_WRIST = 15;
const R_WRIST = 16;
const L_HIP = 23;
const R_HIP = 24;

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function dist(a: NormalizedLandmark, b: NormalizedLandmark) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function midpoint(a: NormalizedLandmark, b: NormalizedLandmark) {
  return { x: (a.x + b.x) * 0.5, y: (a.y + b.y) * 0.5 };
}

function computeAlignmentScore(args: {
  leftShoulder: NormalizedLandmark;
  rightShoulder: NormalizedLandmark;
  leftHip?: NormalizedLandmark;
  rightHip?: NormalizedLandmark;
}) {
  const { leftShoulder, rightShoulder, leftHip, rightHip } = args;
  const shoulderCenter = midpoint(leftShoulder, rightShoulder);
  const shoulderWidth = dist(leftShoulder, rightShoulder);

  // Capture target heuristics:
  // - keep shoulders roughly centered
  // - keep shoulders within an upper band
  // - keep subject at a reasonable scale (shoulderWidth) for upper-body tracking
  const centerPenalty =
    Math.abs(shoulderCenter.x - 0.5) * 1.6 + Math.abs(shoulderCenter.y - 0.38) * 1.2;

  const scalePenalty = Math.abs(shoulderWidth - 0.28) * 2.2; // too small/large
  const torsoPenalty =
    leftHip && rightHip
      ? Math.abs(Math.abs(midpoint(leftHip, rightHip).y - shoulderCenter.y) - 0.32) * 1.6
      : 0.0; // upper-body only: hips may be out of frame

  const raw = 1 - (centerPenalty + scalePenalty + torsoPenalty);
  return clamp01(raw);
}

export function useUpperBodyAlignment(videoEl: HTMLVideoElement | null) {
  const [model, setModel] = useState<PoseLandmarker | null>(null);
  const [tfDetector, setTfDetector] =
    useState<poseDetection.PoseDetector | null>(null);
  const [state, setState] = useState<UpperBodyAlignmentState>({ state: 'idle' });
  const rafMpRef = useRef<number | null>(null);
  const rafTfRef = useRef<number | null>(null);
  const lastInferMsRef = useRef<number>(0);
  const noPoseFramesRef = useRef(0);
  const shouldersMissingFramesRef = useRef(0);
  const [tfReadyState, setTfReadyState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const movenetNoPersonFramesRef = useRef(0);
  const mpFramesProcessedRef = useRef(0);

  const runningMode = useMemo(() => 'VIDEO' as const, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState({ state: 'loadingModel' });
      // Sanity checks so we never silently hang.
      try {
        const [wasmOk, modelOk] = await Promise.all([
          fetch('/mediapipe/wasm/vision_wasm_internal.wasm', { method: 'HEAD' }).then((r) => r.ok),
          fetch(POSE_LANDMARKER_TASK_URL, { method: 'HEAD' }).then((r) => r.ok),
        ]);
        if (!wasmOk || !modelOk) {
          setState({
            state: 'error',
            message:
              'Pose assets missing. Check /public/mediapipe/wasm and /public/mediapipe/models.',
          });
          return;
        }
      } catch (e) {
        setState({
          state: 'error',
          message: 'Failed to verify pose assets. Check dev server and network.',
        });
        return;
      }

      const resolver = await FilesetResolver.forVisionTasks('/mediapipe/wasm');

      if (cancelled) return;

      // Prefer GPU delegate, but fall back to CPU if GPU init fails.
      const create = async (delegate: 'GPU' | 'CPU') =>
        PoseLandmarker.createFromOptions(resolver, {
          baseOptions: {
            delegate,
            modelAssetPath: POSE_LANDMARKER_TASK_URL,
          },
          runningMode,
          numPoses: 1,
          minPoseDetectionConfidence: 0.25,
          minPosePresenceConfidence: 0.25,
          minTrackingConfidence: 0.25,
        });

      let created: PoseLandmarker;
      try {
        created = await create('GPU');
      } catch {
        created = await create('CPU');
      }

      if (cancelled) {
        created.close();
        return;
      }

      setModel(created);
      // If we got this far, the model is ready; allow the UI to advance out of "loading"
      // even before the first successful detection pass.
      setState({
        state: 'noPerson',
        debug: {
          noPoseFrames: 0,
          shouldersMissingFrames: 0,
          mpFramesProcessed: 0,
          tf: tfReadyState,
        },
      });
    }

    void load().catch((err) => {
      if (!cancelled) {
        setState({
          state: 'error',
          message: err instanceof Error ? err.message : 'Pose tracker failed to start.',
        });
      }
    });

    return () => {
      cancelled = true;
      setModel((existing) => {
        existing?.close();
        return null;
      });
    };
  }, [runningMode]);

  // Keep debug state in sync with TF readiness even if user stays in noPerson.
  useEffect(() => {
    setState((prev) => {
      if (prev.state !== 'noPerson') return prev;
      return {
        ...prev,
        debug: {
          noPoseFrames: prev.debug?.noPoseFrames ?? noPoseFramesRef.current,
          shouldersMissingFrames: prev.debug?.shouldersMissingFrames ?? shouldersMissingFramesRef.current,
          mpFramesProcessed: prev.debug?.mpFramesProcessed ?? mpFramesProcessedRef.current,
          video: prev.debug?.video ?? (videoEl
            ? {
                readyState: videoEl.readyState,
                w: videoEl.videoWidth,
                h: videoEl.videoHeight,
                t: videoEl.currentTime,
              }
            : undefined),
          tf: tfReadyState,
          shouldersSeen: prev.debug?.shouldersSeen,
        },
      };
    });
  }, [tfReadyState, videoEl]);

  // Fallback tracker: TFJS MoveNet (more tolerant on some machines).
  useEffect(() => {
    let cancelled = false;
    async function loadTf() {
      setTfReadyState('loading');
      try {
        await setBackend('webgl');
      } catch {
        // ignore, tf will pick a backend
      }
      await tfReady();
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
        },
      );
      if (cancelled) {
        detector.dispose();
        return;
      }
      setTfDetector(detector);
      setTfReadyState('ready');
    }
    // Make sure we surface TF init failures instead of silently staying idle.
    setTfReadyState('loading');
    void loadTf().catch((err) => {
      if (!cancelled) {
        setTfReadyState('error');
        // eslint-disable-next-line no-console
        console.error('[pose] MoveNet init failed', err);
      }
    });
    return () => {
      cancelled = true;
      setTfReadyState('idle');
      setTfDetector((existing) => {
        existing?.dispose();
        return null;
      });
    };
  }, []);

  useEffect(() => {
    if (!model || !videoEl) return;
    const mpModel = model;
    const video = videoEl;

    function loop() {
      rafMpRef.current = requestAnimationFrame(loop);

      if (video.readyState < 2 || video.videoWidth === 0) {
        return;
      }

      const nowMs = performance.now();
      // Throttle inference to avoid pegging CPU/GPU and to avoid relying on `currentTime`
      // which can be quirky for live MediaStreams on some browsers.
      if (nowMs - lastInferMsRef.current < 100) return;
      lastInferMsRef.current = nowMs;

      let result: ReturnType<PoseLandmarker['detectForVideo']>;
      try {
        result = mpModel.detectForVideo(video, nowMs);
      } catch (e) {
        setState({
          state: 'error',
          message: e instanceof Error ? e.message : 'Pose detection failed.',
        });
        return;
      }
      const pose = result.landmarks?.[0];

      if (!pose) {
        noPoseFramesRef.current += 1;
        shouldersMissingFramesRef.current = 0;
        setState({
          state: 'noPerson',
          debug: {
            noPoseFrames: noPoseFramesRef.current,
            shouldersMissingFrames: shouldersMissingFramesRef.current,
            mpFramesProcessed: mpFramesProcessedRef.current,
            video: {
              readyState: video.readyState,
              w: video.videoWidth,
              h: video.videoHeight,
              t: video.currentTime,
            },
            tf: tfReadyState,
          },
        });
        return;
      }

      mpFramesProcessedRef.current += 1;
      noPoseFramesRef.current = 0;
      const leftShoulder = pose[L_SHOULDER];
      const rightShoulder = pose[R_SHOULDER];
      const leftElbow = pose[L_ELBOW];
      const rightElbow = pose[R_ELBOW];
      const leftWrist = pose[L_WRIST];
      const rightWrist = pose[R_WRIST];
      const leftHip = pose[L_HIP];
      const rightHip = pose[R_HIP];

      // Upper-body only: require shoulders to exist; elbows/wrists may be intermittently missing.
      if (!leftShoulder || !rightShoulder) {
        shouldersMissingFramesRef.current += 1;
        // If pose exists but shoulders are missing, still treat as noPerson; also helps debug.
        // eslint-disable-next-line no-console
        console.debug?.('[pose] landmarks present but shoulders missing', {
          hasPose: true,
          leftShoulder: !!leftShoulder,
          rightShoulder: !!rightShoulder,
        });
        setState({
          state: 'noPerson',
          debug: {
            noPoseFrames: noPoseFramesRef.current,
            tf: tfReadyState,
            shouldersSeen: 'no',
            shouldersMissingFrames: shouldersMissingFramesRef.current,
            mpFramesProcessed: mpFramesProcessedRef.current,
            video: {
              readyState: video.readyState,
              w: video.videoWidth,
              h: video.videoHeight,
              t: video.currentTime,
            },
          },
        });
        return;
      }
      shouldersMissingFramesRef.current = 0;

      const score = computeAlignmentScore({
        leftShoulder,
        rightShoulder,
        leftHip,
        rightHip,
      });

      setState({
        state: 'tracking',
        aligned: score >= 0.68,
        confidence: score,
        source: 'mediapipe',
        landmarks: {
          leftShoulder,
          rightShoulder,
          leftElbow: leftElbow ?? undefined,
          rightElbow: rightElbow ?? undefined,
          leftWrist: leftWrist ?? undefined,
          rightWrist: rightWrist ?? undefined,
          leftHip: leftHip ?? undefined,
          rightHip: rightHip ?? undefined,
        },
      });
    }

    rafMpRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafMpRef.current) cancelAnimationFrame(rafMpRef.current);
      rafMpRef.current = null;
    };
  }, [model, tfReadyState, videoEl]);

  // If MediaPipe isn't producing poses, fall back to TFJS detector.
  useEffect(() => {
    if (!tfDetector || !videoEl) return;
    const detector = tfDetector;
    const video = videoEl;

    function loopTf() {
      rafTfRef.current = requestAnimationFrame(loopTf);
      if (video.readyState < 2 || video.videoWidth === 0) return;

      void detector
        .estimatePoses(video, { flipHorizontal: true })
        .then((poses) => {
          const p = poses?.[0];
          const k = p?.keypoints ?? [];
          // Some builds don’t populate `name`; use index fallback.
          const byName = new Map(k.flatMap((kp) => (kp.name ? [[kp.name, kp] as const] : [])));
          const kpAt = (idx: number) => (idx >= 0 && idx < k.length ? k[idx] : undefined);
          const ls = byName.get('left_shoulder') ?? byName.get('leftShoulder') ?? kpAt(5);
          const rs = byName.get('right_shoulder') ?? byName.get('rightShoulder') ?? kpAt(6);

          if (!ls || !rs || ls.score == null || rs.score == null) {
            movenetNoPersonFramesRef.current += 1;
            setState({
              state: 'noPerson',
              debug: {
                noPoseFrames: noPoseFramesRef.current,
                shouldersMissingFrames: shouldersMissingFramesRef.current,
                tf: tfReadyState,
              },
            });
            return;
          }
          if (ls.score < 0.2 || rs.score < 0.2) {
            movenetNoPersonFramesRef.current += 1;
            setState({
              state: 'noPerson',
              debug: {
                noPoseFrames: noPoseFramesRef.current,
                shouldersMissingFrames: shouldersMissingFramesRef.current,
                tf: tfReadyState,
              },
            });
            return;
          }

          // Convert pixel coords to normalized coords.
          const toLm = (kp: poseDetection.Keypoint): NormalizedLandmark => ({
            x: (kp.x ?? 0) / video.videoWidth,
            y: (kp.y ?? 0) / video.videoHeight,
            z: 0,
            visibility: kp.score ?? 0,
          });

          const leftShoulder = toLm(ls);
          const rightShoulder = toLm(rs);

          const score = computeAlignmentScore({ leftShoulder, rightShoulder });
          movenetNoPersonFramesRef.current = 0;
          setState({
            state: 'tracking',
            aligned: score >= 0.68,
            confidence: score,
            source: 'movenet',
            landmarks: {
              leftShoulder,
              rightShoulder,
            },
          });
        })
        .catch(() => undefined);
    }

    rafTfRef.current = requestAnimationFrame(loopTf);
    return () => {
      if (rafTfRef.current) cancelAnimationFrame(rafTfRef.current);
      rafTfRef.current = null;
    };
  }, [state, tfDetector, tfReadyState, videoEl]);

  return state;
}

export function useUpperBodyAlignmentFromRef(videoRef: RefObject<HTMLVideoElement | null>) {
  // React refs don’t trigger re-renders when `.current` changes, so we bridge it
  // through state once the element is mounted.
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    let raf: number | null = null;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const current = videoRef.current;
      if (current && current !== videoEl) {
        setVideoEl(current);
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [videoRef]);

  return useUpperBodyAlignment(videoEl);
}

