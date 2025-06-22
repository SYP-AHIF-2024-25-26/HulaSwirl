import {effect, computed, Injectable, signal, WritableSignal} from '@angular/core';
export enum ModalType{
  CustomOrder,
  Order,
  AddDrink,
  EditDrink,
  Status,
  User,
  Generic
}
@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor() {
    effect(() => {
      document.body.style.overflow = this.modalStack().length > 0 ? 'hidden' : '';
    });
  }

  private modalStack: WritableSignal<{type: ModalType; data: any; persist: boolean;}[]> = signal([]);
  private persistedData: Record<ModalType, any> = {} as Record<ModalType, any>;

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
}
