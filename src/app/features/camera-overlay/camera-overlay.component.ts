import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CameraCornersLayerComponent } from './camera-corners-layer.component';

@Component({
  selector: 'app-camera-overlay',
  imports: [CameraCornersLayerComponent],
  template: `<app-camera-corners-layer />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CameraOverlayComponent {}
