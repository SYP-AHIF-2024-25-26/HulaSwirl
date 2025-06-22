import { Component, Input, TemplateRef, Type, Injector, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalButton, ModalConfig } from './modal-config';
import { UniversalModalService } from './universal-modal.service';
import { MODAL_DATA, MODAL_ID } from './modal.tokens';

@Component({
  selector: 'app-universal-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './universal-modal.component.html',
  styleUrls: ['./universal-modal.component.css']
})
export class UniversalModalComponent {
  @Input({ required: true }) modalId!: string;
  @Input({ required: true }) config!: ModalConfig;

  constructor(private modalService: UniversalModalService, private injector: Injector) {}

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(ev: KeyboardEvent) {
    const stack = this.modalService.modals();
    if (stack().length && stack()[stack().length - 1].id === this.modalId) {
      this.close();
    }
  }

  close() {
    this.modalService.close(this.modalId);
  }

  onBackdropClick() {
    if (!this.config.blockOutsideClose) {
      this.close();
    }
  }

  async onButtonClick(btn: ModalButton) {
    if (btn.action) {
      await btn.action(this.config.data);
    }
    if (btn.closeOnClick !== false) {
      this.close();
    }
  }

  isTemplate(val: any): val is TemplateRef<any> {
    return val && typeof val.createEmbeddedView === 'function';
  }

  isComponent(val: any): val is Type<any> {
    return typeof val === 'function' && val.prototype?.constructor;
  }

  componentInjector() {
    return Injector.create({
      providers: [
        { provide: MODAL_ID, useValue: this.modalId },
        { provide: MODAL_DATA, useValue: this.config.data }
      ],
      parent: this.injector
    });
  }
}
