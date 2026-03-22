// see docs/todo/deprecated.md#sharedutilsfullscreen-apits — fullScreenChange() exported but never imported

// use isBrowser guard because all document.* calls crash on the server where document is undefined
function isBrowser(): boolean {
  return typeof document !== 'undefined';
}

export function fullScreenChange() {
  if (!isBrowser()) return;

  const fullScreenElement = document.fullscreenElement;
  const fullScreenEnable = document.fullscreenEnabled;

  if (!fullScreenElement && fullScreenEnable) {
    pauseAndHideVideos();
  }
}

function pauseAndHideVideos() {
  if (!isBrowser()) return;

  for (const vidElement of document.querySelectorAll('video')) {
    vidElement.pause();
    vidElement.style.display = 'none';
  }
}

async function playAndShowVideo(target: HTMLVideoElement) {
  target.style.display = 'block';
  await target.play();
  await target.requestFullscreen();
}

export const toggleFullscreen = async (target: HTMLVideoElement) => {
  if (!isBrowser()) return;

  if (document.fullscreenElement) {
    await document.exitFullscreen();
    pauseAndHideVideos();
  } else {
    await playAndShowVideo(target);
  }
};
