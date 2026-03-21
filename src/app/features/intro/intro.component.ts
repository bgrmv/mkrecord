import { Component } from '@angular/core';
import { toggleFullscreen } from '../../shared/utils/fullscreen-api';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-intro',
    imports: [MatIconModule],
    templateUrl: './intro.component.html',
    styleUrl: './intro.component.css'
})
// see docs/todo — P0 #1: SSR unsafe; see docs/todo/tech-debt.md#ssr-safety
export class IntroComponent {
  onPlay(event: MouseEvent) {
    // console.log(event.)
    const videoTarget = document.getElementById('vid'); // see docs/todo/tech-debt.md#ssr-safety — requires PlatformService guard
    if (videoTarget) {
      // TODO: move it to service
      toggleFullscreen(videoTarget as HTMLVideoElement);
    }
  }
}
