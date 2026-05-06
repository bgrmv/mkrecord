import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-contacts-captcha',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    // use NG_VALUE_ACCESSOR multi-provider because that's how a custom control
    // hooks into reactive forms — parent only needs `formControlName="captcha"`
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ContactsCaptchaComponent),
      multi: true,
    },
  ],
  // use host metadata over @HostListener / @HostBinding because it co-locates
  // bindings with the component shell and plays nicer with strictPropertyInitialization
  host: {
    role: 'checkbox',
    '[attr.aria-checked]': 'verified()',
    '[attr.aria-disabled]': 'disabled() || null',
    '[attr.aria-busy]': 'animating() || null',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    // use [class.x] host bindings because the CSS uses :host(.is-verified) selectors —
    // these flip the visual state in lockstep with the signals
    '[class.is-verified]': 'verified()',
    '[class.is-animating]': 'animating()',
    '[class.is-disabled]': 'disabled()',
    '(click)': 'toggle()',
    '(keydown.space)': 'onKey($event)',
    '(keydown.enter)': 'onKey($event)',
    '(blur)': 'onTouched()',
  },
  styles: [
    `
      /* mirror keyframe names from contacts-me.component because Angular's
         component-scoped styles don't share @keyframes across components */
      @keyframes blink-rec {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0.15; }
      }

      @keyframes focus-glow {
        0%, 100% {
          text-shadow:
            0 0 8px rgba(224, 32, 32, 0.5),
            1px 1px 0 rgb(0, 0, 0);
        }
        50% {
          text-shadow:
            0 0 18px rgba(224, 32, 32, 0.85),
            0 0 32px rgba(224, 32, 32, 0.35),
            1px 1px 0 rgb(0, 0, 0);
        }
      }

      @keyframes shutter-flash {
        0%   { opacity: 0; }
        50%  { opacity: 0.8; }
        100% { opacity: 0; }
      }

      :host {
        --_red: #e02020;
        --_iris-size: 56px;
        --_radius: 6px;

        display: flex;
        align-items: center;
        gap: 16px;
        position: relative;
        width: 100%;
        padding: 14px 16px;
        margin-top: 4px;
        background:
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.04) 2px,
            rgba(0, 0, 0, 0.04) 4px
          ),
          linear-gradient(
            150deg,
            rgba(8, 2, 2, 0.7) 0%,
            rgba(14, 5, 5, 0.6) 100%
          );
        border: 1px solid rgba(224, 32, 32, 0.16);
        cursor: pointer;
        user-select: none;
        transition:
          border-color 0.25s ease,
          box-shadow 0.25s ease,
          transform 0.15s ease;
      }

      :host(:hover):not(.is-verified):not(.is-disabled) {
        border-color: rgba(224, 32, 32, 0.4);
        box-shadow: 0 0 14px rgba(224, 32, 32, 0.22);
      }

      :host(:focus-visible) {
        outline: 1px solid var(--_red);
        outline-offset: 3px;
      }

      :host(.is-disabled) {
        cursor: not-allowed;
        opacity: 0.5;
      }

      :host(.is-verified) {
        border-color: rgba(224, 32, 32, 0.5);
        box-shadow:
          0 0 12px rgba(224, 32, 32, 0.3),
          inset 0 0 24px rgba(224, 32, 32, 0.05);
      }

      /* HUD corner brackets — same recipe as contacts-me .corner but smaller */
      .corner {
        position: absolute;
        width: 10px;
        height: 10px;
        border-color: var(--_red);
        border-style: solid;
        opacity: 0.6;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      .corner.tl { top: -1px; left: -1px;  border-width: 1px 0 0 1px; }
      .corner.tr { top: -1px; right: -1px; border-width: 1px 1px 0 0; }
      .corner.bl { bottom: -1px; left: -1px;  border-width: 0 0 1px 1px; }
      .corner.br { bottom: -1px; right: -1px; border-width: 0 1px 1px 0; }

      :host(.is-verified) .corner { opacity: 1; }

      /* ---------- Iris ---------- */
      .iris {
        position: relative;
        flex: 0 0 auto;
        width: var(--_iris-size);
        height: var(--_iris-size);
        border-radius: 50%;
        background:
          radial-gradient(
            circle at 50% 50%,
            #1a0606 0%,
            #050202 70%,
            #000 100%
          );
        border: 1px solid rgba(224, 32, 32, 0.3);
        box-shadow:
          inset 0 0 8px rgba(0, 0, 0, 0.9),
          inset 0 0 0 2px rgba(0, 0, 0, 0.5);
        overflow: hidden;
      }

      /* shutter flash overlay — visible only during the closing animation */
      .iris::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(
          circle,
          rgba(255, 255, 255, 0.9) 0%,
          rgba(224, 32, 32, 0.4) 40%,
          transparent 70%
        );
        opacity: 0;
        pointer-events: none;
      }
      :host(.is-animating) .iris::after {
        animation: shutter-flash 0.7s ease-out;
      }

      .blade {
        position: absolute;
        top: -10%;
        left: 50%;
        width: 60%;
        height: 60%;
        /* triangle pointing down toward center */
        clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
        background: linear-gradient(
          180deg,
          rgba(242, 242, 242, 0.85) 0%,
          rgba(180, 180, 180, 0.7) 50%,
          rgba(224, 32, 32, 0.5) 100%
        );
        transform-origin: 0% 100%;
        /* idle = retracted outward (rotation per blade + push out via translateY) */
        transition:
          transform 0.7s cubic-bezier(0.65, 0, 0.35, 1),
          opacity 0.3s ease;
        will-change: transform;
      }

      /* idle (open): blades pulled outward, iris is fully transparent */
      .b1 { transform: rotate(0deg)   translateY(-65%); }
      .b2 { transform: rotate(60deg)  translateY(-65%); }
      .b3 { transform: rotate(120deg) translateY(-65%); }
      .b4 { transform: rotate(180deg) translateY(-65%); }
      .b5 { transform: rotate(240deg) translateY(-65%); }
      .b6 { transform: rotate(300deg) translateY(-65%); }

      /* closed: blades meet at center */
      :host(.is-verified) .b1,
      :host(.is-animating) .b1 { transform: rotate(0deg)   translateY(0); }
      :host(.is-verified) .b2,
      :host(.is-animating) .b2 { transform: rotate(60deg)  translateY(0); }
      :host(.is-verified) .b3,
      :host(.is-animating) .b3 { transform: rotate(120deg) translateY(0); }
      :host(.is-verified) .b4,
      :host(.is-animating) .b4 { transform: rotate(180deg) translateY(0); }
      :host(.is-verified) .b5,
      :host(.is-animating) .b5 { transform: rotate(240deg) translateY(0); }
      :host(.is-verified) .b6,
      :host(.is-animating) .b6 { transform: rotate(300deg) translateY(0); }

      :host(.is-verified) .blade {
        background: linear-gradient(
          180deg,
          rgba(168, 16, 16, 0.95) 0%,
          rgba(120, 10, 10, 0.9) 50%,
          rgba(60, 5, 5, 0.95) 100%
        );
      }

      /* center pin-prick dot — appears only when verified */
      .rec-dot {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 6px;
        height: 6px;
        margin: -3px 0 0 -3px;
        border-radius: 50%;
        background: var(--_red);
        box-shadow:
          0 0 6px var(--_red),
          0 0 12px rgba(224, 32, 32, 0.5);
        opacity: 0;
        transform: scale(0.5);
        transition:
          opacity 0.3s ease 0.4s,
          transform 0.3s ease 0.4s;
        z-index: 2;
      }

      :host(.is-verified) .rec-dot {
        opacity: 1;
        transform: scale(1);
        animation: blink-rec 1.2s ease-in-out infinite 0.7s;
      }

      /* idle ring tick marks (camera focus reticle vibe) */
      .iris-ticks {
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        pointer-events: none;
        background:
          conic-gradient(
            from 0deg,
            transparent 0 8deg,
            rgba(224, 32, 32, 0.35) 8deg 9deg,
            transparent 9deg 90deg,
            rgba(224, 32, 32, 0.35) 90deg 91deg,
            transparent 91deg 180deg,
            rgba(224, 32, 32, 0.35) 180deg 181deg,
            transparent 181deg 270deg,
            rgba(224, 32, 32, 0.35) 270deg 271deg,
            transparent 271deg 360deg
          );
        -webkit-mask: radial-gradient(
          circle,
          transparent calc(50% - 4px),
          #000 calc(50% - 4px),
          #000 50%,
          transparent 50%
        );
                mask: radial-gradient(
          circle,
          transparent calc(50% - 4px),
          #000 calc(50% - 4px),
          #000 50%,
          transparent 50%
        );
        opacity: 0.6;
        transition: transform 1.2s ease, opacity 0.3s ease;
      }

      :host(.is-verified) .iris-ticks {
        opacity: 1;
        transform: rotate(45deg);
      }

      /* ---------- Label ---------- */
      .label {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-family: var(--font-display);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: rgba(242, 242, 242, 0.55);
        line-height: 1.4;
        transition: color 0.3s ease;
      }

      .label .primary {
        font-size: 11px;
        color: rgba(242, 242, 242, 0.8);
      }

      .label .secondary {
        font-size: 9px;
        font-weight: 500;
        letter-spacing: 0.22em;
        color: rgba(242, 242, 242, 0.35);
      }

      :host(.is-verified) .label .primary {
        color: var(--_red);
        /* use focus-glow because it's the same brand pulse used on the form <h1> */
        animation: focus-glow 2.8s ease-in-out infinite;
      }

      :host(.is-animating) .label .primary {
        color: rgba(224, 32, 32, 0.85);
      }

      .rec-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 2px 6px;
        margin-right: 6px;
        background: var(--_red);
        color: #f2f2f2;
        font-size: 8px;
        letter-spacing: 0.2em;
        border-radius: 2px;
        vertical-align: middle;
      }

      /* ---------- Mobile ---------- */
      @media (max-width: 576px) {
        :host {
          --_iris-size: 48px;
          gap: 12px;
          padding: 12px 14px;
        }

        .label .primary { font-size: 10px; }
        .label .secondary { font-size: 8px; }
      }
    `,
  ],
  template: `
    <span class="corner tl"></span>
    <span class="corner tr"></span>
    <span class="corner bl"></span>
    <span class="corner br"></span>

    <div class="iris">
      <span class="iris-ticks"></span>
      <span class="blade b1"></span>
      <span class="blade b2"></span>
      <span class="blade b3"></span>
      <span class="blade b4"></span>
      <span class="blade b5"></span>
      <span class="blade b6"></span>
      <span class="rec-dot"></span>
    </div>

    <div class="label">
      @if (verified()) {
        <span class="primary">
          <span class="rec-badge">REC</span>Shutter Locked
        </span>
        <span class="secondary">Signal armed · click to release</span>
      } @else if (animating()) {
        <span class="primary">Locking shutter…</span>
        <span class="secondary">Calibrating aperture</span>
      } @else {
        <span class="primary">Lock the shutter</span>
        <span class="secondary">Click to verify human</span>
      }
    </div>
  `,
})
export class ContactsCaptchaComponent implements ControlValueAccessor {
  // use signal() because OnPush + zoneless requires reactive primitives — plain fields don't trigger view updates
  readonly verified = signal(false);
  readonly animating = signal(false);
  readonly disabled = signal(false);

  private onChange: (value: boolean) => void = () => {};
  // protected so the host (blur) binding can call it without triggering noUnusedLocals later
  protected onTouched: () => void = () => {};

  // ControlValueAccessor — parent reactive form ↔ internal verified() signal
  writeValue(value: boolean): void {
    this.verified.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // host bindings ↓

  toggle(): void {
    if (this.disabled() || this.animating()) return;

    if (this.verified()) {
      this.verified.set(false);
      this.onChange(false);
      return;
    }

    this.animating.set(true);
    // 700 ms gate matches the CSS aperture-close animation, and as a side effect
    // defeats trivial sync-click bots: any script that clicks then immediately
    // submits will still find verified() === false and the form invalid.
    setTimeout(() => {
      this.animating.set(false);
      this.verified.set(true);
      this.onChange(true);
      this.onTouched();
    }, 700);
  }

  protected onKey(event: Event): void {
    // preventDefault stops Space from scrolling the page when the captcha is focused
    event.preventDefault();
    this.toggle();
  }
}
