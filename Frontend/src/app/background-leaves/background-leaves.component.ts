import {Component, inject} from '@angular/core';
import {NgClass} from '@angular/common';
import {FpsService} from '../services/fps.service';

@Component({
    selector: 'app-background-leaves',
  imports: [
    NgClass
  ],
    templateUrl: './background-leaves.component.html',
    standalone: true,
    styleUrl: './background-leaves.component.css'
})
export class BackgroundLeavesComponent {
  private readonly fpsService = inject(FpsService);

  lowEndDetected = this.fpsService.lowEndDetected;
}
