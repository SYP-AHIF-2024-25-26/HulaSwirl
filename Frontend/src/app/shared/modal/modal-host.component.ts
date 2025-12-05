import {Component, effect, inject, Signal} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {ModalComponent} from './modal.component';
import {ModalInstance, ModalService} from '../../services/modal.service';

@Component({
  selector: 'app-modal-host',
  standalone: true,
  imports: [ModalComponent, NgForOf, NgIf],
  templateUrl: './modal-host.component.html',
  styleUrls: ['./modal-host.component.css']
})
export class ModalHostComponent {
  private modalService = inject(ModalService);
  stack: Signal<ModalInstance[]> = this.modalService.getStack();

  constructor() {
    effect(() => {
      // trigger change detection when stack updates
      this.stack();
    });
  }

  trackById(_index: number, instance: ModalInstance) {
    return instance.id;
  }

  close(id: string) {
    this.modalService.close(id);
  }

  onAction(instance: ModalInstance, button: any) {
    button.onClick?.(instance.config.data);
    if (button.result !== undefined) {
      this.close(instance.id);
    }
  }
}
