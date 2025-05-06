import {Component, effect, inject, signal, WritableSignal} from '@angular/core';
import { ModalService } from '../../services/modal.service';
import { NgIf } from '@angular/common';
import {Drink} from '../../services/drink.service';

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
  currentModalData: WritableSignal<any>=signal(null);

  async ngOnInit() {
    this.currentModalData = this.modalService.getModalData();
  }

  constructor() {
    effect(() => {
      console.log("opened modal",this.currentModalData())
      if (this.currentModalData()&&this.currentModalData().message) {
        this.errorMessage.set(this.currentModalData().message);
      } else {
        this.errorMessage.set('Unbekannter Fehler');
      }

      if (this.currentModalData()&&this.currentModalData().progressDuration && this.currentModalData().progressDuration>=0) {
        this.startProgress(this.currentModalData().progressDuration);
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

        // 👉 Zeige "Getränk fertig!" nach dem Fortschritt
        this.errorMessage.set('Getränk fertig!');

        // Optional: Fortschrittsbalken nach kurzer Zeit ausblenden

        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    }, 100);
  }

  close() {
    this.modalService.closeModal();
  }
}
