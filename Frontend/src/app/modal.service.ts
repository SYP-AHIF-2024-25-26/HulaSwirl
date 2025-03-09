import {effect, EventEmitter, Injectable, Output, signal, WritableSignal} from '@angular/core';
export enum ModalType{
  ODC,OD,AD,ED
}
@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor() {
    effect(() => {
      document.body.style.overflow = this.displayedModal() !== null ? 'hidden' : '';
    });
  }

  private displayedModal: WritableSignal<null|ModalType> = signal(null);
  private modalData: WritableSignal<any> = signal(null);

  closeModal() {
    this.displayedModal.set(null);
  }

  openModal(modal: ModalType, data: any = null) {
    this.displayedModal.set(modal);
    this.modalData.set(data);
  }

  getDisplayedModal() {
    return this.displayedModal;
  }

  getModalData() {
    return this.modalData;
  }
}
