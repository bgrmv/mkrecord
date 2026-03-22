import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toggleFullscreen } from '@shared/utils/fullscreen-api';
import { MatIconModule } from '@angular/material/icon';
import { PlatformService } from '@services/platform.service';

@Component({
  selector: 'app-intro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.css',
})
export class IntroComponent {
  private readonly platform = inject(PlatformService);

  async onPlay() {
    // use PlatformService.isBrowser because document.getElementById is not available during SSR
    if (!this.platform.isBrowser) return;

    const videoTarget = document.getElementById('vid');
    if (videoTarget) {
      // TODO: move it to service
      await toggleFullscreen(videoTarget as HTMLVideoElement);
    }
  }
}
