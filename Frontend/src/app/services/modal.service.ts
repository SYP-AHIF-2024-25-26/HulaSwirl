import {effect, EventEmitter, Injectable, Output, signal, WritableSignal} from '@angular/core';
export enum ModalType{
  ODC,OD,AD,ED,E,U
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
    this.modalData.set(null);
    this.displayedModal.set(null);
  }

  openModal(modal: ModalType, data: any ) {
    this.modalData.set(data);
    this.displayedModal.set(modal);
  }

  getDisplayedModal() {
    return this.displayedModal;
  }

  getModalData() {
    return this.modalData;
  }
}
