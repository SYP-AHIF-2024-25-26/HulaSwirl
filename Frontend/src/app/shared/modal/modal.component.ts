import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, TemplateRef, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ModalConfig, ModalFooterButton} from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  @Input() config!: ModalConfig;
  @Input() bodyTemplate?: TemplateRef<any>;
  @Input() headerTemplate?: TemplateRef<any>;
  @Input() footerTemplate?: TemplateRef<any>;
  @Input() context: any;
  @Output() closed = new EventEmitter<void>();
  @Output() action = new EventEmitter<ModalFooterButton>();

  @ViewChild('dialog', { static: true }) dialogRef!: ElementRef<HTMLDialogElement>;
  private lastFocused: HTMLElement | null = null;

  ngAfterViewInit(): void {
    this.lastFocused = document.activeElement as HTMLElement;
    const dialog = this.dialogRef.nativeElement;
    if (!dialog.open) {
      dialog.showModal();
    }
    dialog.addEventListener('cancel', this.handleEsc);
    dialog.addEventListener('close', this.handleClose);
  }

  ngOnDestroy(): void {
    const dialog = this.dialogRef.nativeElement;
    dialog.removeEventListener('cancel', this.handleEsc);
    dialog.removeEventListener('close', this.handleClose);
    if (this.lastFocused) {
      this.lastFocused.focus();
    }
  }

  handleEsc = (event: Event) => {
    if (this.config.disableEscClose) {
      event.preventDefault();
      return;
    }
    this.close();
  };

  handleClose = (event: Event) => {
    event.preventDefault();
  };

  onBackdropClick(event: MouseEvent) {
    if (!this.config.backdropClose) return;
    if (event.target === this.dialogRef.nativeElement) {
      this.close();
    }
  }

  close() {
    this.closed.emit();
  }

  trackByLabel(_index: number, btn: ModalFooterButton) {
    return btn.label;
  }

  trigger(btn: ModalFooterButton) {
    this.action.emit(btn);
    if (!btn.keepOpen) {
      this.close();
    }
  }
}
