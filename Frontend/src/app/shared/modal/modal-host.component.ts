import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UniversalModalService } from './universal-modal.service';
import { UniversalModalComponent } from './universal-modal.component';

@Component({
  selector: 'app-modal-host',
  standalone: true,
  imports: [CommonModule, UniversalModalComponent],
  templateUrl: './modal-host.component.html',
  styleUrls: ['./modal-host.component.css']
})
export class ModalHostComponent {
  private readonly modalService = inject(UniversalModalService);
  modals = this.modalService.modals();
}
