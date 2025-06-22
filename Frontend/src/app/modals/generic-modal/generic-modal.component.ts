import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../services/modal.service';

export interface GenericModalButton {
  label: string;
  action: () => void;
}

@Component({
  selector: 'app-generic-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generic-modal.component.html',
  styleUrls: ['./generic-modal.component.css']
})
export class GenericModalComponent {
  @Input() title: string = '';
  @Input() imageUrl: string | null = null;
  @Input() buttons: GenericModalButton[] = [];

  constructor(private modalService: ModalService) {}

  close() {
    this.modalService.closeModal();
  }
}
