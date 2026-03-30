import {
  afterNextRender,
  DestroyRef,
  inject,
  Injectable,
  NgZone,
  signal,
} from '@angular/core';
import { PlatformService } from '@services/platform.service';

// use constants for tuning the heat curve; separated from logic for readability
const HEAT_RATE = 2.0; // heat gain per second while mouse is moving (0 → 1 in ~0.5s)
const COOL_RATE = 1.0; // heat loss per second after idle delay (1 → 0 in ~1s)
const IDLE_DELAY = 1000; // ms of no movement before cooling begins

@Injectable({ providedIn: 'root' })
export class MouseHeatService {
  // use signal because it's the CQRS query primitive; components read this, never write
  readonly heat = signal(0);
  readonly x = signal(0);
  readonly y = signal(0);

  private lastMoveTime = 0;
  private lastFrameTime = 0;
  private rafId: number | null = null;
  private running = false;

  private readonly platform = inject(PlatformService);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    if (!this.platform.isBrowser) return;

    // use afterNextRender because DOM event listeners require the browser;
    // afterNextRender only executes client-side after the first paint
    afterNextRender(() => {
      const onMouseMove = (e: MouseEvent) => {
        this.x.set(e.clientX);
        this.y.set(e.clientY);
        this.lastMoveTime = performance.now();
        this.startLoop();
      };

      // use runOutsideAngular because mousemove fires hundreds of times per second;
      // signal.set() self-notifies the scheduler in zoneless mode — no zone.run() needed
      this.zone.runOutsideAngular(() => {
        document.addEventListener('mousemove', onMouseMove);
      });

      this.destroyRef.onDestroy(() => {
        document.removeEventListener('mousemove', onMouseMove);
        if (this.rafId !== null) cancelAnimationFrame(this.rafId);
      });
    });
  }

  // use on-demand rAF loop: starts on first mousemove, stops when heat decays to 0;
  // avoids wasting frames when idle
  private startLoop(): void {
    if (this.running) return;
    this.running = true;
    this.lastFrameTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  // use arrow function so `this` is bound without .bind(); called by requestAnimationFrame
  private tick = (now: number): void => {
    const dt = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    const timeSinceMove = now - this.lastMoveTime;
    const current = this.heat();

    if (timeSinceMove < IDLE_DELAY) {
      // mouse is moving or just stopped — heat up
      const next = Math.min(1, current + HEAT_RATE * dt);
      if (next !== current) this.heat.set(next);
    } else if (current > 0) {
      // mouse idle for > IDLE_DELAY — cool down
      const next = Math.max(0, current - COOL_RATE * dt);
      this.heat.set(next);
    }

    // keep loop alive while there's heat to dissipate or mouse is still "warm"
    if (this.heat() > 0 || timeSinceMove < IDLE_DELAY) {
      this.rafId = requestAnimationFrame(this.tick);
    } else {
      this.running = false;
      this.rafId = null;
    }
  };
}
