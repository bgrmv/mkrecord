// see docs/todo — P0 #3: SSR unsafe — all document.* calls below crash on server; see docs/todo/tech-debt.md#ssr-safety
// see docs/todo/deprecated.md#sharedutilsfullscreen-apits — fullScreenChange() exported but never imported
// TODO: clear & fix

// https://developer.mozilla.org/en-US/docs/Web/API/Element/fullscreenchange_event
// https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API

// document.removeEventListener('fullscreenchange', fullScreenChange);
// document.addEventListener('fullscreenchange', fullScreenChange);

// TODO video
/**
 * 
      <video
        id="vid"
        controls
        [autoplay]="false"
        [muted]="true"
        loop="true"
        controlsList="nodownload noremoteplayback noplaybackrate pictureinpicture"
      >
        <source
          src="assets/video/test.mp4"
          type="video/mp4"
        />
      </video>
 */

export function fullScreenChange() {
  console.log('HEY');
  console.log(event);

  const fullScreenElement = document.fullscreenElement; // see docs/todo/tech-debt.md#ssr-safety
  const fullScreenEnable = document.fullscreenEnabled; // see docs/todo/tech-debt.md#ssr-safety

  console.log(fullScreenElement, fullScreenEnable);
  if (!fullScreenElement && fullScreenEnable) {
    pauseAndHideVideos();
  }
}

function pauseAndHideVideos() {
  for (const vidElement of document.querySelectorAll('video')) {
    // see docs/todo/tech-debt.md#ssr-safety
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
  if (document.fullscreenElement) {
    // see docs/todo/tech-debt.md#ssr-safety
    await document.exitFullscreen();
    pauseAndHideVideos();
  } else {
    await playAndShowVideo(target);
  }
};
