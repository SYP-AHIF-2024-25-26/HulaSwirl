import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../shared/modal/modal.component';
import { ModalConfig, ModalFooterButton, ModalService } from '../../services/modal.service';

export interface GenericModalButton {
  label: string;
  action: () => void;
  appearance?: 'primary' | 'secondary' | 'danger';
}

@Component({
  selector: 'app-generic-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './generic-modal.component.html',
  styleUrls: ['./generic-modal.component.css']
})
export class GenericModalComponent {
  @Input() title: string = '';
  @Input() subtitle: string | undefined;
  @Input() size: ModalConfig['size'] = 'medium';
  @Input() buttons: GenericModalButton[] = [];
  @Output() closed = new EventEmitter<void>();

  @ViewChild('body', { static: true }) bodyTemplate!: TemplateRef<unknown>;
  @ViewChild('footer', { static: true }) footerTemplate!: TemplateRef<unknown>;

  constructor(private modalService: ModalService) {}

  get config(): ModalConfig {
    const footerButtons: ModalFooterButton[] = this.buttons.map(btn => ({
      label: btn.label,
      appearance: btn.appearance,
      onClick: () => btn.action()
    }));
    return {
      title: this.title,
      subtitle: this.subtitle,
      size: this.size,
      buttons: footerButtons,
      backdropClose: true
    };
  }

  close() {
    this.closed.emit();
    this.modalService.close();
  }
}
