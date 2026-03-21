import { Component, inject, signal } from '@angular/core';
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
import { FooterComponent } from '../core/footer.component';
import { PlatformService } from '../services/platform.service';
import emailjs from '@emailjs/browser';

// Replace these with your EmailJS account credentials:
// https://www.emailjs.com/docs/introduction/how-does-emailjs-work/
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

@Component({
  selector: 'app-contacts-me',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    FooterComponent,
  ],
  styles: [
    `
      :host {
        position: relative;
        display: flex;
        justify-content: center;
        flex-direction: column;
        max-width: 600px;
        text-wrap: balance;
        align-items: center;

        --filled-input-text-color: red;

        q {
          text-align: center;
        }

        padding: 60px 20px;

        border: 1px solid var(--color_whitesmoke_darken_5);
        background-color: linear-gradient(
          to right,
          rgba(0, 0, 0, 0.1),
          rgba(0, 0, 0, 0.7)
        );

        & mat-form-field {
          width: 100%;
        }

        app-footer {
          display: none;
        }
      }

      mat-form-field {
        color: var(--c_red);
      }

      /* does not */
      ::ng-deep.mdc-floating-label--required:not(
          .mdc-floating-label--hide-required-marker
        )::after {
        color: red;
      }

      .mat-mdc-raised-button:not(:disabled) {
        background-color: var(--c_red_d1);
        color: var(--color_whitesmoke);
      }

      @media (max-width: 576px) {
        :host {
          padding: 20px 30px;
          border: none;

          app-footer {
            display: block;
          }
        }

        form textarea {
          max-height: 5vh;
        }
      }

      form#contacts {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 8px; /* see docs/todo/ui — U8 */

        fieldset {
          display: grid;
        }

        textarea {
          resize: vertical;
          max-height: 30vh;
        }

        button:disabled {
          cursor: not-allowed;
        }

        button[type='submit'] {
          &:disabled {
            cursor: not-allowed;
          }
          &:hover {
            border: 1px solid whitesmoke;
          }
        }
      }

      .feedback {
        margin-top: 12px;
        font-size: 14px;

        &.success { color: #4caf50; }
        &.error { color: var(--c_red); }
      }
    `,
  ],
  template: `
    <form
      id="contacts"
      [formGroup]="formGroup"
      (submit)="onSubmit($event)">
      <q>Tell me about your project, and I'll bring it to life.</q><br />
      <q>Let's film the magic on camera! </q><br />

      <mat-form-field class="example-full-width" appearance="outline">
        <mat-label>Email</mat-label>
        <input
          matInput
          type="email"
          placeholder="Input your email"
          formControlName="email" />
      </mat-form-field>

      <mat-form-field class="example-full-width" appearance="outline">
        <mat-label>Leave a comment</mat-label>
        <textarea matInput rows="3" formControlName="text"></textarea>
      </mat-form-field>

      <button
        color="primary"
        mat-raised-button
        [disabled]="formGroup.invalid || isSubmitting()"
        type="submit">
        {{ isSubmitting() ? 'Sending…' : 'Send' }}
      </button>

      @if (submitSuccess()) {
        <p class="feedback success">Message sent! I'll get back to you soon.</p>
      }
      @if (submitError()) {
        <p class="feedback error">{{ submitError() }}</p>
      }
    </form>

    <br />
    <br />

    <app-footer />
  `,
})
export class ContactsMeComponent {
  private readonly platformService = inject(PlatformService);

  readonly isSubmitting = signal(false);
  readonly submitSuccess = signal(false);
  readonly submitError = signal<string | null>(null);

  formGroup = new FormGroup({
    email: new FormControl<string | null>(null, {
      validators: [Validators.email, Validators.required],
    }),
    text: new FormControl<string | null>('', {
      validators: [Validators.required],
    }),
  });

  async onSubmit(event: Event) {
    event.preventDefault();

    if (this.formGroup.invalid || !this.platformService.isBrowser) return;

    this.isSubmitting.set(true);
    this.submitSuccess.set(false);
    this.submitError.set(null);

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_email: this.formGroup.value.email,
          message: this.formGroup.value.text,
        },
        { publicKey: EMAILJS_PUBLIC_KEY }
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
