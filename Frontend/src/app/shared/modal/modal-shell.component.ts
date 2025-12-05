import {AfterViewInit, ChangeDetectionStrategy, Component, ContentChild, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, TemplateRef, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ModalButtonConfig, ModalConfig, ModalSize} from './modal.types';

@Component({
  selector: 'app-modal-shell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-shell.component.html',
  styleUrl: './modal-shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalShellComponent implements AfterViewInit, OnDestroy {
  @Input() config: ModalConfig = {};
  @Input() open = true;
  @Input() bodyTemplate?: TemplateRef<any>;
  @Input() bodyContext?: Record<string, any>;
  @Input() footerTemplate?: TemplateRef<any>;
  @Input() footerContext?: Record<string, any>;
  @Input() headerTemplate?: TemplateRef<any>;
  @Input() buttons: ModalButtonConfig[] = [];
  @Output() closed = new EventEmitter<void>();

  @ContentChild('appModalBody', { read: TemplateRef }) projectedBody?: TemplateRef<any>;
  @ContentChild('appModalFooter', { read: TemplateRef }) projectedFooter?: TemplateRef<any>;
  @ContentChild('appModalHeader', { read: TemplateRef }) projectedHeader?: TemplateRef<any>;
  @ContentChild('appModalButtons', { read: TemplateRef }) projectedButtons?: TemplateRef<any>;

  @ViewChild('dialogRef') dialogRef?: ElementRef<HTMLDialogElement>;

  private opener?: HTMLElement | null;

  ngAfterViewInit(): void {
    if (this.open) {
      this.show();
    }
  }

  ngOnDestroy(): void {
    this.restoreFocus();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent) {
    if (this.config.closeOnEsc !== false && this.open) {
      event.preventDefault();
      this.close();
    }
  }

  get sizeClass(): ModalSize {
    return this.config.size ?? 'medium';
  }

  show() {
    const dialog = this.dialogRef?.nativeElement;
    if (!dialog) return;
    if (!dialog.open) {
      this.opener = document.activeElement as HTMLElement;
      dialog.showModal();
      setTimeout(() => {
        const firstFocusable = dialog.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      });
    }
  }

  close() {
    const dialog = this.dialogRef?.nativeElement;
    if (dialog?.open) {
      dialog.close();
    }
    this.restoreFocus();
    this.closed.emit();
  }

  onDialogClick(event: MouseEvent) {
    if (this.config.closeOnBackdrop === false) return;
    const dialog = this.dialogRef?.nativeElement;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const clickedOutside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (clickedOutside) {
      this.close();
    }
  }

  triggerAction(btn: ModalButtonConfig) {
    if (btn.action) {
      btn.action();
    }
  }

  private restoreFocus() {
    if (this.opener && typeof this.opener.focus === 'function') {
      this.opener.focus();
    }
  }
}
