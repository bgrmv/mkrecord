import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  trigger,
  transition,
  style,
  animate,
  stagger,
  query,
} from '@angular/animations';

const fadeInUp = trigger('fadeInUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(14px)' }),
    animate(
      '550ms cubic-bezier(0.16, 0.84, 0.3, 1)',
      style({ opacity: 1, transform: 'translateY(0)' })
    ),
  ]),
]);

const staggerList = trigger('staggerList', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        stagger(90, [
          animate(
            '450ms cubic-bezier(0.16, 0.84, 0.3, 1)',
            style({ opacity: 1, transform: 'translateY(0)' })
          ),
        ]),
      ],
      { optional: true }
    ),
  ]),
]);

@Component({
  selector: 'app-info',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  animations: [fadeInUp, staggerList],
  styles: [
    `
      @keyframes levitate {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-6px);
        }
      }

      @keyframes card-glow {
        0%, 100% {
          box-shadow:
            0 0 8px rgba(224, 78, 66, 0.15),
            inset 0 0 20px rgba(224, 78, 66, 0.03);
        }
        50% {
          box-shadow:
            0 0 16px rgba(224, 78, 66, 0.25),
            inset 0 0 30px rgba(224, 78, 66, 0.06);
        }
      }

      @keyframes scanline {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100%); }
      }

      @keyframes grain-drift {
        0%, 100% { transform: translate(0, 0); }
        25% { transform: translate(-2px, 1px); }
        50% { transform: translate(1px, -1px); }
        75% { transform: translate(-1px, 2px); }
      }

      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 100%;
        padding: clamp(8px, 1.5vw, 20px);
        box-sizing: border-box;
        overflow: hidden;
      }

      section {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        gap: clamp(8px, 1.5vh, 16px);

        a {
          font-weight: 900;
        }

        h2 {
          font-weight: 700;
          font-size: clamp(16px, 2.5vw, 28px);
          text-align: left;
          margin: 0;
        }
      }

      .stroke {
        display: inline;
        color: var(--c_red_d1);
        font-weight: 700;
        letter-spacing: 0.3px;
        border-bottom: 1.5px solid var(--c_red_d1);
        padding-bottom: 1px;
        transition: color 0.3s ease, border-color 0.3s ease;

        &:hover {
          color: var(--c_red_l1);
          border-color: var(--c_red_l1);
        }
      }

      strong {
        color: var(--c_red_d1);
        font-weight: 800;
        letter-spacing: 0.5px;
      }

      /* ── Intro ── */

      .intro-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: clamp(6px, 1vh, 14px);
        padding: clamp(10px, 1.5vw, 20px);
        border-left: 3px solid var(--c_red_d1);
        background: linear-gradient(
          90deg,
          rgba(224, 78, 66, 0.05) 0%,
          transparent 40%
        );

        p {
          font-size: clamp(13px, 1.6vw, 18px);
          line-height: 1.65;
          letter-spacing: 0.025em;
          margin: 0;
          color: #e8e8e8;
          font-feature-settings: 'kern' 1, 'liga' 1;
        }

        p:first-child {
          font-size: clamp(14px, 1.8vw, 20px);
          font-weight: 300;
          color: var(--color_whitesmoke);
        }

        p:last-child {
          font-style: italic;
          color: var(--color_whitesmoke_darken_2);
        }
      }

      /* ── Cards grid ── */

      .sections-wrapper {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: 1fr;
        width: 100%;
        gap: clamp(10px, 1.5vw, 16px);
        margin-top: clamp(8px, 1.5vh, 16px);
        perspective: 1200px;
        flex: 1;
        min-height: 0;
      }

      /* ── Flip card ── */

      .card-flip {
        position: relative;
        cursor: pointer;
        animation: levitate 3.5s ease-in-out infinite;

        &:nth-child(2) { animation-delay: 0.4s; }
        &:nth-child(3) { animation-delay: 0.8s; }
      }

      .card-flip.read {
        animation: none;
      }

      .card-inner {
        position: relative;
        width: 100%;
        height: 100%;
        transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        transform-style: preserve-3d;
      }

      .card-flip.flipped .card-inner {
        transform: rotateY(180deg);
      }

      .card-face {
        position: absolute;
        inset: 0;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding: clamp(12px, 1.5vw, 20px);
        border: 1px solid var(--c_red_d1);
        background: linear-gradient(
          145deg,
          rgba(13, 13, 13, 0.92),
          rgba(30, 18, 16, 0.88)
        );
        animation: card-glow 4s ease-in-out infinite;
      }

      /* Film-grain overlay on each face */
      .card-face::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23n)" opacity="0.04"/></svg>');
        background-size: 150px;
        animation: grain-drift 8s linear infinite;
        pointer-events: none;
        z-index: 1;
      }

      /* Scanline sweep */
      .card-face::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          transparent 0%,
          rgba(224, 78, 66, 0.03) 50%,
          transparent 100%
        );
        height: 40%;
        animation: scanline 6s linear infinite;
        pointer-events: none;
        z-index: 1;
      }

      .card-back {
        transform: rotateY(180deg);
        gap: clamp(12px, 2vw, 18px);
        justify-content: center;
      }

      .card-front {
        justify-content: center;
        align-items: center;
        gap: clamp(14px, 2vw, 24px);
      }

      /* ── Card header ── */

      .card-title {
        font-family: 'Space Grotesk', Roboto, sans-serif;
        font-weight: 700;
        font-size: clamp(14px, 2.2vw, 22px);
        color: var(--c_red_d1);
        margin: 0;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        position: relative;
        z-index: 2;
      }

      .card-front .card-title {
        font-size: clamp(18px, 2.8vw, 28px);
        text-align: center;
      }

      .card-front .card-hint {
        font-size: clamp(10px, 1.2vw, 13px);
        color: var(--color_whitesmoke_darken_3);
        letter-spacing: 0.15em;
        text-transform: uppercase;
        position: relative;
        z-index: 2;
      }

      /* Red dot blink on front */
      .rec-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--c_red_d1);
        margin-right: 6px;
        vertical-align: middle;
        box-shadow: 0 0 6px var(--c_red_d1);
        animation: card-glow 2s ease-in-out infinite;
      }

      /* ── Card content ── */

      .card-back ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: clamp(6px, 1vw, 10px);
        position: relative;
        z-index: 2;
        flex: 1;
      }

      .card-back li {
        font-size: clamp(12px, 1.4vw, 16px);
        line-height: 1.6;
        letter-spacing: 0.2px;
        color: #e8e8e8;
        transition: transform 0.3s ease;

        &:hover {
          transform: translateX(4px);
        }
      }

      /* ── Corner marks (camera viewfinder) ── */

      .corner-mark {
        position: absolute;
        width: 14px;
        height: 14px;
        z-index: 2;
      }

      .corner-mark::before,
      .corner-mark::after {
        content: '';
        position: absolute;
        background: var(--c_red_d1);
      }

      .corner-tl { top: 6px; left: 6px; }
      .corner-tl::before { width: 14px; height: 1px; top: 0; left: 0; }
      .corner-tl::after { width: 1px; height: 14px; top: 0; left: 0; }

      .corner-tr { top: 6px; right: 6px; }
      .corner-tr::before { width: 14px; height: 1px; top: 0; right: 0; }
      .corner-tr::after { width: 1px; height: 14px; top: 0; right: 0; }

      .corner-bl { bottom: 6px; left: 6px; }
      .corner-bl::before { width: 14px; height: 1px; bottom: 0; left: 0; }
      .corner-bl::after { width: 1px; height: 14px; bottom: 0; left: 0; }

      .corner-br { bottom: 6px; right: 6px; }
      .corner-br::before { width: 14px; height: 1px; bottom: 0; right: 0; }
      .corner-br::after { width: 1px; height: 14px; bottom: 0; right: 0; }

      @media (hover: none) {
        .card-back li {
          transform: none !important;
        }
      }

      @media (max-width: 768px) {
        :host {
          padding: clamp(10px, 3vw, 20px);
          overflow-y: auto;
        }

        section {
          gap: clamp(12px, 3vw, 20px);
          height: auto;
        }

        .intro-container {
          padding: clamp(12px, 3vw, 20px);

          p {
            font-size: clamp(14px, 3.8vw, 18px);
            line-height: 1.6;
            margin: 0;
          }

          p:first-child {
            font-size: clamp(15px, 4.2vw, 20px);
          }
        }

        .sections-wrapper {
          grid-template-columns: 1fr;
          grid-auto-rows: auto;
          gap: clamp(12px, 3vw, 18px);
          margin-top: clamp(14px, 3vw, 24px);
          flex: none;
        }

        .card-flip {
          min-height: 180px;
        }

        .card-face {
          padding: clamp(14px, 3vw, 20px);
        }

        .card-back ul {
          gap: clamp(8px, 2vw, 12px);
        }

        .card-back li {
          font-size: clamp(13px, 3.5vw, 16px);
          line-height: 1.6;
        }

        .card-title {
          font-size: clamp(14px, 4vw, 20px);
        }

        .card-front .card-title {
          font-size: clamp(18px, 5vw, 24px);
        }

        .corner-mark {
          width: 10px;
          height: 10px;
        }
      }
    `,
  ],
  template: `
    <section>
      <div class="intro-container" [@staggerList]="3">
        <p [@fadeInUp]>
          What's up! I'm <strong>Marek</strong> - the guy who turns video into
          something <span class="stroke">modern, slick, and cinematic</span> as
          hell. I don't just shoot pretty stuff, I know how
          <span class="stroke">video actually works for business</span>. And yeah,
          I'm <strong>solid with targeting</strong> too. If you landed on this
          page, it means <span class="stroke">the ads hit the mark</span> and
          you're here for
          <span class="stroke">content that looks fire and actually brings results</span>.
        </p>
        <p [@fadeInUp]>
          You'll only see a small slice of my work here, but trust me, it's
          <strong>more than enough to know you're in the right place</strong>. I
          shoot
          <strong>mood videos, commercials, corporate stuff, interviews, events
          and even films</strong>. No idea yet? No problem.
          <span class="stroke">We'll build it together</span>. I've got your back
          <span class="stroke">from the first spark to the final cut</span>.
        </p>
        <p [@fadeInUp]>
          And yeah, if it comes down to it, I can even be your best man at your
          wedding and shoot it beautifully at the same time.
        </p>
      </div>

      <div class="sections-wrapper">
        <!-- Experience -->
        <div
          class="card-flip"
          [class.flipped]="flipped()[0]"
          [class.read]="read()[0]"
          (click)="toggleCard(0)">
          <div class="card-inner">
            <div class="card-face card-front">
              <span class="corner-mark corner-tl"></span>
              <span class="corner-mark corner-tr"></span>
              <span class="corner-mark corner-bl"></span>
              <span class="corner-mark corner-br"></span>
              <h3 class="card-title">Experience</h3>
              <span class="card-hint"><span class="rec-dot"></span>Tap to flip</span>
            </div>
            <div class="card-face card-back">
              <span class="corner-mark corner-tl"></span>
              <span class="corner-mark corner-tr"></span>
              <span class="corner-mark corner-bl"></span>
              <span class="corner-mark corner-br"></span>
              <h3 class="card-title">Experience</h3>
              <ul>
                <li>
                  <strong>10+</strong> years in the game as a videographer -
                  shooting, directing, editing, and running full projects from A
                  to Z.
                </li>
                <li>
                  <strong>5+</strong> years in the film industry, working on
                  <strong>large-scale productions</strong> and full-on crew
                  projects.
                </li>
                <li>
                  <strong>Broadcast camera operator</strong> &
                  <strong>licensed drone operator</strong>.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Clients & Projects -->
        <div
          class="card-flip"
          [class.flipped]="flipped()[1]"
          [class.read]="read()[1]"
          (click)="toggleCard(1)">
          <div class="card-inner">
            <div class="card-face card-front">
              <span class="corner-mark corner-tl"></span>
              <span class="corner-mark corner-tr"></span>
              <span class="corner-mark corner-bl"></span>
              <span class="corner-mark corner-br"></span>
              <h3 class="card-title">Clients & Projects</h3>
              <span class="card-hint"><span class="rec-dot"></span>Tap to flip</span>
            </div>
            <div class="card-face card-back">
              <span class="corner-mark corner-tl"></span>
              <span class="corner-mark corner-tr"></span>
              <span class="corner-mark corner-bl"></span>
              <span class="corner-mark corner-br"></span>
              <h3 class="card-title">Clients & Projects</h3>
              <ul>
                <li>
                  Large-scale productions:
                  <strong>Latvian Song and Dance Festival</strong> &
                  <strong>Major Budapest</strong> - projects reflecting scale &
                  level.
                </li>
                <li>
                  Major brands: <strong>LMT</strong>, <strong>H&M</strong> | Top
                  artists: <strong>LOBODA</strong> & more.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Specialization -->
        <div
          class="card-flip"
          [class.flipped]="flipped()[2]"
          [class.read]="read()[2]"
          (click)="toggleCard(2)">
          <div class="card-inner">
            <div class="card-face card-front">
              <span class="corner-mark corner-tl"></span>
              <span class="corner-mark corner-tr"></span>
              <span class="corner-mark corner-bl"></span>
              <span class="corner-mark corner-br"></span>
              <h3 class="card-title">Specialization</h3>
              <span class="card-hint"><span class="rec-dot"></span>Tap to flip</span>
            </div>
            <div class="card-face card-back">
              <span class="corner-mark corner-tl"></span>
              <span class="corner-mark corner-tr"></span>
              <span class="corner-mark corner-bl"></span>
              <span class="corner-mark corner-br"></span>
              <h3 class="card-title">Specialization</h3>
              <ul>
                <li>
                  <strong>Podcasts</strong> • <strong>Interviews</strong> •
                  <strong>Music Videos</strong> • <strong>Commercials</strong> •
                  <strong>Reports</strong> • <strong>Reels</strong> - modern
                  cinematic edge.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class InfoComponent {
  private sanitizer = inject(DomSanitizer);

  // use signal() for card flip state — zoneless-compatible reactive state
  readonly flipped = signal([false, false, false]);
  readonly read = signal([false, false, false]);

  toggleCard(index: number): void {
    const current = this.flipped();
    const next = [...current];
    next[index] = !next[index];
    this.flipped.set(next);

    if (!this.read()[index]) {
      const readState = [...this.read()];
      readState[index] = true;
      this.read.set(readState);
    }
  }

  sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
