import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FpsService} from '../services/fps.service';

@Component({
    selector: 'app-background-leaves',
  imports: [],
    templateUrl: './background-leaves.component.html',
    standalone: true,
    styleUrl: './background-leaves.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackgroundLeavesComponent {
  private readonly fpsService = inject(FpsService);

  lowEndDetected = this.fpsService.lowEndDetected;
}
