import { Component } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { IconService } from '../services/icon.service';

@Component({
  selector: 'app-footer',
  imports: [MatIconModule, MatButtonToggleModule],
  providers: [IconService], // see docs/todo — P1 #11: duplicate IconService provider; also in app.component.ts; add providedIn:'root' to IconService and remove both; see docs/todo/tech-debt.md#singleton-violations
  styles: [
    `
      :host {
        z-index: 100;
      }

      footer {
        width: 100%;
        bottom: 0;
        left: 0;
        text-align: center;
        /* display: grid;
    grid-template-columns: 350px 350px; */
        justify-content: center;

        .logotype {
          mat-icon {
            width: 150px;
            height: 100px;
          }
        }

        p {
          padding: 5px 0;
          font-size: 12px;
          color: var(--color_whitesmoke_darken_1);

          .brand {
            color: var(--c_red);
            font-weight: 500;
          }

          &.fullname {
            text-transform: uppercase;
            font-weight: 900;
          }

          a {
            font-weight: 300;
            color: var(--color_whitesmoke_darken_2);

            &:hover {
              color: var(--c_red);
            }
          }
        }

        .social {
          .social-group {
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: var(--c_red);
            padding: 10px;
            font-weight: 300;
          }
        }

        a:hover ::ng-deep mat-icon svg {
          fill: var(--c_red);
        }
      }
    `,
  ],
  template: `
    <footer>
      <div>
        <p class="fullname">Marek Kondratjev</p>
        <div class="social">
          <a
            href="https://t.me/mkrec_studio"
            target="_blank"
            class="social-group">
            <mat-icon svgIcon="telegram"></mat-icon>
          </a>
          <a
            href="https://www.youtube.com/@Marekus21"
            target="_blank"
            class="social-group">
            <mat-icon svgIcon="youtube"></mat-icon>
          </a>
          <a
            href="https://www.facebook.com/KondratjevM"
            target="_blank"
            class="social-group">
            <mat-icon svgIcon="facebook"></mat-icon>
          </a>
          <a
            href="https://www.instagram.com/mkrec.studio/"
            target="_blank"
            class="social-group">
            <mat-icon svgIcon="instagram"></mat-icon>
          </a>
          <a
            href="https://www.linkedin.com/in/marek-kondratjev/"
            target="_blank"
            class="social-group">
            <mat-icon svgIcon="linkedin"></mat-icon>
          </a>
          <a
            href="mailto:mkrecstudioweb@gmail.com"
            rel="noopener noreferrer"
            target="_blank"
            class="social-group">
            <mat-icon svgIcon="gmail"></mat-icon>
          </a>
        </div>
        <p>
          Copyright ©
          <span class="brand">MK Rec Studio</span>
          ‒ 2024
        </p>
        <!-- <p>
          Developed by
          <span>
            <a href="#" target="_blank"> &#64;dpaniq </a>
            /
            <a href="#" target="_blank"> &#64;Nastya </a>
            /
            <a href="#" target="_blank"> &#64;mkrec_studio </a>
            /
            <a href="#" target="_blank"> &#64;Valletta </a>
          </span>
        </p> -->
      </div>
    </footer>
  `,
})
export class FooterComponent {}
