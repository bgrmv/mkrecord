import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HomeBrandComponent } from '@features/home-brand.component';
import { SeoService } from '@services/seo.service';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HomeBrandComponent],
  styles: `
    :host {
      --_red: #e02020;
      --_red_dark: #a81010;
    }

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

    @keyframes slide-up {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes neon-pulse-divider {
      0%,
      100% {
        opacity: 0.75;
        box-shadow:
          0 0 6px var(--_red),
          0 0 18px rgba(224, 32, 32, 0.5);
      }
      50% {
        opacity: 1;
        box-shadow:
          0 0 10px var(--_red),
          0 0 32px rgba(224, 32, 32, 0.7),
          0 0 56px rgba(224, 32, 32, 0.25);
      }
    }

    /* ── LIGHTS — white neon pulse ── */
    @keyframes white-neon {
      0%,
      100% {
        text-shadow:
          0 0 10px #fff,
          0 0 30px rgba(255, 255, 255, 0.6),
          0 0 70px rgba(255, 255, 255, 0.3);
      }
      50% {
        text-shadow:
          0 0 20px #fff,
          0 0 60px rgba(255, 255, 255, 0.85),
          0 0 130px rgba(255, 255, 255, 0.45),
          0 0 260px rgba(255, 255, 255, 0.2);
      }
    }

    /* ── LIGHTS — arc-lamp strike: cold filament → warm tungsten flash → white ── */
    /* use discrete steps(1) timing because a smooth fade reads as a dimmer, not as a lamp igniting */
    @keyframes lights-strike {
      0%,
      14% {
        color: #6b6b6b;
        text-shadow: none;
      }
      15%,
      20% {
        color: #ffe6bf;
        text-shadow:
          0 0 12px #ffd9a0,
          0 0 34px rgba(255, 200, 130, 0.5);
      }
      21%,
      32% {
        color: #5d5d5d;
        text-shadow: none;
      }
      33%,
      40% {
        color: #fff2dc;
        text-shadow:
          0 0 18px #ffd9a0,
          0 0 46px rgba(255, 200, 130, 0.6);
      }
      41%,
      46% {
        color: #7a7168;
        text-shadow: 0 0 6px rgba(255, 200, 130, 0.25);
      }
      47%,
      100% {
        color: #fff;
        text-shadow:
          0 0 10px #fff,
          0 0 30px rgba(255, 255, 255, 0.6),
          0 0 70px rgba(255, 255, 255, 0.3);
      }
    }

    /* ── ACTI[ON] — toggle snapping live, with contact bounce ── */
    @keyframes switch-on {
      0%,
      17% {
        background-color: var(--_red_dark);
        color: rgba(255, 255, 255, 0.3);
        box-shadow: inset 0 0 0 1px rgba(224, 32, 32, 0.35);
      }
      18%,
      23% {
        background-color: var(--_red);
        color: #fff;
        box-shadow:
          0 0 14px rgba(224, 32, 32, 0.6),
          0 0 38px rgba(224, 32, 32, 0.28);
      }
      24%,
      37% {
        background-color: var(--_red_dark);
        color: rgba(255, 255, 255, 0.35);
        box-shadow: inset 0 0 0 1px rgba(224, 32, 32, 0.35);
      }
      38%,
      43% {
        background-color: var(--_red);
        color: #fff;
        box-shadow:
          0 0 18px rgba(224, 32, 32, 0.7),
          0 0 44px rgba(224, 32, 32, 0.3);
      }
      44%,
      49% {
        background-color: #6d1414;
        color: rgba(255, 255, 255, 0.55);
        box-shadow: inset 0 0 0 1px rgba(224, 32, 32, 0.4);
      }
      55%,
      100% {
        background-color: var(--_red);
        color: #fff;
        box-shadow:
          0 0 14px rgba(224, 32, 32, 0.55),
          0 0 38px rgba(224, 32, 32, 0.25);
      }
    }

    /* keep the lit state alive without competing with the already-blinking .rec-dot */
    @keyframes on-breathe {
      0%,
      100% {
        box-shadow:
          0 0 14px rgba(224, 32, 32, 0.55),
          0 0 38px rgba(224, 32, 32, 0.25);
      }
      50% {
        box-shadow:
          0 0 18px rgba(224, 32, 32, 0.7),
          0 0 48px rgba(224, 32, 32, 0.35);
      }
    }

    :host {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 28px;
    }

    .neon-divider {
      width: clamp(180px, 55%, 380px);
      height: 1px;
      background: var(--_red);
      animation: neon-pulse-divider 2.4s ease-in-out infinite;
    }

    .header {
      text-align: center;
      animation: slide-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;
      font-family: var(--font-display);


      h1 {
        font-size: clamp(22px, 5vw, 62px);
        font-weight: 900;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        margin: 0;
        line-height: 1.2;
        user-select: none;
        text-align: center;
      }

      span {
        text-align: center;
      }

      .word-divider {
        color: rgba(255, 255, 255, 0.2);
        font-size: 0.55em;
        vertical-align: middle;
        margin: 0 0.1em;
      }

      /* ── staged set call: 0.75s LIGHTS → 1.2s CAMERA → 2.1s ON, then steady loop ── */

      /* LIGHTS */
      .word-lights {
        color: #fff;
        /* strike starts at 0.75s = when .header's slide-up (0.6s + 0.15s delay) lands */
        animation:
          lights-strike 0.9s steps(1, end) 0.75s both,
          white-neon 2.8s ease-in-out 1.65s infinite;
      }

      /* CAMERA */
      .word-camera {
        color: #fff;
      }

      /* ACTION */
      .word-action {
        .red {
          position: relative;
          display: inline-block;
          /* starts in the OFF position; switch-on drives it live at 2.1s */
          color: rgba(255, 255, 255, 0.3);
          background-color: var(--_red_dark);
          box-shadow: inset 0 0 0 1px rgba(224, 32, 32, 0.35);
          /* use extra padding-left = letter-spacing (0.14em) to compensate trailing glyph spacing that shifts text visually left */
          padding: 4px 10px 4px calc(10px + 0.14em);
          border-radius: 2px;
          animation:
            switch-on 1.1s cubic-bezier(0.22, 1, 0.36, 1) 2.1s both,
            on-breathe 3.4s ease-in-out 3.2s infinite;
        }

        color: #fff;
        display: inline-block;
        transform-origin: center center;
      }
    }

    @media (max-width: 576px) {
      :host {
        gap: 20px;
        padding: 0 16px;
      }

      .neon-divider {
        width: 70%;
      }

      .header {
        animation: none;
        text-align: left;
        font-family: var(--font-display);

        text-wrap: balance;


        /* no .header entrance on mobile, so the set call starts immediately and runs tighter */
        .word-lights {
          animation-delay: 0s, 0.9s;
        }

        .red {
          animation-delay: 1.1s, 2.2s;
        }

        h1 {
          font-size: clamp(30px, 10vw, 46px);
          letter-spacing: 0.18em;
          line-height: 1.35;

          & > span {
            display: block;
            text-align: center;
          }

          .word-divider {
            display: none;
          }
        }
      }
    }

    /* this component is the first to honour reduced motion outside view-transition.css;
       every animated element must land on its FINAL state, not its initial one */
    @media (prefers-reduced-motion: reduce) {
      .header,
      .neon-divider,
      .rec-dot,
      .word-lights,
      .red {
        animation: none !important;
      }

      /* selectors are scoped under .header to outrank the nested rules above (0,2,0) */
      .header .word-lights {
        color: #fff;
        text-shadow:
          0 0 10px #fff,
          0 0 30px rgba(255, 255, 255, 0.6),
          0 0 70px rgba(255, 255, 255, 0.3);
      }

      /* .red must read as switched ON — animation:none drops switch-on's "both" fill */
      .header .red {
        color: #fff;
        background-color: var(--_red);
        box-shadow:
          0 0 14px rgba(224, 32, 32, 0.55),
          0 0 38px rgba(224, 32, 32, 0.25);
      }
    }
  `,
  template: `
    <app-home-brand />
    <div class="neon-divider"></div>
    <div class="header">
   
      <h1>
        <span class="word-lights">LIGHTS</span>
        <span class="word-divider">×</span>
        <span class="word-camera">CAMERA</span>
        <span class="word-divider">×</span>
        <span class="word-action"> ACTI<b class="red">ON</b> </span>
      </h1>
    </div>
  `,
})
export class HomePageComponent {
  constructor() {
    inject(SeoService).set({
      title: 'LIGHTS × CAMERA × ACTION',
      description:
        'Cinematic filmmaker Marek Kondratjev for hire. Mood videos, commercials, events, corporate content and social media reels.',
      keywords:
        'filmmaker for hire, videographer, cinematic video, commercial video, event videography, reels, MK Rec Studio',
      path: '/',
    });
  }
}
