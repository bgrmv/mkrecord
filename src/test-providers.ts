import { provideZonelessChangeDetection } from '@angular/core';

// mirrors app.config.ts — TestBed must run zoneless too, or component tests
// exercise a change-detection strategy the app never actually uses at runtime
export default [provideZonelessChangeDetection()];
