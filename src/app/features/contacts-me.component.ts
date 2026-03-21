import { Component } from '@angular/core';
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
    `,
  ],
  template: `
    <!-- see docs/todo — P2 #20: form submit only calls preventDefault, never sends data; see docs/improvements/index.md#8-contacts-form--wire-to-backend -->
    <form
      id="contacts"
      [formGroup]="formGroup"
      (submit)="$event.preventDefault()">
      <q>Tell me about your project, and I’ll bring it to life.</q><br />
      <q>Let’s film the magic on camera! </q><br />

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
        [disabled]="formGroup.invalid"
        type="submit">
        Send
      </button>
    </form>

    <br />
    <br />

    <app-footer />
  `,
})
export class ContactsMeComponent {
  formGroup = new FormGroup({
    email: new FormControl<string | null>(null, {
      validators: [Validators.email, Validators.required],
    }),
    text: new FormControl<string | null>('', {
      validators: [Validators.required],
    }),
  });
}
