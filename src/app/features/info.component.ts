import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-info',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDivider],
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        max-width: 1300px;

        justify-content: center;
        align-items: start;
        height: 100%;
      }

      section {
        display: flex;
        justify-content: center;
        flex-direction: column;
        width: 100%;

        a {
          font-weight: 900;
        }

        h2 {
          font-weight: 700;
          font-size: calc(12px + 1vw);
          text-align: left; /* see docs/todo/ui — U5 */
        }

        h5 {
          color: var(--c_red);
          font-weight: 500;
          font-size: calc(11px + 1vw);
          margin-bottom: 6px; /* see docs/todo/ui — U7 */
        }

        p {
          font-size: calc(10px + 1vw);
          wrap: balance;
        }

        & > div {
          padding: 5px;
        }

        .regalias-container {
          .regalias {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 12px;
          }

          .regalia {
            margin: 15px;
            padding: 10px 15px;
          }
        }

        .experiences-container {
          .experiences {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 12px;
          }

          .experience {
            margin: 15px;
            padding: 10px 15px;
          }
        }
      }

      .regalia,
      .experience {
        transition: transform 0.3s ease;
      }

      .regalia:hover,
      .experience:hover {
        transform: scale(1.05) translateY(-3px);
      }

      @media (hover: none) {
        /* see docs/todo/ui — M4 */
        .regalia,
        .experience {
          transform: none !important;
        }
      }

      @media (max-width: 576px) {
        br {
          display: none;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          margin: 2px 0;
        }

        section {
          --gridGap: 0;
          position: relative;

          a {
            font-weight: var(--fontWeight);
          }

          h2 {
            font-weight: 500;
            font-size: calc(11px + 1vw);
            text-shadow: 1px 1px 1px black;
          }

          h5 {
            color: var(--c_red);
            font-weight: 500;
            font-size: calc(9px + 1vw);
          }

          p {
            font-size: calc(8px + 1vw);
          }

          .regalias-container {
            padding: 0 0 20px;
            .regalias {
              display: grid;
              grid-template-columns: 1fr;
              gap: var(--gridGap);
            }

            .regalia {
              margin: 0px;
              padding: 5px 5px;
            }
          }

          .experiences-container {
            padding: 0;
            .experiences {
              display: grid;
              grid-template-columns: 1fr;
              gap: var(--gridGap);
            }

            .experience {
              margin: 0px;
              padding: 5px 5px;
            }
          }
        }
      }
    `,
  ],
  template: `
    <section>
      <div class="regalias-container">
        <h2>Regalias</h2>
        <br />
        <mat-divider />
        <br />
        <div class="regalias">
          @for (regalia of regalias; track regalia.subject) {
            <div class="regalia">
              <h5>★ {{ regalia.subject | uppercase }}</h5>
              <p>{{ regalia.text | lowercase }}</p>
            </div>
          }
        </div>
      </div>

      <div class="experiences-container">
        <h2>Experience</h2>
        <br />
        <mat-divider />
        <br />
        <div class="experiences">
          @for (exp of experiences; track exp.subject) {
            <div class="experience">
              <h5>★{{ exp.subject | uppercase }}</h5>
              <p>{{ exp.text | lowercase }}</p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class InfoComponent {
  readonly regalias = [
    {
      subject: 'Cinematography',
      text: 'Participation in the creation of more than 30 projects covering various genres, from short films to documentaries',
    },
    {
      subject: 'Video Editing',
      text: 'Edited 20 films using advanced editing techniques to achieve high quality and cinematic style',
    },
    {
      subject: 'Solo Expertise',
      text: 'Unique ability to work individually, from conceptualization to final editing',
    },
  ];
  readonly experiences = [
    {
      subject: 'International Projects',
      text: 'First place at the Venice Film Festival',
    },
    {
      subject: 'Corporate Filming',
      text: 'Successful participation in the filming of more than 10 corporate events',
    },
    {
      subject: 'Individual Approach',
      text: 'Effective work from project idea to final editing - over 30 projects',
    },
    {
      subject: 'Teamwork',
      text: 'Successful collaboration with a professional team in over 30 projects',
    },
    {
      subject: 'Technologies',
      text: 'Use of a drone for unique video perspectives',
    },
  ];
}
