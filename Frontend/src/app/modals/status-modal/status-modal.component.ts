import {Component, inject, signal, WritableSignal} from '@angular/core';
import {UniversalModalService} from '../../shared/modal/universal-modal.service';
import {MODAL_ID, MODAL_DATA} from '../../shared/modal/modal.tokens';
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
  private modal = inject(UniversalModalService);
  private readonly modalId: string = inject(MODAL_ID);
  private readonly data = inject(MODAL_DATA) as any;

  statusMessage = signal('');
  progress: number = 0;
  progressVisible: boolean = false;

  ngOnInit() {
    if (this.data && this.data.message) {
      this.statusMessage.set(this.data.message);
    } else if (this.data && this.data.progressDuration >= 0) {
      this.startProgress(this.data.progressDuration);
      this.statusMessage.set("Your drink is being prepared...");
    } else {
      this.statusMessage.set('Unbekannter Fehler');
    }
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
        this.statusMessage.set("Your drink is ready!");

        // Optional: Fortschrittsbalken nach kurzer Zeit ausblenden

        setTimeout(() => {
          this.closeModal()
        }, 1500);
      }
    }, 100);
  }

  closeModal() {
    this.progressVisible = false;
    this.progress = 0;
    this.statusMessage.set('');
    this.modal.close(this.modalId);
  }
}
