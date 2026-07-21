import {
  afterNextRender,
  computed,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  NgZone,
  signal,
} from '@angular/core';
import { PlatformService } from '@services/platform.service';

@Directive({
  selector: '[parallaxItem]',
  host: {
    // use host property for static styles; more angular-way than direct el.style
    '[style.will-change]': '"transform"',
    '[style.transition]': '"transform 0.2s ease-out"',
  },
})
export class ParallaxItemDirective {
  // use input because it's the modern Angular API for component/directive inputs; provides signal-based reactivity
  readonly movement = input(0.04);

  // use signal to store mouse position; signals automatically notify computed() when they change
  private readonly mousePos = signal({ x: 0, y: 0 });

  // use signal to track if parallax is active; used to blur background during interaction
  private readonly isActive = signal(false);

  // use signal for zoom effect; randomly scales element during mouse movement, then returns to 1
  private readonly scale = signal(1);

  // use signal for glitch offset; creates visual noise effect during parallax
  private readonly glitch = signal({ offsetX: 0, offsetY: 0 });

  private blurTimeout: ReturnType<typeof setTimeout> | null = null;
  private scaleTimeout: ReturnType<typeof setTimeout> | null = null;
  private resetTimeout: ReturnType<typeof setTimeout> | null = null;

  // use computed because it derives the transform string reactively without requiring manual DOM updates; updates only when mousePos, movement, scale changes
  private readonly transform = computed(() => {
    const { x, y } = this.mousePos();
    const m = this.movement();
    const s = this.scale();

    // use perspective and scale to create zoom in/out effect during parallax
    return `perspective(800px) translate3d(${x * m}px, ${y * m}px, 0) scale(${s})`;
  });

  private readonly eleRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platform = inject(PlatformService);
  private rafId: number | null = null;

  constructor() {
    // use effect at constructor level to apply CSS custom properties; more reusable and angular-friendly than direct style assignment
    effect(() => {
      const el = this.eleRef.nativeElement;
      const newTransform = this.transform();
      // use setProperty for CSS custom properties; allows override from component styles
      el.style.setProperty('--parallax-transform', newTransform);
      el.style.transform = newTransform;
    });

    // use effect to apply glitch offsets as CSS variable; child elements can use this for separate glitch effect
    effect(() => {
      const el = this.eleRef.nativeElement;
      const { offsetX, offsetY } = this.glitch();
      el.style.setProperty('--glitch-offset-x', `${offsetX}px`);
      el.style.setProperty('--glitch-offset-y', `${offsetY}px`);
    });

    // use effect to update corner brightness during parallax interaction; brightens and highlights camera overlay elements
    effect(() => {
      if (!this.platform.isBrowser) return;

      const active = this.isActive();
      const root = document.documentElement;

      if (active) {
        // use brightness and opacity to highlight corner elements during parallax; increased values for more visible effect
        root.style.setProperty('--corner-brightness', '1.8');
        root.style.setProperty('--corner-opacity', '1');
      } else {
        // use increased brightness in idle state for better visibility; corners are always somewhat visible
        root.style.setProperty('--corner-brightness', '1.3');
        root.style.setProperty('--corner-opacity', '0.85');
      }
    });

    // use effect to apply/remove blur on background based on active state; guarded with isBrowser to prevent SSR document access error
    effect(() => {
      if (!this.platform.isBrowser) return;

      const active = this.isActive();
      const videos = document.querySelectorAll('.video-brackground video');

      videos.forEach((video) => {
        const videoEl = video as HTMLElement;
        if (active) {
          videoEl.style.filter = 'blur(12px) brightness(0.5)';
          videoEl.style.transition = 'filter 0.3s ease-out';
        } else {
          videoEl.style.filter = 'blur(0px) brightness(1)';
          videoEl.style.transition = 'filter 0.6s ease-out';
        }
      });
    });

    // use afterNextRender because DOM style initialization requires the element to be rendered; afterNextRender only runs in browser and after first render
    afterNextRender(() => {
      const el = this.eleRef.nativeElement;

      // use setProperty for initial values
      el.style.setProperty('--parallax-transform', 'translate3d(0, 0, 0)');

      const handleMouseMove = (e: MouseEvent) => {
        // use requestAnimationFrame because DOM writes must be batched at the next paint frame to avoid thrashing; prevents layout recalculations on every mousemove
        if (this.rafId !== null) return; // already scheduled for next frame

        this.rafId = requestAnimationFrame(() => {
          const halfW = window.innerWidth / 2;
          const halfH = window.innerHeight / 2;

          // use clientX/Y because they're viewport-relative; pageX/Y includes scrolling which is incorrect for parallax
          const offsetX = e.clientX - halfW;
          const offsetY = e.clientY - halfH;

          // use signal.set() to store position; this triggers computed and effect reactively, keeping DOM in sync
          this.mousePos.set({ x: offsetX, y: offsetY });

          // use signal to mark parallax as active; triggers blur effect on background
          // use random zoom effect only once per interaction start: generate random scale between 0.9 and 1.1
          if (this.scale() === 1) {
            const randomScale = 0.9 + Math.random() * 0.2;
            this.scale.set(randomScale);
          }

          this.isActive.set(true);

          // use random glitch offsets for noise effect: small pixel offsets that vary each frame
          const glitchX = (Math.random() - 0.5) * 2;
          const glitchY = (Math.random() - 0.5) * 2;
          this.glitch.set({ offsetX: glitchX, offsetY: glitchY });

          // clear previous timeouts and set new ones to deactivate/reset after user stops moving mouse
          if (this.blurTimeout) clearTimeout(this.blurTimeout);
          if (this.scaleTimeout) clearTimeout(this.scaleTimeout);

          this.blurTimeout = setTimeout(() => {
            this.isActive.set(false);
          }, 300);

          // use timeout to smoothly return scale to 1 after interaction stops
          this.scaleTimeout = setTimeout(() => {
            this.scale.set(1);
            this.glitch.set({ offsetX: 0, offsetY: 0 });
          }, 400);

          // use timeout to return mouse position to center when user stops moving mouse
          if (this.resetTimeout) clearTimeout(this.resetTimeout);
          this.resetTimeout = setTimeout(() => {
            this.mousePos.set({ x: 0, y: 0 });
          }, 400);

          this.rafId = null;
        });
      };

      // use runOutsideAngular because mousemove fires hundreds of times per second; running it inside the zone triggers change detection on every event, even with OnPush. Outside the zone, Angular CD is not notified unless the callback explicitly calls NgZone.run()
      this.zone.runOutsideAngular(() => {
        document.addEventListener('mousemove', handleMouseMove);
      });

      // use destroyRef because it tracks component lifecycle; ensures the listener and any pending rAF are cleaned up when the directive is destroyed, preventing memory leaks
      this.destroyRef.onDestroy(() => {
        document.removeEventListener('mousemove', handleMouseMove);
        if (this.rafId !== null) {
          cancelAnimationFrame(this.rafId);
        }
        if (this.blurTimeout) {
          clearTimeout(this.blurTimeout);
        }
        if (this.scaleTimeout) {
          clearTimeout(this.scaleTimeout);
        }
        if (this.resetTimeout) {
          clearTimeout(this.resetTimeout);
        }
      });
    });
  }
}
