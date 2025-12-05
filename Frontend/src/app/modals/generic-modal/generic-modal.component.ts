import {
  AfterViewInit,
  ContentChildren,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  Directive,
  QueryList
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalIcon = 'info' | 'success' | 'warning' | 'error' | undefined;
export type ModalSize = 'small' | 'medium' | 'large' | 'full' | string;

export interface GenericModalButton {
  label: string;
  action?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  closeOnClick?: boolean;
}

export interface GenericModalTemplateContext<T = unknown> {
  data: T | null;
  close: () => void;
}

@Directive({ selector: '[modal-footer]' })
export class ModalFooterProjection {}

@Directive({ selector: '[modal-buttons]' })
export class ModalButtonsProjection {}

@Component({
  selector: 'app-generic-modal',
  standalone: true,
  imports: [CommonModule, ModalFooterProjection, ModalButtonsProjection],
  templateUrl: './generic-modal.component.html',
  styleUrls: ['./generic-modal.component.css']
})
export class GenericModalComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() icon?: ModalIcon;
  @Input() size: ModalSize = 'medium';
  @Input() closeOnEsc: boolean = true;
  @Input() closeOnBackdrop: boolean = true;
  @Input() bodyTemplate?: TemplateRef<GenericModalTemplateContext>;
  @Input() footerTemplate?: TemplateRef<GenericModalTemplateContext>;
  @Input() data: unknown = null;
  @Input() footerButtons: GenericModalButton[] = [];
  @Input() opened: boolean = true;

  @Output() closed = new EventEmitter<void>();

  @ViewChild('dialog', { static: false }) dialog?: ElementRef<HTMLDialogElement>;
  @ContentChildren(ModalFooterProjection, { descendants: true }) projectedFooters?: QueryList<ModalFooterProjection>;
  @ContentChildren(ModalButtonsProjection, { descendants: true }) projectedButtons?: QueryList<ModalButtonsProjection>;

  private previouslyFocused?: HTMLElement | null;

  get hasFooterContent(): boolean {
    const hasProjectedFooter = (this.projectedFooters?.length ?? 0) > 0;
    const hasProjectedButtons = (this.projectedButtons?.length ?? 0) > 0;
    return !!this.footerTemplate || this.footerButtons.length > 0 || hasProjectedFooter || hasProjectedButtons;
  }

  get sizeClass(): string {
    if (['small', 'medium', 'large', 'full'].includes(this.size)) {
      return `modal-${this.size}`;
    }
    return '';
  }

  ngAfterViewInit(): void {
    if (this.opened) {
      this.show();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('opened' in changes && !changes['opened'].firstChange && this.dialog) {
      if (this.opened) {
        this.show();
      } else {
        this.requestClose();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.dialog?.nativeElement?.open) {
      this.dialog.nativeElement.close();
    }
  }

  show() {
    if (!this.dialog) return;
    const element = this.dialog.nativeElement;
    this.previouslyFocused = document.activeElement as HTMLElement;
    if (!element.open) {
      element.showModal();
    }
    const firstInput = element.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    queueMicrotask(() => firstInput?.focus());
  }

  requestClose() {
    if (!this.dialog) return;
    if (this.dialog.nativeElement.open) {
      this.dialog.nativeElement.close();
    }
    this.restoreFocus();
    this.closed.emit();
  }

  handleButtonClick(btn: GenericModalButton) {
    btn.action?.();
    if (btn.closeOnClick ?? true) {
      this.requestClose();
    }
  }

  onDialogCancel(event: Event) {
    if (!this.closeOnEsc) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    this.requestClose();
  }

  onDialogClick(event: MouseEvent) {
    if (!this.closeOnBackdrop) return;
    if (event.target === this.dialog?.nativeElement) {
      this.requestClose();
    }
  }

  private restoreFocus() {
    if (this.previouslyFocused && document.body.contains(this.previouslyFocused)) {
      this.previouslyFocused.focus({ preventScroll: true });
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEsc(event: KeyboardEvent) {
    if (this.closeOnEsc && this.dialog?.nativeElement?.open) {
      event.preventDefault();
      this.requestClose();
    }
  }
}
