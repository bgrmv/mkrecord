import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { InfoComponent } from '@features/info.component';

@Component({
  selector: 'app-info-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InfoComponent, MatIconModule],
  template: `
    <header class="page-header">
      <div class="rec-badge">
        <span class="rec-dot"></span>
        Live Feed
      </div>
      <h1>The Filmmaker</h1>
      <div class="divider">
        <mat-icon fontIcon="info" />
      </div>
    </header>
    <app-info />
  `,
  styles: [
    `
      @keyframes focus-glow {
        0%, 100% {
          text-shadow:
            0 0 10px rgba(224, 32, 32, 0.5),
            1px 1px 0 rgb(0, 0, 0);
        }
        50% {
          text-shadow:
            0 0 22px rgba(224, 32, 32, 0.8),
            0 0 40px rgba(224, 32, 32, 0.3),
            1px 1px 0 rgb(0, 0, 0);
        }
      }

      @keyframes blink-rec {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0.15; }
      }

      @keyframes slide-up {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }

      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
        width: 100%;
        overflow: hidden;
        --_red: #e02020;
      }

      app-info {
        flex: 1;
        min-height: 0;
        width: 100%;
      }

      .page-header {
        flex-shrink: 0;
        width: 100%;
        text-align: center;
        padding: 20px 24px 0;
        font-family: var(--font-display);
        animation: slide-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;

        .rec-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: clamp(7px, 1.5vw, 9px);
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(224, 32, 32, 0.65);
          margin-bottom: 10px;

          .rec-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--_red);
            box-shadow: 0 0 7px var(--_red);
            animation: blink-rec 1.2s ease-in-out infinite;
          }
        }

        h1 {
          font-size: clamp(18px, 3.5vw, 28px);
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--_red);
          margin: 0 0 12px;
          line-height: 1.15;
          animation: focus-glow 2.8s ease-in-out infinite;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 14px;
          max-width: 300px;
          margin: 0 auto;

          &::before,
          &::after {
            content: '';
            flex: 1;
            height: 1px;
            background: linear-gradient(
              to var(--_dir, right),
              transparent 0%,
              rgba(224, 32, 32, 0.35) 100%
            );
          }

          &::before { --_dir: right; }
          &::after  { --_dir: left; }

          mat-icon {
            font-size: 15px;
            width: 15px;
            height: 15px;
            color: var(--_red);
            opacity: 0.6;
          }
        }
      }
    `,
  ],
})
export class InfoPageComponent {}
