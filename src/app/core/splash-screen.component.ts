import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { PlatformService } from '@services/platform.service';

// r=68 → circumference = 2·π·68 ≈ 427.26 — used in CSS stroke-dasharray and ringOffset()
const CIRC = 427.26;

@Component({
  selector: 'app-splash-screen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      /* ── Keyframes ─────────────────────────────────────────────── */

      @keyframes blink-rec {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0.15; }
      }

      /* horizontal bar sweeping top → bottom — simulates a camera light meter scan */
      @keyframes sweep {
        from { top: -120px; }
        to   { top: 110%; }
      }

      /* random translate shifts create film-grain jitter without a real noise texture */
      @keyframes grain {
        0%   { transform: translate(0, 0); }
        20%  { transform: translate(-2%, -1%); }
        40%  { transform: translate(1%, 2%); }
        60%  { transform: translate(-1%, 1%); }
        80%  { transform: translate(2%, -2%); }
        100% { transform: translate(0, 0); }
      }

      /* overshoot-then-settle for the countdown digit — matches the springy nav tab animation */
      @keyframes number-pop {
        from { transform: scale(1.5); opacity: 0; }
        60%  { transform: scale(0.92); opacity: 1; }
        to   { transform: scale(1); opacity: 1; }
      }

      /* use focus-glow name from contacts-me.component for brand coherence across the codebase */
      @keyframes glow-pulse {
        0%, 100% {
          text-shadow:
            0 0 12px rgba(224, 32, 32, 0.55),
            1px 1px 0 #000;
        }
        50% {
          text-shadow:
            0 0 28px rgba(224, 32, 32, 0.85),
            0 0 50px rgba(224, 32, 32, 0.25),
            1px 1px 0 #000;
        }
      }

      @keyframes locked-in {
        from { opacity: 0; transform: translateY(8px) scale(0.94); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
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

        &.exit { opacity: 0; }
      }

      /* HUD corner brackets — same pattern as contacts-me.component for brand consistency */
      .corner {
        position: absolute;
        width: 22px;
        height: 22px;
        border-color: var(--_red);
        border-style: solid;
        opacity: 0.45;

        &.tl { top: 18px; left: 18px; border-width: 2px 0 0 2px; }
        &.tr { top: 18px; right: 18px; border-width: 2px 2px 0 0; }
        &.bl { bottom: 18px; left: 18px; border-width: 0 0 2px 2px; }
        &.br { bottom: 18px; right: 18px; border-width: 0 2px 2px 0; }
      }

      /* film sprocket holes — purely decorative, reinforce the celluloid metaphor */
      .sprockets {
        position: absolute;
        top: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        padding: 20px 14px;

        &.left  { left: 0; }
        &.right { right: 0; }
      }

      .hole {
        width: 13px;
        height: 9px;
        border: 1.5px solid rgba(224, 32, 32, 0.2);
        border-radius: 2px;
        background: rgba(0, 0, 0, 0.5);
        flex-shrink: 0;
      }


      /* ── Countdown ring ───────────────────────────────────────── */

      .ring-wrap {
        position: relative;
        width: clamp(130px, 20vw, 170px);
        height: clamp(130px, 20vw, 170px);
        margin-bottom: 44px;
      }

      svg.ring {
        width: 100%;
        height: 100%;
        /* rotate -90° so stroke starts at 12 o'clock */
        transform: rotate(-90deg);
        overflow: visible;

        .ring-bg {
          fill: none;
          stroke: rgba(224, 32, 32, 0.1);
          stroke-width: 1.5;
        }

        .ring-fill {
          fill: none;
          stroke: var(--_red);
          stroke-width: 2;
          /* use pre-computed CIRC constant — interpolated by TypeScript before Angular sees this string */
          stroke-dasharray: 427.26;
          stroke-linecap: round;
          filter: drop-shadow(0 0 5px rgba(224, 32, 32, 0.65));
          transition: stroke-dashoffset 0.08s linear;
        }
      }

      .ring-inner {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
      }

      /* use @if with three separate <span> elements so Angular destroys and recreates
         the DOM node on each countdown change, which re-triggers the CSS animations */
      .count-num {
        font-family: 'Orbitron', sans-serif;
        font-size: clamp(44px, 9vw, 64px);
        font-weight: 900;
        line-height: 1;
        letter-spacing: 0;
        /* text-align + width:100% ensure the digit is centred inside ring-inner */
        width: 100%;
        text-align: center;
        color: var(--_red);
        animation:
          number-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both,
          glow-pulse 2.5s ease-in-out 0.4s infinite;
      }

      .count-label {
        font-family: 'Orbitron', sans-serif;
        font-size: 7px;
        font-weight: 700;
        letter-spacing: 0.4em;
        text-transform: uppercase;
        color: rgba(242, 242, 242, 0.18);
      }

      /* ── Status area ──────────────────────────────────────────── */

      .status {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
      }

      .rec-badge {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        font-family: 'Orbitron', sans-serif;
        font-size: clamp(9px, 1.5vw, 11px);
        font-weight: 700;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        /* grey until done — same muted tone as --c_gray */
        color: #8c8c8c;
        transition: color 0.4s ease;

        &.active {
          color: rgba(224, 32, 32, 0.85);
          animation: blink-rec 1.2s ease-in-out infinite;
        }

        .rec-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          /* grey dot until done */
          background: #8c8c8c;
          box-shadow: none;
          flex-shrink: 0;
          transition: background 0.4s ease, box-shadow 0.4s ease;

          &.active {
            background: var(--_red);
            box-shadow: 0 0 7px var(--_red);
            animation: blink-rec 1.2s ease-in-out infinite;
          }
        }
      }

      .status-text {
        font-family: 'Orbitron', sans-serif;
        font-size: clamp(9px, 1.4vw, 11px);
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

        &.done { opacity: 0.12; }
      }

      .progress-fill {
        position: absolute;
        inset: 0 auto 0 0;
        background: linear-gradient(to right, #a81010, var(--_red));
        box-shadow: 0 0 8px rgba(224, 32, 32, 0.6);
        transition: width 0.08s linear;
      }

      .progress-pct {
        font-family: 'Orbitron', sans-serif;
        font-size: 8px;
        font-weight: 700;
        letter-spacing: 0.15em;
        color: rgba(224, 32, 32, 0.38);
        transition: opacity 0.6s ease;

        &.done { opacity: 0.12; }
      }

      /* ── Signal locked overlay ────────────────────────────────── */

      .locked {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        background: rgba(5, 1, 1, 0.6);
        z-index: 20;
        animation: locked-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;

        .locked-title {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(13px, 2.8vw, 20px);
          font-weight: 900;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--_red);
          text-shadow:
            0 0 28px rgba(224, 32, 32, 0.65),
            0 0 60px rgba(224, 32, 32, 0.2);
          /* blink until done.emit() — same rhythm as the REC dot */
          animation: blink-rec 1.1s ease-in-out infinite;
        }

        .locked-sub {
          font-family: 'Orbitron', sans-serif;
          font-size: 8px;
          font-weight: 400;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(242, 242, 242, 0.3);
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

      <!-- countdown ring with SVG progress circle -->
      

       @if (phase() === 'loading') {
      <!-- status: REC badge → status text → progress bar -->
      <div class="status">
        <!-- <div class="rec-badge" [class.active]="progressDone()">
          <span class="rec-dot" [class.active]="progressDone()"></span>
          Signal Ready
        </div> -->

        <p class="status-text">{{ statusText() }}</p>

        <div class="progress-track" [class.done]="progressDone()">
          <div class="progress-fill" [style.width.%]="progress()"></div>
        </div>

        <span class="progress-pct" [class.done]="progressDone()">{{ progress() }}&nbsp;%</span>
      </div>
       }

      <!-- signal-locked overlay appears briefly before exit -->
      @if (phase() === 'ready') {
        <div class="locked">
          <span class="locked-title">Signal Locked</span>
        </div>
      }

    </div>
  `,
})
export class SplashScreenComponent {
  private readonly platform = inject(PlatformService);

  // use output() because it is the modern Angular signal-based alternative to EventEmitter
  readonly done = output<void>();

  readonly phase = signal<'loading' | 'ready' | 'exit'>('loading');
  readonly countdown = signal<3 | 2 | 1>(3);
  readonly statusText = signal('INITIALIZING SIGNAL');
  readonly progress = signal(0);

  // use computed() so ringOffset stays in sync with progress without manual subscriptions
  readonly ringOffset = computed(() => CIRC * (1 - this.progress() / 100));

  // true once the bar hits 100 — drives CSS class changes in the template
  readonly progressDone = computed(() => this.progress() >= 100);


  readonly holes = Array(10).fill(0);

  constructor() {
    // use afterNextRender because document.fonts, requestAnimationFrame, and
    // setTimeout are browser-only APIs — afterNextRender never fires during SSR
    afterNextRender(() => {
      void this.runSequence();
    });
  }

  private async runSequence(): Promise<void> {
    this.animateProgress();

    // status text cycling — each label is visible ~1.2–1.5s before the next
    setTimeout(() => this.statusText.set('LOADING ASSETS'),    800);
    setTimeout(() => this.countdown.set(2),                   1600);
    setTimeout(() => this.statusText.set('CALIBRATING OPTICS'), 2000);
    setTimeout(() => this.countdown.set(1),                   3200);
    setTimeout(() => this.statusText.set('CAMERA READY'),     3600);

    // use Promise.all to wait for BOTH the minimum display window AND font readiness —
    // fonts.ready resolves fast when cached, so the min-delay is the real gatekeeper
    const minDelay = new Promise<void>((r) => setTimeout(r, 4400));
    await Promise.all([minDelay, document.fonts.ready]);

    this.phase.set('ready');
    // use 2500ms so "Signal Locked" blinks visibly before fade-out
    await new Promise<void>((r) => setTimeout(r, 2500));
    this.phase.set('exit'); // triggers opacity:0 CSS transition (0.65s)
    await new Promise<void>((r) => setTimeout(r, 680)); // outlast the transition
    this.done.emit();
  }

  private animateProgress(): void {
    const duration = 4200;
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
