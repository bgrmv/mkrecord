import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';

import { YOUTUBE_PLAYER_CONFIG, YouTubePlayer } from '@angular/youtube-player';
import { DeviceDetectorService } from 'ngx-device-detector';

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
  imports: [
    MatFormFieldModule,
    FormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    YouTubePlayer,
    MatButtonModule,
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

        h1 {
          color: var(--c_red);
        }
      }

      mat-dialog-container {
        background-color: transparent;
        overflow: hidden;
      }

      ::ng-deep.mat-mdc-dialog-surface {
        background-color: transparent;
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

      button.close-button {
        position: absolute;
        border-radius: 50%;
        right: 5px;
        top: 5px;
        z-index: 9999;
        text-shadow: 1px 1px 1px black;

        &:hover {
          color: var(--c_red);
        }
      }
    `,
  ],
  template: `
    <button class="close-button" mat-dialog-close mat-icon-button>✖</button>

    <!-- <h1 mat-dialog-title>{{ data.title | uppercase }}</h1> -->

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
    }
  `,
  providers: [
    {
      provide: YOUTUBE_PLAYER_CONFIG,
      useValue: {
        // loadApi: false,
      },
    },
  ],
})
export class VideoDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<VideoDialogComponent>);
  private readonly deviceSerivce = inject(DeviceDetectorService); // see docs/todo — P2 #23: typo, should be deviceService
  public readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  protected xy = computed(() =>
    this.deviceSerivce.isMobile() ? { x: 320, y: 180 } : { x: 960, y: 540 },
  );
}
