import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ModalService } from '../../services/modal.service';

export interface GenericModalButton {
  label: string;
  action: () => void;
}

@Component({
  selector: 'app-generic-modal',
  standalone: true,
  imports: [],
  templateUrl: './generic-modal.component.html',
  styleUrls: ['./generic-modal.component.css']
})
export class GenericModalComponent {
  @Input() title: string = '';
  //@Input() imageUrl: string | null = null;
  @Input() buttons: GenericModalButton[] = [];
  @Output() closed = new EventEmitter<void>();

  constructor(private modalService: ModalService) {}

  close() {
    this.closed.emit();
    this.modalService.closeModal();
  }
}
