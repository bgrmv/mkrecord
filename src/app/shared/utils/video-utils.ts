export async function ensureBackgroundPlay(
  video: HTMLVideoElement,
  timeout = 100
): Promise<void> {
  setPlaybackProps(video);

  try {
    video.load();
  } catch {}

  await waitForPlayable(video, timeout);

  try {
    await video.play();
  } catch (e) {
    console.warn(
      'Background video autoplay blocked, will retry on user interaction',
      e
    );
    await waitForUserInteractionPlay(video);
  }
}

function setPlaybackProps(video: HTMLVideoElement) {
  try {
    video.muted = true;
    video.autoplay = true;
    (video as any).playsInline = true;
  } catch {}
}

function waitForPlayable(video: HTMLVideoElement, timeout: number) {
  return new Promise<void>(resolve => {
    if (video.readyState >= 3) return resolve();

    let resolved = false;
    const onResolve = () => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve();
    };

    const onCanPlayThrough = () => onResolve();
    const onCanPlay = () => onResolve();
    const timer = setTimeout(onResolve, timeout);

    function cleanup() {
      clearTimeout(timer);
      video.removeEventListener('canplaythrough', onCanPlayThrough);
      video.removeEventListener('canplay', onCanPlay);
    }

    video.addEventListener('canplaythrough', onCanPlayThrough);
    video.addEventListener('canplay', onCanPlay);
  });
}

function waitForUserInteractionPlay(video: HTMLVideoElement) {
  return new Promise<void>(resolve => {
    const tryPlay = async () => {
      try {
        await video.play();
        removeListeners();
        resolve();
      } catch {}
    };

    const removeListeners = () => {
      document.removeEventListener('click', onUser);
      document.removeEventListener('touchstart', onUser);
      document.removeEventListener('keydown', onUser);
    };

    const onUser = () => void tryPlay();

    document.addEventListener('click', onUser, { once: true });
    document.addEventListener('touchstart', onUser, { once: true });
    document.addEventListener('keydown', onUser, { once: true });
  });
}
