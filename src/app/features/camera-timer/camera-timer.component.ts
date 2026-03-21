import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, map, scan } from 'rxjs';
import { PlatformService } from '../../services/platform.service';

const initialDate = new Date().setHours(0, 0, 0, 0);

@Component({
  selector: 'app-camera-timer',
  imports: [CommonModule],
  template: `<p [textContent]="timerSignal() | date: 'HH:mm:ss'"></p> `,
  styles: `
    :host {
      p {
        font-weight: 100;
        color: rgba(245, 245, 245, 0.5);
      }
    }
  `,
})
export class CameraTimerComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformService = inject(PlatformService);

  protected readonly timerSignal = signal('2024-12-31T00:00:00.000Z'); // see docs/todo/deprecated.md#featurescamera-timercamera-timer-componentts — hardcoded past date, meaningless; see docs/todo/tech-debt.md#cqrs--state-ownership-violations — C2

  ngOnInit() {
    // Run on browser;
    if (this.platformService.isBrowser) {
      const date = new Date('2024-12-31T00:00:00.000Z'); // see docs/todo/deprecated.md — hardcoded past date, decide on real behavior
      console.log(date); // see docs/todo/deprecated.md#consolelog-pollution — remove

      interval(1000) // see docs/todo — P2 #14: magic number 1000, extract to named constant
        .pipe(
          scan((acc, curr) => {
            // acc.setMilliseconds(acc.getMilliseconds() + 1); // see docs/todo/deprecated.md — dead commented line, delete
            acc.setSeconds(acc.getSeconds() + 1);
            return acc;
          }, date),
          map(timer => timer.toISOString().slice(0, 23)),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(timer => {
          this.timerSignal.update(() => timer);
        });
    }
  }
}
