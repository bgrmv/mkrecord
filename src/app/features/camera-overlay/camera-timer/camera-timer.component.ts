import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PlatformService } from '@services/platform.service';
import { browserInterval } from '@shared/utils/ssr-rxjs';
import { map, scan } from 'rxjs';

@Component({
  selector: 'app-camera-timer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `<div [textContent]="timerSignal() | date: 'HH:mm:ss'"></div> `,
  styles: `
    :host {
      div {
        font-family: var(--font-display);
        font-weight: 100;
        color: rgba(245, 245, 245, 0.5);
      }
    }
  `,
})
export class CameraTimerComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformService = inject(PlatformService);

  protected readonly timerSignal = signal('2024-12-31T00:00:00.000Z'); // see docs/todo/deprecated.md#featurescamera-timercamera-timer-componentts — hardcoded past date, meaningless; see docs/todo/tech-debt.md#cqrs--state-ownership-violations — C2

  // see docs/todo/angular-modern-api.md — C2: use constructor + afterNextRender() — same as C1; E2: use toSignal() because subscribe() only forwards values to signal
  ngOnInit() {
    // Run on browser;
    const date = new Date('2024-12-31T00:00:00.000Z'); // see docs/todo/deprecated.md — hardcoded past date, decide on real behavior
    console.log(date); // see docs/todo/deprecated.md#consolelog-pollution — remove

    // use browserInterval because bare interval() creates an uncleanable timer leak during SSR
    browserInterval(this.platformService, 1000) // see docs/todo — P2 #14: magic number 1000, extract to named constant
      .pipe(
        scan((acc) => {
          acc.setSeconds(acc.getSeconds() + 1);
          return acc;
        }, date),
        map((timer: Date) => timer.toISOString().slice(0, 23)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((timer) => {
        this.timerSignal.update(() => timer);
      });
  }
}
