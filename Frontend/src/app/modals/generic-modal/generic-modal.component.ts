import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  input,
  output
} from '@angular/core';

import { ModalService } from '../../services/modal.service';

export interface GenericModalButton {
  label: string;
  action: () => void;
}

export type GenericModalSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-generic-modal',
  imports: [],
  templateUrl: './generic-modal.component.html',
  styleUrls: ['./generic-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericModalComponent {
  readonly title = input('');
  readonly buttons = input<GenericModalButton[]>([]);
  readonly size = input<GenericModalSize>('medium');
  readonly closed = output<void>();

  private readonly modalService = inject(ModalService);

  close() {
    this.closed.emit();
    this.modalService.closeModal();
  }
}
