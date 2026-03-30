import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatChipsModule } from '@angular/material/chips';
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

const sectionSlide = trigger('sectionSlide', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate(
      '700ms cubic-bezier(0.16, 0.84, 0.3, 1)',
      style({ opacity: 1, transform: 'translateY(0)' })
    ),
  ]),
]);

@Component({
  selector: 'app-info',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatChipsModule],
  animations: [fadeInUp, staggerList, sectionSlide],
  styles: [
    `
      @keyframes border-glow {
        0%, 100% {
          filter: drop-shadow(0 0 2px rgba(224, 78, 66, 0.2));
        }
        50% {
          filter: drop-shadow(0 0 3px rgba(224, 78, 66, 0.3));
        }
      }

      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        max-width: 1400px;
        height: 100%;
        padding: clamp(10px, 2vw, 30px);
        box-sizing: border-box;
        overflow: hidden;
      }

      section {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        gap: clamp(12px, 2vw, 24px);

        a {
          font-weight: 900;
        }

        h2 {
          font-weight: 700;
          font-size: clamp(16px, 2.5vw, 28px);
          text-align: left; /* see docs/todo/ui — U5 */
          margin: 0;
        }

        h3 {
          font-family: 'Space Grotesk', Roboto, sans-serif;
          font-weight: 700;
          font-size: clamp(14px, 2.2vw, 22px);
          color: var(--c_red_l1);
          margin: 0 0 clamp(8px, 1.2vw, 12px) 0;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
        }

        h5 {
          color: var(--c_red);
          font-weight: 500;
          font-size: clamp(14px, 2vw, 22px);
          margin: 0 0 6px 0; /* see docs/todo/ui — U7 */
        }

        p {
          font-size: clamp(13px, 1.8vw, 19px);
          line-height: 1.8;
          letter-spacing: 0.02em;
          margin: 0;
          color: #e8e8e8;
          font-feature-settings: 'kern' 1, 'liga' 1;
        }
      }

      .chip {
        display: inline-block;
        background-color: var(--c_red);
        color: white;
        font-weight: 700;
        font-size: 0.85em;
        padding: 6px 12px;
        border-radius: 20px;
        margin: 0 3px;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(224, 78, 66, 0.3);
        letter-spacing: 0.3px;

        &:hover {
          box-shadow: 0 4px 12px rgba(224, 78, 66, 0.5);
          transform: translateY(-2px);
        }
      }

      strong {
        color: var(--c_red);
        font-weight: 800;
        letter-spacing: 0.5px;
      }

      .intro-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: clamp(12px, 1.5vw, 18px);
      }

      .sections-wrapper {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        width: 100%;
        gap: clamp(12px, 2vw, 20px);
        flex: 1;
        min-height: 0;
        margin-top: clamp(20px, 3vw, 40px);
      }

      .section-container {
        display: flex;
        flex-direction: column;
        gap: clamp(8px, 1.5vw, 12px);
        overflow: hidden;
        padding: clamp(12px, 2vw, 18px);
        position: relative;
        background: linear-gradient(135deg, rgba(224, 78, 66, 0.06), rgba(242, 93, 80, 0.03));
        border: 2px solid var(--c_red);
        flex: 1;
        animation: border-glow 4s ease-in-out infinite;
        transition: transform 0.3s ease;

        &:hover {
          transform: translateY(-2px);
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: clamp(8px, 1.2vw, 12px);
        }

        li {
          font-size: clamp(12px, 1.5vw, 16px);
          line-height: 1.7;
          letter-spacing: 0.2px;
          color: #e8e8e8;
        }
      }

      .section-container li {
        transition: transform 0.3s ease;

        &:hover {
          transform: translateX(4px);
        }
      }

      @media (hover: none) {
        /* see docs/todo/ui — M4 */
        .section-container li {
          transform: none !important;
        }
      }

      @media (max-width: 576px) {
        :host {
          padding: clamp(8px, 1.5vw, 15px);
        }

        section {
          gap: clamp(8px, 1.5vw, 16px);
        }

        h3 {
          font-size: clamp(13px, 2.8vw, 18px);
          margin: 0 0 clamp(6px, 1vw, 10px) 0;
        }

        .intro-container {
          p {
            font-size: clamp(11px, 2.2vw, 14px);
            line-height: 1.5;
            margin: 0;
          }
        }

        .sections-wrapper {
          grid-template-columns: 1fr;
          gap: clamp(10px, 2vw, 16px);
          margin-top: clamp(12px, 2vw, 20px);
        }

        .section-container {
          gap: clamp(6px, 1vw, 10px);
          padding: clamp(10px, 1.5vw, 14px);

          ul {
            gap: clamp(6px, 1vw, 10px);
          }

          li {
            font-size: clamp(10px, 1.8vw, 13px);
            line-height: 1.4;
          }
        }
      }
    `,
  ],
  template: `
    <section>
      <div class="intro-container" [@staggerList]="introText.split('\n\n').length">
        @for (paragraph of introText.split('\n\n'); track paragraph) {
          <p [@fadeInUp] [innerHTML]="sanitize(paragraph)"></p>
        }
      </div>

      <div class="sections-wrapper">
        <div class="section-container" [@sectionSlide]>
          <h3>Experience</h3>
          <ul [@staggerList]="experience.length">
            @for (item of experience; track item) {
              <li [@fadeInUp] [innerHTML]="sanitize(item)"></li>
            }
          </ul>
        </div>

        <div class="section-container" [@sectionSlide]>
          <h3>Clients & Projects</h3>
          <ul [@staggerList]="clientsAndProjects.length">
            @for (item of clientsAndProjects; track item) {
              <li [@fadeInUp] [innerHTML]="sanitize(item)"></li>
            }
          </ul>
        </div>

        <div class="section-container" [@sectionSlide]>
          <h3>Specialization</h3>
          <ul [@staggerList]="specialization.length">
            @for (item of specialization; track item) {
              <li [@fadeInUp] [innerHTML]="sanitize(item)"></li>
            }
          </ul>
        </div>
      </div>
    </section>
  `,
})
export class InfoComponent {
  private sanitizer = inject(DomSanitizer);

