import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  viewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { PORTFOLIO_LIST } from './constants';

const ITEM_WIDTH = 800; // see docs/todo — P2 #14: magic number, extract to named constant in constants.ts

@Component({
  selector: 'app-portfolio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, MatIconModule, NgOptimizedImage],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.css',
  providers: [],
})
export class PortfolioComponent {
  readonly portfolioList = PORTFOLIO_LIST; // see docs/todo/deprecated.md#featuresportfolioportfolio-componentts — never used in template, delete

  readonly dialog = inject(MatDialog);

  protected scrollContainerRef = viewChild<HTMLElement>('scrollContainer'); // see docs/todo/tech-debt.md#angular-quirks — contentChild used instead of ViewChild due to Angular timing issues; should be refactored when Angular releases fixes for ViewChild timing

  // see docs/todo/angular-modern-api.md — K1: use signal() because with zoneless change detection, plain mutable fields don't trigger view updates
  disabledLeft = true;
  disabledRight = false;

  // see docs/todo/angular-modern-api.md — D1: use host property in @Component because it centralizes all host bindings in metadata, making them visible at a glance
  @HostListener('document:keydown', ['$event'])
  setScroll(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      console.log(event.key);
      this.onScrollLeft();
    }

    if (event.key === 'ArrowRight') {
      this.onScrollRight();
    }
  }

  onScrollLeft() {
    const scrollRef = this.scrollContainerRef();
    if (!scrollRef) return;

    const scrolled = scrollRef.scrollLeft;

    // Ensure scrolled is a multiple of ITEM_WIDTH to avoid misalignment
    const finalWidth = Math.max(
      0,
      Math.floor(scrolled / ITEM_WIDTH) * ITEM_WIDTH - ITEM_WIDTH,
    );
    scrollRef.scrollLeft = finalWidth;

    this.disabledLeft = finalWidth === 0;
    this.disabledRight = false;

    console.log({ scrolled, finalWidth });
  }

  onScrollRight() {
    const container = this.scrollContainerRef();
    if (!container) return;

    const scrollWidth = container.scrollWidth;
    const scrolled = container.scrollLeft;
    const lastIndex = Math.floor(scrollWidth / ITEM_WIDTH) - 1;

    // Ensure scrolled is a multiple of ITEM_WIDTH to avoid misalignment
    const finalWidth = Math.min(
      scrollWidth - container.clientWidth,
      Math.floor(scrolled / ITEM_WIDTH) * ITEM_WIDTH + ITEM_WIDTH,
    );
    container.scrollLeft = finalWidth;

    this.disabledRight = finalWidth === scrollWidth - container.clientWidth;
    this.disabledLeft = false;

    console.log({ scrolled, finalWidth, lastIndex });
  }

  isCloseTo(number1: number, number2: number, tolerance = ITEM_WIDTH + 100) {
    // see docs/todo/deprecated.md#featuresportfolioportfolio-componentts — never called, delete
    // Проверяем, находится ли разница между числами в пределах заданной погрешности
    console.log(number1, number2, Math.abs(number1 - number2) <= tolerance);
    return Math.abs(number1 - number2) <= tolerance;
  }
}
