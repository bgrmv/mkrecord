import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { interval, map, startWith } from 'rxjs';

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
      p {
        padding: 2px;
        font-weight: 400;
        color: var(--color_whitesmoke_darken_4);
        border: 1px solid var(--color_whitesmoke_darken_4);
        width: max-content;
      }
    `,
  ],
  template: `<p>{{ quality$ | async }}</p>`,
})
export class CameraQualityResolutionComponent {
  protected quality$ = interval(3000).pipe(
    startWith(randomChoice(cameraQualities)),
    map(() => randomChoice(cameraQualities)),
  );
}
