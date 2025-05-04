import {Component, computed, effect, inject, signal} from '@angular/core';
import {ModalService} from '../../services/modal.service';

@Component({
  selector: 'app-error-modal',
  imports: [],
  templateUrl: './error-modal.component.html',
  standalone: true,
  styleUrl: './error-modal.component.css'
})
export class ErrorModalComponent {
  private modalService = inject(ModalService);

  errorMessage = signal(''); // ← reaktive Variable

  constructor() {
    effect(() => {
      const data = this.modalService.getModalData()();
      console.log('EFFECT DATA:', data);
      if (data?.message) {
        this.errorMessage.set(data.message);
      } else {
        this.errorMessage.set('Unbekannter Fehler');
      }
    });
  }

  close() {
    this.modalService.closeModal();
  }
}
