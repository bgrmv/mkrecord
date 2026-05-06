import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FooterComponent } from '@core/footer.component';
import { PlatformService } from '@services/platform.service';
import { firstValueFrom } from 'rxjs';
import { ContactsCaptchaComponent } from './contacts-captcha.component';

@Component({
  selector: 'app-contacts-me',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    FooterComponent,
    ContactsCaptchaComponent,
  ],
  styles: [
    `
      /* use focus-glow from mobile-nav because it unifies the Orbitron brand pulse across nav + headings */
      /* use rgba(224,32,32,...) — hue 0° true red — instead of the global --c_red_d1 (#e04e42, hue 4°, tomato) */
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

      @keyframes success-glow {
        0%, 100% { text-shadow: 0 0 8px rgba(74, 222, 128, 0.3); }
        50% { text-shadow: 0 0 20px rgba(74, 222, 128, 0.6); }
      }

      /* ---------- Host & Material token overrides ---------- */
      :host {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        padding: 24px;
        box-sizing: border-box;
        overflow-y: auto;

        /* use --_red: #e02020 (hue 0°, same lightness as --c_red_d1 #e04e42)
           as a single source of truth for all red accents in this component */
        --_red: #e02020;

        /* use Material MDC design tokens at :host scope because they cascade into
           all mat-form-field children without needing ::ng-deep */
        --mdc-outlined-text-field-outline-color: rgba(242, 242, 242, 0.12);
        --mdc-outlined-text-field-hover-outline-color: rgba(224, 32, 32, 0.45);
        --mdc-outlined-text-field-focus-outline-color: var(--_red);
        --mdc-outlined-text-field-label-text-color: rgba(242, 242, 242, 0.45);
        --mdc-outlined-text-field-focus-label-text-color: var(--_red);
        --mdc-outlined-text-field-input-text-color: var(--color_whitesmoke);
        --mdc-outlined-text-field-caret-color: var(--_red);
        --mdc-outlined-text-field-input-text-placeholder-color: rgba(242, 242, 242, 0.2);

        /* error state — use --_red for outlines/labels, lighter shade for hint text */
        --mdc-outlined-text-field-error-outline-color: var(--_red);
        --mdc-outlined-text-field-error-hover-outline-color: var(--_red);
        --mdc-outlined-text-field-error-focus-outline-color: var(--_red);
        --mdc-outlined-text-field-error-label-text-color: var(--_red);
        --mdc-outlined-text-field-error-focus-label-text-color: var(--_red);
        --mdc-outlined-text-field-error-hover-label-text-color: var(--_red);
        --mat-form-field-error-text-color: #ff6060;

        /* button tokens */
        --mdc-elevated-button-container-color: var(--_red);
        --mdc-elevated-button-label-text-color: #f2f2f2;
      }

      /* required asterisk — ::ng-deep still needed because the marker
         is rendered outside the component's encapsulation boundary */
      ::ng-deep .mdc-floating-label--required:not(
          .mdc-floating-label--hide-required-marker
        )::after {
        color: var(--_red);
      }

      /* ---------- Card ---------- */
      .card {
        position: relative;
        width: 100%;
        max-width: 580px;
        padding: 56px 60px 52px;
        background:
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.035) 2px,
            rgba(0, 0, 0, 0.035) 4px
          ),
          linear-gradient(
            150deg,
            rgba(10, 3, 3, 0.98) 0%,
            rgba(16, 6, 6, 0.96) 60%,
            rgba(20, 8, 8, 0.97) 100%
          );
        border: 1px solid rgba(224, 32, 32, 0.16);
        box-shadow:
          0 0 0 1px rgba(0, 0, 0, 0.9),
          0 32px 80px rgba(0, 0, 0, 0.85),
          inset 0 1px 0 rgba(255, 255, 255, 0.03),
          inset 0 -1px 0 rgba(224, 32, 32, 0.06);
        animation: slide-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      /* HUD corner brackets */
      .corner {
        position: absolute;
        width: 18px;
        height: 18px;
        border-color: var(--_red);
        border-style: solid;
        opacity: 0.75;

        &.tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
        &.tr { top: -1px; right: -1px; border-width: 2px 2px 0 0; }
        &.bl { bottom: -1px; left: -1px; border-width: 0 0 2px 2px; }
        &.br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }
      }

      /* ---------- Header ---------- */
      .header {
        text-align: center;
        font-family: var(--font-display);
        margin-bottom: 44px;

        .rec-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: clamp(7px, 1.5vw, 9px);
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(224, 32, 32, 0.65);
          margin-bottom: 18px;

          .rec-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--_red);
            box-shadow: 0 0 7px var(--_red);
            /* use blink-rec because it mirrors a camera REC indicator */
            animation: blink-rec 1.2s ease-in-out infinite;
          }
        }

        h1 {
          font-size: clamp(20px, 3.8vw, 30px);
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--_red);
          margin: 0 0 20px;
          line-height: 1.15;
          /* use focus-glow because it's the same Orbitron active-state animation
             as the mobile nav labels — maintains brand coherence */
          animation: focus-glow 2.8s ease-in-out infinite;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;

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

        .tagline {
          font-family: var(--font-body);
          font-weight: 300;
          font-size: 13.5px;
          line-height: 1.75;
          color: rgba(242, 242, 242, 0.5);
          letter-spacing: 0.025em;
          max-width: 400px;
          margin: 0 auto;

          strong {
            color: rgba(242, 242, 242, 0.75);
            font-weight: 400;
          }
        }
      }

      /* ---------- Form ---------- */
      form#contacts {
        display: flex;
        flex-direction: column;
        /* use gap:12px because mat-form-field already has a subscript area (~20px)
           below the outline — adding 12px makes the total gap ~32px between fields */
        gap: 12px;

        /* Honeypot — visually removed without display:none (bots detect that and skip).
           Off-screen + 0×0 + clip-path means it occupies no layout space and no
           pixels render, but the field is still present in the DOM for naive bots. */
        .hp-trap {
          position: absolute;
          left: -10000px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
          opacity: 0;
          pointer-events: none;
        }

        mat-form-field {
          width: 100%;
        }

        textarea {
          resize: vertical;
          min-height: 80px;
          max-height: 220px;
        }

        button[type='button'] {
          width: 100%;
          height: 50px;
          margin-top: 16px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          /* use dark-to-bright red gradient — both stops stay at hue 0° (no orange drift) */
          background: linear-gradient(
            160deg,
            #a81010 0%,
            var(--_red) 100%
          ) !important;
          color: #f2f2f2 !important;
          box-shadow: 0 2px 16px rgba(224, 32, 32, 0.25) !important;
          transition:
            box-shadow 0.25s ease,
            transform 0.15s ease,
            opacity 0.2s ease;

          &:not(:disabled):hover {
            box-shadow:
              0 0 18px rgba(224, 32, 32, 0.55),
              0 6px 24px rgba(0, 0, 0, 0.5) !important;
            transform: translateY(-1px);
          }

          &:not(:disabled):active {
            transform: translateY(0);
          }

          &:disabled {
            cursor: not-allowed;
            opacity: 0.38;
          }
        }
      }

      /* ---------- Status feedback ---------- */
      .feedback {
        margin-top: 18px;
        text-align: center;
        animation: slide-up 0.35s ease both;

        &.success {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #4ade80;
          animation:
            slide-up 0.35s ease both,
            success-glow 2.5s ease-in-out infinite;

          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
          }
        }

        &.error {
          font-family: var(--font-display);
          font-size: 13px;
          color: #ff6060;
        }
      }

      /* ---------- Footer (mobile only) ---------- */
      .footer-wrap {
        display: none;
      }

      /* ---------- Mobile ---------- */
      @media (max-width: 576px) {
        :host {
          padding: 0;
          align-items: flex-start;
        }

        .card {
          border: none;
          border-top: 1px solid rgba(224, 32, 32, 0.12);
          box-shadow: none;
          /* use larger horizontal padding because 22px feels cramped at 390–430px */
          padding: 36px 24px 28px;
          background: rgba(10, 3, 3, 0.98);
          animation: none;
        }

        .corner {
          display: none;
        }

        .header {
          margin-bottom: 24px;
          padding: 0 4px;

          h1 { font-size: 18px; }

          .tagline { font-size: 12.5px; }
        }

        form#contacts {
          padding: 0 4px;

          textarea {
            max-height: 5vh;
          }
        }

        .footer-wrap {
          display: block;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(224, 32, 32, 0.1);
        }
      }
    `,
  ],
  template: `
    <div class="card">
      <span class="corner tl"></span>
      <span class="corner tr"></span>
      <span class="corner bl"></span>
      <span class="corner br"></span>

      <header class="header">
        <div class="rec-badge">
          <span class="rec-dot"></span>
          Signal Ready
        </div>

        <h1>Initiate Contact</h1>

        <div class="divider">
          <mat-icon fontIcon="videocam" />
        </div>

        <p class="tagline">
          Every great film begins with a single conversation.
          <strong>Tell me about your vision</strong> — the story you need told,
          the moment too precious to leave unfilmed — and together we'll craft
          something that outlasts the frame.
        </p>
      </header>

      <form id="contacts" [formGroup]="formGroup" (submit)="onSubmit($event)">
        <!--
          Honeypot field — invisible to real users via off-screen positioning
          (NOT display:none, which sophisticated bots detect and skip). Naive
          bots fill any input named "website"/"url" by default.
          Use position:absolute + clip + tabindex=-1 + aria-hidden + autocomplete=off
          so screen readers, keyboard users, and password managers all skip it.
        -->
        <input
          class="hp-trap"
          type="text"
          name="website"
          formControlName="website"
          tabindex="-1"
          autocomplete="off"
          aria-hidden="true" />

        <mat-form-field appearance="outline">
          <mat-label>Your Email</mat-label>
          <input
            matInput
            type="email"
            placeholder="you@studio.com"
            formControlName="email" />
          <mat-error>
            @if (formGroup.get('email')?.hasError('required')) {
              Email is required
            } @else if (formGroup.get('email')?.hasError('email')) {
              Please enter a valid email address
            }
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Your Message</mat-label>
          <textarea
            matInput
            rows="4"
            formControlName="text"
            placeholder="Describe your project, event, or idea — the more detail, the better."></textarea>
          <mat-error>
            @if (formGroup.get('text')?.hasError('required')) {
              Message is required
            } @else if (formGroup.get('text')?.hasError('minlength')) {
              Message must be at least 10 characters
            }
          </mat-error>
        </mat-form-field>

        <app-contacts-captcha formControlName="captcha" />

        <button
          mat-raised-button
          type="submit"
          [disabled]="formGroup.invalid || isSubmitting()">
          {{ isSubmitting() ? 'Transmitting…' : 'Send Signal' }}
        </button>
      </form>

      @if (submitSuccess()) {
        <div class="feedback success">
          <mat-icon fontIcon="check_circle" />
          Signal received — I'll be in touch soon
        </div>
      }
      @if (submitError()) {
        <p class="feedback error">{{ submitError() }}</p>
      }

      <div class="footer-wrap">
        <app-footer />
      </div>
    </div>
  `,
})
export class ContactsMeComponent {
  private readonly platformService = inject(PlatformService);
  private readonly http = inject(HttpClient);

