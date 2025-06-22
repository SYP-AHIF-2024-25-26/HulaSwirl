import { Injectable, WritableSignal, signal, inject, effect } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { ModalConfig } from './modal-config';

export interface ModalInstance {
  id: string;
  config: ModalConfig;
}

let idCounter = 0;

@Injectable({ providedIn: 'root' })
export class UniversalModalService {
  private readonly router = inject(Router);
  private readonly modalStack: WritableSignal<ModalInstance[]> = signal([]);
  private readonly persistedData = new Map<string, any>();

  constructor() {
    this.router.events.subscribe(ev => {
      if (ev instanceof NavigationStart) {
        this.closeAll();
      }
    });
  }

  open(config: ModalConfig): string {
    const id = config.id ?? `modal-${++idCounter}`;
    if (config.persist && this.persistedData.has(id)) {
      config.data = this.persistedData.get(id);
    }
    this.modalStack.update(list => [...list, { id, config }]);
    return id;
  }

  close(id: string) {
    const inst = this.modalStack().find(m => m.id === id);
    if (inst) {
      if (inst.config.persist) {
        this.persistedData.set(id, inst.config.data);
      } else {
        this.persistedData.delete(id);
      }
    }
    this.modalStack.set(this.modalStack().filter(m => m.id !== id));
  }

  closeAll() {
    this.modalStack().forEach(m => {
      if (m.config.persist) {
        this.persistedData.set(m.id, m.config.data);
      }
    });
    this.modalStack.set([]);
  }

  modals() {
    return this.modalStack;
  }
}
