import {
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { interval, map } from 'rxjs';
import { PlatformService } from '../../services/platform.service';

const batteryIcons = [
  'battery_1_bar',
  'battery_2_bar',
  'battery_3_bar',
  'battery_4_bar',
  'battery_5_bar',
  'battery_full',
];

@Component({
  selector: 'app-camera-battery',
  imports: [MatIconModule],
  styles: [
    `
      :host {
        writing-mode: vertical-lr;
        text-orientation: sideways-left;
        padding-right: 10px;
      }

      mat-icon {
        color: var(--color_whitesmoke_darken_4);
        transform: scale(2);
      }

      @media (max-width: 576px) {
        mat-icon {
          transform: scale(2);
        }
      }
    `,
  ],
  template: ` <mat-icon [fontIcon]="batteryIcon()" /> `,
})
export class CameraBatteryComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformService = inject(PlatformService);

  // see docs/todo/tech-debt.md#cqrs--state-ownership-violations — C1: these writable signals are application state, should be owned by CameraStateService
  protected readonly batterySignal = signal<boolean>(true);
  protected readonly batteryIcon = signal<string>(batteryIcons.at(3)!);

  ngOnInit() {
    // Run on browser;
    if (this.platformService.isBrowser) {
      interval(1500) // see docs/todo — P2 #14: magic number 1500, extract to named constant
        .pipe(
          map(timer => timer % 2 === 0),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(timer => {
          this.batterySignal.update(() => timer);

          this.batteryIcon.set(batteryIcons.at(timer ? 2 : 3)!);
        });
    }
  }
}