  readonly isSubmitting = signal(false);
  readonly submitSuccess = signal(false);
  readonly submitError = signal<string | null>(null);

  // see docs/todo/angular-modern-api.md — H1: migrate to signal-based forms when Angular stabilizes them — they integrate natively with the signal graph
  formGroup = new FormGroup({
    email: new FormControl<string | null>(null, {
      validators: [Validators.email, Validators.required],
    }),
    text: new FormControl<string | null>('', {
      validators: [Validators.required, Validators.minLength(10)],
    }),
    // use Validators.requiredTrue because the form must stay invalid until the
    // user verifies humanity — propagates into formGroup.invalid automatically,
    // so the existing [disabled]="formGroup.invalid" on the submit button picks it up
    captcha: new FormControl<boolean>(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue],
    }),
    // Honeypot — invisible to humans (positioned off-screen, tabindex=-1, aria-hidden).
    // Naive bots fill every field they find; if this is non-empty, we silently drop the
    // submission so the bot thinks it succeeded and doesn't retry.
    // Field name "website" is intentionally a common bot-keyword target.
    // No validators here: validators would reject the form *before* we can detect the bot.
    website: new FormControl<string>('', { nonNullable: true }),
  });

  async onSubmit(event: Event) {
    event.preventDefault();

    if (this.formGroup.invalid) {
      // use markAllAsTouched because mat-error only renders when the control
      // has been interacted with — this reveals all errors on submit attempt
      this.formGroup.markAllAsTouched();
      return;
    }

    // Honeypot trap — if the hidden field has any value, a bot filled it.
    // Fake the success state so the bot's heuristic ("got 200 OK / saw success UI")
    // marks this target as done and moves on. Do NOT throw or show an error —
    // that would teach the bot to skip honeypot fields next time.
    if (this.formGroup.value.website) {
      this.submitSuccess.set(true);
      this.formGroup.reset();
      return;
    }

    if (!this.platformService.isBrowser) return;

    this.isSubmitting.set(true);
    this.submitSuccess.set(false);
    this.submitError.set(null);

    try {
      await firstValueFrom(
        this.http.post('/api/contact', {
          email: this.formGroup.value.email,
          text: this.formGroup.value.text,
        }),
      );
      this.submitSuccess.set(true);
      this.formGroup.reset();
    } catch {
      this.submitError.set('Failed to send. Please try again later.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
