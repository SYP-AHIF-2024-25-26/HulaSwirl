import {Component, effect, inject, signal, Signal} from '@angular/core';
import {ModalService, ModalType} from '../../services/modal.service';
import { NgIf } from '@angular/common';
import {FpsService} from '../../services/fps.service';
import {ModalShellComponent} from '../../shared/modal/modal-shell.component';

@Component({
  selector: 'app-status-modal',
  standalone: true,
  imports: [NgIf, ModalShellComponent],
  templateUrl: './status-modal.component.html',
  styleUrl: './status-modal.component.css'
})
export class StatusModalComponent {
  private modalService = inject(ModalService);
  private fpsService = inject(FpsService);

  currentModalData: Signal<any> = signal(null);
  statusMessage = signal('');
  lowEndDetected = this.fpsService.lowEndDetected;
  progress: number = 0;
  progressVisible: boolean = false;

  async ngOnInit() {
    this.currentModalData = this.modalService.getModalData();
  }

  constructor() {
    effect(() => {
      if(this.modalService.getDisplayedModal()() == ModalType.Status) {
        if (this.currentModalData() && this.currentModalData().message) {
          this.statusMessage.set(this.currentModalData().message);
        } else if (this.currentModalData() && this.currentModalData().progressDuration && this.currentModalData().progressDuration >= 0) {
          this.startProgress(this.currentModalData().progressDuration);
          this.statusMessage.set("Your drink is being prepared...");
        } else {
          this.statusMessage.set('Unbekannter Fehler');
        }
      }
    });
  }

  startProgress(durationInSeconds: number) {
    this.progressVisible = true;
    this.progress = 0;
    const steps = durationInSeconds * (this.lowEndDetected() ? 2 : 10);
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      this.progress = (currentStep / steps) * 100;

      if (currentStep >= steps) {
        clearInterval(interval);

        // 👉 Zeige "Getränk fertig!" nach dem Fortschritt
        this.statusMessage.set("Your drink is ready!");

        // Optional: Fortschrittsbalken nach kurzer Zeit ausblenden

        setTimeout(() => {
          this.closeModal()
        }, 1500);
      }
    }, this.lowEndDetected() ? 500 : 100);
  }

  closeModal() {
    this.progressVisible = false;
    this.progress = 0;
    this.statusMessage.set('');
    this.modalService.closeAll();
  }
}
