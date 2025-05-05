import { Component, effect, inject, signal } from '@angular/core';
import { ModalService } from '../../services/modal.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [NgIf],
  templateUrl: './error-modal.component.html',
  styleUrl: './error-modal.component.css'
})
export class ErrorModalComponent {
  private modalService = inject(ModalService);

  errorMessage = signal('');
  progress: number = 0;
  progressVisible: boolean = false;

  constructor() {
    effect(async () => {
      const data = this.modalService.getModalData();
      if (data().message) {
        this.errorMessage.set(data().message);
      } else {
        this.errorMessage.set('Unbekannter Fehler');
      }

      if (data().progressDuration) {
         this.startProgress(data().progressDuration);
      }
    });
  }

   startProgress(durationInSeconds: number) {
    this.progressVisible = true;
    this.progress = 0;
    const steps = durationInSeconds * 10;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      this.progress = (currentStep / steps) * 100;
      if (currentStep >= steps) {
        clearInterval(interval);
        setTimeout(() => {
          this.progressVisible = false;
        }, 500);
      }
    }, 100);
  }

  close() {
    this.modalService.closeModal();
  }
}
