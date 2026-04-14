import {Component, effect, inject, signal, Signal} from '@angular/core';
import {ModalService, ModalType} from '../../services/modal.service';

import {GenericModalComponent} from '../generic-modal/generic-modal.component';
import {FpsService} from '../../services/fps.service';

@Component({
  selector: 'app-status-modal',
  standalone: true,
  imports: [GenericModalComponent],
  templateUrl: './status-modal.component.html',
  styleUrl: './status-modal.component.css'
})
export class StatusModalComponent {
  private modalService = inject(ModalService);
  private fpsService = inject(FpsService);

  currentModalData: Signal<any> = this.modalService.getModalData();
  statusMessage = signal('');
  lowEndDetected = this.fpsService.lowEndDetected;
  progress = signal(0);
  progressVisible = signal(false);
  private progressInterval: ReturnType<typeof setInterval> | null = null;
  private closeTimeout: ReturnType<typeof setTimeout> | null = null;
  private activeProgressDuration: number | null = null;

  constructor() {
    effect(() => {
      if (this.modalService.getDisplayedModal()() === ModalType.Status) {
        const modalData = this.currentModalData();

        if (modalData?.message) {
          this.clearProgressTimers();
          this.progressVisible.set(false);
          this.progress.set(0);
          this.activeProgressDuration = null;
          this.statusMessage.set(modalData.message);
        } else if (modalData?.progressDuration != null && modalData.progressDuration >= 0) {
          if (this.activeProgressDuration !== modalData.progressDuration || !this.progressVisible()) {
            this.startProgress(modalData.progressDuration);
          }
          this.statusMessage.set('Your drink is being prepared...');
        } else {
          this.clearProgressTimers();
          this.progressVisible.set(false);
          this.progress.set(0);
          this.activeProgressDuration = null;
          this.statusMessage.set('Unbekannter Fehler');
        }
      } else {
        this.clearProgressTimers();
        this.activeProgressDuration = null;
      }
    });
  }

  startProgress(durationInSeconds: number) {
    this.clearProgressTimers();
    this.activeProgressDuration = durationInSeconds;
    this.progressVisible.set(true);
    this.progress.set(0);

    const steps = Math.max(1, durationInSeconds * (this.lowEndDetected() ? 2 : 10));
    const intervalMs = this.lowEndDetected() ? 500 : 100;
    let currentStep = 0;

    this.progressInterval = setInterval(() => {
      currentStep++;
      this.progress.set((currentStep / steps) * 100);

      if (currentStep >= steps) {
        this.clearProgressTimers();
        this.progress.set(100);
        this.statusMessage.set('Your drink is ready!');
        this.closeTimeout = setTimeout(() => {
          this.closeModal();
        }, 1500);
      }
    }, intervalMs);
  }

  closeModal() {
    this.clearProgressTimers();
    this.activeProgressDuration = null;
    this.progressVisible.set(false);
    this.progress.set(0);
    this.statusMessage.set('');
    this.modalService.closeAll();
  }

  private clearProgressTimers() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }

    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
  }
}
