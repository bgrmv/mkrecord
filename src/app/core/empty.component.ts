import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-empty',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  styles: [
    `
      :host {
        color: var(--color_whitesmoke);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        margin: 200px 100px;
        font-weight: 900;
        text-shadow: 1px 2px 5px var(--c_red);
      }

      .container {
        text-align: center;
      }
    `,
  ],
  template: `
    <div class="container">
      <h1>404 | Not found</h1>
      <h2>404 | Not found</h2>
      <h3>404 | Not found</h3>
      <h4>404 | Not found</h4>
      <h5>404 | Not found</h5>
      <h6>404 | Not found</h6>
    </div>
  `,
})
export class EmptyComponent {}
