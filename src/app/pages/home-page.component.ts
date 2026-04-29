import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HomeBrandComponent } from '@features/home-brand.component';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HomeBrandComponent],
  styles: `
    :host { --_red: #e02020; --_red_dark: #a81010 }

    @keyframes blink-rec {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0.15; }
    }

    @keyframes slide-up {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes neon-pulse-divider {
      0%, 100% { opacity: 0.75; box-shadow: 0 0 6px var(--_red), 0 0 18px rgba(224,32,32,0.5); }
      50%      { opacity: 1;    box-shadow: 0 0 10px var(--_red), 0 0 32px rgba(224,32,32,0.7), 0 0 56px rgba(224,32,32,0.25); }
    }

    /* ── LIGHTS — white neon pulse ── */
    @keyframes white-neon {
      0%, 100% { text-shadow: 0 0 10px #fff, 0 0 30px rgba(255,255,255,0.6), 0 0 70px rgba(255,255,255,0.3); }
      50%      { text-shadow: 0 0 20px #fff, 0 0 60px rgba(255,255,255,0.85), 0 0 130px rgba(255,255,255,0.45), 0 0 260px rgba(255,255,255,0.2); }
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

      .rec-badge {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        font-size: clamp(14px, 1.5vw, 24px);
        font-weight: 700;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: rgba(224, 32, 32, 0.65);
        margin-bottom: 14px;

        .rec-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--_red);
          box-shadow: 0 0 7px var(--_red);
          animation: blink-rec 1.2s ease-in-out infinite;
        }
      }

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

      /* LIGHTS */
      .word-lights {
        color: #fff;
        animation: white-neon 2.8s ease-in-out infinite;
      }

      /* CAMERA */
      .word-camera {
        .cam {
          color: #fff;
          background: var(--_red);
          /* use extra padding-left = letter-spacing (0.14em) to compensate trailing glyph spacing that shifts text visually left */
          padding: 4px 10px 4px calc(10px + 0.14em);
          border-radius: 2px;
        }

        .era {
          color: #fff;
        }
      }

      /* ACTION */
      .word-action {
        .red {
          color: #fff;
          background: var(--_red);
          /* use extra padding-left = letter-spacing (0.14em) to compensate trailing glyph spacing that shifts text visually left */
          padding: 4px 10px 4px calc(10px + 0.14em);
          border-radius: 2px;
        }

        color: #fff;
        display: inline-block;
        transform-origin: center center;
      }
    }

    @media (max-width: 576px) {
      :host { gap: 20px; padding: 0 16px; }

      .neon-divider { width: 70%; }

      .header {
        animation: none;
        text-align: left;
        font-family: var(--font-display);

        wrap: balance;

        .rec-badge { display: none; }

        h1 {
          font-size: clamp(30px, 10vw, 46px);
          letter-spacing: 0.18em;
          line-height: 1.35;

          & > span { display: block; text-align: center; }

          .word-divider { display: none; }
        }
      }
    }
  `,
  template: `
    <app-home-brand />
    <div class="neon-divider"></div>
    <div class="header">
      <div class="rec-badge">
        <span class="rec-dot"></span>
        On Set
      </div>
      <h1>
        <span class="word-lights">LIGHTS</span>
        <span class="word-divider">×</span>
        <span class="word-camera"><b class="cam">CAM</b>ERA</span>
        <span class="word-divider">×</span>
        <span class="word-action">
          ACTI<b class="red">ON</b>
        </span>
      </h1>
    </div>
  `,
})
export class HomePageComponent {}
