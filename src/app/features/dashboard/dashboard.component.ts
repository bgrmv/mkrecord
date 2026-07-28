import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CategoryEnum } from '@app/constants';
import type { PortfolioDraft } from '@entities/portfolio-item/portfolio-item.model';
import { PortfolioAdminStore } from '@services/portfolio-admin/portfolio-admin.store';
import { DashboardClipFormComponent } from './dashboard-clip-form.component';
import { DashboardClipListComponent } from './dashboard-clip-list.component';
import { DashboardStatusBarComponent } from './dashboard-status-bar.component';

/**
 * Editing deck for the portfolio: two reels on the left, one slate on the right.
 *
 * Holds no state of its own — it reads {@link PortfolioAdminStore} query signals and
 * forwards child outputs to store commands (CLAUDE.md rule 3).
 */
@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DashboardStatusBarComponent,
    DashboardClipListComponent,
    DashboardClipFormComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  protected readonly store = inject(PortfolioAdminStore);
  protected readonly CategoryEnum = CategoryEnum;

  public constructor() {
    // load() is idempotent and the iteration-1 adapter resolves synchronously, so this is
    // safe during SSR; void marks the promise as intentionally unawaited (no-floating-promises)
    void this.store.load();
  }

  protected onSave(draft: PortfolioDraft): void {
    this.store.upsert(draft);
  }

  protected onMove(event: { id: string; delta: number }): void {
    this.store.move(event.id, event.delta);
  }

  protected onCommit(): void {
    void this.store.commit();
  }
}
