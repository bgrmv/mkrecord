import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PlatformService } from '@services/platform.service';
import { browserInterval } from '@shared/utils/ssr-rxjs';
import { map, startWith } from 'rxjs';

const cameraQualities = ['FHD', 'QHD 2K', 'UHD 4K', '8K UHD'];

function randomChoice(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

@Component({
  selector: 'app-camera-quality-resolution',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],

  styles: [
    `
      div {
        font-family: var(--font-display);
        padding: 2px;
        font-weight: 400;
        color: var(--color_whitesmoke_darken_4);
        border: 1px solid var(--color_whitesmoke_darken_4);
        width: max-content;
      }
    `,
  ],
  // see docs/todo/angular-modern-api.md — A1: use toSignal() because async pipe adds CommonModule dependency and doesn't integrate with zoneless change detection
  template: `<div>{{ quality$ | async }}</div>`,
})
export class CameraQualityResolutionComponent {
  // use browserInterval because bare interval() creates an uncleanable timer leak during SSR
  protected quality$ = browserInterval(inject(PlatformService), 3000).pipe(
    startWith(randomChoice(cameraQualities)),
    map(() => randomChoice(cameraQualities)),
  );
}
