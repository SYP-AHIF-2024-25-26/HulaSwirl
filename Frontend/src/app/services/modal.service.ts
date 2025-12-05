import {Injectable, computed, effect, signal, TemplateRef, WritableSignal} from '@angular/core';

export enum ModalType{
  CustomOrder,
  Order,
  AddDrink,
  EditDrink,
  Status,
  User,
  Account
}

export type ModalSize = 'small' | 'medium' | 'large';
export type ModalIcon = 'info' | 'success' | 'warning' | 'error' | string;

export interface ModalFooterButton {
  label: string;
  appearance?: 'primary' | 'secondary' | 'danger';
  keepOpen?: boolean;
  result?: any;
  onClick?: (context?: any) => void;
}

export interface ModalConfig {
  id?: string;
  title: string;
  subtitle?: string;
  message?: string;
  icon?: ModalIcon;
  size?: ModalSize;
  width?: string;
  disableEscClose?: boolean;
  backdropClose?: boolean;
  buttons?: ModalFooterButton[];
  bodyTemplate?: TemplateRef<any>;
  headerTemplate?: TemplateRef<any>;
  footerTemplate?: TemplateRef<any>;
  data?: any;
  type?: ModalType | null;
  persist?: boolean;
}

export interface ModalInstance {
  id: string;
  config: ModalConfig;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalStack: WritableSignal<ModalInstance[]> = signal([]);
  private persistedData: Record<ModalType, any> = {} as Record<ModalType, any>;

  constructor() {
    effect(() => {
      document.body.style.overflow = this.modalStack().length > 0 ? 'hidden' : '';
    });
  }

  open(config: ModalConfig): string {
    const id = this.generateId();
    const next: ModalInstance = { id, config: { backdropClose: true, size: 'medium', ...config, id } };
    this.modalStack.set([...this.modalStack(), next]);
    return id;
  }

  openMessage(title: string, message: string, options: Partial<ModalConfig> = {}): string {
    return this.open({
      title,
      message,
      buttons: [
        { label: 'OK', appearance: 'primary' }
      ],
      ...options
    });
  }

  openModal(modal: ModalType, data: any = null, persist: boolean = false) {
    if (data === null && this.persistedData[modal]) {
      data = this.persistedData[modal];
    }
    const stack = [...this.modalStack()];
    const existingIndex = stack.findIndex(m => m.config.type === modal);
    if (existingIndex === -1) {
      stack.push({id: this.generateId(), config: {type: modal, data, persist, title: ''}});
      this.modalStack.set(stack);
    }
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 9);
  }

  closeModal() {
    this.close();
  }

  close(id?: string) {
    if (id) {
      const stack = this.modalStack();
      const modal = stack.find(m => m.id === id);
      if (modal?.config.persist && modal.config.type !== null && modal.config.type !== undefined) {
        this.persistedData[modal.config.type] = modal.config.data;
      }
      this.modalStack.set(stack.filter(m => m.id !== id));
      return;
    }
    const stack = [...this.modalStack()];
    const modal = stack.pop();
    if (modal) {
      if (modal.config.persist && modal.config.type !== null && modal.config.type !== undefined) {
        this.persistedData[modal.config.type] = modal.config.data;
      } else if (modal.config.type !== null && modal.config.type !== undefined && !modal.config.persist) {
        delete this.persistedData[modal.config.type];
      }
    }
    this.modalStack.set(stack);
  }

  closeAll() {
    this.modalStack.set([]);
    this.persistedData = {} as Record<ModalType, any>;
  }

  getStack() {
    return this.modalStack;
  }

  getTop() {
    return computed(() => {
      const stack = this.modalStack();
      return stack.length ? stack[stack.length - 1] : null;
    });
  }

  getDisplayedModal() {
    return computed(() => {
      const stack = this.modalStack();
      return stack.length > 0 ? stack[stack.length - 1].config.type ?? null : null;
    });
  }

  getModalData() {
    return computed(() => {
      const stack = this.modalStack();
      return stack.length > 0 ? stack[stack.length - 1].config.data : null;
    });
  }
}
