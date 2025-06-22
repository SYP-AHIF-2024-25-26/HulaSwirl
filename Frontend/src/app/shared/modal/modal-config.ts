import { TemplateRef, Type } from '@angular/core';

export interface ModalButton {
  label: string;
  cssClass?: string;
  closeOnClick?: boolean;
  action?: (data: any) => void | Promise<void>;
}

export interface ModalConfig<T = any> {
  id?: string;
  title?: string;
  body?: string | TemplateRef<any> | Type<any>;
  footer?: string | TemplateRef<any> | Type<any> | null;
  buttons?: ModalButton[];
  data?: T;
  persist?: boolean;
  blockOutsideClose?: boolean;
}
