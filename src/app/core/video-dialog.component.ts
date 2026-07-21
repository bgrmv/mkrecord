import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

import { YOUTUBE_PLAYER_CONFIG, YouTubePlayer } from '@angular/youtube-player';
import { DeviceDetectorService } from 'ngx-device-detector';

import { toggleElementFullscreen } from '@shared/utils/fullscreen-api';

export interface DialogData {
  url: string;
  title: string;
  preview: string;
  videoUrl: string;
  videoId: string;
  category: string;
}

@Component({
  selector: 'app-video-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // use host binding to apply class without @HostListener per CLAUDE.md rule #10
    '[class.fullscreen-mode]': 'isFullscreen()',
  },
  imports: [
    MatFormFieldModule,
    FormsModule,
    MatDialogActions,
    MatDialogClose,
    YouTubePlayer,
    MatButtonModule,
    MatIconModule,
  ],
  styles: [
    `
      :host {
        padding: 40px;
        overflow: hidden;
        border-radius: 10px;
        display: flex;
        align-items: center;
        align-content: center;
        flex-direction: column;
      }

      :host(.fullscreen-mode) {
        padding: 0;
        justify-content: center;
      }

      mat-dialog-container {
        background-color: transparent;
        overflow: hidden;
      }

      ::ng-deep .mat-mdc-dialog-surface {
        background-color: transparent;
      }

      /* override Material max-width:80vw when dialog is maximized to fullscreen */
      ::ng-deep .video-dialog-fullscreen {
        max-width: 100vw !important;
        width: 100vw !important;
        height: 100vh !important;
      }

      ::ng-deep .video-dialog-fullscreen .mat-mdc-dialog-surface {
        border-radius: 0 !important;
        background: #000 !important;
      }

      .video-wrapper {
        position: relative;
        display: block;
        overflow: hidden;
      }

      youtube-player {
        display: block;
        overflow: hidden;
      }

      /* use pointer-events:auto overlay so mousemove fires over the iframe,
         letting the cursor component track position inside the video;
         cursor:none suppresses the native browser cursor over the iframe */
      .video-overlay {
        position: absolute;
        inset: 0;
        cursor: none;
        pointer-events: auto;
      }

      ::ng-deep .youtube-player-placeholder-button {
        display: flex;
        justify-content: center;
      }

      .dialog-actions {
        width: 100%;
        padding: 8px 0 0;
        gap: 8px;
        margin: 0 auto;
      }

      .dialog-action-btn {
        color: var(--color_whitesmoke);
        text-shadow: 1px 1px 1px black;

        span {
          font-family: var(--font-display);
          letter-spacing: 0.15em;
          font-size: 12px;
          font-weight: 700;
          margin-left: 6px;
        }

        &:hover {
          color: var(--c_red);
        }
      }
    `,
  ],
  template: `
    @if (data.url) {
      <!-- see docs/todo — P0 #5: hardcoded videoId="rFGxVhX-cIo" ignores data.videoId; see docs/todo/deprecated.md#corevideo-dialog-componentts — this entire @if branch is unreachable (data.url is never set) -->
      <youtube-player
        videoId="rFGxVhX-cIo"
        [playerVars]="{ autoplay: 0, controls: 1, color: 'red' }"
        placeholderImageQuality="high"
        [disablePlaceholder]="false" />
    } @else {
      <div class="video-wrapper">
        <youtube-player
          [videoId]="data.videoId"
          [playerVars]="{ autoplay: 1, controls: 1, color: 'red', showinfo: 1 }"
          placeholderImageQuality="high"
          [disablePlaceholder]="false"
          [width]="xy().x"
          [height]="xy().y" />
        <div class="video-overlay"></div>
      </div>

      <mat-dialog-actions
        align="end"
        class="dialog-actions"
        [style.max-width.px]="xy().x">
        <button
          mat-button
          type="button"
          class="dialog-action-btn"
          aria-label="Fullscreen"
          (click)="onFullscreen()">
          <mat-icon>{{
            isFullscreen() ? 'fullscreen_exit' : 'fullscreen'
          }}</mat-icon>
          <span>{{ isFullscreen() ? 'EXIT' : 'FULLSCREEN' }}</span>
        </button>
        <button
          mat-button
          mat-dialog-close
          type="button"
          class="dialog-action-btn"
          aria-label="Close">
          <mat-icon>close</mat-icon>
          <span>CLOSE</span>
        </button>
      </mat-dialog-actions>
    }
  `,
  providers: [
    {
      provide: YOUTUBE_PLAYER_CONFIG,
      useValue: {},
    },
  ],
})
export class VideoDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<VideoDialogComponent>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly deviceSerivce = inject(DeviceDetectorService); // see docs/todo — P2 #23: typo, should be deviceService
  public readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  protected readonly isFullscreen = signal(false);

  constructor() {
    afterNextRender(() => {
      const onFullscreenChange = () => {
        const isFs = !!document.fullscreenElement;
        this.isFullscreen.set(isFs);

        if (isFs) {
          this.dialogRef.addPanelClass('video-dialog-fullscreen');
          this.dialogRef.updateSize('100vw', '100vh');
        } else {
          this.dialogRef.removePanelClass('video-dialog-fullscreen');
          this.dialogRef.updateSize();
        }
      };

      document.addEventListener('fullscreenchange', onFullscreenChange);

      this.destroyRef.onDestroy(() => {
        document.removeEventListener('fullscreenchange', onFullscreenChange);
        // exit fullscreen if the dialog is closed while fullscreen is active
        if (document.fullscreenElement) {
          void document.exitFullscreen();
        }
      });
    });
  }

  // use computed to letterbox 16:9 video within current viewport when fullscreen
  protected xy = computed(() => {
    if (this.isFullscreen()) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const byWidth = { x: vw, y: Math.round((vw * 9) / 16) };
      const byHeight = { x: Math.round((vh * 16) / 9), y: vh };
      return byWidth.y <= vh ? byWidth : byHeight;
    }
    return this.deviceSerivce.isMobile()
      ? { x: 320, y: 180 }
      : { x: 960, y: 540 };
  });

  protected onFullscreen(): void {
    void toggleElementFullscreen();
  }
}
