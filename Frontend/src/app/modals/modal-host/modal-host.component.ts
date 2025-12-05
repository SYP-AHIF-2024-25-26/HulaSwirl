import { Component, inject } from '@angular/core';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import { ModalService } from '../../services/modal.service';
import { GenericModalComponent } from '../generic-modal/generic-modal.component';

@Component({
  selector: 'app-modal-host',
  standalone: true,
  imports: [NgIf, NgTemplateOutlet, GenericModalComponent],
  templateUrl: './modal-host.component.html',
  styleUrl: './modal-host.component.css'
})
export class ModalHostComponent {
  protected modalService = inject(ModalService);
  protected modals = this.modalService.getDynamicModals();
}
