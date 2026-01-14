import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { ModalService } from '../../services/modal.service';

export interface GenericModalButton {
  label: string;
  action: () => void;
}

export type GenericModalSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-generic-modal',
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
  protected readonly isSmall = computed(() => this.size() === 'small');
  protected readonly isMedium = computed(() => this.size() === 'medium');
  protected readonly isLarge = computed(() => this.size() === 'large');

  close() {
    this.closed.emit();
    this.modalService.closeModal();
  }
}
