import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import type { PortfolioItem } from '@entities/portfolio-item/portfolio-item.model';
import { PlatformService } from '@services/platform.service';

/** One reel of clips (a single category), rendered as a strip of film frames. */
@Component({
  selector: 'app-dashboard-clip-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  templateUrl: './dashboard-clip-list.component.html',
  styleUrl: './dashboard-clip-list.component.css',
})
export class DashboardClipListComponent {
  private readonly platform = inject(PlatformService);

  public readonly heading = input.required<string>();
  public readonly code = input.required<string>();
  public readonly items = input.required<readonly PortfolioItem[]>();
  public readonly selectedId = input<string | null>(null);

  // named selectClip, not select: a bare `select` collides with the native DOM event
  // (@angular-eslint/no-output-native) and would fire on text selection inside the host
  public readonly selectClip = output<string>();
  public readonly add = output<void>();
  public readonly move = output<{ id: string; delta: number }>();
  public readonly toggleBackground = output<string>();

  /**
   * Purely presentational hover state — allowed as component-local state under the
   * project's CQRS rule, which forbids only *application* state in components.
   */
  protected readonly hoveredId = signal<string | null>(null);

  // preview <video> elements are pointless on touch (no hover) and must never be
  // instantiated during SSR, so both are gated behind one flag
  protected readonly canPreview =
    !this.platform.isMobile() && this.platform.isBrowser;

  protected slate(index: number): string {
    return (index + 1).toString().padStart(2, '0');
  }

  protected onHover(id: string | null): void {
    if (this.canPreview) this.hoveredId.set(id);
  }
}