  readonly introText = `What's up! I'm <strong>Marek</strong> - the guy who turns video into something <span class="chip">modern, slick, and cinematic</span> as hell. I don't just shoot pretty stuff, I know how <span class="chip">video actually works for business</span>. And yeah, I'm <strong>solid with targeting</strong> too. If you landed on this page, it means <span class="chip">the ads hit the mark</span> and you're here for <span class="chip">content that looks fire and actually brings results</span>.

You'll only see a small slice of my work here, but trust me, it's <strong>more than enough to know you're in the right place</strong>. I shoot <strong>mood videos, commercials, corporate stuff, interviews, events and even films</strong>. No idea yet? No problem. <span class="chip">We'll build it together</span>. I've got your back <span class="chip">from the first spark to the final cut</span>.

And yeah, if it comes down to it, I can even be your best man at your wedding and shoot it beautifully at the same time.`;

  readonly experience = [
    '<strong>10+</strong> years in the game as a videographer - shooting, directing, editing, and running full projects from A to Z.',
    '<strong>5+</strong> years in the film industry, working on <strong>large-scale productions</strong> and full-on crew projects.',
    '<strong>Broadcast camera operator</strong> & <strong>licensed drone operator</strong>.',
  ];

  readonly clientsAndProjects = [
    'Large-scale productions: <strong>Latvian Song and Dance Festival</strong> & <strong>Major Budapest</strong> - projects reflecting scale & level.',
    'Major brands: <strong>LMT</strong>, <strong>H&M</strong> | Top artists: <strong>LOBODA</strong> & more.',
  ];

  readonly specialization = [
    '<strong>Podcasts</strong> • <strong>Interviews</strong> • <strong>Music Videos</strong> • <strong>Commercials</strong> • <strong>Reports</strong> • <strong>Reels</strong> - modern cinematic edge.',
  ];

  sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
