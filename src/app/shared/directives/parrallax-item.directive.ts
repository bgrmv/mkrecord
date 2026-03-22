import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  OnInit,
} from '@angular/core';

// see docs/todo — P0 #2: SSR unsafe — window.innerWidth/innerHeight on lines 46-47 crash on server; see docs/todo/tech-debt.md#ssr-safety
@Directive({
  selector: '[parallaxItem]',
})
export class ParallaxItemDirective implements OnInit {
  readonly movement = input(0.025);

  private readonly eleRef = inject<ElementRef<HTMLElement>>(ElementRef);

  ngOnInit(): void {
    this.eleRef.nativeElement.style.transform = `translate(0px, 0px)`;
    this.eleRef.nativeElement.style.transition =
      'transform 0.2s allow-discrete';
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    const movement = this.movement() || 0.015;

    const screenX = window.innerWidth; // see docs/todo/tech-debt.md#ssr-safety — window not available on server
    const screenY = window.innerHeight; // see docs/todo/tech-debt.md#ssr-safety
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
