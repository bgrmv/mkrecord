import {
  afterNextRender,
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
} from '@angular/core';
import { PlatformService } from '@services/platform.service';

@Directive({
  selector: '[parallaxItem]',
})
export class ParallaxItemDirective {
  readonly movement = input(0.025);

  private readonly eleRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platform = inject(PlatformService);

  constructor() {
    // use afterNextRender because setting DOM styles requires the element to be rendered;
    // it only runs in the browser, replacing both ngOnInit + isBrowser guard
    afterNextRender(() => {
      this.eleRef.nativeElement.style.transform = `translate(0px, 0px)`;
      this.eleRef.nativeElement.style.transition =
        'transform 0.2s allow-discrete';
    });
  }

  // see docs/todo/angular-modern-api.md — D2: use host property in @Directive because it centralizes host bindings in metadata
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    // use PlatformService.isBrowser because window.innerWidth/Height is not available during SSR
    if (!this.platform.isBrowser) return;

    const movement = this.movement() || 0.015;

    const screenX = window.innerWidth;
    const screenY = window.innerHeight;
    const screenXHalf = screenX / 2;
    const screenYHalf = screenY / 2;

    const cursorX = e.pageX < screenXHalf ? -e.pageX : e.pageX;
    const cursorY = e.pageY < screenYHalf ? -e.pageY : e.pageY;

    const newX = cursorX * movement;
    const newY = cursorY * movement;

    const transform = `translate(${newX}px, ${newY}px)`;
    this.eleRef.nativeElement.style.transform = transform;
  }
}
