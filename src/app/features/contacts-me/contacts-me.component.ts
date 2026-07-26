import { httpResource } from '@angular/common/http';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FooterComponent } from '@core/footer.component';
import { PlatformService } from '@services/platform.service';
import { ContactsCaptchaComponent } from './contacts-captcha.component';

// use a namespaced key so a future unrelated sessionStorage entry can't collide
const CONTACT_SENT_KEY = 'mkrecord:contact-sent';

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
  templateUrl: './contacts-me.component.html',
  styleUrl: './contacts-me.component.css',
})
export class ContactsMeComponent {
  private readonly platformService = inject(PlatformService);

  @ViewChild('formDirective')
  private readonly formDirective!: FormGroupDirective;

  readonly sent = signal(false);
  // true only when `sent` came from a sessionStorage check on mount, not a fresh submit —
  // drives which copy the post-submit panel shows (§4 of the plan)
  readonly restoredFromSession = signal(false);

  private readonly submitPayload = signal<
    { email: string; text: string } | undefined
  >(undefined);

  // use httpResource because returning undefined from the request function means "no
  // request" — nothing fires until onSubmit() sets a payload, and its own status()/
  // isLoading()/error() signals are the single source of truth for the submit lifecycle,
  // replacing a hand-rolled loading/success/error state
  readonly contactResource = httpResource<{ ok: boolean }>(() => {
    const payload = this.submitPayload();
    return payload && { url: '/api/contact', method: 'POST', body: payload };
  });

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

  constructor() {
    // browser-only sessionStorage read, guarded per PlatformService.isBrowser and run via
    // afterNextRender (not ngOnInit) per the project's SSR-safe modern-API convention
    afterNextRender(() => {
      if (
        this.platformService.isBrowser &&
        sessionStorage.getItem(CONTACT_SENT_KEY)
      ) {
        this.sent.set(true);
        this.restoredFromSession.set(true);
      }
    });

    // httpResource resolves asynchronously — reacting to its status signal (rather than
    // inlining this in onSubmit()) is the idiomatic way to hook a side effect off it
    effect(() => {
      if (this.contactResource.status() === 'resolved') {
        this.markSent();
      }
    });
  }

  onSubmit(event: Event): void {
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
    // that would teach the bot to skip honeypot fields next time. Bypasses
    // contactResource entirely — no real network call for a fake success.
    if (this.formGroup.value.website) {
      this.markSent();
      this.formDirective.resetForm();
      return;
    }

    if (!this.platformService.isBrowser) return;

    // a new object literal every call — even a retry with identical text still has a
    // different reference, so httpResource reliably retriggers without needing .reload()
    this.submitPayload.set({
      email: this.formGroup.value.email!,
      text: this.formGroup.value.text!,
    });
  }

  sendAnother(): void {
    this.sent.set(false);
    this.restoredFromSession.set(false);
    this.formDirective.resetForm();
  }

  private markSent(): void {
    if (this.platformService.isBrowser) {
      sessionStorage.setItem(CONTACT_SENT_KEY, '1');
    }
    this.sent.set(true);
  }
}
