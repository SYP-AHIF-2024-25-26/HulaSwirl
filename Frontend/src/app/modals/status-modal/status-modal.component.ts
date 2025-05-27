import {Component, effect, inject, signal, WritableSignal} from '@angular/core';
import {ModalService, ModalType} from '../../services/modal.service';
import { NgIf } from '@angular/common';
import {Drink} from '../../services/drink.service';

@Component({
  selector: 'app-status-modal',
  standalone: true,
  imports: [NgIf],
  templateUrl: './status-modal.component.html',
  styleUrl: './status-modal.component.css'
})
export class StatusModalComponent {
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
      if(this.modalService.getDisplayedModal()() == ModalType.E) {
        if (this.currentModalData() && this.currentModalData().message) {
          this.errorMessage.set(this.currentModalData().message);
        } else if (this.currentModalData() && this.currentModalData().progressDuration && this.currentModalData().progressDuration >= 0) {
          this.startProgress(this.currentModalData().progressDuration);
          this.errorMessage.set("Your drink is being prepared...");
        } else {
          this.errorMessage.set('Unbekannter Fehler');
        }
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
        this.errorMessage.set("Your drink is ready!");

        // Optional: Fortschrittsbalken nach kurzer Zeit ausblenden

        setTimeout(() => {
          this.closeModal()
        }, 3000);
      }
    }, 100);
  }

  closeModal() {
    this.progressVisible = false;
    this.modalService.closeModal();
  }
}
