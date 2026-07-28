import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type { PortfolioAdminStatus } from '@services/portfolio-admin/portfolio-admin.store';

/**
 * Camera status strip: reads like a viewfinder overlay rather than an admin toolbar.
 * Pure view — every value arrives as an input, every action leaves as an output.
 */
@Component({
  selector: 'app-dashboard-status-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="strip">
      <span class="rec" [class.is-live]="dirty()">
        <span class="dot"></span>
        {{ dirty() ? 'REC' : 'IDLE' }}
      </span>

      <span class="sep"></span>

      <span class="metric">{{ pad(total()) }}<em>CLIPS</em></span>
      <span class="metric">{{ pad(backgrounds()) }}<em>BG</em></span>

      <span class="state" [attr.data-state]="status()">{{ stateLabel() }}</span>

      <span class="spacer"></span>

      <button
        mat-stroked-button
        type="button"
        class="ghost-btn"
        [disabled]="!dirty() || busy()"
        (click)="discard.emit()">
        Discard
      </button>

      <button
        mat-raised-button
        type="button"
        class="commit-btn"
        [class.is-armed]="dirty() && !busy()"
        [disabled]="!dirty() || busy()"
        (click)="commit.emit()">
        {{ status() === 'saving' ? 'Committing…' : 'Commit' }}
      </button>
    </div>

    @if (error(); as message) {
      <p class="alert" role="alert">
        <mat-icon fontIcon="error_outline" />
        {{ message }}
        <button
          type="button"
          class="dismiss"
          aria-label="Dismiss"
          (click)="dismiss.emit()">
          ×
        </button>
      </p>
    }
  `,
  styleUrl: './dashboard-status-bar.component.css',
})
export class DashboardStatusBarComponent {
  public readonly total = input.required<number>();
  public readonly backgrounds = input.required<number>();
  public readonly dirty = input.required<boolean>();
  public readonly busy = input.required<boolean>();
  public readonly status = input.required<PortfolioAdminStatus>();
  public readonly error = input<string | null>(null);

  public readonly commit = output<void>();
  public readonly discard = output<void>();
  public readonly dismiss = output<void>();

  protected readonly stateLabel = computed(() => {
    switch (this.status()) {
      case 'loading':
        return 'Loading';
      case 'saving':
        return 'Writing';
      case 'saved':
        return 'Committed';
      case 'error':
        return 'Fault';
      default:
        return this.dirty() ? 'Unsaved' : 'Synced';
    }
  });

  // timecode-style two-digit counters — a bare "9" would break the monospaced rhythm
  protected pad(value: number): string {
    return value.toString().padStart(2, '0');
  }
}
