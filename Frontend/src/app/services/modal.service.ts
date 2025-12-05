import { Injectable, WritableSignal, computed, effect, signal, TemplateRef } from '@angular/core';
import { GenericModalTemplateContext } from '../modals/generic-modal/generic-modal.component';

export enum ModalType{
  CustomOrder,
  Order,
  AddDrink,
  EditDrink,
  Status,
  User,
  Account
}

export type ModalButtonVariant = 'primary' | 'secondary' | 'danger';

export interface ModalButtonConfig {
  label: string;
  variant?: ModalButtonVariant;
  closeOnClick?: boolean;
  action?: () => void;
}

export interface ModalConfig<TData = unknown> {
  id?: string;
  title?: string;
  subtitle?: string;
  icon?: 'info' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large' | 'full' | string;
  message?: string;
  data?: TData | null;
  bodyTemplate?: TemplateRef<GenericModalTemplateContext<TData>>;
  footerTemplate?: TemplateRef<GenericModalTemplateContext<TData>>;
  footerButtons?: ModalButtonConfig[];
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;
}

interface ActiveModal<TData = unknown> {
  id: string;
  config: ModalConfig<TData>;
  restoreFocus?: HTMLElement | null;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor() {
    effect(() => {
      const hasModal = this.modalStack().length > 0 || this.dynamicModals().length > 0;
      document.body.style.overflow = hasModal ? 'hidden' : '';
    });
  }

  private modalStack: WritableSignal<{type: ModalType; data: any; persist: boolean;}[]> = signal([]);
  private persistedData: Record<ModalType, any> = {} as Record<ModalType, any>;

  private dynamicModals: WritableSignal<ActiveModal[]> = signal([]);

  closeModal(keepData: boolean = false) {
    const stack = [...this.modalStack()];
    const modal = stack.pop();
    if (modal) {
      if (modal.persist && !keepData) {
        this.persistedData[modal.type] = modal.data;
      } else if (!modal.persist) {
        delete this.persistedData[modal.type];
      }
    }
    this.modalStack.set(stack);
  }

  closeAll() {
    this.modalStack.set([]);
    this.persistedData = {} as Record<ModalType, any>;
    this.dynamicModals.set([]);
  }

  openModal(modal: ModalType, data: any = null, persist: boolean = false) {
    if (data === null && this.persistedData[modal]) {
      data = this.persistedData[modal];
    }
    const stack = [...this.modalStack()];
    const existingIndex = stack.findIndex(m => m.type === modal);
    if (existingIndex == -1) {
      stack.push({type: modal, data, persist});
      this.modalStack.set(stack);
    }
  }

  getModalStack() {
    return this.modalStack;
  }

  getDisplayedModal() {
    return computed(() => {
      const stack = this.modalStack();
      return stack.length > 0 ? stack[stack.length - 1].type : null;
    });
  }

  getModalData() {
    return computed(() => {
      const stack = this.modalStack();
      return stack.length > 0 ? stack[stack.length - 1].data : null;
    });
  }

  // Template-driven modal API
  open<TData = unknown>(config: ModalConfig<TData>) {
    const fallbackId = `modal-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const id = config.id ?? (globalThis.crypto?.randomUUID?.() ?? fallbackId);
    const modal: ActiveModal<TData> = {
      id,
      config: {
        size: 'medium',
        closeOnBackdrop: true,
        closeOnEsc: true,
        ...config,
      },
      restoreFocus: document.activeElement as HTMLElement | null,
    };
    this.dynamicModals.set([...this.dynamicModals(), modal]);
    return {
      id,
      close: () => this.closeDynamic(id),
    };
  }

  closeDynamic(id: string) {
    const current = this.dynamicModals();
    const modal = current.find(m => m.id === id);
    const stack = current.filter(m => m.id !== id);
    this.dynamicModals.set(stack);
    if (modal?.restoreFocus && document.body.contains(modal.restoreFocus)) {
      modal.restoreFocus.focus({ preventScroll: true });
    }
  }

  getDynamicModals() {
    return this.dynamicModals.asReadonly();
  }
}
