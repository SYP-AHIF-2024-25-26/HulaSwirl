import { Component, inject } from '@angular/core';
import {AsyncPipe, NgIf} from '@angular/common';
import { LoadingService } from '../services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [NgIf, AsyncPipe],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.css'
})
export class LoadingSpinnerComponent {
  protected readonly loadingService = inject(LoadingService);
}
