import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-splash-screen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      /* ── Keyframes ─────────────────────────────────────────────── */

      @keyframes blink-rec {
        0%,
        49% {
          opacity: 1;
        }
        50%,
        100% {
          opacity: 0.15;
        }
      }

      /* horizontal bar sweeping top → bottom — simulates a camera light meter scan */
      @keyframes sweep {
        from {
          top: -120px;
        }
        to {
          top: 110%;
        }
      }

      /* random translate shifts create film-grain jitter without a real noise texture */
      @keyframes grain {
        0% {
          transform: translate(0, 0);
        }
        20% {
          transform: translate(-2%, -1%);
        }
        40% {
          transform: translate(1%, 2%);
        }
        60% {
          transform: translate(-1%, 1%);
        }
        80% {
          transform: translate(2%, -2%);
        }
        100% {
          transform: translate(0, 0);
        }
      }

      @keyframes locked-in {
        from {
          opacity: 0;
          transform: translateY(8px) scale(0.94);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* ── Host ──────────────────────────────────────────────────── */

      :host {
        position: fixed;
        inset: 0;
        z-index: 99999;
        /* use repeating-linear-gradient CRT scanline texture because it's a pure-CSS
           approximation of the physical scan-line look, zero extra assets */
        background:
          repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 2px,
            rgba(0, 0, 0, 0.1) 2px,
            rgba(0, 0, 0, 0.1) 4px
          ),
          #050101;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        /* use --_red: #e02020 (hue 0°) — same convention as contacts-me.component */
        --_red: #e02020;
        --_green: #00e87c;
      }

      /* ── Atmospheric effects ──────────────────────────────────── */

      /* grain: SVG feTurbulence noise embedded as data-URI background —
         animated with step() timing to randomise the tile position each frame */
      .grain {
        position: absolute;
        inset: -80px;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        background-size: 180px 180px;
        opacity: 0.038;
        animation: grain 0.45s steps(1) infinite;
        pointer-events: none;
        z-index: 1;
      }

      /* vignette: standard radial gradient that darkens edges — frames the centre */
      .vignette {
        position: absolute;
        inset: 0;
        background: radial-gradient(
          ellipse at 50% 50%,
          transparent 38%,
          rgba(0, 0, 0, 0.75) 100%
        );
        pointer-events: none;
        z-index: 2;
      }

      /* sweep: thin gradient bar that drifts top→bottom like a camera light meter line */
      .sweep {
        position: absolute;
        left: 0;
        right: 0;
        height: 120px;
        background: linear-gradient(
          to bottom,
          transparent,
          rgba(224, 32, 32, 0.045) 50%,
          transparent
        );
        animation: sweep 4s linear infinite;
        pointer-events: none;
        z-index: 3;
      }

      /* ── Splash wrapper ───────────────────────────────────────── */

      .splash {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;

        &.exit {
          display: none;
        }
      }

      /* HUD corner brackets — same pattern as contacts-me.component for brand consistency */
      .corner {
        position: absolute;
        width: 22px;
        height: 22px;
        border-color: var(--_red);
        border-style: solid;
        opacity: 0.45;

        &.tl {
          top: 18px;
          left: 18px;
          border-width: 2px 0 0 2px;
        }
        &.tr {
          top: 18px;
          right: 18px;
          border-width: 2px 2px 0 0;
        }
        &.bl {
          bottom: 18px;
          left: 18px;
          border-width: 0 0 2px 2px;
        }
        &.br {
          bottom: 18px;
          right: 18px;
          border-width: 0 2px 2px 0;
        }
      }

      /* ── Status area ──────────────────────────────────────────── */

      .status {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
      }

      .status-text {
        font-family: var(--font-display);
        font-size: clamp(13px, 2.2vw, 18px);
        font-weight: 700;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        color: rgba(242, 242, 242, 0.4);
        min-height: 1.2em;
        text-align: center;
      }

      .progress-track {
        width: clamp(150px, 24vw, 210px);
        height: 1px;
        background: rgba(242, 242, 242, 0.07);
        position: relative;
        overflow: hidden;
        transition: opacity 0.6s ease;

        &.done {
          opacity: 0.12;
        }
      }

      .progress-fill {
        position: absolute;
        inset: 0 auto 0 0;
        background: linear-gradient(to right, #a81010, var(--_red));
        box-shadow: 0 0 8px rgba(224, 32, 32, 0.6);
        transition: width 0.08s linear;
      }

      .progress-pct {
        font-family: var(--font-display);
        font-size: clamp(13px, 2.2vw, 18px);
        font-weight: 700;
        letter-spacing: 0.15em;
        color: rgba(224, 32, 32, 0.38);
        transition: opacity 0.6s ease;

        &.done {
          opacity: 0.12;
        }
      }

      /* ── Signal locked / unlocked overlays ───────────────────── */

      .locked,
      .unlocked {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 14px;
        background: rgba(5, 1, 1, 0.6);
        z-index: 20;
        animation: locked-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .lock-icon {
        width: 44px;
        height: 44px;
        /* currentColor inherits from parent .locked / .unlocked color */
        fill: currentColor;
        filter: drop-shadow(0 0 10px currentColor);
      }

      .locked {
        color: var(--_red);

        .locked-title {
          font-family: var(--font-display);
          font-size: clamp(13px, 2.8vw, 20px);
          font-weight: 900;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--_red);
          text-shadow:
            0 0 28px rgba(224, 32, 32, 0.65),
            0 0 60px rgba(224, 32, 32, 0.2);
          /* blink until loading begins — same rhythm as the REC dot */
          animation: blink-rec 1.1s ease-in-out infinite;
        }
      }

      .unlocked {
        color: var(--_red);

        .unlocked-title {
          font-family: var(--font-display);
          font-size: clamp(13px, 2.8vw, 20px);
          font-weight: 900;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--_red);
          text-shadow:
            0 0 20px rgba(0, 232, 124, 0.7),
            0 0 50px rgba(0, 232, 124, 0.2);
          /* reuse blink-rec so unlocked blinks with the same rhythm as locked */
          animation: blink-rec 1.1s ease-in-out infinite;
        }
      }
    `,
  ],
  template: `
    <!-- atmospheric layers -->
    <div class="grain" aria-hidden="true"></div>
    <div class="vignette" aria-hidden="true"></div>
    <div class="sweep" aria-hidden="true"></div>

    <div class="splash" [class.exit]="phase() === 'exit'">
      <!-- HUD corner brackets -->
      <span class="corner tl"></span>
      <span class="corner tr"></span>
      <span class="corner bl"></span>
      <span class="corner br"></span>

      <!-- signal-locked overlay: shown first for 300 ms before loading begins -->
      @if (phase() === 'locked') {
        <div class="locked">
          <!-- Material "lock" path — shackle closed on both sides -->
          <svg class="lock-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
          <span class="locked-title">Signal Locked</span>
        </div>
      }

      <!-- loading phase: progress bar and status text -->
      @if (phase() === 'loading') {
        <div class="status">
          <div class="status-text">{{ statusText() }}</div>
          <div class="progress-track" [class.done]="progressDone()">
            <div class="progress-fill" [style.width.%]="progress()"></div>
          </div>
          <span class="progress-pct" [class.done]="progressDone()"
            >{{ progress() }}&nbsp;%</span
          >
        </div>
      }

      <!-- signal-unlocked overlay: shown after loading completes, before exit -->
      @if (phase() === 'unlocked') {
        <div class="unlocked">
          <!-- lock_open_right: shackle connects on the left, free end lifts to the right -->
          <svg class="lock-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6 8h1V6c0-2.76 2.24-5 5-5S17 3.24 17 6h-2c0-1.66-1.34-3-3-3s-3 1.34-3 3v2H18c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2zm6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
          </svg>
          <span class="unlocked-title">Signal Unlocked</span>
        </div>
      }
    </div>
  `,
})
export class SplashScreenComponent {
  // use output() because it is the modern Angular signal-based alternative to EventEmitter
  readonly done = output<void>();

  readonly phase = signal<'locked' | 'loading' | 'unlocked' | 'exit'>('locked');
  readonly statusText = signal('INITIALIZING SIGNAL');
  readonly progress = signal(0);

  // use computed() so progressDone stays in sync with progress without manual subscriptions
  readonly progressDone = computed(() => this.progress() >= 100);

  constructor() {
    // use afterNextRender because document.fonts, requestAnimationFrame, and
    // setTimeout are browser-only APIs — afterNextRender never fires during SSR
    afterNextRender(() => {
      void this.runSequence();
    });
  }

  private async runSequence(): Promise<void> {
    // hold Signal Locked long enough for the user to read the text
    await new Promise<void>((r) => setTimeout(r, 1200));

    this.phase.set('loading');
    this.animateProgress();

    // status text cycling — three labels spread evenly across the loading window
    setTimeout(() => this.statusText.set('LOADING ASSETS'), 400);
    setTimeout(() => this.statusText.set('CALIBRATING OPTICS'), 1000);
    setTimeout(() => this.statusText.set('CAMERA READY'), 1700);

    // use Promise.all to wait for BOTH the minimum display window AND font readiness —
    // fonts.ready resolves fast when cached, so the min-delay is the real gatekeeper
    const minDelay = new Promise<void>((r) => setTimeout(r, 2200));
    await Promise.all([minDelay, document.fonts.ready]);

    this.phase.set('unlocked');
    // hold Signal Unlocked long enough for the user to register it before exit
    await new Promise<void>((r) => setTimeout(r, 1500));
    this.phase.set('exit');
    this.done.emit();
  }

  private animateProgress(): void {
    const duration = 2000;
    const start = performance.now();

    // use requestAnimationFrame because it syncs with the display refresh rate,
    // giving smooth 60 fps updates without setInterval drift
    const tick = (now: number): void => {
      // clamp to exactly 100 — never emits 101+ regardless of rAF timing jitter
      const p = Math.min(Math.floor(((now - start) / duration) * 100), 100);
      this.progress.set(p);
      if (p < 100) requestAnimationFrame(tick);
      else this.progress.set(100); // guarantee exactly 100
    };

    requestAnimationFrame(tick);
  }
}
