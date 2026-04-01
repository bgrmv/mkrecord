import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { IconService } from '@services/icon.service';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonToggleModule],
  providers: [IconService], // see docs/todo — P1 #11: duplicate IconService provider; also in app.component.ts; add providedIn:'root' to IconService and remove both; see docs/todo/tech-debt.md#singleton-violations
  styles: [
    `
      :host {
        z-index: 100;
      }

      footer {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: clamp(16px, 3vw, 32px);
        padding: 0 clamp(20px, 3vw, 40px);

        p {
          margin: 0;
          padding: 0;
          font-size: 11px;
          color: var(--color_whitesmoke_darken_2);
          white-space: nowrap;

          .brand {
            color: var(--c_red_d1);
            font-weight: 500;
          }

          &.fullname {
            text-transform: uppercase;
            font-weight: 900;
            font-size: 12px;
            letter-spacing: 0.08em;
            color: var(--color_whitesmoke_darken_1);
          }

          a {
            font-weight: 300;
            color: var(--color_whitesmoke_darken_2);

            &:hover {
              color: var(--c_red_d1);
            }
          }
        }

        .social {
          display: flex;
          align-items: center;
          gap: 0;

          .social-group {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--c_red_d1);
            padding: 6px;
            font-weight: 300;
          }
        }

        a:hover ::ng-deep mat-icon svg {
          fill: var(--c_red_d1);
        }
      }
    `,
  ],
  template: `
    <footer>
      <p class="fullname">Marek Kondratjev</p>
      <div class="social">
        <a href="https://t.me/mkrec_studio" target="_blank" class="social-group">
          <mat-icon svgIcon="telegram"></mat-icon>
        </a>
        <a href="https://www.youtube.com/@Marekus21" target="_blank" class="social-group">
          <mat-icon svgIcon="youtube"></mat-icon>
        </a>
        <a href="https://www.facebook.com/KondratjevM" target="_blank" class="social-group">
          <mat-icon svgIcon="facebook"></mat-icon>
        </a>
        <a href="https://www.instagram.com/mkrec.studio/" target="_blank" class="social-group">
          <mat-icon svgIcon="instagram"></mat-icon>
        </a>
        <a href="https://www.linkedin.com/in/marek-kondratjev/" target="_blank" class="social-group">
          <mat-icon svgIcon="linkedin"></mat-icon>
        </a>
        <a href="mailto:mkrecstudioweb@gmail.com" rel="noopener noreferrer" target="_blank" class="social-group">
          <mat-icon svgIcon="gmail"></mat-icon>
        </a>
      </div>
      <p>© <span class="brand">MK Rec Studio</span> | {{ year }}</p>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly year = new Date().getFullYear();
}
